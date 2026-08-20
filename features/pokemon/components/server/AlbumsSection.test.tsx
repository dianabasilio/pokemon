import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlbumsSection } from "./AlbumsSection";
import { getAlbums } from "../../api/albums";

vi.mock("../../api/albums", () => ({
  getAlbums: vi.fn(),
}));

describe("AlbumsSection", () => {
  it("fetches albums and renders them via UserAlbumsCarousel", async () => {
    vi.mocked(getAlbums).mockResolvedValue([
      { userId: 1, id: 1, title: "sample album" },
    ]);

    const ui = await AlbumsSection();
    render(ui);

    expect(screen.getByText("sample album")).toBeInTheDocument();
  });

  it("renders the empty state when there are no albums", async () => {
    vi.mocked(getAlbums).mockResolvedValue([]);

    const ui = await AlbumsSection();
    render(ui);

    expect(
      screen.getByText("No suggested albums right now."),
    ).toBeInTheDocument();
  });
});
