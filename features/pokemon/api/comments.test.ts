import { describe, it, expect, vi, afterEach } from "vitest";
import { getComments, createComment } from "./comments";
import { UpstreamError } from "../errors";

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const VALID_COMMENT = {
  postId: 1,
  id: 1,
  name: "Ash",
  email: "ash@example.com",
  body: "Charizard is great",
};

describe("getComments", () => {
  it("returns parsed comments on success", async () => {
    mockFetch(200, [VALID_COMMENT]);
    const comments = await getComments();
    expect(comments).toEqual([VALID_COMMENT]);
  });

  it("throws UpstreamError on a failed request", async () => {
    mockFetch(500, {});
    await expect(getComments()).rejects.toBeInstanceOf(UpstreamError);
  });

  it("falls back to an empty list when the response doesn't match the schema", async () => {
    mockFetch(200, { unexpected: "shape" });
    expect(await getComments()).toEqual([]);
  });
});

describe("createComment", () => {
  it("maps the API response into a Comment", async () => {
    mockFetch(201, VALID_COMMENT);
    const comment = await createComment("Charizard is great");
    expect(comment).toEqual(VALID_COMMENT);
  });

  it("falls back to sane defaults when fields are missing", async () => {
    mockFetch(201, { body: "hi" });
    const comment = await createComment("hi");
    expect(comment.name).toBe("Anonymous trainer");
    expect(comment.body).toBe("hi");
  });

  it("throws UpstreamError when the request fails", async () => {
    mockFetch(500, {});
    await expect(createComment("hi")).rejects.toBeInstanceOf(UpstreamError);
  });
});
