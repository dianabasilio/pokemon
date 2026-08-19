import type { Album } from "@/lib/types";

export function UserAlbumsCarousel({ items }: Readonly<{ items: Album[] }>) {
  if (items.length === 0) {
    return <p className="text-gray-500">No suggested albums right now.</p>;
  }

  return (
    <ul className="flex gap-4 overflow-x-auto pb-2">
      {items.map((album) => (
        <li
          key={album.id}
          className="min-w-[180px] rounded-lg border p-4 text-sm capitalize"
        >
          {album.title}
        </li>
      ))}
    </ul>
  );
}
