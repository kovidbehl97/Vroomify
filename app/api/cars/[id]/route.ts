import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('vroomify');
    const car = await db.collection('cars').findOne({ _id: new ObjectId(params.id) });
    await client.close();
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json(car);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession({ req: request });
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { make, model, year, pricePerDay, available } = await request.json();
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('vroomify');
    const result = await db.collection('cars').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { make, model, year, pricePerDay, available } }
    );
    await client.close();
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Car updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession({ req: request });
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('vroomify');
    const result = await db.collection('cars').deleteOne({ _id: new ObjectId(params.id) });
    await client.close();
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Car deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}