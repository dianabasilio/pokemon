import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPokemon,
  parsePokemonName,
  NotFoundError,
  PokemonHeader,
  CommentsSection,
  AlbumsSection,
  CommentsSkeleton,
  AlbumsSkeleton,
} from "@/features/pokemon";

type PageProps = { params: { name: string } };

// Pre-renders the most visited Pokémon at build time (SSG); the rest are
// served via on-demand ISR the first time someone requests them
// (dynamicParams defaults to true).
export function generateStaticParams() {
  const mostVisited = [
    "pikachu",
    "charizard",
    "bulbasaur",
    "squirtle",
    "mewtwo",
    "gengar",
    "eevee",
    "snorlax",
    "ditto",
    "dragonite",
  ];
  return mostVisited.map((name) => ({ name }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const name = parsePokemonName(params.name);
  if (!name) return { title: "Pokémon not found" };

  try {
    // Same fetch the page uses: Next dedupes it, so it isn't called twice.
    const pokemon = await getPokemon(name);
    const title = `${pokemon.name} — Pokémon Detail`;
    const description = `${pokemon.name}'s profile: type, height, weight, and trainer comments.`;
    return {
      title,
      description,
      alternates: { canonical: `/pokemon/${pokemon.name}` },
      openGraph: {
        title,
        description,
        images: pokemon.sprites.front_default
          ? [pokemon.sprites.front_default]
          : [],
      },
    };
  } catch {
    return { title: "Pokémon not found" };
  }
}

export default async function PokemonDetailPage({ params }: PageProps) {
  const name = parsePokemonName(params.name);
  if (!name) notFound();

  let pokemon;
  try {
    pokemon = await getPokemon(name);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error; // caught by app/pokemon/[name]/error.tsx
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pokemon.name,
    image: pokemon.sprites.front_default ?? undefined,
    additionalProperty: pokemon.types.map(({ type }) => ({
      "@type": "PropertyValue",
      name: "type",
      value: type.name,
    })),
  };

  return (
    <main className="mx-auto max-w-4xl p-6 py-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PokemonHeader
        name={pokemon.name}
        sprite={pokemon.sprites.front_default}
        height={pokemon.height}
        weight={pokemon.weight}
        types={pokemon.types}
      />

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Trainer Comments
        </h2>
        <Suspense fallback={<CommentsSkeleton />}>
          <CommentsSection />
        </Suspense>
      </section>

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Suggested Albums
        </h2>
        <Suspense fallback={<AlbumsSkeleton />}>
          <AlbumsSection />
        </Suspense>
      </section>
    </main>
  );
}
