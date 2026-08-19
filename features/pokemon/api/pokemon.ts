import { z } from "zod";
import { NotFoundError, UpstreamError } from "@/features/pokemon/errors";
import type { Pokemon } from "@/features/pokemon/types";

const pokemonResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  sprites: z.object({
    front_default: z.string().nullable(),
  }),
  types: z.array(
    z.object({
      slot: z.number(),
      type: z.object({ name: z.string(), url: z.string() }),
    }),
  ),
});

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/pokemon";

/**
 * Practically immutable data in PokeAPI: revalidated once a day (ISR),
 * which keeps the route static and optimal for SEO/LCP.
 */
export async function getPokemon(name: string): Promise<Pokemon> {
  const res = await fetch(`${POKEAPI_BASE_URL}/${encodeURIComponent(name)}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (res.status === 404) {
    throw new NotFoundError(`Pokémon "${name}"`);
  }
  if (!res.ok) {
    throw new UpstreamError("PokeAPI", res.status);
  }

  const parsed = pokemonResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new UpstreamError("PokeAPI (unexpected response shape)", res.status);
  }
  return parsed.data;
}
