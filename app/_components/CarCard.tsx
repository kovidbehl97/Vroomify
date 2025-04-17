import Link from 'next/link';
import { Car } from '../_lib/types';

export default function CarCard({ car }: { car: Car }) {
  return (
    <div className="border p-4 rounded shadow">
      <h3 className="text-lg font-bold">{car.make} {car.model}</h3>
      <p>Year: {car.year}</p>
      <p>Price: ${car.price}/day</p>
      <p>Type: {car.carType}</p>
      <p>Transmission: {car.transmission}</p>
      <Link href={`/cars/${car._id}`} className="text-blue-600">View Details</Link>
    </div>
  );
}