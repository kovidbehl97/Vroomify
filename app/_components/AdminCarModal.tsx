// app/_components/AdminCarModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createCar, updateCar, deleteCar } from '../_lib/api'; // Import your API functions
import { Car } from '../_lib/types'; // Import your Car type

// Define props for the modal
interface AdminCarModalProps {
  isOpen: boolean;
  operation: 'add' | 'edit' | 'delete' | null;
  car: Car | null; // Car data for edit/delete
  onClose: () => void; // Handler to close the modal
  onSuccess: () => void; // Handler to call after successful operation
}

export default function AdminCarModal({ isOpen, operation, car, onClose, onSuccess }: AdminCarModalProps) {
  // State for form fields (for add/edit)
  const [formData, setFormData] = useState<Partial<Car>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to populate form data when car prop changes (for edit)
  useEffect(() => {
    if (operation === 'edit' && car) {
      setFormData(car); // Populate form with car data when editing
    } else {
      setFormData({}); // Clear form data for add/delete
    }
    setError(null); // Clear errors when modal opens/operation changes
  }, [operation, car]);

  // Don't render the modal if not open
  if (!isOpen) {
    return null;
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'year' || name === 'price' || name === 'mileage' ? Number(value) : value, // Convert numbers
    }));
  };

  // Handle form submission (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (operation === 'add') {
        await createCar(formData);
        console.log('Car added successfully');
      } else if (operation === 'edit' && car?._id) {
        await updateCar(car._id.toString(), formData); // Pass car ID and updated data
        console.log(`Car ${car._id} updated successfully`);
      }
      onSuccess(); // Call success handler to close modal and refresh list

    } catch (err: any) {
      console.error(`Error during ${operation} car operation:`, err);
      setError(err.message || `Failed to ${operation} car.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete confirmation
  const handleDeleteConfirm = async () => {
    if (car?._id && operation === 'delete') {
      setLoading(true);
      setError(null);
      try {
        await deleteCar(car._id.toString()); // Pass car ID to delete
        console.log(`Car ${car._id} deleted successfully`);
        onSuccess(); // Call success handler
      } catch (err: any) {
        console.error(`Error during delete car operation:`, err);
        setError(err.message || 'Failed to delete car.');
      } finally {
        setLoading(false);
      }
    }
  };


  // Determine modal title
  const modalTitle = operation === 'add' ? 'Add New Car' : operation === 'edit' ? `Edit ${car?.make} ${car?.model}` : `Delete ${car?.make} ${car?.model}?`;

  return (
    // Basic Modal Overlay and Structure (Styling needed)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{modalTitle}</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* --- Render content based on operation --- */}
        {operation === 'delete' ? (
          // --- Delete Confirmation ---
          <div>
            <p>Are you sure you want to delete this car?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ) : (
          // --- Add/Edit Form ---
          <form onSubmit={handleSubmit}>
            {/* Example Form Fields (Adjust based on your Car type) */}
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Make</label>
              <input type="text" name="make" value={formData.make || ''} onChange={handleChange} className="border p-2 rounded w-full" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Model</label>
              <input type="text" name="model" value={formData.model || ''} onChange={handleChange} className="border p-2 rounded w-full" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Year</label>
              <input type="number" name="year" value={formData.year || ''} onChange={handleChange} className="border p-2 rounded w-full" required />
            </div>
             <div className="mb-4">
              <label className="block mb-1 text-gray-700">Price Per Day ($)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="border p-2 rounded w-full" required /> {/* Assuming 'price' is the field name */}
            </div>
             {/* Add other fields like mileage, carType, transmission */}

             <div className="mb-4">
              <label className="block mb-1 text-gray-700">Mileage</label>
              <input type="number" name="mileage" value={formData.mileage || ''} onChange={handleChange} className="border p-2 rounded w-full" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Car Type</label>
              {/* Consider using a select dropdown like your Filter component */}
               
              {/* Example using select: */}
              <select name="carType" value={formData.carType || ''} onChange={handleChange} className="border p-2 rounded w-full" required>
                 <option value="">Select Type</option>
                 <option value="SUV">SUV</option>
                 <option value="Sedan">Sedan</option>
                 <option value="Hatchback">Hatchback</option>
               </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700">Transmission</label>
               {/* Consider using a select dropdown */}
               
               {/* Example using select: */}
               <select name="transmission" value={formData.transmission || ''} onChange={handleChange} className="border p-2 rounded w-full" required>
                 <option value="">Select Transmission</option>
                 <option value="Automatic">Automatic</option>
                 <option value="Manual">Manual</option>
               </select>
            </div>
            {/* Form Buttons */}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {loading ? (operation === 'add' ? 'Adding...' : 'Saving...') : (operation === 'add' ? 'Add Car' : 'Save Changes')}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}