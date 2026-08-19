"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import useSWR from "swr";
import { getComments } from "@/features/pokemon/api/comments";
import { CommentForm } from "@/features/pokemon/components/client/CommentForm";
import type { Comment } from "@/features/pokemon/types";

const COMMENTS_KEY = "comments";

export function PostCommentsList({
  initialComments,
}: Readonly<{
  initialComments: Comment[];
}>) {
  // fallbackData = what already arrived via SSR (SEO/LCP): no second
  // request on first render. From there on SWR owns the client cache and
  // revalidation, reusing the same getComments() the server already uses.
  const { data: comments = initialComments, mutate } = useSWR(
    COMMENTS_KEY,
    getComments,
    { fallbackData: initialComments, revalidateOnFocus: false },
  );

  const [query, setQuery] = useState("");
  // The input responds instantly; the heavy list recomputes in the
  // background at React 18's lower concurrent-rendering priority.
  const deferredQuery = useDeferredValue(query);

  const visible = useMemo(() => {
    const needle = deferredQuery.toLowerCase();
    return [...comments] // clone: never mutate the received/cached array
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((c) => c.body.toLowerCase().includes(needle));
  }, [comments, deferredQuery]);

  // `mutate` is stable across renders (same key), so this callback is too:
  // it prevents re-firing the success effect inside <CommentForm>.
  const appendOptimistic = useCallback(
    (comment: Comment) => {
      // JSONPlaceholder doesn't persist the POST: update the local cache
      // instead of forcing a real revalidation against the server.
      mutate((current = []) => [comment, ...current], { revalidate: false });
    },
    [mutate],
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search comments..."
        className="border p-2 w-full"
        aria-label="Search comments"
      />
      <ul className="mt-4 space-y-3">
        {visible.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong>
            <p>{c.body}</p>
          </li>
        ))}
      </ul>
      <CommentForm onSuccess={appendOptimistic} />
    </div>
  );
}
