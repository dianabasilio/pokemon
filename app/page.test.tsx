import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("links to each featured Pokémon's detail page", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: "ditto" })).toHaveAttribute(
      "href",
      "/pokemon/ditto",
    );
    expect(screen.getByRole("link", { name: "pikachu" })).toHaveAttribute(
      "href",
      "/pokemon/pikachu",
    );
  });
});
