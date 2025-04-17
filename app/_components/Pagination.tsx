'use client';

export default function Pagination({
  total,
  page,
  limit,
  onPageChange,
}: {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        Previous
      </button>
      <span className="px-4 py-2">Page {page} of {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        Next
      </button>
    </div>
  );
}