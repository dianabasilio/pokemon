import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CommentsSkeleton, AlbumsSkeleton } from "./Skeletons";

describe("Skeletons", () => {
  it("CommentsSkeleton renders 4 pulsing placeholder lines", () => {
    const { container } = render(<CommentsSkeleton />);
    expect(container.querySelectorAll(".animate-pulse > div")).toHaveLength(4);
  });

  it("AlbumsSkeleton renders 3 pulsing placeholder lines", () => {
    const { container } = render(<AlbumsSkeleton />);
    expect(container.querySelectorAll(".animate-pulse > div")).toHaveLength(3);
  });
});
