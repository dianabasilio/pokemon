# 🚀 Next.js (App Router) & React

**Objetivo:** Evaluar criterio arquitectónico, optimización de rendimiento y manejo de flujos asíncronos a nivel Senior con **Next.js 14 (App Router)** y **React 18**.

> No se espera que el código compile ni que se ejecute. Se evalúa el **diagnóstico** y el **criterio** para corregirlo. Puedes escribir pseudo-código o explicar en voz alta.

---

## 📋 El Escenario

Estás construyendo la página de **Detalle de un Pokémon** (simula el detalle de producto de un catálogo de alto tráfico). La página debe ser:

1. **Rápida** — buen LCP, sin bloqueos visuales.
2. **Indexable** — SEO: contenido principal renderizado en el servidor, con metadatos.
3. **Resiliente** — soportar picos de tráfico y nombres de Pokémon inexistentes sin romperse.
   El código que recibes "funciona" en el camino feliz, pero **tiene varios errores y decisiones arquitectónicas incorrectas**. Hay al menos **8 problemas** entre los dos archivos.

---

## 🌐 APIs disponibles

Todas son públicas y no requieren autenticación.

### 1. PokeAPI — datos críticos (SEO / LCP)

```
GET https://pokeapi.co/api/v2/pokemon/{name}
```

- El `{name}` debe ir en **minúsculas** (`ditto`, no `Ditto`), si no responde **404**.
- Ejemplo: <https://pokeapi.co/api/v2/pokemon/ditto>
- Respuesta (recortada):

```jsonc
{
  "id": 132,
  "name": "ditto",
  "height": 3,
  "weight": 40,
  "sprites": {
    "front_default": "https://raw.githubusercontent.com/.../132.png",
  },
  "types": [{ "slot": 1, "type": { "name": "normal", "url": "..." } }],
}
```

- Es información prácticamente **inmutable**: piensa qué estrategia de caché le corresponde.

### 2. JSONPlaceholder — contenido secundario (lento, no crítico)

```
GET https://jsonplaceholder.typicode.com/comments?_limit=100   // "comentarios de entrenadores"
GET https://jsonplaceholder.typicode.com/albums?_limit=20      // "álbumes sugeridos"
```

- `comments` → `{ postId, id, name, email, body }[]`
- `albums` → `{ userId, id, title }[]`
- Asume que **cada una tarda ~2 s** en responder.

---

## 🛠️ Código Inicial (a refactorizar)

### Archivo 1 — `app/pokemon/[name]/page.tsx`

```tsx
// app/pokemon/[name]/page.tsx
import {
  PokemonHeader,
  PostCommentsList,
  UserAlbumsCarousel,
} from "@/components";
export default async function PokemonDetailPage({
  params,
}: {
  params: { name: string };
}) {
  // 🟢 API 1 (PokeAPI): datos esenciales de la entidad (críticos para SEO y el primer render)
  const resPokemon = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${params.name}`,
    {
      cache: "no-store",
    },
  );
  const pokemon = await resPokemon.json();
  // ❌ API 2 (JSONPlaceholder): comentarios pesados (tardan y no son críticos)
  const resComments = await fetch(
    "https://jsonplaceholder.typicode.com/comments?_limit=100",
  );
  const comments = await resComments.json();
  // ❌ API 3 (JSONPlaceholder): carrusel secundario (contenido debajo del viewport)
  const resAlbums = await fetch(
    "https://jsonplaceholder.typicode.com/albums?_limit=20",
  );
  const albums = await resAlbums.json();
  <Suspense></Suspense>;
  return (
    <main className="p-6 max-w-4xl mx-auto">
      {/* Información principal del Pokémon */}
      <PokemonHeader
        name={pokemon.name}
        sprite={pokemon.sprites.front_default}
        types={pokemon.types}
      />
      {/* Sección secundaria de comentarios */}
      <section className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Comentarios de Entrenadores</h2>
        <PostCommentsList items={comments} />
      </section>
      {/* Sección secundaria de álbumes */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">Álbumes Sugeridos</h2>
        <UserAlbumsCarousel items={albums} />
      </section>
    </main>
  );
}
```

### Archivo 2 — `components/PostCommentsList.tsx`

```tsx
// components/PostCommentsList.tsx
import { useEffect, useState } from "react";
type Comment = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};
export function PostCommentsList({ items }: { items: Comment[] }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState<Comment[]>(items);
  const [sending, setSending] = useState(false);
  useEffect(() => {
    const filtered = items
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((c) => c.body.toLowerCase().includes(query.toLowerCase()));
    setVisible(filtered);
  }, [query]);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    await fetch("/api/comments", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });
    setSending(false);
    window.location.reload(); // para ver el comentario nuevo
  }
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar comentario..."
        className="border p-2 w-full"
      />
      <ul className="mt-4 space-y-3">
        {visible.map((c, i) => (
          <li key={i}>
            <strong>{c.name}</strong>
            <p>{c.body}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="mt-6">
        <textarea name="body" className="border p-2 w-full" />
        <button type="submit" disabled={sending}>
          {sending ? "Enviando..." : "Comentar"}
        </button>
      </form>
    </div>
  );
}
```

## Daniel_najera@homedepot.com

## 🎯 Tus Tareas

> Prioriza en este orden. No pasa nada si no terminas las 5: se valora más la profundidad del razonamiento que la cantidad.

### 1. Cascada de peticiones y streaming _(~10 min)_

La página hace tres `await` secuenciales: el primer byte de contenido tarda la **suma** de las tres APIs, destruyendo el **LCP**.

- **Misión:** refactoriza para que `PokemonHeader` se renderice en el servidor de inmediato (SEO + LCP), mientras comentarios y álbumes cargan **en paralelo** sin bloquear el render inicial.
- Justifica qué herramientas usas y por qué (`Suspense`, `loading.tsx`, componentes de servidor anidados, `Promise.all`, etc.).

### 2. Caché y renderizado _(~4 min)_

La estrategia de caché de las tres llamadas es incorrecta para lo que representa cada una.

- **Misión:** define qué caché/revalidación merece cada `fetch` y qué efecto tiene sobre el modo de renderizado de la ruta (estático vs. dinámico). Menciona también qué harías para las rutas más visitadas en build time.

### 3. Robustez y SEO _(~4 min)_

Hoy, `/pokemon/Pikachu` o `/pokemon/mewthree` provocan un error 500 en producción.

- **Misión:** corrige el manejo de entrada y de errores de red, y añade los metadatos que la página necesita para ser indexable. ¿Dónde vive cada cosa en el App Router?

### 4. Estado e interactividad en el cliente _(~8 min)_

`PostCommentsList` tiene varios bugs de React además de un problema de rendimiento: con miles de comentarios, el input se congela al teclear.

- **Misión:** enumera los bugs que ves en el componente y reescríbelo para que:
  1. El input responda al instante mientras la lista filtrada se renderiza en segundo plano.
  2. Desaparezcan los errores de correctitud (estado derivado, mutación, listas).

### 5. Mutación de datos con Server Actions _(~4 min)_

El envío del formulario usa `fetch` + `useState` + `window.location.reload()`.

- **Misión:** rediseña el flujo con un **Server Action** garantizando:
  1. Estado de "enviando" **sin** `useState` manual.
  2. Revalidación de los datos en el servidor tras el éxito, sin recargar la página completa.
  3. Que el formulario siga funcionando de forma razonable si JavaScript aún no ha hidratado.

---

## ✅ Cómo se resolvió cada parte

> Este proyecto ya quedó implementado (no es pseudo-código): corre con `npm install && npm run dev`, tiene tests (`npm test`) y build (`npm run build`). El detalle completo, en inglés, está en [`SOLUTION.md`](./SOLUTION.md) — aquí un resumen punto por punto, en el mismo orden que las tareas de arriba.
>
> **Demo en vivo (Vercel):** <https://pokemon-nextjs-zeta.vercel.app>

**1. Cascada de peticiones y streaming**
`app/pokemon/[name]/page.tsx` hace `await` solo del Pokémon (rápido, crítico para SEO/LCP) y renderiza el header de inmediato. Comentarios y álbumes viven en Server Components separados (`CommentsSection`, `AlbumsSection`), cada uno detrás de su propio `<Suspense>` — cargan en paralelo entre sí y nunca bloquean el header. Ver `features/pokemon/components/server/`.

**2. Caché y renderizado**
Cada `fetch` tiene su propia estrategia: `getPokemon` usa ISR de 24h (`next: { revalidate: 86400 }`, dato casi inmutable → ruta estática), `getComments`/`getAlbums` revalidan cada 60s (contenido secundario). `generateStaticParams` en `page.tsx` pre-renderiza en build los 10 Pokémon más visitados; el resto se genera on-demand vía ISR. Ver `features/pokemon/api/`.

**3. Robustez y SEO**
`params.name` se normaliza y valida con Zod antes de llegar a PokeAPI (arregla `/pokemon/Pikachu`). Un 404 real de la API dispara `notFound()` → `not-found.tsx`; cualquier otro fallo lo captura `error.tsx` (arregla `/pokemon/mewthree`). `generateMetadata` + JSON-LD dan SEO/indexabilidad. Ver `features/pokemon/validation.ts`, `app/pokemon/[name]/{not-found,error}.tsx`.

**4. Estado e interactividad en el cliente**
`PostCommentsList` reescrito: `useMemo` en vez de `useEffect` para el estado derivado, el array ya no se muta (`[...comments].sort(...)`), `key` estable por `id` en vez de índice, y `useDeferredValue` para que el input responda al instante aunque la lista sea grande. Ver `features/pokemon/components/client/PostCommentsList.tsx`.

**5. Mutación de datos con Server Actions**
`features/pokemon/actions/comment-actions.ts` es un Server Action real (`"use server"`) que valida con Zod y llama `revalidateTag`. `CommentForm.tsx` usa `useFormState`/`useFormStatus` (sin `useState` manual) y sigue funcionando como POST nativo sin JS. Nada de `window.location.reload()`.
