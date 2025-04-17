import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('vroomify');
    const cars = await db.collection('cars').find().toArray();
    await client.close();
    return NextResponse.json(cars);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession({ req: request });
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { make, model, year, pricePerDay, available } = await request.json();
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('vroomify');
    const result = await db.collection('cars').insertOne({
      make,
      model,
      year,
      pricePerDay,
      available,
    });
    await client.close();
    return NextResponse.json({ _id: result.insertedId, make, model, year, pricePerDay, available }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}