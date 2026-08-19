import Link from "next/link";

export default function PokemonNotFound() {
  return (
    <main className="mx-auto max-w-4xl p-6 py-10 text-center">
      <div className="rounded-2xl border border-gray-100 bg-white p-10 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pokémon not found
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          We couldn&apos;t find that Pokémon. Check the name and try again.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 active:scale-[0.98]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
