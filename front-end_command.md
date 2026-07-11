# PG Manager Web — Build Prompt (React)

> This is an implementation prompt, not documentation of existing code. Hand this file to a
> coding agent (or a frontend engineer) to scaffold and build the React web app that consumes
> the **PG Manager backend** (`/Users/balagowda/Code/pg-app/pg-backend`, already built and
> running on `http://localhost:8080/api/v1/`). Section 1 is a hard contract — copied verbatim
> from the backend's own `backend-prompt.md` Section 1 and verified live against the running
> service — it is not negotiable without also changing the backend and the existing Android
> client. Everything after that is architectural guidance for building the web app well.
>
> Sibling projects in this workspace:
> - `/Users/balagowda/Code/pg-app/pg-backend` — the Spring Boot API this app talks to. Its
>   `backend-prompt.md` and `README.md` are useful background but you don't need to open them;
>   Section 1 below is the complete contract.
> - `/Users/balagowda/Code/pg-app/PGManager` — the existing native Android client (Kotlin/
>   Compose) for the same backend. Its `DESIGN_SYSTEM.md` defines the "Indigo Pro" visual
>   language (colors, type, spacing, components) this web app should feel like a sibling of —
>   see Section 4.

---

## 0. What you're building

A desktop-first web app for PG (Paying Guest) hostel owners to manage properties, rooms,
guests, and monthly rent — the browser-based sibling of the existing Android app, talking to
the exact same multi-tenant backend. Each **owner** account is a tenant; all data is scoped to
the authenticated owner server-side (you never send or trust an `ownerId` from the client).

This is the *second* client against a contract that already has one shipped consumer (Android).
Treat Section 1 as frozen the same way the backend does: **do not propose backend changes to
accommodate the web app.** If something feels awkward, work around it in the frontend — the
backend's Section 1 fields, paths, and status codes are fixed by the Android app's existing
Retrofit interfaces.

Primary users: PG owners/managers, mostly desktop/laptop browsers (some tablet use), checking
rent collection and occupancy status, recording payments, adding guests/rooms. This is a
CRUD-and-dashboard business tool, not a marketing site — optimize for information density,
fast data entry, and keyboard-friendly forms over flashy motion.

---

## 1. Frozen contract — the backend API you're calling

This is ground truth, copied from the backend's own spec and confirmed against the live
service. All endpoints are under **`/api/v1/`**, JSON over HTTPS (HTTP in local dev), UTF-8.

### 1.1 Wire format rules

- The server **freely adds new response fields over time** — never assume a response object
  has *exactly* the fields listed below; treat unknown fields as ignorable, never error on them.
- You must **never rename fields when sending requests** — send exactly the field names below.
- Dates: guest `joiningDate` is `yyyy-MM-dd` (plain string, no time component). Payment `month`
  is `yyyy-MM` (plain string). Timestamps (`paidOn`, JWT `expiresIn`) are **epoch milliseconds
  as a JSON number**, never ISO-8601 strings — format/parse these with `Date`/`date-fns`
  yourself, don't expect the API to hand you `Date` objects.
- IDs are **client-generated UUID strings**. When creating a new PG/Room/Guest/Payment in the
  browser, generate the id yourself with `crypto.randomUUID()` before calling the API — the
  server never assigns IDs on create.
- Auth is `Authorization: Bearer <jwt>` on every request except `POST /api/v1/auth/login`,
  `POST /api/v1/auth/register`, and `POST /api/v1/auth/refresh`.
- No CSRF token needed (bearer-token auth, not cookies) — but see Section 6 for where to store
  the token safely in the browser.

### 1.2 Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/v1/auth/login` | `{ "email": string, "password": string }` | `LoginResponse` |
| POST | `/api/v1/auth/register` | `{ "name": string, "email": string, "password": string }` | `LoginResponse` |
| POST | `/api/v1/auth/refresh` | `{ "refreshToken": string }` | `LoginResponse` |
| POST | `/api/v1/auth/logout` | `{ "refreshToken": string }` | 204, no body |

```jsonc
// LoginResponse
{
  "token": "string",              // JWT, ~12h TTL — send as Bearer on every subsequent call
  "owner": { "id": "string", "name": "string", "email": "string" },
  "refreshToken": "string",       // opaque, rotates on every /auth/refresh call
  "expiresIn": 43200               // seconds
}
```

Unlike the Android app (which has no refresh flow wired up yet), **the web app should implement
full silent-refresh**: on a 401 from any authenticated call, attempt one `/auth/refresh` using
the stored `refreshToken`; on success retry the original request once; on failure, clear the
session and redirect to `/login`. See Section 6.2 for the exact pattern.

### 1.3 PGs

| Method | Path | Query | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/pgs` | — | — | `PgDto[]` |
| POST | `/api/v1/pgs` | — | `PgDto` | `PgDto` (409 if id exists) |
| PUT | `/api/v1/pgs/{id}` | — | `PgDto` | `PgDto` (upsert — creates if id is new) |
| DELETE | `/api/v1/pgs/{id}` | — | — | 204, no body |

```jsonc
{ "id": "string", "name": "string", "address": "string", "city": "string" }
```

### 1.4 Rooms

| Method | Path | Query | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/rooms` | `pgId` (optional) | — | `RoomDto[]` |
| POST | `/api/v1/rooms` | — | `RoomDto` | `RoomDto` |
| PUT | `/api/v1/rooms/{id}` | — | `RoomDto` | `RoomDto` (upsert) |
| DELETE | `/api/v1/rooms/{id}` | — | — | 204 |

```jsonc
{ "id": "string", "pgId": "string", "roomNumber": "string", "capacity": 0 }
```

`capacity` must be a positive integer (≥ 1) — validate client-side before submit, the server
also enforces this and returns 400 if violated.

### 1.5 Guests

| Method | Path | Query | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/guests` | `pgId` (optional) | — | `GuestDto[]` |
| POST | `/api/v1/guests` | — | `GuestDto` | `GuestDto` |
| PUT | `/api/v1/guests/{id}` | — | `GuestDto` | `GuestDto` (upsert) |
| DELETE | `/api/v1/guests/{id}` | — | — | 204 |

```jsonc
{
  "id": "string",
  "pgId": "string",
  "roomId": "string",
  "name": "string",
  "phone": "string",
  "joiningDate": "2026-07-01",        // yyyy-MM-dd, plain string
  "monthlyRent": 10000,               // integer rupees — belongs to the guest, not the room
  "deposit": 20000,
  "dueDay": 5,                        // 1..28 inclusive
  "status": "ACTIVE"                  // "ACTIVE" | "NOTICE" | "LEFT" — literal string
}
```

Validate `status` against exactly those three literals and `dueDay` as `1..28` client-side
before submit (mirror the backend's validation so the form fails fast with a friendly message
instead of round-tripping a 400).

**Creating a guest auto-creates a current-month `Payment` row server-side** (`amountDue =
monthlyRent`, `amountPaid = 0`, `status = "PENDING"`) — after a successful guest create/update,
refetch that guest's payments (or invalidate the payments query) so the UI shows it immediately.

### 1.6 Payments

| Method | Path | Query | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/payments` | `month`, `pgId`, `guestId` (all optional, combinable) | — | `PaymentDto[]` |
| POST | `/api/v1/payments` | — | `PaymentDto` | `PaymentDto` |
| PUT | `/api/v1/payments/{id}` | — | `PaymentDto` | `PaymentDto` (upsert) |
| DELETE | `/api/v1/payments/{id}` | — | — | 204 (exists, but no UI action needs it in v1) |

```jsonc
{
  "id": "string",
  "guestId": "string",
  "pgId": "string",
  "month": "2026-07",                 // yyyy-MM
  "amountDue": 10000,
  "amountPaid": 4000,
  "status": "PARTIAL",                // "PAID" | "PENDING" | "PARTIAL" | "OVERDUE" — server-computed
  "paidOn": 1751500000000,            // epoch millis, nullable
  "note": "string or null"
}
```

**"Record payment" is server-authoritative — don't reimplement the status math client-side
beyond an optimistic-UI guess.** The rule you should know when designing the "Record Payment"
form (so the UX makes sense, even though the server does the actual computation):
- Payments **accumulate** — PUT-ing a payment with `amountPaid: 4000` against a row that
  already has `amountPaid: 2000` results in `6000` server-side, **not** an overwrite. The
  "Record Payment" form should ask "how much is being paid *now*" (an increment), not "what's
  the new total" — send `currentAmountPaid + increment` as the PUT body's `amountPaid`, or make
  this explicit in the UI copy so users aren't confused why typing "4000" twice results in 8000
  paid, not 4000.
- `status` becomes `PAID` once `amountPaid >= amountDue`; the server also promotes unpaid
  current-month rows to `OVERDUE` once the due date passes, via a nightly job — so a payment row
  you fetched an hour ago may have a stale `status` if you're holding it in client cache across a
  day boundary. Don't over-cache payment lists; refetch on tab focus / after mutations.
- `note` on partial update: sending `null`/blank keeps the existing note server-side — the form
  can safely send `null` for "no new note" without wiping a prior one.

### 1.7 Dashboard

| Method | Path | Response |
|---|---|---|
| GET | `/api/v1/dashboard` | `DashboardDto`, scoped to the authenticated owner, no query params |

```jsonc
{
  "totalPgs": 0,
  "totalRooms": 0,
  "totalBeds": 0,
  "occupiedBeds": 0,
  "vacantBeds": 0,
  "occupancyPercent": 0.0,
  "revenueThisMonth": 0,
  "pendingAmount": 0,
  "defaulterCount": 0,
  "todaysCollection": 0,
  "upcomingDues": [ /* PaymentDto[], due within [today, today+7], ascending by due date */ ],
  "guestsNeedingReminder": 0,
  "roomsWithVacancy": 0,
  "paymentsDueTomorrow": 0,
  "trendPercent": null,               // revenueThisMonth vs previous month, signed percent, nullable
  "sparkline": [0, 0, 0, 0, 0, 0, 0],  // last 7-14 days' collected amount, ascending by date
  "recentActivity": [
    { "type": "PAYMENT_RECEIVED", "guestName": "string", "amount": 9500, "timestampMillis": 0 },
    { "type": "GUEST_JOINED", "guestName": "string", "amount": null, "timestampMillis": 0 }
  ]
}
```

This is the app's home screen. Fetch it once on dashboard mount, expose a manual refresh
action, and consider a short `staleTime` (e.g. 30–60s) with TanStack Query rather than
polling — it's cheap to refetch on navigation back to the tab.

### 1.8 Defaulters

| Method | Path | Response |
|---|---|---|
| GET | `/api/v1/defaulters` | `DefaulterDto[]`, sorted descending by `daysOverdue` |

```jsonc
{
  "guestId": "string",
  "guestName": "string",
  "phone": "string",
  "roomNumber": "string",
  "pgName": "string",
  "monthlyRent": 10000,
  "daysOverdue": 9,
  "outstandingAmount": 10000
}
```

### 1.9 Search

| Method | Path | Query | Response |
|---|---|---|---|
| GET | `/api/v1/search` | `q` (required) | `{ "guests": GuestDto[], "rooms": RoomDto[], "pgs": PgDto[] }` |

Case-insensitive substring match server-side. Debounce the input (300ms) before firing the
request; don't fire on every keystroke.

### 1.10 Errors — RFC 7807 `ProblemDetail`

Every error response has this shape (validation errors include a `field`/`message` array):

```jsonc
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid",
  "instance": "/api/v1/guests",
  "errors": [ { "field": "dueDay", "message": "must be between 1 and 28" } ]
}
```

Status codes you must handle distinctly in the UI: `400` (show field-level form errors from
`errors[]`), `401` (attempt refresh, see 1.2/6.2; if refresh also fails, force logout), `404`
(resource doesn't exist or belongs to another owner — show "not found", never imply it might
exist), `409` (only from strict `POST` create — "already exists" toast), `422` (semantically
invalid but well-formed — show `detail` as the message), `500` (generic "something went wrong,
try again" — never surface the raw response body).

---

## 2. Tech stack

- **React 18** with **TypeScript** (strict mode on). **Vite** for build tooling — fast dev
  server, no need for Next.js/SSR here (this is an authenticated, client-only dashboard app;
  nothing benefits from server rendering, and SSR would complicate the bearer-token auth model
  for no gain).
- **Routing:** `react-router` v6 (data router / `createBrowserRouter`), with a layout route for
  the authenticated shell (sidebar + topbar) and a loader-guarded set of child routes.
- **Server state / data fetching:** **TanStack Query** (`@tanstack/react-query`) for every API
  call — queries for reads, mutations for writes, with `invalidateQueries` after mutations
  (e.g. creating a guest invalidates `['guests', pgId]` and `['payments', guestId]`). Don't
  hand-roll `useEffect`+`useState` data fetching; TanStack Query is the one dependency doing the
  most work in this app (caching, refetch-on-focus, retry, loading/error states) and keeps
  components declarative.
- **HTTP client:** a thin `axios` instance (or `fetch` wrapper) in `src/api/client.ts` with a
  request interceptor injecting the bearer token and a response interceptor implementing the
  401-refresh-and-retry flow from Section 6.2. Axios is preferred over raw `fetch` here
  specifically for its interceptor API, which is the cleanest place to centralize auth/refresh.
- **Forms & validation:** **React Hook Form** + **Zod** schemas mirroring Section 1's field
  constraints (`dueDay` 1-28, `status` enum, `capacity` positive int, required strings). Derive
  TypeScript types from the Zod schemas with `z.infer<>` so the DTO shape and the validation
  schema can't drift apart.
- **Styling / component library:** **Tailwind CSS** + **shadcn/ui** (Radix primitives +
  Tailwind, copy-in components you own and can theme — not an opaque npm component library).
  This pairing lets you port the Android app's "Indigo Pro" design tokens (Section 4) directly
  into `tailwind.config.ts` CSS variables and get accessible, unstyled-by-default primitives
  (dialog, dropdown, tabs, toast) to skin.
- **Charts:** **Recharts** for the dashboard sparkline and any trend visuals — lightweight,
  composable, plays well with Tailwind theming.
- **Icons:** **lucide-react** — matches the "thin line-art" icon language the Android app's
  `AppIcons.kt` already uses (Section 4), keeping the two clients visually consistent.
- **Dates:** **date-fns** for `yyyy-MM-dd`/`yyyy-MM` parsing/formatting and epoch-millis
  conversions — never construct date strings by hand with string concatenation.
- **State outside server cache:** a small **Zustand** store (or React Context, either is fine —
  pick Zustand for less boilerplate) for auth/session (`token`, `refreshToken`, `owner`,
  `isAuthenticated`) and any pure-UI state that doesn't belong in the URL or server cache
  (sidebar collapsed, active PG filter selection, etc.).
- **Testing:** **Vitest** + **React Testing Library** for unit/component tests, **Playwright**
  for end-to-end flows (login → create PG → create room → create guest → record payment →
  see it on the dashboard).
- **Linting/formatting:** ESLint (typescript-eslint, react-hooks plugin) + Prettier.

---

## 3. Architecture

### 3.1 Folder layout — feature-based, mirrors the backend's package-by-feature style

```
src/
├── main.tsx
├── App.tsx                      # router provider, query client provider, theme provider
├── api/
│   ├── client.ts                 # axios instance, auth header + refresh-and-retry interceptor
│   ├── types.ts                  # PgDto/RoomDto/GuestDto/PaymentDto/DashboardDto/DefaulterDto
│   │                              # — hand-typed from Section 1, or generated from the backend's
│   │                              # OpenAPI doc at /v3/api-docs (see Section 3.4)
│   └── endpoints/
│       ├── auth.ts, pgs.ts, rooms.ts, guests.ts, payments.ts, dashboard.ts,
│       └── defaulters.ts, search.ts   # thin fetch functions, one file per resource
├── auth/
│   ├── useAuthStore.ts            # Zustand: token, refreshToken, owner, actions
│   ├── AuthProvider.tsx           # boots session from persisted storage on app load
│   └── RequireAuth.tsx            # route guard component
├── features/
│   ├── dashboard/                 # DashboardPage, KpiCard grid, UpcomingDues, ActivityFeed
│   ├── pgs/                       # PgListPage, PgFormDialog, PgCard
│   ├── rooms/                     # RoomListPage (per-PG), RoomFormDialog
│   ├── guests/                    # GuestListPage, GuestDetailPage, GuestFormDialog
│   ├── payments/                  # PaymentListPage, RecordPaymentDialog
│   ├── defaulters/                # DefaultersPage
│   ├── search/                    # GlobalSearch (topbar command palette)
│   └── auth/                      # LoginPage, RegisterPage
├── components/
│   ├── layout/                    # AppShell (sidebar + topbar), Sidebar, Topbar
│   └── ui/                        # shadcn/ui primitives (button, dialog, input, select, toast…)
├── design/
│   ├── tokens.css                 # CSS variables ported from Android's AppColors/AppTypography
│   └── statusChip.ts              # PaymentStatus/GuestStatus -> chip color mapping
├── hooks/                         # useDebounce, useCurrentOwner, etc.
├── lib/                           # formatCurrency (Indian grouping), formatDate, cn()
└── routes/                        # route tree if not colocated in App.tsx
```

Each `features/<x>/` folder owns its page component(s), any feature-local components, and its
TanStack Query hooks (e.g. `features/guests/useGuests.ts`, `useCreateGuest.ts`). Cross-feature
reads (e.g. the guest form needs a PG/room picker) import the *other feature's* query hooks —
never duplicate a fetch function across features.

### 3.2 Routing

```
/login                          public
/register                       public
/                                RequireAuth layout (sidebar shell)
  /dashboard                    default landing after login
  /pgs                          list
  /pgs/:pgId                    detail — rooms in this PG
  /guests                       list (all PGs), filterable by pgId via query param
  /guests/:guestId              detail — profile + payment history
  /payments                     list, filterable by month/pgId/guestId via query params
  /defaulters
  /search?q=…                   full-page results (topbar search is a quick preview)
  /settings                     owner profile, logout
```

Use `react-router`'s `useSearchParams` for the list filters (`pgId`, `month`, `guestId`, `q`) so
filtered views are shareable/bookmarkable URLs, not just component state.

### 3.3 Owner scoping — nothing to build, but don't undermine it

The backend derives `ownerId` from the JWT server-side and never trusts a client-supplied value
(Section 3.2 of the backend spec). There is no `ownerId` field anywhere in the DTOs above and
none should ever appear in a request body you construct — if you find yourself wanting to add
one "to be explicit," that's a sign something's wrong with your understanding of the contract.

### 3.4 Typed API client — generate, don't hand-maintain, once the backend is stable

The backend exposes a live OpenAPI 3.1 document at `http://localhost:8080/v3/api-docs`. Prefer
generating `src/api/types.ts` (and optionally typed fetch functions) from that document with
`openapi-typescript` (types only, lightweight, no runtime) rather than hand-transcribing DTOs —
this is the "single source of truth for client codegen" the backend spec calls out. If codegen
tooling is out of scope for the initial build, hand-typing from Section 1 above is an acceptable
starting point, but note the codegen path in the README as a follow-up so the two never drift.

---

## 4. Design system — port "Indigo Pro" from the Android app, don't invent a new look

The Android app (`/Users/balagowda/Code/pg-app/PGManager/DESIGN_SYSTEM.md`) already defines a
complete visual language for this product, called "Indigo Pro." The web app should read as the
same product on a bigger screen, not a different app that happens to share a backend. Port the
*tokens*, not the Compose implementation:

| Token | Value | Source |
|---|---|---|
| Primary | `#5A5AF5` (indigo) | `AppColors.kt` light theme |
| Secondary | `#A855F7` (purple) | `AppColors.kt` light theme |
| Background | `#F3F4FB` | indigo-washed neutral |
| Surface variant | `#ECECFE` | indigo-washed neutral |
| Text primary | `#161428` (near-black) | |
| Dark bg | `#0F0F1A`, dark primary `#8F8FFF`, dark secondary (lilac) `#D6A6FF` | dark theme mirror |
| Font | **Sora** (bundled TTFs in the Android app's `res/font/`; same family available on
  Google Fonts — self-host or `@fontsource/sora` for the web) | |
| Corner radii | card `24px`, dialog `28px`, button/chip `pill`, input `16px` | `AppShapes.kt` |
| Spacing scale | `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48` (xxs→massive) | `AppSpacing.kt` |
| Motion | ≤ 350ms for all transitions except count-up numbers (~900ms) | `AppMotion.kt` |

Implement these as CSS variables in `src/design/tokens.css`, wired into `tailwind.config.ts`
(`colors.primary`, `colors.secondary`, `borderRadius.card`, etc.) with light/dark variants via
`prefers-color-scheme`/a class-based toggle — same SYSTEM/LIGHT/DARK modes the Android app
supports.

**Component parity (build web equivalents, not literal ports):**
- `KpiCard` → a fixed-height stat tile (icon, value, label, optional trend badge) for the
  dashboard grid — mirrors the Android `KpiCard` slots (icon/value/title/subtitle/trend/badge).
- `StatusChip` → a small pill component mapping `PaymentStatus`/`GuestStatus` to color exactly
  like the Android `ChipStatus` mapping: `PAID`→success, `PENDING`→neutral/info, `PARTIAL`→
  warning, `OVERDUE`→error, `ACTIVE`→success, `NOTICE`→warning, `LEFT`→neutral. Centralize this
  mapping in `src/design/statusChip.ts` — never pick a chip color ad hoc at a call site.
- `EmptyState` / `ErrorState` → required on every list view (empty PGs, empty guests, failed
  fetch with retry) — don't ship a bare blank screen or an unstyled error string.
- A `GradientHeroCard`-equivalent for the dashboard's top revenue/collection summary.
- Sidebar nav mirrors the Android bottom-nav's top-level sections (Dashboard, PGs, Guests,
  Payments, Defaulters) plus Search and Settings, since desktop affords a persistent sidebar
  instead of a bottom bar.

Don't chase 1:1 visual parity screen-by-screen (that's what the Android app spent multiple
iterations on, per its `PROJECT_CONTEXT.md`) — get the palette, type, spacing, and status-color
language right, then let the desktop layout be genuinely desktop-appropriate (data tables with
sortable columns, side-by-side master-detail views, modals instead of full-screen forms) rather
than a stretched phone layout.

---

## 5. Business logic to replicate in the UI (server is still the source of truth)

These mirror the backend spec's Section 4 — the web app doesn't recompute these authoritatively
(the server does), but the UI should understand them well enough to render sensible previews
and avoid confusing users.

- **Effective payment status**: what you fetch from `GET /payments` may lag reality by up to a
  day (server promotes to `OVERDUE` via a nightly job) — if you want to show "overdue" sooner
  than the server does, compute a client-side *display-only* effective status the same way:
  `amountPaid >= amountDue ? PAID : (today > dueDate ? OVERDUE_DISPLAY : amountPaid > 0 ?
  PARTIAL : PENDING)`, where `dueDate = month.atDay(min(guest.dueDay, daysInMonth(month)))`.
  Label it distinctly if you do this (e.g. a subtle "overdue" tag) rather than overwriting the
  server's `status` field in the cache — don't let a client-computed guess silently diverge from
  what a refetch will show.
- **Currency formatting**: Indian digit grouping (`₹1,00,000`, not `₹100,000`) — use
  `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`,
  matching the Android app's `CurrencyUtils`.
- **Occupancy**: `vacantBeds = totalBeds - occupiedBeds`, `occupancyPercent = occupiedBeds /
  totalBeds * 100` — the dashboard endpoint already computes and returns these; don't
  recalculate from raw room/guest lists elsewhere in the UI, just read the `DashboardDto` fields
  to avoid two sources of truth disagreeing.
- **dueDay clamping**: a guest with `dueDay: 30` and a due date in February should be understood
  as "the 28th" in any client-side date math — never construct an invalid calendar date.

---

## 6. Auth & session handling

### 6.1 Token storage

Store `token` and `refreshToken` in memory (Zustand store) as the primary copy, persisted to
`localStorage` so a page refresh doesn't force a re-login. This is a bearer-token SPA with no
first-party cookies, so XSS is the real risk to weigh, not CSRF — keep dependencies minimal,
sanitize anything rendered from user input (guest names, notes) even though React escapes by
default, and don't introduce a package that eval's or dangerously-sets HTML anywhere near this
data. `httpOnly` cookies aren't an option here since the backend doesn't set them (Section 1
confirms bearer-only, no cookie auth per the backend's own design) — accept `localStorage` as
the pragmatic choice for this app's threat model, and note it explicitly in the README rather
than silently deciding it.

### 6.2 Refresh-and-retry interceptor pattern

```ts
// src/api/client.ts (sketch — implement fully)
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      try {
        const { token, refreshToken } = await refreshSession(); // POST /auth/refresh
        useAuthStore.getState().setSession({ token, refreshToken });
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      } catch {
        useAuthStore.getState().clearSession();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
```

Guard against a refresh stampede (multiple concurrent 401s triggering parallel `/auth/refresh`
calls, since the backend rotates the refresh token on every use and a second concurrent call
would get a stale/already-rotated token) — queue concurrent 401s behind a single in-flight
refresh promise rather than firing one refresh per failed request.

### 6.3 Route guarding

`RequireAuth` wraps the authenticated layout route; on mount with no valid session, redirect to
`/login` preserving the attempted path (`?redirect=/guests/123`) so login returns the user where
they meant to go.

---

## 7. Error handling & UX conventions

- Parse `ProblemDetail` responses centrally in the API client; surface `title`/`detail` in a
  toast (shadcn/ui `Toast` / `Sonner`) for non-form errors, and map `errors[].field` to React
  Hook Form's `setError` for 400s on a submitted form so the exact field shows the exact server
  message instead of a generic "please fix errors" toast.
- Every list page needs three states beyond the happy path: loading (skeleton rows, not a
  spinner, for anything showing tabular data), empty (friendly `EmptyState` with a call-to-action
  matching the page — "No guests yet" + "Add Guest" button), and error (`ErrorState` with retry,
  wired to TanStack Query's `refetch`).
- Destructive actions (delete PG/room/guest) get a confirm dialog — deleting a PG cascades
  conceptually to its rooms/guests/payments on the backend; make that consequence explicit in
  the confirm copy, don't let a one-click delete surprise an owner.
- Optimistic updates are fine for low-risk toggles (e.g. marking a search result as viewed) but
  **not** for payment recording — that mutation has server-computed status logic (Section 1.6);
  wait for the response and update the cache from what the server actually returned, don't
  optimistically guess the resulting `status`.

---

## 8. Testing expectations

- **Unit/component tests** (Vitest + RTL) for: the status-chip mapping function, currency/date
  formatting helpers, the due-date-clamping logic, and form validation schemas (Zod) — assert
  the boundary cases explicitly (dueDay 28 vs 29, Feb clamping, empty/whitespace note handling).
- **Integration tests** for the auth interceptor's refresh-and-retry logic (mock a 401 then a
  successful refresh then a successful retry; mock a 401 then a failed refresh → session cleared
  and redirect fires) — this is the trickiest piece of logic in the app and the easiest to get
  subtly wrong (double-refresh races, infinite retry loops on a permanently-401ing endpoint).
- **E2E** (Playwright) for the golden path against a real running backend (docker compose from
  `pg-backend`): register → login → create PG → create room → create guest (assert a PENDING
  payment appears) → record a partial payment (assert status becomes PARTIAL, amount
  accumulates) → record the remainder (assert status becomes PAID) → dashboard reflects the
  numbers. This is the web equivalent of the backend's own "Section 1 contract test" — it's the
  test that proves the two projects actually integrate, not just that each compiles alone.

---

## 9. Local development & deployment

- **Env var:** `VITE_API_BASE_URL`, defaulting to `http://localhost:8080/api/v1` for local dev
  against the `pg-backend` docker-compose stack (see that repo's README) — never hardcode the
  base URL in source.
- **CORS:** already handled backend-side (`CorsConfig` allow-lists specific origins per the
  backend spec's Section 7) — when you pick a local dev port (Vite defaults to `5173`) or a
  deployed domain, that origin needs adding to the backend's CORS allow-list; flag this as a
  cross-repo coordination step in your README rather than something the frontend can fix alone.
- **Build:** `npm run build` → static `dist/` — deployable to any static host (Vercel, Netlify,
  S3+CloudFront, or an nginx container). No server-side runtime needed since this is a pure SPA
  hitting an external API.
- **README.md** in the frontend project: how to run locally against the backend, the
  `VITE_API_BASE_URL` env var, how to run the Playwright E2E suite (requires the backend running
  via docker compose), and a note on the CORS allow-list coordination above.

---

## 10. Deliverables checklist

- [ ] Vite + React + TypeScript project, strict mode, builds clean with `npm run build`.
- [ ] Tailwind + shadcn/ui set up, `design/tokens.css` porting the Indigo Pro palette/type/
      spacing from the Android app's `DESIGN_SYSTEM.md`.
- [ ] Auth flow: login, register, logout, and the full 401-refresh-and-retry interceptor
      (Section 6.2), with a race-safe single-flight refresh.
- [ ] All P0 read/write flows: PGs, Rooms, Guests, Payments — list, create, edit, delete (where
      the API supports it), each using client-generated UUIDs and PUT-as-upsert.
- [ ] Dashboard page rendering every `DashboardDto` field, including v2 fields (`sparkline`,
      `trendPercent`, `recentActivity`).
- [ ] Defaulters page, sorted as returned by the API.
- [ ] Global search (topbar quick results + a full `/search` page), debounced.
- [ ] Status-chip color mapping centralized and used everywhere a `PaymentDto.status` or
      `GuestDto.status` is rendered — no ad hoc color picks.
- [ ] Loading (skeleton), empty, and error states on every list view.
- [ ] Currency formatted with Indian grouping everywhere money is shown.
- [ ] Unit tests for formatting/validation helpers and the refresh-interceptor logic.
- [ ] Playwright E2E covering the golden path in Section 8, runnable against the local backend
      docker-compose stack.
- [ ] `README.md`: local setup, env vars, CORS coordination note, test commands.
