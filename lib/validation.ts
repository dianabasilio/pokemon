import { z } from "zod";

// PokeAPI names: lowercase, no spaces, only letters/numbers/hyphens.
export const pokemonNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Pokémon name is required")
  .max(50, "Pokémon name is too long")
  .regex(/^[a-z0-9-]+$/, "Invalid Pokémon name");

export function parsePokemonName(rawName: string): string | null {
  const result = pokemonNameSchema.safeParse(rawName);
  return result.success ? result.data : null;
}

export const commentFormSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment cannot exceed 500 characters"),
});
