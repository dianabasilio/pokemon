import Image from "next/image";
import type { Pokemon } from "@/lib/types";

type PokemonHeaderProps = {
  name: string;
  sprite: string | null;
  types: Pokemon["types"];
};

export function PokemonHeader({ name, sprite, types }: Readonly<PokemonHeaderProps>) {
  return (
    <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      {sprite && (
        <Image
          src={sprite}
          alt={`${name} sprite`}
          width={160}
          height={160}
          priority
          className="bg-gray-50 rounded-lg"
        />
      )}
      <div>
        <h1 className="text-3xl font-bold capitalize">{name}</h1>
        <ul className="mt-2 flex gap-2">
          {types.map(({ type }) => (
            <li
              key={type.name}
              className="rounded-full bg-gray-200 px-3 py-1 text-sm capitalize"
            >
              {type.name}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
