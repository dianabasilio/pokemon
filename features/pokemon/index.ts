// Public surface of the `pokemon` feature. Consumers outside this folder
// (e.g. app/pokemon/[name]/page.tsx) should only import from here, never
// reach into components/server, components/client, or api directly.
export { getPokemon } from "@/features/pokemon/api/pokemon";
export { parsePokemonName } from "@/features/pokemon/validation";
export { NotFoundError } from "@/features/pokemon/errors";
export { PokemonHeader } from "@/features/pokemon/components/ui/PokemonHeader";
export {
  CommentsSkeleton,
  AlbumsSkeleton,
} from "@/features/pokemon/components/ui/Skeletons";
export { CommentsSection } from "@/features/pokemon/components/server/CommentsSection";
export { AlbumsSection } from "@/features/pokemon/components/server/AlbumsSection";
export type { Pokemon, Comment, Album } from "@/features/pokemon/types";
