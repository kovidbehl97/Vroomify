// app/_components/CarCard.tsx
import Link from 'next/link';
import { Car } from '../_lib/types';

// Define props for the handlers
interface CarCardProps {
    car: Car;
    isDashBoardPage: boolean;
    onEditClick?: (car: Car) => void; // Optional handler
    onDeleteClick?: (car: Car) => void; // Optional handler
}

// Accept the new props
export default function CarCard({ car, isDashBoardPage, onEditClick, onDeleteClick }: CarCardProps) {
  return (
    <div className="border relative rounded-xl shadow-gray-200 shadow-md border-gray-200  flex justify-between items-center overflow-hidden h-52 py-4 px-5">
      {/* ... your existing car image/placeholder and details ... */}
      <div className='bg-gray-400 h-full w-56 mr-5'></div> {/* Image placeholder */}
      <div className=' w-full flex flex-col justify-start h-full pt-2'>
         {/* ... car details like make, model, year, etc. ... */}
         <h3 className="text-3xl font-extrabold">{car.make} {car.model}</h3>
         <p>Year: {car.year}</p>
         <p>Type: {car.carType}</p>
         <p>Transmission: {car.transmission}</p>
         {/* Add other details you want to display */}
         {/* <p>Price: ${car.price}/day</p> // Or show only in button section */}
      </div>

      <div className='flex flex-col justify-center items-center mr-2'>
        {/* Show price here or below */}
         <p className='mt-1.5 font-extrabold text-black text-3xl mb-3'>${car.price}/day</p>

        {!isDashBoardPage ? (
          // --- View Details Button (for non-dashboard) ---
          <Link href={`/cars/${car._id}`} className="text-white bg-black text-nowrap px-5 py-2 hover:bg-gray-700 transition-colors">View Details</Link> 
        ) : (
          // --- Edit/Delete Buttons (for dashboard) ---
          <div className='flex gap-2'>
            {/* Use the onEditClick handler */}
            <button
              onClick={() => onEditClick && onEditClick(car)} // Call handler if it exists
              className="text-white bg-black text-nowrap px-5 py-2 hover:bg-gray-700 transition-colors" // Added hover
            >
              Edit
            </button>
            {/* Use the onDeleteClick handler */}
            <button
              onClick={() => onDeleteClick && onDeleteClick(car)} // Call handler if it exists
              className="text-white bg-red-500 text-nowrap px-5 py-2 hover:bg-red-600 transition-colors" // Added hover
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}