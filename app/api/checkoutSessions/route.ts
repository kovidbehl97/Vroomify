import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '../../_lib/stripe';
import { ObjectId } from 'mongodb';
import { getMongoClient } from '../../_lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../_lib/auth';
import { Car } from '../../_lib/types';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.BASE_URL || 'https://vroomtest-afid87aoo-kovids-projects.vercel.app/';

    const body = await req.json();
    const { carId, pickupDate, dropoffDate, pickupTime, dropoffTime, location } = body;

    if (!carId || !pickupDate || !dropoffDate || !pickupTime || !dropoffTime || !location) {
      console.error('API Error: Missing required booking data');
      return NextResponse.json({ error: 'Missing booking data' }, { status: 400 });
    }
    const carDetails: Car | null = await getCarDetails(carId);
    if (!carDetails) {
      console.error('API Error: Car not found with ID:', carId);
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    const priceAsNumber = Number(carDetails.price);
    const startDate = new Date(pickupDate);
    const endDate = new Date(dropoffDate);

    if (isNaN(priceAsNumber) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('API Error: Invalid price or date data.');
      return NextResponse.json({ error: 'Invalid car price or date' }, { status: 400 });
    }
    
    const totalPrice = calculateTotalPrice(priceAsNumber, startDate, endDate);
    const totalPriceInCents = Math.round(totalPrice * 100);
    const usersession = await getServerSession(authOptions);
    const sessionUser = usersession?.user;
    const session = await stripe.checkout.sessions.create({
      customer_email: sessionUser?.email || 'guest@example.com',
      billing_address_collection: 'auto',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${carDetails.make} ${carDetails.model}`,
              description: `Car booking for ${carDetails.year}`,
            },
            unit_amount: totalPriceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        userId: sessionUser?.id || 'guest',
        carId,
        pickupDate,
        dropoffDate,
        pickupTime,
        dropoffTime,
        location,
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Stripe checkout error:', err.message);
      return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    } else {
      console.error('Stripe checkout error: Unknown error occurred', err);
      return NextResponse.json({ error: 'Internal Server Error', message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
async function getCarDetails(carId: string): Promise<Car | null> {
  try {
    const client = await getMongoClient();
    const db = client.db('cars');
    const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) }) as unknown as Car | null;
    return car;
  } catch (error) {
    console.error('Error fetching car details:', error);
    return null;
  }
}

function calculateTotalPrice(price: number, startDate: Date, endDate: Date): number {
  const daysBooked = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return price * daysBooked;
}