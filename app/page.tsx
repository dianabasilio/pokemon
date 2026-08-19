import Link from "next/link";

const FEATURED = ["ditto", "pikachu", "charizard", "mewtwo"];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-6 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        <span className="text-red-600">Poké</span>dex
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Try the detail page with streaming, per-endpoint caching, and Server
        Actions.
      </p>
      <ul className="mt-6 flex flex-wrap gap-3">
        {FEATURED.map((name) => (
          <li key={name}>
            <Link
              href={`/pokemon/${name}`}
              className="inline-block rounded-full border border-gray-200 bg-white px-4 py-2 capitalize text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
