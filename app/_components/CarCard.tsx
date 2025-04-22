import Link from 'next/link';
import { Car } from '../_lib/types';

export default function CarCard({ car }: { car: Car }) {
  return (
    <div className="border relative rounded-xl shadow-gray-200 shadow-md border-gray-200  flex justify-between items-center overflow-hidden h-52 py-4 px-5">
      <div className='bg-gray-400 h-full w-56 mr-5'></div>
      <div className=' w-full flex flex-col justify-start h-full pt-2'>
      <h3 className="text-3xl font-extrabold">{car.make} {car.model}</h3>
      <p>Year: {car.year}</p>
      
      <p>Type: {car.carType}</p>
      <p>Transmission: {car.transmission}</p>
      </div>
      <div className='flex flex-col justify-center items-center mr-2'>
      <p className='mt-1.5 font-extrabold text-black text-3xl mb-3'>${car.price}/day</p>
      <Link href={`/cars/${car._id}`} className="text-white bg-black text-nowrap px-5 py-2 ">View Details</Link>
      </div>
    </div>
  );
}