import type { Album } from "@/features/pokemon/types";

export function UserAlbumsCarousel({ items }: Readonly<{ items: Album[] }>) {
  if (items.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No suggested albums right now.
      </p>
    );
  }

  return (
    <ul className="flex gap-4 overflow-x-auto pb-2">
      {items.map((album) => (
        <li
          key={album.id}
          className="min-w-[180px] rounded-xl border border-gray-100 bg-white p-4 text-sm capitalize text-gray-900 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-100"
        >
          {album.title}
        </li>
      ))}
    </ul>
  );
}
