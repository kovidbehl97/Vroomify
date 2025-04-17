// components/Pagination.tsx
import React from 'react';

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ total, page, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-8">
      {page > 1 && (
        <button onClick={() => onPageChange(page - 1)} className="px-4 py-2 mr-2 bg-gray-200 rounded">
          Previous
        </button>
      )}
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`px-4 py-2 mx-1 rounded ${pageNumber === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {pageNumber}
        </button>
      ))}
      {page < totalPages && (
        <button onClick={() => onPageChange(page + 1)} className="px-4 py-2 ml-2 bg-gray-200 rounded">
          Next
        </button>
      )}
    </div>
  );
};

export default Pagination;