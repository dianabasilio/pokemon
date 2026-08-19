export default function Loading() {
  return (
    <main className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-40 w-40 rounded-lg bg-gray-200" />
        <div className="space-y-3 pt-2">
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="h-5 w-24 rounded-full bg-gray-200" />
        </div>
      </div>
    </main>
  );
}
