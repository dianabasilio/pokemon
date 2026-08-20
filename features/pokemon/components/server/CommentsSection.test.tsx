import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommentsSection } from "./CommentsSection";
import { getComments } from "../../api/comments";

vi.mock("../../api/comments", () => ({
  getComments: vi.fn(),
}));

// PostCommentsList is a Client Component with its own SWR/dynamic-import
// concerns, already covered by its own test suite — isolate it here so
// this test only verifies CommentsSection's orchestration responsibility.
vi.mock("../client/PostCommentsList", () => ({
  PostCommentsList: ({ initialComments }: { initialComments: { id: number }[] }) => (
    <div data-testid="comments-count">{initialComments.length}</div>
  ),
}));

describe("CommentsSection", () => {
  it("fetches comments and passes them to PostCommentsList", async () => {
    vi.mocked(getComments).mockResolvedValue([
      { postId: 1, id: 1, name: "Ash", email: "a@a.com", body: "hi" },
      { postId: 1, id: 2, name: "Misty", email: "b@b.com", body: "hey" },
    ]);

    const ui = await CommentsSection();
    render(ui);

    expect(screen.getByTestId("comments-count")).toHaveTextContent("2");
  });
});
