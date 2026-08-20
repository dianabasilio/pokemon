import { describe, it, expect } from "vitest";
import { parsePokemonName, commentFormSchema } from "./validation";

describe("parsePokemonName", () => {
  it("normalizes uppercase input to lowercase", () => {
    expect(parsePokemonName("Pikachu")).toBe("pikachu");
  });

  it("trims surrounding whitespace", () => {
    expect(parsePokemonName("  ditto  ")).toBe("ditto");
  });

  it("rejects an empty name", () => {
    expect(parsePokemonName("")).toBeNull();
  });

  it("rejects names with invalid characters", () => {
    expect(parsePokemonName("pika/chu")).toBeNull();
    expect(parsePokemonName("pika chu")).toBeNull();
  });

  it("rejects names that are too long", () => {
    expect(parsePokemonName("a".repeat(51))).toBeNull();
  });

  it("accepts hyphenated names", () => {
    expect(parsePokemonName("ho-oh")).toBe("ho-oh");
  });
});

describe("commentFormSchema", () => {
  it("accepts a non-empty comment", () => {
    const result = commentFormSchema.safeParse({ body: "Great Pokémon!" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty comment", () => {
    const result = commentFormSchema.safeParse({ body: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a comment longer than 500 characters", () => {
    const result = commentFormSchema.safeParse({ body: "a".repeat(501) });
    expect(result.success).toBe(false);
  });
});
