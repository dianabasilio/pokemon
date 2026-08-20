import { describe, it, expect, vi } from "vitest";
import { getPokemon } from "@/features/pokemon";
import { generateStaticParams, generateMetadata } from "./page";

vi.mock("@/features/pokemon", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/pokemon")>();
  return { ...actual, getPokemon: vi.fn() };
});

const VALID_POKEMON = {
  id: 132,
  name: "ditto",
  height: 3,
  weight: 40,
  sprites: { front_default: "https://raw.githubusercontent.com/x/132.png" },
  types: [{ slot: 1, type: { name: "normal", url: "https://x" } }],
};

describe("generateStaticParams", () => {
  it("returns the most-visited Pokémon for build-time SSG", () => {
    const params = generateStaticParams();
    expect(params).toContainEqual({ name: "ditto" });
    expect(params).toContainEqual({ name: "pikachu" });
    expect(params.length).toBeGreaterThanOrEqual(10);
  });
});

describe("generateMetadata", () => {
  it("builds title/description/OG data from the fetched Pokémon", async () => {
    vi.mocked(getPokemon).mockResolvedValue(VALID_POKEMON);

    const metadata = await generateMetadata({ params: { name: "ditto" } });

    expect(metadata.title).toBe("ditto — Pokémon Detail");
    expect(metadata.alternates).toEqual({ canonical: "/pokemon/ditto" });
  });

  it("returns a not-found title for an invalid name, without calling getPokemon", async () => {
    const metadata = await generateMetadata({ params: { name: "??" } });
    expect(metadata.title).toBe("Pokémon not found");
    expect(getPokemon).not.toHaveBeenCalled();
  });

  it("returns a not-found title when the fetch fails", async () => {
    vi.mocked(getPokemon).mockRejectedValue(new Error("boom"));
    const metadata = await generateMetadata({ params: { name: "mewthree" } });
    expect(metadata.title).toBe("Pokémon not found");
  });
});
