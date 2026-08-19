import { z } from "zod";
import { UpstreamError } from "@/features/pokemon/errors";
import type { Comment } from "@/features/pokemon/types";

const commentSchema = z.object({
  postId: z.number(),
  id: z.number(),
  name: z.string(),
  email: z.string(),
  body: z.string(),
});

const COMMENTS_URL = "https://jsonplaceholder.typicode.com/comments?_limit=100";

/**
 * Secondary, slow content (~2s): revalidated every minute and lives behind
 * a <Suspense> boundary, so it never blocks the route's initial render.
 */
export async function getComments(): Promise<Comment[]> {
  const res = await fetch(COMMENTS_URL, {
    next: { revalidate: 60, tags: ["comments"] },
  });
  if (!res.ok) {
    throw new UpstreamError("comments", res.status);
  }
  const parsed = z.array(commentSchema).safeParse(await res.json());
  return parsed.success ? parsed.data : [];
}

/**
 * JSONPlaceholder is a mock API: it responds 201 with a simulated object but
 * never persists the data (a later GET will not include it).
 */
export async function createComment(body: string): Promise<Comment> {
  const res = await fetch("https://jsonplaceholder.typicode.com/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body, postId: 1, name: "Anonymous trainer" }),
  });
  if (!res.ok) {
    throw new UpstreamError("create comment", res.status);
  }
  const data = await res.json();
  return {
    postId: data.postId ?? 1,
    id: data.id ?? Date.now(),
    name: data.name ?? "Anonymous trainer",
    email: data.email ?? "anonymous@example.com",
    body: data.body ?? body,
  };
}
