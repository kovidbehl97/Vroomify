// app/(routes)/bookings/[id]/BookingFormClient.tsx (This is a Client Component)
"use client"; // *** Mark this file as a Client Component ***

import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react"; // Use useSession if you need session data *client-side*
import StripeCheckoutButton from "./StripeCheckoutButton";
import { useRouter } from 'next/navigation'; // If you need client-side navigation


interface BookingFormClientProps {
    carId: string;
    // userId: string; // Receive user ID from the Server Component if needed
    // initialCarPrice?: string; // Receive initial price from Server Component if fetched there
}

export default function BookingFormClient({ carId }: BookingFormClientProps) { // Receive carId as prop
  // *** DO NOT CALL getServerSession or auth() here ***
  // If you needed session data client-side for rendering (e.g., user's name on the form), use useSession():
  // const { data: session, status } = useSession();
  // const isLoadingSession = status === 'loading';

  const [pickupDate, setPickupDate] = useState<string>("");
  const [dropoffDate, setDropoffDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [dropoffTime, setDropoffTime] = useState<string>("");
  const [location, setLocation] = useState<string>("Square One Mall");
  const [error, setError] = useState<string>("");
  const [carPrice, setCarPrice] = useState<string>(""); // Or use initialCarPrice prop

  useEffect(() => {
    // Fetch car price client-side if not fetched on the server
    const fetchCarPrice = async () => {
      try {
        const res = await fetch(`/api/cars/${carId}`); // Use carId prop
        if (!res.ok) {
             throw new Error('Failed to fetch car details');
        }
        const data = await res.json();
         setCarPrice(data.price);
      } catch (err) {
        console.error("Failed to fetch car details:", err);
        setError("Failed to fetch car details");
      }
    };

    // Only fetch if carId is available and price hasn't been set (or use a flag)
    if (carId) {
       fetchCarPrice();
    }
  }, [carId]); // Dependency on carId prop


  // You might need a form submission handler here to create the booking record
  // before redirecting to Stripe or handling payment.
  // This handler would likely call an API route like /api/bookings to save the booking details
  // Make sure to include the userId (passed as prop or from useSession if used) in the booking data.
  const handleBookingSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(''); // Clear previous errors

      // Basic validation
      if (!pickupDate || !dropoffDate || !pickupTime || !dropoffTime || !location || !carId) {
          setError('Please fill in all required fields.');
          return;
      }

      // Add logic here to create the booking in your database
      // You'll need the current user's ID for this
      // const currentUserId = userId; // If passed as prop
      // Or fetch client-side if needed:
      // const { data: session } = useSession(); // Requires useSession import and hook call
      // const currentUserId = session?.user?.id;

      // If you need the user ID here, pass it as a prop or use useSession
       // For simplicity, let's assume userId is passed as a prop

       // Example fetch to your booking API route (you'll need to create this)
      // try {
      //    const bookingData = {
      //        carId: carId,
      //        userId: currentUserId, // Make sure you have the user ID
      //        pickupDate,
      //        dropoffDate,
      //        pickupTime,
      //        dropoffTime,
      //        location,
      //        carPrice // Include price or calculate on server
      //        // Add status, createdAt etc.
      //    };
      //    const res = await fetch('/api/bookings', { // Your API route to create bookings
      //        method: 'POST',
      //        headers: { 'Content-Type': 'application/json' },
      //        body: JSON.stringify(bookingData),
      //    });
      //    if (!res.ok) {
      //        const errorData = await res.json();
      //        throw new Error(errorData.message || 'Failed to create booking record');
      //    }
      //    const booking = await res.json();
      //    console.log('Booking record created:', booking);

          // After successful booking creation, proceed to Stripe or confirmation
          // For this example, we'll assume StripeCheckoutButton handles the payment initiation
          // based on the form data collected here.
          // You might pass booking.id to StripeCheckoutButton if payment is tied to a specific booking record.

          // If you redirect to Stripe here after creating the booking record:
          // router.push(`/checkout?bookingId=${booking.id}`);


      // } catch (err: any) {
      //     console.error("Booking creation failed:", err);
      //     setError(err.message || "Failed to create booking.");
      // }
  };


  // Show loading or access denied state if needed from useSession
  // if (isLoadingSession) {
  //     return <p>Loading session...</p>;
  // }
  // // Note: Basic auth check should happen in Server Component, but you could reinforce here for UI
  // if (!session) {
  //     return <p>Please log in to book a car.</p>;
  // }


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Book Your Car</h1> {/* Added text-center */}
      {/* Wrap your form inputs in a <form> element with onSubmit */}
      <form onSubmit={handleBookingSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow-md"> {/* Added styling and onSubmit */}
        <div className="mb-4">
          <label htmlFor="pickupDate" className="block mb-1 text-gray-700">Pick-up Date</label> {/* Added htmlFor/styling */}
          <input
            id="pickupDate" // Added id
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
           <label htmlFor="pickupTime" className="block mb-1 text-gray-700">Pick-up Time</label> {/* Added htmlFor/styling */}
          <input
            id="pickupTime" // Added id
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
           <label htmlFor="dropoffDate" className="block mb-1 text-gray-700">Drop-off Date</label> {/* Added htmlFor/styling */}
          <input
            id="dropoffDate" // Added id
            type="date"
            value={dropoffDate}
            onChange={(e) => setDropoffDate(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
           <label htmlFor="dropoffTime" className="block mb-1 text-gray-700">Drop-off Time</label> {/* Added htmlFor/styling */}
          <input
            id="dropoffTime" // Added id
            type="time"
            value={dropoffTime}
            onChange={(e) => setDropoffTime(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
           <label htmlFor="location" className="block mb-1 text-gray-700">Pick-up Location</label> {/* Added htmlFor/styling */}
          <select
            id="location" // Added id
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="Square One Mall">Square One Mall</option>
            <option value="Pearson International Airport (YYZ)">
              Pearson International Airport (YYZ)
            </option>
            <option value="Union Station">Union Station</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="carPrice" className="block mb-1 text-gray-700">Car Price</label> {/* Added htmlFor/styling */}

          <input
             id="carPrice" // Added id
            type="text"
            value={carPrice ? `$${carPrice}/day` : 'Loading...'} // Show loading state
            readOnly
            className="border p-2 rounded w-full bg-gray-200"
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>} {/* Adjusted styling */}
        {/* You might add a submit button here */}
        {/* <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Booking</button> */}
      </form>

      {/* Pass relevant booking data to StripeCheckoutButton */}
      {/* Ensure all required fields are filled and carPrice is loaded before enabling */}
      {pickupDate && dropoffDate && pickupTime && dropoffTime && location && carPrice && (
         <StripeCheckoutButton
            carId={carId}
            pickupDate={pickupDate}
            dropoffDate={dropoffDate}
            dropoffTime={dropoffTime}
            pickupTime={pickupTime}
            location={location}
            // Pass price and userId if Stripe needs them directly
            // price={carPrice}
            // userId={userId} // If passed as prop
         />
      )}

    </div>
  );
}