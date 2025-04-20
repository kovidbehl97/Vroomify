// File: /app/api/checkout_sessions/route.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '../../_lib/stripe';
import { ObjectId } from 'mongodb';
import { getMongoClient } from '../../_lib/mongodb'; // Ensure this exists
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const headersList =await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const body = await req.json();
    const { carId, pickupDate, dropoffDate, pickupTime, dropoffTime, location } = body;

    if (!carId || !pickupDate || !dropoffDate || !pickupTime || !dropoffTime || !location) {
      return NextResponse.json({ error: 'Missing booking data' }, { status: 400 });
    }

    const carDetails = await getCarDetails(carId);
const totalPrice = calculateTotalPrice(Number(carDetails!.price), new Date(pickupDate), new Date(dropoffDate));

const usersession = await getServerSession(authOptions);
const sessionUser = usersession?.user;
const session = await stripe.checkout.sessions.create({
  customer_email: sessionUser?.email || 'guest@example.com', // Add this dynamically
  billing_address_collection: 'auto',
  shipping_address_collection: { allowed_countries: ['US', 'CA'] },
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${carDetails!.make} ${carDetails!.model}`,
          description: `Car booking for ${carDetails!.year}`,
        },
        unit_amount: totalPrice * 100,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  metadata: {
    userId: sessionUser?.id || '', // Add user id from session
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
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

async function getCarDetails(carId: string) {
  const client = await getMongoClient();
  const db = client.db('cars');
  const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) });

  if (!car) {
    throw new Error('Car not found');
  }

  return car;
}

function calculateTotalPrice(price: number, startDate: Date, endDate: Date): number {
  const daysBooked = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return price * daysBooked;
}




