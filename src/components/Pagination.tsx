interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-sm text-gray-500 dark:text-gray-400 px-3">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
