import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PokemonTypeBadge } from "./PokemonTypeBadge";

describe("PokemonTypeBadge", () => {
  it("renders the type name and its dedicated color for a known type", () => {
    render(<PokemonTypeBadge typeName="fire" />);
    const badge = screen.getByText("fire");
    expect(badge.className).toContain("bg-orange-500");
  });

  it("falls back to the default style for an unknown type", () => {
    render(<PokemonTypeBadge typeName="cosmic" />);
    const badge = screen.getByText("cosmic");
    expect(badge.className).toContain("bg-gray-400");
  });
});
