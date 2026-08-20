import { describe, it, expect, vi, afterEach } from "vitest";
import { getAlbums } from "./albums";
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

const VALID_ALBUM = { userId: 1, id: 1, title: "quidem molestiae enim" };

describe("getAlbums", () => {
  it("returns parsed albums on success", async () => {
    mockFetch(200, [VALID_ALBUM]);
    expect(await getAlbums()).toEqual([VALID_ALBUM]);
  });

  it("throws UpstreamError on a failed request", async () => {
    mockFetch(500, {});
    await expect(getAlbums()).rejects.toBeInstanceOf(UpstreamError);
  });

  it("falls back to an empty list when the response doesn't match the schema", async () => {
    mockFetch(200, { unexpected: "shape" });
    expect(await getAlbums()).toEqual([]);
  });
});
