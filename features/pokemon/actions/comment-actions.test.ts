import { describe, it, expect, vi } from "vitest";
import { revalidateTag } from "next/cache";
import { addCommentAction } from "./comment-actions";
import { createComment } from "../api/comments";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("../api/comments", () => ({
  createComment: vi.fn(),
}));

const initialState = { status: "idle" as const };

function formDataWithBody(body: string) {
  const fd = new FormData();
  fd.set("body", body);
  return fd;
}

describe("addCommentAction", () => {
  it("returns a validation error and never calls createComment for an empty body", async () => {
    const result = await addCommentAction(initialState, formDataWithBody("   "));
    expect(result.status).toBe("error");
    expect(createComment).not.toHaveBeenCalled();
  });

  it("creates the comment, revalidates, and returns it on success", async () => {
    const comment = {
      postId: 1,
      id: 99,
      name: "Anonymous trainer",
      email: "anonymous@example.com",
      body: "Nice catch!",
    };
    vi.mocked(createComment).mockResolvedValue(comment);

    const result = await addCommentAction(
      initialState,
      formDataWithBody("Nice catch!"),
    );

    expect(createComment).toHaveBeenCalledWith("Nice catch!");
    expect(revalidateTag).toHaveBeenCalledWith("comments");
    expect(result).toEqual({ status: "success", comment });
  });

  it("returns a generic error when createComment fails", async () => {
    vi.mocked(createComment).mockRejectedValue(new Error("network down"));

    const result = await addCommentAction(
      initialState,
      formDataWithBody("Nice catch!"),
    );

    expect(result.status).toBe("error");
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
