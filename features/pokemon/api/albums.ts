import { z } from "zod";
import { UpstreamError } from "@/features/pokemon/errors";
import type { Album } from "@/features/pokemon/types";

const albumSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
});

const ALBUMS_URL = "https://jsonplaceholder.typicode.com/albums?_limit=20";

/**
 * Secondary content (~2s) below the viewport: revalidated every minute and
 * lives behind its own <Suspense>, independent from comments/header.
 */
export async function getAlbums(): Promise<Album[]> {
  const res = await fetch(ALBUMS_URL, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new UpstreamError("albums", res.status);
  }
  const parsed = z.array(albumSchema).safeParse(await res.json());
  return parsed.success ? parsed.data : [];
}
