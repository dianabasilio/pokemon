import { describe, it, expect } from "vitest";
import { NotFoundError, UpstreamError } from "./errors";

describe("NotFoundError", () => {
  it("builds a message from the resource name", () => {
    const err = new NotFoundError('Pokémon "mewthree"');
    expect(err.name).toBe("NotFoundError");
    expect(err.message).toBe('Pokémon "mewthree" not found');
  });
});

describe("UpstreamError", () => {
  it("builds a message from the resource name and status", () => {
    const err = new UpstreamError("PokeAPI", 500);
    expect(err.name).toBe("UpstreamError");
    expect(err.message).toBe("Failed to fetch PokeAPI (status 500)");
  });
});
