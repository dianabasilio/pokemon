import Link from "next/link";

export default function PokemonNotFound() {
  return (
    <main className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold">Pokémon not found</h1>
      <p className="mt-2 text-gray-600">
        We couldn&apos;t find that Pokémon. Check the name and try again.
      </p>
      <Link href="/" className="mt-6 inline-block text-red-600 underline">
        Back to home
      </Link>
    </main>
  );
}
