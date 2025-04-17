'use client';
import { useState, useEffect } from 'react';
import { fetchCars } from '../_lib/api';
import CarCard from './CarCard';
import SearchBar from './SearchBar';
import Filter from './Filter';
import Pagination from './Pagination';
import { Car } from '../_lib/types';

export default function CarCatalogue() {
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [carType, setCarType] = useState('');
  const [transmission, setTransmission] = useState('');

  useEffect(() => {
    async function loadCars() {
      try {
        const data = await fetchCars({ search, carType, transmission, page, limit });
        setCars(data.cars);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    }
    loadCars();
  }, [search, carType, transmission, page]);

  return (
    <section className="container mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Our Cars</h2>
      <div className="flex mb-6">
        <SearchBar onSearch={setSearch} />
        <Filter
          label="Car Type"
          options={['SUV', 'Sedan', 'Hatchback']}
          onChange={setCarType}
        />
        <Filter
          label="Transmission"
          options={['Automatic', 'Manual']}
          onChange={setTransmission}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard key={car._id} car={car} />
        ))}
      </div>
      <Pagination
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />
    </section>
  );
}