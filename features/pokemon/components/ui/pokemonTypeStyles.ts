// Static lookup, not string interpolation: every class string below must
// appear literally in source for Tailwind's JIT scanner to generate it.
type TypeStyle = {
  /** Solid badge background + text color for this type. */
  badge: string;
  /** Soft tinted background, used behind the sprite. */
  soft: string;
};

export const POKEMON_TYPE_STYLES: Record<string, TypeStyle> = {
  normal: { badge: "bg-neutral-400 text-white", soft: "bg-neutral-50 dark:bg-neutral-900/40" },
  fire: { badge: "bg-orange-500 text-white", soft: "bg-orange-50 dark:bg-orange-950/40" },
  water: { badge: "bg-blue-500 text-white", soft: "bg-blue-50 dark:bg-blue-950/40" },
  electric: { badge: "bg-yellow-400 text-neutral-900", soft: "bg-yellow-50 dark:bg-yellow-950/40" },
  grass: { badge: "bg-green-500 text-white", soft: "bg-green-50 dark:bg-green-950/40" },
  ice: { badge: "bg-cyan-400 text-neutral-900", soft: "bg-cyan-50 dark:bg-cyan-950/40" },
  fighting: { badge: "bg-red-700 text-white", soft: "bg-red-50 dark:bg-red-950/40" },
  poison: { badge: "bg-purple-500 text-white", soft: "bg-purple-50 dark:bg-purple-950/40" },
  ground: { badge: "bg-amber-600 text-white", soft: "bg-amber-50 dark:bg-amber-950/40" },
  flying: { badge: "bg-indigo-400 text-white", soft: "bg-indigo-50 dark:bg-indigo-950/40" },
  psychic: { badge: "bg-pink-500 text-white", soft: "bg-pink-50 dark:bg-pink-950/40" },
  bug: { badge: "bg-lime-500 text-neutral-900", soft: "bg-lime-50 dark:bg-lime-950/40" },
  rock: { badge: "bg-yellow-800 text-white", soft: "bg-yellow-50 dark:bg-yellow-950/40" },
  ghost: { badge: "bg-violet-700 text-white", soft: "bg-violet-50 dark:bg-violet-950/40" },
  dragon: { badge: "bg-indigo-700 text-white", soft: "bg-indigo-50 dark:bg-indigo-950/40" },
  dark: { badge: "bg-neutral-700 text-white", soft: "bg-neutral-100 dark:bg-neutral-900/60" },
  steel: { badge: "bg-slate-400 text-neutral-900", soft: "bg-slate-50 dark:bg-slate-900/40" },
  fairy: { badge: "bg-pink-300 text-neutral-900", soft: "bg-pink-50 dark:bg-pink-950/40" },
};

export const DEFAULT_TYPE_STYLE: TypeStyle = {
  badge: "bg-gray-400 text-white",
  soft: "bg-gray-50 dark:bg-gray-900/40",
};

export function getTypeStyle(typeName: string): TypeStyle {
  return POKEMON_TYPE_STYLES[typeName] ?? DEFAULT_TYPE_STYLE;
}
