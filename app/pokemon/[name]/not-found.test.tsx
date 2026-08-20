import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PokemonNotFound from "./not-found";

describe("PokemonNotFound", () => {
  it("renders the not-found message and a link back home", () => {
    render(<PokemonNotFound />);
    expect(screen.getByText("Pokémon not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
