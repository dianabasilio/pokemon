import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PokemonHeader } from "./PokemonHeader";

const TYPES = [
  { slot: 1, type: { name: "fire", url: "https://x" } },
  { slot: 2, type: { name: "flying", url: "https://x" } },
];

describe("PokemonHeader", () => {
  it("renders the name, every type badge, and formatted height/weight", () => {
    render(
      <PokemonHeader
        name="charizard"
        sprite="https://raw.githubusercontent.com/x/6.png"
        height={17}
        weight={905}
        types={TYPES}
      />,
    );

    expect(screen.getByRole("heading", { name: "charizard" })).toBeInTheDocument();
    expect(screen.getByText("fire")).toBeInTheDocument();
    expect(screen.getByText("flying")).toBeInTheDocument();
    expect(screen.getByText("1.7 m")).toBeInTheDocument();
    expect(screen.getByText("90.5 kg")).toBeInTheDocument();
    expect(screen.getByAltText("charizard sprite")).toBeInTheDocument();
  });

  it("omits the sprite image when there is none", () => {
    render(
      <PokemonHeader name="ditto" sprite={null} height={3} weight={40} types={[]} />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
