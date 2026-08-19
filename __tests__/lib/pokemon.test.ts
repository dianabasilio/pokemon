import { describe, it, expect, vi, afterEach } from "vitest";
import { getPokemon } from "@/lib/api/pokemon";
import { NotFoundError, UpstreamError } from "@/lib/errors";

const VALID_POKEMON = {
  id: 132,
  name: "ditto",
  height: 3,
  weight: 40,
  sprites: { front_default: "https://raw.githubusercontent.com/x/132.png" },
  types: [{ slot: 1, type: { name: "normal", url: "https://x" } }],
};

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getPokemon", () => {
  it("returns the pokémon when the response is valid", async () => {
    mockFetch(200, VALID_POKEMON);
    const pokemon = await getPokemon("ditto");
    expect(pokemon.name).toBe("ditto");
  });

  it("throws NotFoundError on a 404 (nonexistent name)", async () => {
    mockFetch(404, {});
    await expect(getPokemon("mewthree")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws UpstreamError on any other network failure", async () => {
    mockFetch(500, {});
    await expect(getPokemon("ditto")).rejects.toBeInstanceOf(UpstreamError);
  });

  it("throws UpstreamError if the response doesn't match the expected schema", async () => {
    mockFetch(200, { unexpected: "shape" });
    await expect(getPokemon("ditto")).rejects.toBeInstanceOf(UpstreamError);
  });
});
