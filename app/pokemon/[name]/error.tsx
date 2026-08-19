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
    <main className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-gray-600">
        We couldn&apos;t load this Pokémon right now. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded bg-red-600 px-4 py-2 text-white"
      >
        Try again
      </button>
    </main>
  );
}
