import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Loading from "./loading";

describe("Loading", () => {
  it("renders a pulsing skeleton placeholder", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
