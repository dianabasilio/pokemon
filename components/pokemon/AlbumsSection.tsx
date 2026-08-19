import { getAlbums } from "@/lib/api/albums";
import { UserAlbumsCarousel } from "@/components/pokemon/UserAlbumsCarousel";

// Async Server Component: its own await doesn't block the rest of the page
// because a <Suspense> boundary wraps it from app/pokemon/[name]/page.tsx.
export async function AlbumsSection() {
  const albums = await getAlbums();
  return <UserAlbumsCarousel items={albums} />;
}
