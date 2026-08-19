import { getComments } from "@/features/pokemon/api/comments";
import { PostCommentsList } from "@/features/pokemon/components/client/PostCommentsList";

// Async Server Component behind its own <Suspense>: does the fetch that
// is critical for SEO/LCP without blocking PokemonHeader or AlbumsSection.
export async function CommentsSection() {
  const comments = await getComments();
  return <PostCommentsList initialComments={comments} />;
}
