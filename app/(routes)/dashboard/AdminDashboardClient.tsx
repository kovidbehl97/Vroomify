"use client";

import { useState } from "react";
import CarList from "../../_components/CarList";
import AdminCarModal from "../../_components/AdminCarModal";
import { Car } from "../../_lib/types";

type ModalOperation = "add" | "edit" | "delete" | null;

export default function AdminDashboardClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOperation, setModalOperation] = useState<ModalOperation>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddCarClick = () => {
    setModalOperation("add");
    setSelectedCar(null);
    setIsModalOpen(true);
  };

  const handleEditCarClick = (car: Car) => {
    setModalOperation("edit");
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleDeleteCarClick = (car: Car) => {
    setModalOperation("delete");
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalOperation(null);
    setSelectedCar(null);
  };

  const handleOperationSuccess = () => {
    handleCloseModal();
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="relative top-34">
      <div className=" font-bold text-center relative bottom-24 container mx-auto">
        <h1 className="text-5xl w-full">Dashboard</h1>
        <button
          onClick={handleAddCarClick}
          className="bg-black text-white px-6 py-2 absolute right-0 top-1 text-nowrap cursor-pointer font-normal"
        >
          Add Car
        </button>
      </div>
      <CarList
        key={refreshKey}
        onEditClick={handleEditCarClick}
        onDeleteClick={handleDeleteCarClick}
      />
      {isModalOpen && (
        <AdminCarModal
          isOpen={isModalOpen}
          operation={modalOperation}
          car={selectedCar}
          onClose={handleCloseModal}
          onSuccess={handleOperationSuccess}
        />
      )}
    </div>
  );
}
