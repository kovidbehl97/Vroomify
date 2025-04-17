'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../auth/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

interface CarDetails {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  carType: string;
  transmission: string;
  id?: string; // Include the ID in the interface
}

export default function CarDetailPage() {
  const { carId } = useParams();
  const router = useRouter();
  const [car, setCar] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (carId) {
      const fetchCarDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const carDocRef = doc(db, 'cars', carId as string);
          const docSnap = await getDoc(carDocRef);

          if (docSnap.exists()) {
            setCar({ id: docSnap.id, ...docSnap.data() } as CarDetails); // Include the ID in the car object
          } else {
            setError('Car not found.');
          }
        } catch (error: any) {
          console.error('Error fetching car details:', error);
          setError('Failed to fetch car details.');
        } finally {
          setLoading(false);
        }
      };

      fetchCarDetails();
    }
  }, [carId]);



  if (loading) return <div>Loading car details...</div>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!car) return <p>No car details found.</p>;

  return (
    <div>
      <h1>{car.year} {car.make} {car.model}</h1>
      <p>Type: {car.carType}</p>
      <p>Transmission: {car.transmission}</p>
      <p>Mileage: {car.mileage} miles</p>
      <p>Price: ${car.price}/hour</p>
      {/* Display other car details here */}
      <Link href={`/bookings?carId=${car?.id}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
        Book Now
      </Link>
    </div>
  );
}