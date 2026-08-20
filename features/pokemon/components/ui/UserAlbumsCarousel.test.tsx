import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserAlbumsCarousel } from "./UserAlbumsCarousel";

describe("UserAlbumsCarousel", () => {
  it("renders one item per album", () => {
    render(
      <UserAlbumsCarousel
        items={[
          { userId: 1, id: 1, title: "first album" },
          { userId: 1, id: 2, title: "second album" },
        ]}
      />,
    );
    expect(screen.getByText("first album")).toBeInTheDocument();
    expect(screen.getByText("second album")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no albums", () => {
    render(<UserAlbumsCarousel items={[]} />);
    expect(
      screen.getByText("No suggested albums right now."),
    ).toBeInTheDocument();
  });
});
