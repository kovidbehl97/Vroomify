// api/cars/[id]/route.ts
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route'; // Adjust path as needed
import { getMongoClient } from '../../../_lib/mongodb'; // Adjust path as needed

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the connected client (getMongoClient should handle connection pooling)
    const client = await getMongoClient();
    const db = client.db('cars');
    const paramsData = params // params is already awaited by Next.js
    const car = await db.collection('cars').findOne({ _id: new ObjectId(paramsData.id) });
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json(car);
  } catch (error) {
    console.error('GET /api/cars/[id] - Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: (error as any).message }, { status: 500 });
  }
  // No finally block here - Correct
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { make, model, year, price, available } = await request.json();
    const updateFields: any = {};
    if (make) updateFields.make = make;
    if (model) updateFields.model = model;
    if (year) updateFields.year = year;
    if (price) updateFields.price = price;
    if (available !== undefined) updateFields.available = available;

    // Get the connected client (getMongoClient should handle connection pooling)
    const client = await getMongoClient();
    const db = client.db('cars');
    const result = await db.collection('cars').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateFields }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Car updated' });
  } catch (error) {
    console.error('PUT /api/cars/[id] - Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: (error as any).message }, { status: 500 });
  }
  // No finally block here - Correct
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    // Get the connected client (getMongoClient should handle connection pooling)
    const client = await getMongoClient();
    const db = client.db('cars');
    const result = await db.collection('cars').deleteOne({ _id: new ObjectId(params.id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Car deleted' });
  } catch (error) {
     console.error('DELETE /api/cars/[id] - Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: (error as any).message }, { status: 500 });
  }
   // No finally block here - Correct
}