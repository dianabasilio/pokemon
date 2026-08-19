function SkeletonLines({ count }: { count: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-gray-200" />
      ))}
    </div>
  );
}

export function CommentsSkeleton() {
  return <SkeletonLines count={4} />;
}

export function AlbumsSkeleton() {
  return <SkeletonLines count={3} />;
}
