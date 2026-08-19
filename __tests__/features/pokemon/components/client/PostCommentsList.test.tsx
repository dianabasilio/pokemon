import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostCommentsList } from "@/features/pokemon/components/client/PostCommentsList";
import type { Comment } from "@/features/pokemon/types";

const COMMENTS: Comment[] = vi.hoisted(() => [
  { postId: 1, id: 1, name: "Misty", email: "a@a.com", body: "I like Pikachu" },
  { postId: 1, id: 2, name: "Ash", email: "b@b.com", body: "Charizard is the best" },
  { postId: 1, id: 3, name: "Brock", email: "c@c.com", body: "Onix is strong" },
]);

// SWR's fetcher revalidates on mount: it resolves with the same data as
// fallbackData so the test doesn't depend on a real request.
vi.mock("@/features/pokemon/api/comments", () => ({
  getComments: vi.fn().mockResolvedValue(COMMENTS),
}));

// The form/Server Action isn't the focus of this test: it's isolated so
// the test doesn't depend on next/cache or a real request.
vi.mock("@/features/pokemon/components/client/CommentForm", () => ({
  CommentForm: () => null,
}));

describe("PostCommentsList", () => {
  it("filters by comment text without mutating the original array", async () => {
    const originalOrder = COMMENTS.map((c) => c.id);
    render(<PostCommentsList initialComments={COMMENTS} />);

    const input = screen.getByLabelText("Search comments");
    await userEvent.type(input, "Charizard");

    expect(await screen.findByText("Charizard is the best")).toBeInTheDocument();
    expect(screen.queryByText("I like Pikachu")).not.toBeInTheDocument();

    // The array received via props must not have been mutated by the internal .sort().
    expect(COMMENTS.map((c) => c.id)).toEqual(originalOrder);
  });

  it("sorts alphabetically by trainer name", () => {
    render(<PostCommentsList initialComments={COMMENTS} />);
    const names = screen.getAllByText(/Ash|Brock|Misty/).map((el) => el.textContent);
    expect(names).toEqual(["Ash", "Brock", "Misty"]);
  });
});
