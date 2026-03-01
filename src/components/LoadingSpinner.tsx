export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-800" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
        Scraping...
      </span>
    </div>
  );
}
