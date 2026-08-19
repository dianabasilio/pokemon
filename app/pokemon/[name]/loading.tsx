export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl p-6 py-10 animate-pulse">
      <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="h-40 w-40 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-3 pt-2">
          <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </main>
  );
}
