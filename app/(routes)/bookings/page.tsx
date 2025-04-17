'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const pickupLocations = [
  'Square One Mall',
  'Union Station',
  'Pearson International Airport (YYZ)',
];

const dailyRate = 50; // Example daily rate

export default function BookingPage() {
  const searchParams = useSearchParams();
  const carId = searchParams.get('carId');

  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [bookingDays, setBookingDays] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (pickupDate && dropoffDate) {
      const start = new Date(pickupDate);
      const end = new Date(dropoffDate);
      const timeDiff = Math.abs(end.getTime() - start.getTime());
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setBookingDays(days);
      setTotalCost(days * dailyRate);
    } else {
      setBookingDays(0);
      setTotalCost(0);
    }
  }, [pickupDate, dropoffDate]);

  const handlePickupLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPickupLocation(event.target.value);
  };

  const handlePickupDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPickupDate(event.target.value);
  };

  const handlePickupTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPickupTime(event.target.value);
  };

  const handleDropoffDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDropoffDate(event.target.value);
  };

  const handleDropoffTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDropoffTime(event.target.value);
  };

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(event.target.value);
  };

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const handleCheckout = () => {
    // Implement Stripe checkout logic here
    if (!carId) {
      alert('Car ID is missing. Cannot proceed with booking.');
      return;
    }
    if (!pickupLocation || !pickupDate || !pickupTime || !dropoffDate || !dropoffTime || !fullName || !phoneNumber || !email) {
      alert('Please fill in all the booking details.');
      return;
    }
    if (bookingDays <= 0) {
      alert('Please select valid pickup and drop-off dates.');
      return;
    }
    alert(`Checkout initiated for Car ID: ${carId}, Total Cost: $${totalCost}`);
    // In a real application, you would send this data to your backend
    // to create a booking record and initiate the Stripe payment.
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book Your Car</h1>
      {carId && <p className="mb-2">Booking for Car ID: {carId}</p>}
      {!carId && <p className="mb-2 text-yellow-500">Car ID is missing. Please go back and select a car.</p>}

      <div className="mb-4">
        <label htmlFor="pickupLocation" className="block text-gray-700 text-sm font-bold mb-2">Pickup Location:</label>
        <select
          id="pickupLocation"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={pickupLocation}
          onChange={handlePickupLocationChange}
        >
          <option value="">Select Pickup Location</option>
          {pickupLocations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex space-x-4">
        <div>
          <label htmlFor="pickupDate" className="block text-gray-700 text-sm font-bold mb-2">Pickup Date:</label>
          <input
            type="date"
            id="pickupDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pickupDate}
            onChange={handlePickupDateChange}
          />
        </div>
        <div>
          <label htmlFor="pickupTime" className="block text-gray-700 text-sm font-bold mb-2">Pickup Time:</label>
          <input
            type="time"
            id="pickupTime"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={pickupTime}
            onChange={handlePickupTimeChange}
          />
        </div>
      </div>

      <div className="mb-4 flex space-x-4">
        <div>
          <label htmlFor="dropoffDate" className="block text-gray-700 text-sm font-bold mb-2">Drop-off Date:</label>
          <input
            type="date"
            id="dropoffDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={dropoffDate}
            onChange={handleDropoffDateChange}
          />
        </div>
        <div>
          <label htmlFor="dropoffTime" className="block text-gray-700 text-sm font-bold mb-2">Drop-off Time:</label>
          <input
            type="time"
            id="dropoffTime"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={dropoffTime}
            onChange={handleDropoffTimeChange}
          />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
        <div className="mb-2">
          <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">Full Name:</label>
          <input
            type="text"
            id="fullName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={fullName}
            onChange={handleFullNameChange}
          />
        </div>
        <div className="mb-2">
          <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
          />
        </div>
        <div className="mb-2">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={handleEmailChange}
          />
        </div>
      </div>

      <div className="bg-indigo-100 border border-indigo-400 text-indigo-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Rate:</strong> ${dailyRate}/day
        <span className="block sm:inline"> | </span>
        <strong className="font-bold">Booking Days:</strong> {bookingDays}
        <span className="block sm:inline"> | </span>
        <strong className="font-bold">Total Cost:</strong> ${totalCost}
      </div>

      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleCheckout}
      >
        Checkout
      </button>
    </div>
  );
}