'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchCar } from '../../../_lib/api';
import { Car } from '../../../_lib/types';
import Link from 'next/link';

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCar() {
      try {
        const data = await fetchCar(id as string);
        setCar(data);
      } catch (error) {
        console.error('Error fetching car:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCar();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!car) return <p>Car not found</p>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">{car.make} {car.model}</h1>
      <p>Year: {car.year}</p>
      <p>Price: ${car.price}/day</p>
      <p>Mileage: {car.mileage} miles</p>
      <p>Type: {car.carType}</p>
      <p>Transmission: {car.transmission}</p>
      <Link href={`/bookings/${car._id}`} className="bg-blue-600 text-white px-4 py-2 rounded mt-4 inline-block">
        Book Now
      </Link>
    </div>
  );
}