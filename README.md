# PG Manager Web

Desktop-first React web app for PG (Paying Guest) hostel owners to manage properties, rooms,
guests, and monthly rent. Browser-based sibling of the existing Android client — both talk to
the same multi-tenant Spring Boot backend at `/Users/balagowda/Code/pg-app/pg-backend`.

Built from [`front-end_command.md`](./front-end_command.md), which is the implementation spec
for this project (frozen backend API contract, architecture, and design-system guidance).

## Tech stack

React 19 + TypeScript (strict), Vite, react-router-dom v7, TanStack Query, axios, React Hook
Form + Zod, Tailwind CSS v4 + hand-built Radix primitives (shadcn-style, not the CLI-generated
kind), Recharts, lucide-react, date-fns, Zustand, Vitest + React Testing Library, Playwright.

> The spec calls for React 18 and Tailwind v3-style `tailwind.config.ts`. This repo was
> scaffolded against whatever `npm create vite` resolved as current at build time — React 19 and
> Tailwind v4 (CSS-first `@theme` config in [`src/design/tokens.css`](./src/design/tokens.css)
> instead of a JS config file). Everything else follows the spec as written.

## Running locally

Requires the `pg-backend` stack running locally (see that repo's README for `docker compose
up`), reachable at `http://localhost:8080` by default.

```bash
npm install
cp .env.example .env.local   # edit VITE_API_BASE_URL if your backend isn't on localhost:8080
npm run dev                  # http://localhost:5173
```

### Env vars

| Var | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Base URL the axios client sends every request to. |

### CORS coordination

The backend's `CorsConfig` allow-lists specific origins. `http://localhost:5173` (Vite's default
dev port) needs to be on that allow-list for local dev to work, and any deployed domain for this
app needs adding too. This is a cross-repo change — the frontend can't fix it alone.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check (`tsc -b`) and produce a static `dist/` build. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint (typescript-eslint + react-hooks). |
| `npm run format` | Prettier, writes in place. |
| `npm run test` | Vitest unit/integration tests, single run. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run test:e2e` | Playwright golden-path E2E (see below). |

## Testing

**Unit/integration (Vitest + RTL)** — no backend required:
- `src/lib/formatCurrency.test.ts`, `formatDate.test.ts`, `effectiveStatus.test.ts`,
  `normalizeNote.test.ts` — formatting and business-logic helpers, with explicit boundary cases
  (dueDay 28 vs 29, February/leap-year clamping, whitespace-only notes).
- `src/design/statusChip.test.ts` — the centralized status → chip color mapping.
- `src/features/guests/schemas.test.ts`, `src/features/rooms/schemas.test.ts` — Zod validation
  boundaries (dueDay 1..28, capacity ≥ 1, status enum).
- `src/api/client.test.ts` — the 401 refresh-and-retry interceptor, using `axios-mock-adapter`:
  successful refresh + retry, failed refresh → session cleared + redirect, and a race test
  asserting concurrent 401s share one in-flight `/auth/refresh` call.

Run with `npm run test`.

> Node's built-in experimental Web Storage API can shadow jsdom's `localStorage` in tests, which
> breaks Zustand's persisted auth store. The test scripts pass
> `NODE_OPTIONS=--no-experimental-webstorage` (via `cross-env`) to avoid this — if you invoke
> `vitest` directly outside these scripts, set that flag yourself.

**E2E (Playwright)** — requires the backend running:

```bash
docker compose -f ../pg-backend/docker-compose.yml up -d   # or however pg-backend documents it
npm run dev &                                                # or let Playwright's webServer start it
npm run test:e2e
```

[`e2e/golden-path.spec.ts`](./e2e/golden-path.spec.ts) covers register → login → create PG →
create room → create guest (asserts a PENDING payment appears) → record a partial payment
(asserts PARTIAL, amount accumulates) → record the remainder (asserts PAID) → dashboard reflects
the numbers. This is the web equivalent of the backend's own contract test — it proves the two
projects actually integrate.

## Architecture notes

- **Owner scoping**: the backend derives `ownerId` from the JWT; no request body in this app
  ever includes an `ownerId` field. See `src/api/types.ts`.
- **Client-generated UUIDs**: every create (`PgDto`/`RoomDto`/`GuestDto`/`PaymentDto`) generates
  its `id` with `crypto.randomUUID()` before calling the API — the server never assigns IDs.
- **Refresh-and-retry**: `src/api/client.ts` implements a single-flight 401 → refresh → retry
  interceptor (Section 6.2 of the spec) so concurrent 401s share one `/auth/refresh` call rather
  than racing the backend's refresh-token rotation.
- **Effective payment status**: `src/lib/effectiveStatus.ts` computes a client-side *display-only*
  overdue guess (the server only promotes to `OVERDUE` via a nightly job), labeled distinctly
  (`OVERDUE_DISPLAY`) so it's never confused with the server's actual `status`.
- **Typed API client**: `src/api/types.ts` is hand-typed from the spec's Section 1. Follow-up:
  generate it from the backend's live OpenAPI doc (`/v3/api-docs`) with `openapi-typescript` once
  the backend is stable, per the spec's Section 3.4, so the two can't silently drift apart.

## Known gaps / follow-ups

- `PaymentDto` `DELETE` endpoint exists on the backend but has no UI action (matches the spec —
  "no UI action needs it in v1").
- The Playwright suite is one golden-path spec, not full coverage of every CRUD flow; extend
  `e2e/` as more flows need contract-level confidence.
- Bundle is a single ~1MB JS chunk (Recharts + Radix + the app). Worth revisiting with route-level
  `React.lazy()` code-splitting if initial load time becomes a concern.
