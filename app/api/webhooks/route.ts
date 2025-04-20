// File: app/api/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import { getMongoClient } from '../../_lib/mongodb'; // Ensure this has the correct caching logic

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', // Use the correct API version for your Stripe account
});

// Helper function to buffer the request body
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
  console.log('Webhook received at /api/webhooks');

  // Get the raw body as a Buffer
  const rawBody = await buffer(req.body!);
  const signature = req.headers.get('stripe-signature');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    // Construct the Stripe event for signature verification
    event = stripe.webhooks.constructEvent(rawBody, signature!, endpointSecret);
    console.log(`Event received: ${event.type} (${event.id})`);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`Processing checkout.session.completed for session: ${session.id}`);

    // Declare client here if needed for logging outside the inner try, but not for closing
    // let client; // Removed this declaration as it's not needed outside the try anymore

    try {
      // Retrieve session details (optional, but good for confirmation)
      const sessionWithDetails = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['payment_intent', 'line_items.data.price.product'], // Expand line items details if needed
      }).catch(err => {
        console.warn(`Failed to retrieve session details for ${session.id}: ${err.message}`);
        // Handle this error appropriately - maybe log and return early if details are crucial
        // For now, we'll proceed with the event payload data if retrieve fails
        return session; // Fallback to event payload data if retrieve fails
      });

      if (sessionWithDetails.payment_status === 'paid') {
        // Extract booking data from session metadata or line items
        const bookingData = {
          userId: sessionWithDetails.metadata?.userId || 'guest',
          carId: sessionWithDetails.metadata?.carId || 'unknown', // Make sure this is the car ID from metadata
          pickupDate: sessionWithDetails.metadata?.pickupDate,
          dropoffDate: sessionWithDetails.metadata?.dropoffDate,
          pickupTime: sessionWithDetails.metadata?.pickupTime,
          dropoffTime: sessionWithDetails.metadata?.dropoffTime,
          location: sessionWithDetails.metadata?.location, // Make sure location is in metadata if needed
          amount: sessionWithDetails.amount_total! / 100,
          currency: sessionWithDetails.currency,
          status: 'paid',
          createdAt: new Date(),
          sessionId: sessionWithDetails.id,
          // You might want to store car details like make/model from line_items.data.price.product if expanded
          // For example:
          // carDetails: sessionWithDetails.line_items?.data.map(item => ({
          //   priceId: item.price?.id,
          //   productId: item.price?.product?.id, // Requires 'line_items.data.price.product' expansion
          //   productName: (item.price?.product as any)?.name,
          //   quantity: item.quantity
          // }))
        };

        console.log('Attempting to get MongoDB client...');
        try {
          // Get the connected client (getMongoClient should handle connection pooling)
          const client = await getMongoClient();
          console.log('MongoDB client obtained successfully.'); // Changed log message slightly
          const db = client.db('cars'); // Or use getMongoDb()
          console.log('Accessed database: cars');
          const bookingsCollection = db.collection('bookings');
          console.log('Accessed collection: bookings');

          // Check if booking already exists to prevent duplicates on webhook retries
          const existingBooking = await bookingsCollection.findOne({ sessionId: sessionWithDetails.id });
          if (!existingBooking) {
            console.log('No existing booking found. Attempting to insert:', bookingData);
            const result = await bookingsCollection.insertOne(bookingData);
            console.log('Insert result:', result);
            console.log(`Booking stored for session: ${sessionWithDetails.id}`);

            // TODO: Add logic here to update car availability if needed
            // You would need to fetch the car by ID (bookingData.carId) and update a field like 'available: false'
            // Ensure you handle potential errors during the car update as well.

          } else {
            console.log(`Booking already exists for session: ${sessionWithDetails.id}. Skipping insert.`);
          }
        } catch (mongoError: any) {
          console.error('Error during MongoDB operation in webhook:', mongoError.message, mongoError.stack);
          // Depending on your retry strategy, you might want to return a non-200 status here
          // to signal Stripe to retry the webhook later. However, returning 200 after logging
          // the error prevents infinite retries if the error is persistent.
          // Log the error and still return 200 if you handle retries/idempotency elsewhere.
        }
        // REMOVED the finally block that calls client.close()
        // finally {
        //   if (client) {
        //     await client.close();
        //     console.log('MongoDB connection closed.');
        //   }
        // }
      } else {
        console.log(`Payment not completed (${sessionWithDetails.payment_status}) for session: ${sessionWithDetails.id}. Skipping booking creation.`);
      }
    } catch (err: any) {
      console.error(`Error processing checkout.session.completed logic: ${err.message}`);
      // Return a 500 status for processing errors so Stripe might retry
      return new NextResponse(`Failed to process session logic: ${err.message}`, { status: 500 });
    }
  } else {
    console.log(`Ignored event type: ${event.type}`);
    // For unhandled event types, it's often best practice to still return 200
  }

  // Always return a 200 status for handled events/signatures to acknowledge receipt
  // Only return non-200 for signature verification failures or processing errors you want retried
  return new NextResponse('Webhook handled', { status: 200 });
}