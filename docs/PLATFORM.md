# EMC Digital Academy — platform conventions

The public website (`app/(site)`) is the source of truth for EMC's visual identity. The academy (`app/academy`) extends it. **Never edit the public website's look.**

## Layering

```
Screen (app/academy/**/page.tsx — server components)
  ↓ reads
Repositories (server/repositories/*.ts — read models, no writes)
  ↓
Store (server/db/store.ts → demo in-memory; PostgreSQL/Prisma later)

Client interaction → Server actions (server/actions/<area>.ts, "use server")
  ↓ assertPermission(...) → mutate via store → audit(...) → emit(event)
  ↓
Services (server/services/*) → Integrations (integrations/*) → providers
```

- Every page calls `requirePermission("<permission>")` (or `requireUser()`) from `@/server/auth/session` first. **Never authorize by role name** — always by permission.
- Every server action calls `assertPermission(...)`, validates and clips all input, mutates, calls `audit({...})`, may `emit(event, payload)`, then `revalidatePath(...)`. Return `{ ok: true } | { ok: false, error }` for form actions.
- Business code never calls a provider (email, WhatsApp, AI, …) directly. Use `emit()` (notification engine) or `sendMessage()` / `askAI()` services.
- Data shown to a user must be scoped to what they may see (a student sees only their own records; faculty only their batches/courses).
- Server-only modules start with `import "server-only"`.

## Next.js 16 notes

- `params` and `searchParams` are Promises: `const { id } = await params`.
- `middleware` is now `proxy.ts` (already set up; don't add another).
- Use `useActionState` (from `react`) for forms that call server actions.

## Design language (match the website)

- Tokens (Tailwind v4, `app/globals.css`): `ink` (deep navy), `navy`, `blue` (medical blue), `cyan` (accent — use sparingly), `cyan-ink` (cyan text on white), `soft` (soft blue), `mist` (very light grey), `line` (hairline), `muted` (secondary text).
- Type: Geist; technical labels use the `label` class (mono, uppercase, tracked). Headings use the `heading` / `display` classes.
- Surfaces: page background `bg-mist`; panels white with `border border-line rounded-2xl`. Hairline grids (`gap-px bg-line`) instead of generic stat cards. Dark `bg-ink` hero bands with `grid-bg-dark` are allowed for one focal block per screen.
- Buttons: `Button` / `ButtonLink` from `@/components/ui/Button` (variants: primary, accent, outline, ghost, light, outline-light; sizes sm/md/lg).
- Icons: `Icon` from `@/components/ui/Icon` (see its list of names).
- Academy kit: `@/components/academy/ui` — `PageHeader`, `Panel`, `Metrics`, `Pill`, `StatusPill`, `statusTone`, `humanize`, `ProgressBar`, `Ring`, `Avatar`, `EmptyState`, `ErrorState`, `Skeleton`, `Tabs`, `DataTable`, `Notice`, `TextLink`, `DemoBadge`.
- Charts: `@/components/academy/charts` — `BarChart`, `LineChart`, `HBars`, `Funnel`, `ActivityStrip`. Keep charts few and clean.
- Formatting: `@/lib/platform/format` (`formatDate`, `formatDateTime`, `formatShortDate`, `formatTime`, `formatWeekday`, `inr`, `relative`, `greeting`).
- Every list has a meaningful empty state. Use the shared `loading.tsx` skeleton or `Skeleton` for loading. Mobile first: tables use `DataTable` (stacks on phones); never cause horizontal page scroll; touch targets ≥ 40px.
- Accessibility: semantic headings (one `h1` per page via `PageHeader`), labelled form controls, `aria-*` on custom widgets, visible focus.
- Honesty: all data is fictional demo data. Never present the Coding Lab or AI output as medical advice or an authoritative coding decision. Certificates from EMC are course certificates, not external professional certifications.
