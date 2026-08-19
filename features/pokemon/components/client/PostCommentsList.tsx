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
        className="w-full rounded-lg border border-gray-200 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        aria-label="Search comments"
      />
      <ul className="mt-4 space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
        {visible.map((c) => (
          <li key={c.id} className="pt-3 first:pt-0">
            <strong className="text-gray-900 dark:text-gray-100">{c.name}</strong>
            <p className="text-gray-600 dark:text-gray-400">{c.body}</p>
          </li>
        ))}
      </ul>
      <CommentForm onSuccess={appendOptimistic} />
    </div>
  );
}
