"use client";

import { useEffect } from "react";

// error.tsx must be a Client Component: it catches network/5xx failures
// from PokeAPI (or any other unhandled error) without taking down the rest
// of the site.
export default function PokemonError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Technical detail stays in server logs/console, never shown to the user.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-4xl p-6 py-10 text-center">
      <div className="rounded-2xl border border-gray-100 bg-white p-10 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          We couldn&apos;t load this Pokémon right now. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
