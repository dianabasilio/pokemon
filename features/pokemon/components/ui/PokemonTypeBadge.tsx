import { getTypeStyle } from "@/features/pokemon/components/ui/pokemonTypeStyles";

export function PokemonTypeBadge({ typeName }: Readonly<{ typeName: string }>) {
  const { badge } = getTypeStyle(typeName);
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badge}`}
    >
      {typeName}
    </span>
  );
}
