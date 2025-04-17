import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route'; // Adjust path as needed
import { getMongoClient } from '../../../_lib/mongodb'; // Adjust path as needed

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await getMongoClient();
    const db = client.db('cars');
    const car = await db.collection('cars').findOne({ _id: new ObjectId(params.id) });
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json(car);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { make, model, year, pricePerDay, available } = await request.json();
    const updateFields: any = {};
    if (make) updateFields.make = make;
    if (model) updateFields.model = model;
    if (year) updateFields.year = year;
    if (pricePerDay) updateFields.pricePerDay = pricePerDay;
    if (available !== undefined) updateFields.available = available;

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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const client = await getMongoClient();
    const db = client.db('cars');
    const result = await db.collection('cars').deleteOne({ _id: new ObjectId(params.id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Car deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}