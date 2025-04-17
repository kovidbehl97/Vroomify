"use client";
import React, { useState, useEffect } from "react";
import { db } from "../auth/firebase";
import {
  collection,
  getDocs,
  query,
  limit,
  orderBy,
  startAfter,
  where,
} from "firebase/firestore";
import Link from "next/link"; // Import the Link component from Next.js

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  carType: string;
  transmission: string;
}

const ITEMS_PER_PAGE = 8;

const CarList = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<any | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [makeFilter, setMakeFilter] = useState("");
  const [carTypeFilter, setCarTypeFilter] = useState("");
  const [carTypes] = useState([
    "Sedan",
    "SUV",
    "Truck",
    "Electric Sedan",
    "Minivan",
    "Hatchback",
  ]);
  const [makes, setMakes] = useState<string[]>([]);

  useEffect(() => {
    const fetchUniqueMakes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "cars"));
        const uniqueMakes = [
          ...new Set(snapshot.docs.map((doc) => doc.data().make)),
        ].sort();
        setMakes(uniqueMakes);
      } catch (error) {
        console.error("Error fetching unique makes:", error);
      }
    };

    fetchUniqueMakes();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      let q = query(collection(db, "cars"));

      if (carTypeFilter) {
        q = query(q, where("carType", "==", carTypeFilter));
      }

      if (makeFilter) {
        q = query(q, where("make", "==", makeFilter));
      }

      q = query(q, orderBy("make"), limit(ITEMS_PER_PAGE));
      if (lastVisible && currentPage > 1) {
        q = query(q, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const newCars = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Car)
      );

      setCars(newCars);
      setLoading(false);

      if (querySnapshot.docs.length < ITEMS_PER_PAGE) {
        setHasNextPage(false);
      } else if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasNextPage(true);
      } else {
        setHasNextPage(false);
      }
    } catch (e: any) {
      console.error("Error fetching cars:", e);
      setError("Failed to fetch cars.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset pagination and fetch when filters change
    setCurrentPage(1); // Reset to the first page
    setLastVisible(null); // Reset the starting point for pagination
    setCars([]); // Clear the existing cars
    fetchCars();
  }, [makeFilter, carTypeFilter]);

  useEffect(() => {
    if (currentPage > 1 && !loading) {
      fetchCars();
    }
    if (currentPage === 1 && cars.length === 0 && !loading) {
      fetchCars();
    }
  }, [currentPage]);

  const nextPage = () => {
    if (hasNextPage && !loading) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1 && !loading) {
      setCurrentPage((prevPage) => prevPage - 1);
      setLastVisible(null);
      setCars([]);
      fetchCars();
    }
  };

  const handleMakeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMakeFilter(e.target.value);
  };

  const handleCarTypeFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCarTypeFilter(e.target.value);
  };

  if (loading)
    return (
      <div className="h-screen ">
      </div>
    );

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="h-screen">
      <h1>Available Cars</h1>

      <div className="mb-4 flex items-center space-x-4">
        <select
          value={makeFilter}
          onChange={handleMakeFilterChange}
          className="p-2 border rounded"
        >
          <option value="">All Makes</option>
          {makes.map((make, index) => (
            <option key={index} value={make}>
              {make}
            </option>
          ))}
        </select>
        <select
          value={carTypeFilter}
          onChange={handleCarTypeFilterChange}
          className="p-2 border rounded"
        >
          <option value="">All Types</option>
          {carTypes.map((type,index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative">
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-100 bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        {cars.map((car) => (
          <div key={car.id} className="bg-white rounded-md shadow-md p-4">
            <h2 className="text-xl font-semibold">
              {car.year} {car.make} {car.model}
            </h2>
            <p className="text-gray-600">Type: {car.carType}</p>
            <p className="text-gray-600">Transmission: {car.transmission}</p>
            <p className="text-gray-600">Mileage: {car.mileage} miles</p>
            <p className="text-lg font-bold text-indigo-600">
              ${car.price}/hour
            </p>
            <div className="mt-4">
              {/* Use Link to create a link to the car details page */}
              <Link
                href={`/${car.id}`}
                rel="noopener noreferrer"
              >
                <button className="...">View Details</button>
              </Link>
            </div>
          </div>
        ))}
        {cars.length === 0 && !loading && (
          <p>No cars found matching your criteria.</p>
        )}
      </div>

      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={prevPage}
          disabled={currentPage === 1 || loading}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={nextPage}
          disabled={!hasNextPage || loading}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CarList;



