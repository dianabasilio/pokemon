# Solution — Pokémon Detail Page (Next.js 14 App Router)

This document walks through the diagnosis of the original code and the
implementation that replaces it, task by task, plus the architectural
reasoning behind it. The working project lives in this same repository.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000/pokemon/ditto
npm test        # Vitest + React Testing Library
npm run build   # production build, verifies static/ISR output

# or, containerized:
docker compose up --build
```

---

## Why App Router (not Pages Router)

- **Real streaming SSR with `<Suspense>`**: the initial HTML (shell +
  `PokemonHeader`) is sent complete and indexable immediately; React keeps
  streaming the comments/albums chunks over the same connection. `pages/`
  has no equivalent — `getServerSideProps` blocks the first byte on the
  slowest data source.
- **Per-segment file conventions** (`loading.tsx`, `error.tsx`,
  `not-found.tsx`) handle loading/error/404 states declaratively, without
  hand-rolled conditionals in every page — this is what task 3 asks for.
- **Granular `fetch` caching** (`cache`, `next.revalidate`, `next.tags`)
  lets each endpoint decide its own rendering strategy (static, ISR, or
  dynamic) without separate `getStaticProps`/`getServerSideProps` files —
  this is task 2.
- **Server Actions** remove the need for a hand-written API route + `fetch`
  + manual `useState` for mutations, with native progressive enhancement
  (the `<form action={...}>` still works before JS hydrates) — task 5.
- **Metadata API** (`generateMetadata`) sits next to the data it describes
  and reuses the same deduped `fetch`, instead of a second round trip for
  `<head>`.
- **Hybrid SSR + SWR** for the interactive part (comments): the Server
  Component stays the source of truth for the first paint (SEO/LCP, no
  loading flash), while `useSWR` on the client takes over with
  `fallbackData` for revalidation, client caching, and an optimistic
  `mutate()` after posting a comment.

---

## Architecture: feature-based, not layer-based

```
app/
  pokemon/[name]/
    page.tsx        # imports ONLY from @/features/pokemon
    loading.tsx
    error.tsx
    not-found.tsx
  layout.tsx
  page.tsx
features/
  pokemon/
    index.ts                  # public barrel — the only door in
    actions/comment-actions.ts
    api/{pokemon,comments,albums}.ts
    components/
      server/{CommentsSection,AlbumsSection}.tsx
      client/{PostCommentsList,CommentForm}.tsx
      ui/{PokemonHeader,Skeletons,UserAlbumsCarousel}.tsx
    errors.ts
    types.ts
    validation.ts
__tests__/features/pokemon/...
```

The code is organized **by domain, not by technical layer**. A layer-based
layout (`lib/`, `components/`, `actions/` at the root) works for a single
screen, but doesn't scale: as soon as a second area (`search`, `cart`)
shows up, technical folders turn into a shared dumping ground and nothing
stops one feature from reaching into another's internals. Here, everything
Pokémon-specific is self-contained under `features/pokemon/`, and
`features/pokemon/index.ts` is the *only* file `app/` is allowed to import
from — `page.tsx` can't reach `components/server/...` or `api/...`
directly, which is Dependency Inversion applied at the folder level, not
just the class level.

**SOLID, mapped to this structure:**
- **SRP** — each file in `api/` talks to exactly one endpoint;
  `components/server` only orchestrates fetch + Suspense;
  `components/ui` never touches network or state.
- **OCP** — `types.ts` + `errors.ts` let a new data source (another
  merch API) be added without touching `page.tsx`; a whole new feature
  (`features/search/`) can be added without touching `features/pokemon/`.
- **LSP** — every function in `api/` returns `Promise<T>` or throws one of
  `NotFoundError` / `UpstreamError`, a consistent contract that
  `error.tsx`/`not-found.tsx` both consume the same way.
- **ISP** — `PokemonHeader`, `PostCommentsList`, etc. only receive the
  props they actually use, not one giant `pokemon` object — directly
  fixes bug #4 below (derived state / mutation).
- **DIP** — `page.tsx` depends on `@/features/pokemon` (an abstraction),
  never calls `fetch` directly and never imports an internal file of the
  feature — testable and swappable.

**Deliberate scope decisions:**
- No `app/(routes)/` route group: it only pays off with multiple layout
  branches to separate without affecting the URL (e.g. `(marketing)` vs
  `(app)`). With a single branch here, it would be indirection with no
  benefit.
- No empty global `components/ui/` or `lib/` yet: there is currently only
  one feature and nothing genuinely cross-feature to put there. That's
  where a shared design system (e.g. shadcn/ui) or cross-cutting utilities
  would go **once a second feature actually needs them** — creating those
  folders now would be speculative structure with no real content.

**Security:**
- `params.name` is normalized (`toLowerCase().trim()`) and validated with
  Zod before being interpolated into the PokeAPI URL.
- External API responses (PokeAPI, JSONPlaceholder) are parsed through Zod
  schemas rather than trusted as `any` — malformed upstream data fails
  safely into `UpstreamError` instead of crashing the render.
- The comment Server Action validates `body` (non-empty, ≤500 chars) with
  Zod before forwarding it; React escapes rendered text by default, so
  there's no stored-XSS vector, but the input is still bounded server-side.
- No API keys/secrets anywhere — both APIs are public.
- `next.config.mjs` sets baseline security response headers
  (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).

---

## The 5 tasks, point by point

### 1. Request waterfall and streaming

The original code did three sequential `await fetch()` calls before
rendering anything, so first paint waited on the sum of all three APIs
(and Comments/Albums are simulated at ~2s each).

**Fix:** `page.tsx` awaits only `getPokemon(name)` — fast, and critical
for SEO/LCP — then renders `PokemonHeader` immediately.
`CommentsSection` and `AlbumsSection` are separate async Server
Components, each wrapped in its own `<Suspense fallback={<Skeleton />}>`.
Neither blocks the header, and they load in parallel with each other
because each is an independent Suspense boundary, not a sequential await
chain.

### 2. Caching and rendering mode

The original used `cache: "no-store"` on all three fetches — the worst
choice for the Pokémon data (near-immutable) and irrelevant for content
that's supposed to be secondary/deferred anyway.

**Fix**, one strategy per endpoint:
- `getPokemon`: `next: { revalidate: 86400 }` (24h ISR) — this is
  practically static data, and this setting is what keeps the route
  statically generated for LCP/SEO.
- `getComments` / `getAlbums`: `next: { revalidate: 60 }` — refreshed
  every minute, but since both live behind a `<Suspense>` boundary they
  don't force the whole route into dynamic rendering.
- `generateStaticParams` pre-renders the most-visited Pokémon at build
  time (SSG); everything else is generated on first request via
  on-demand ISR (`dynamicParams` defaults to `true`).

### 3. Robustness and SEO

`/pokemon/Pikachu` 500'd (PokeAPI needs lowercase) and
`/pokemon/mewthree` 500'd too (no 404 handling at all).

**Fix:**
- `parsePokemonName` (Zod) normalizes and validates the route param before
  it ever reaches PokeAPI.
- `getPokemon` throws a typed `NotFoundError` on a real 404, which
  `page.tsx` turns into `notFound()` → renders `app/pokemon/[name]/not-found.tsx`.
- Any other failure (network, 5xx, unexpected shape) is re-thrown and
  caught by `app/pokemon/[name]/error.tsx` (a Client Component with
  `reset()`), so one Pokémon's failure never takes down the rest of the
  site. Internals are logged server-side only, never shown to the user.
- `generateMetadata` builds `title`/`description`/`openGraph`/
  `alternates.canonical` from the same (deduped) `getPokemon` call; JSON-LD
  (`schema.org/Product`) is embedded in `page.tsx` for richer search
  snippets; `metadataBase` in `app/layout.tsx` resolves absolute URLs.

**Known limitation — self-hosted 404 status code.** When a Pokémon name
is valid syntax but doesn't exist, `notFound()` renders the correct
`not-found.tsx` UI and sets `<meta name="robots" content="noindex">` (so
crawlers won't index it), but the raw HTTP status returned by the
self-hosted Node server (both `next start` and the standalone Docker
image) is `200`, not `404` — verified directly against this build. This
is a known nuance of Next.js App Router outside of Vercel's platform:
Vercel's edge network rewrites the status for these prerendered/ISR
pages using build-time metadata that a plain Node server doesn't apply.
The practical impact is limited (search engines already respect the
`noindex` meta tag regardless of status code), but any monitoring/uptime
tooling or non-browser client expecting a real `404` should account for
this — the production-grade fix is a thin reverse-proxy rule (e.g. nginx)
that maps these responses to `404`, or hosting on a platform that handles
it natively.

### 4. Client state and interactivity (`PostCommentsList`)

Bugs found in the original component:
- A `useEffect` recomputed the filtered list on every keystroke — plain
  derived state, no effect needed.
- `.sort()` mutated the `items` array received via props (and, in the
  original, `items` came straight from an outer scope with no clone).
- `key={i}` (array index) instead of a stable id.
- Filtering thousands of comments synchronously froze the input on every
  keystroke.

**Fix:** `useMemo` derives the filtered/sorted list instead of an effect;
the array is cloned (`[...comments].sort(...)`) before sorting; `key={c.id}`
replaces the index; and the query is wrapped in `useDeferredValue`, so
typing stays instant while React recomputes the (potentially large) list
at a lower concurrent-rendering priority in the background.

On top of that, the list now uses `useSWR` with `fallbackData` seeded
from the Server Component's SSR fetch (`CommentsSection`) — no second
request on first paint, but SWR takes over client-side caching and
revalidation from there.

### 5. Data mutation via Server Action

The original used `fetch` + manual `useState(sending)` +
`window.location.reload()` to "refresh" after submitting.

**Fix:** `features/pokemon/actions/comment-actions.ts` is a Server Action
(`"use server"`) that validates `body` with Zod, POSTs to JSONPlaceholder,
and calls `revalidateTag("comments")`. `CommentForm` uses
`useFormState(addCommentAction, initialState)` for the result and
`useFormStatus()` inside the submit button for the pending state — no
manual `useState`. Because it's a real `<form action={formAction}>`, it
still submits as a native POST if JS hasn't hydrated yet.

**Note on JSONPlaceholder:** it's a mock API — the `POST` returns `201`
with a simulated object but never actually persists it, so a later `GET`
won't include it. That's why the success path updates the SWR cache
**optimistically and locally**
(`mutate('comments', (current) => [comment, ...current], { revalidate: false })`)
instead of forcing a real revalidation against the server, which would
just wipe out the comment that was never really saved. `revalidateTag`
is still correct for the *next* real visit (a different user, a fresh
session) — this is a property of the test API, not a bug in the app.

---

## Lazy loading

- **Images**: the only `<Image>` in the project (the sprite in
  `PokemonHeader`) uses `next/image`, which lazy-loads by default. It
  correctly sets `priority` instead, since it's the page's LCP element —
  the one case where lazy loading should be skipped.
- **Server sections**: `CommentsSection` and `AlbumsSection` are already
  deferred via their own `<Suspense>` boundaries (see task 1) — that's the
  App Router-native form of lazy loading for Server Components, so
  `next/dynamic` doesn't apply to them (it only affects the client
  bundle, and Server Components never ship to the client in the first
  place).
- **`CommentForm`**: a below-the-fold interactive widget, not needed to
  render the comments list itself. It's loaded with `next/dynamic(...,
  { ssr: false })` inside `PostCommentsList` (already a Client Component,
  so `ssr: false` is valid there), which puts it in its own chunk instead
  of the initial bundle — verified in the production build output
  (a separate `872.*.js` chunk containing the form's code, not present in
  the main page bundle).

---

## Testing

`__tests__/features/pokemon/`:
- `api/pokemon.test.ts` — `getPokemon` returns typed data on success,
  throws `NotFoundError` on a 404, `UpstreamError` on any other failure
  or on a response that doesn't match the expected schema.
- `components/client/PostCommentsList.test.tsx` — filtering doesn't
  mutate the original comments array, and the list renders sorted by
  trainer name.

## Docker

`next.config.mjs` sets `output: "standalone"`, so the production image
only needs `.next/standalone`, `.next/static`, and `public/` — no full
`node_modules`, no source, no devDependencies. The `Dockerfile` is a
3-stage build (`deps` → `builder` → `runner`) and the final container
runs as the non-root `node` user. Verified locally:

```bash
docker compose up --build
# or
docker build -t homedepot-pokemon .
docker run -p 3000:3000 homedepot-pokemon
```
