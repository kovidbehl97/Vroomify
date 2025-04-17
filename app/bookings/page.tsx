'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// ... other imports

export default function BookingPage() {
  const searchParams = useSearchParams();
  const carId = searchParams.get('carId');
  const [carDetails, setCarDetails] = useState(null);

  useEffect(() => {
    if (carId) {
      // Fetch car details based on carId
      const fetchCar = async () => {
        console.log('Booking for car ID:', carId);
        // ... your Firestore fetching logic using carId ...
      };
      fetchCar();
    }
  }, [carId]);

  return (
    <div>
      <h1>Booking Page</h1>
      {carId && <h2>Booking for Car ID: {carId}</h2>}
      {!carId && <p>No car selected for booking.</p>}
      {/* ... booking form and other UI elements ... */}
    </div>
  );
}