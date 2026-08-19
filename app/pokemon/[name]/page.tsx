import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPokemon } from "@/lib/api/pokemon";
import { parsePokemonName } from "@/lib/validation";
import { NotFoundError } from "@/lib/errors";
import { PokemonHeader } from "@/components/pokemon/PokemonHeader";
import { CommentsSection } from "@/components/pokemon/CommentsSection";
import { AlbumsSection } from "@/components/pokemon/AlbumsSection";
import { CommentsSkeleton, AlbumsSkeleton } from "@/components/pokemon/Skeletons";

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
    <main className="p-6 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PokemonHeader
        name={pokemon.name}
        sprite={pokemon.sprites.front_default}
        types={pokemon.types}
      />

      <section className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Trainer Comments</h2>
        <Suspense fallback={<CommentsSkeleton />}>
          <CommentsSection />
        </Suspense>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">Suggested Albums</h2>
        <Suspense fallback={<AlbumsSkeleton />}>
          <AlbumsSection />
        </Suspense>
      </section>
    </main>
  );
}
