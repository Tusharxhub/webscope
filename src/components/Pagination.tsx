interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
