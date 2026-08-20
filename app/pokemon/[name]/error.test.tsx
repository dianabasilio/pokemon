import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PokemonError from "./error";

describe("PokemonError", () => {
  it("renders the error message and calls reset on click", async () => {
    const reset = vi.fn();
    const error = Object.assign(new Error("boom"), { digest: "abc" });

    render(<PokemonError error={error} reset={reset} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
