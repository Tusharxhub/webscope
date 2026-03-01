export default function SkeletonLoader() {
  return (
    <div className="space-y-4 w-full animate-fade-in">
      <div className="h-5 skeleton-shimmer rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 skeleton-shimmer rounded w-full" />
        <div className="h-4 skeleton-shimmer rounded w-5/6" />
        <div className="h-4 skeleton-shimmer rounded w-2/3" />
      </div>
      <div className="flex gap-3">
        <div className="h-7 skeleton-shimmer rounded w-20" />
        <div className="h-7 skeleton-shimmer rounded w-24" />
      </div>
    </div>
  );
}
