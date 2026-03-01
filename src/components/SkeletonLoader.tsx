export default function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4 w-full">
      <div className="h-6 bg-gray-200 dark:bg-white/10 rounded-xl w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-lg w-full" />
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-lg w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-lg w-2/3" />
      </div>
      <div className="flex gap-3">
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl w-24" />
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl w-28" />
      </div>
    </div>
  );
}
