import Link from "next/link";

const FEATURED = ["ditto", "pikachu", "charizard", "mewtwo"];

export default function HomePage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Pokédex</h1>
      <p className="mt-2 text-gray-600">
        Try the detail page with streaming, per-endpoint caching, and Server
        Actions.
      </p>
      <ul className="mt-6 flex flex-wrap gap-3">
        {FEATURED.map((name) => (
          <li key={name}>
            <Link
              href={`/pokemon/${name}`}
              className="inline-block rounded-full bg-gray-200 px-4 py-2 capitalize hover:bg-gray-300"
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
