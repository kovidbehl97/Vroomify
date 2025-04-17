import { Car, Booking } from './types';
import { getSession } from 'next-auth/react';

// Fetch all cars with query parameters
export async function fetchCars(params: {
  search?: string;
  carType?: string;
  transmission?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/cars?${query}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch cars');
  return res.json() as Promise<Car[]>;
}

// Fetch a single car by ID
export async function fetchCar(id: string) {
  const res = await fetch(`/api/cars/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch car');
  return res.json() as Promise<Car>;
}

// Create a booking
export async function createBooking(data: {
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}, token: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: session.user?JSON.stringify({ ...data, userId: session.user.id }):'',
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json() as Promise<Booking>;
}

// Fetch booking history
export async function fetchBookingHistory() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const res = await fetch('/api/bookings/history', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch booking history');
  return res.json() as Promise<Booking[]>;
}

// Create a car (admin only)
export async function createCar(data: Partial<Car>) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') throw new Error('Admin access required');
  const res = await fetch('/api/cars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create car');
  return res.json() as Promise<Car>;
}

// Update a car (admin only)
export async function updateCar(id: string, data: Partial<Car>) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') throw new Error('Admin access required');
  const res = await fetch(`/api/cars/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update car');
  return res.json() as Promise<Car>;
}

// Delete a car (admin only)
export async function deleteCar(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') throw new Error('Admin access required');
  const res = await fetch(`/api/cars/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to delete car');
  return res.json();
}

// Register a user
export async function registerUser(data: { email: string; password: string; name: string }) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to register');
  }
  return res.json() as Promise<{ _id: string; email: string; name: string; role: string }>;
}