import Image from "next/image";
import type { Pokemon } from "@/features/pokemon/types";
import { PokemonTypeBadge } from "@/features/pokemon/components/ui/PokemonTypeBadge";
import { getTypeStyle } from "@/features/pokemon/components/ui/pokemonTypeStyles";

type PokemonHeaderProps = {
  name: string;
  sprite: string | null;
  height: number;
  weight: number;
  types: Pokemon["types"];
};

export function PokemonHeader({
  name,
  sprite,
  height,
  weight,
  types,
}: Readonly<PokemonHeaderProps>) {
  const primaryType = types[0]?.type.name ?? "normal";
  const { soft } = getTypeStyle(primaryType);

  return (
    <header className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {sprite && (
          <div className={`shrink-0 rounded-xl p-4 ${soft}`}>
            <Image
              src={sprite}
              alt={`${name} sprite`}
              width={160}
              height={160}
              priority
            />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold capitalize tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            {name}
          </h1>
          <ul className="mt-3 flex gap-2">
            {types.map(({ type }) => (
              <li key={type.name}>
                <PokemonTypeBadge typeName={type.name} />
              </li>
            ))}
          </ul>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:max-w-xs">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Height
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {(height / 10).toFixed(1)} m
              </dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Weight
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {(weight / 10).toFixed(1)} kg
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </header>
  );
}
