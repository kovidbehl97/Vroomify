import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Buffer } from 'buffer';
import { getMongoClient } from '../../_lib/mongodb';
import { sendBookingConfirmation } from '../../_lib/email';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

interface Product {
  name: string;
  description?: string;
}

interface SessionWithDetails extends Stripe.Checkout.Session {
  line_items?: Stripe.ApiList<Stripe.LineItem & { price?: { product?: Product } }>;
}

async function buffer(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const rawBody = await buffer(req.body!);
  const signature = req.headers.get('stripe-signature');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, endpointSecret);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return new NextResponse(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }
    return new NextResponse('Webhook signature verification failed: Unknown error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const sessionWithDetails = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['payment_intent', 'line_items.data.price.product', 'customer_details'],
      }) as SessionWithDetails;

      if (sessionWithDetails.payment_status === 'paid') {

        const bookingData = {
          userId: sessionWithDetails.metadata?.userId || 'guest',
          carId: sessionWithDetails.metadata?.carId || 'unknown',
          pickupDate: sessionWithDetails.metadata?.pickupDate,
          dropoffDate: sessionWithDetails.metadata?.dropoffDate,
          pickupTime: sessionWithDetails.metadata?.pickupTime,
          dropoffTime: sessionWithDetails.metadata?.dropoffTime,
          location: sessionWithDetails.metadata?.location,
          amount: sessionWithDetails.amount_total! / 100,
          currency: sessionWithDetails.currency,
          status: 'paid',
          createdAt: new Date(),
          sessionId: sessionWithDetails.id,
        };

        const bookingDetails = {
          customerEmail: sessionWithDetails.customer_details?.email || 'unknown@example.com',
          userName: sessionWithDetails.customer_details?.name || 'Customer',
          pickupDate: sessionWithDetails.metadata?.pickupDate || 'N/A',
          dropoffDate: sessionWithDetails.metadata?.dropoffDate || 'N/A',
          amount: sessionWithDetails.amount_total! / 100,
          car: {
            make: sessionWithDetails.line_items?.data[0]?.price?.product?.name || 'Unknown Make',
            model: sessionWithDetails.line_items?.data[0]?.price?.product?.description || 'Unknown Model',
          },
        };

        try {
          const client = await getMongoClient();
          const db = client.db('cars');
          const bookingsCollection = db.collection('bookings');

          const existingBooking = await bookingsCollection.findOne({ sessionId: sessionWithDetails.id });

          if (!existingBooking) {
            await bookingsCollection.insertOne(bookingData);
            await sendBookingConfirmation(bookingDetails.customerEmail, bookingDetails);
          } 
        } catch (mongoError: unknown) {
          console.error('MongoDB error:', mongoError);
          if (mongoError instanceof Error) {
            return new NextResponse(`MongoDB operation failed: ${mongoError.message}`, { status: 500 });
          }
          return new NextResponse('MongoDB operation failed: Unknown error', { status: 500 });
        }
      } 
    } catch (err: unknown) {
      console.error('Error processing session:', err);
      if (err instanceof Error) {
        return new NextResponse(`Failed to process session logic: ${err.message}`, { status: 500 });
      }
      return new NextResponse('Failed to process session logic: Unknown error', { status: 500 });
    }
  }

  return new NextResponse('Webhook handled', { status: 200 });
}