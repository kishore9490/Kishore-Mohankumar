# EMC — Experts Medical Coding Academy

One product with two doors:

- **Public website** (`app/(site)`): a professional gateway into medical coding.
- **EMC Academy** (`app/academy`): the learning platform, with role-based experiences for **students** (learn), **faculty** (teach), **marketing** (grow) and **super admin** (operate).

It's built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion and React Three Fiber.

## EMC Academy — quick start

Run `npm run dev`, open http://localhost:3000/login and click one of the **demo accounts**. Every person, lead, score and amount in demo mode is fictional.

| Role | Email | Password |
| --- | --- | --- |
| Student | student@demo.emc | Student@2026 |
| Faculty | faculty@demo.emc | Faculty@2026 |
| Marketing | marketing@demo.emc | Growth@2026 |
| Super Admin | admin@demo.emc | Admin@2026 |

The role comes from the account; there's no role picker. Demo mode keeps data in memory, so changes reset when the server restarts. Demo accounts disappear once `DATABASE_URL` is set.

See [`docs/PLATFORM.md`](docs/PLATFORM.md) for architecture and conventions.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Copy `.env.example` to `.env.local` and fill in what you have.

## Before launch: content EMC must supply

The site does not make up facts. Anything EMC hasn't confirmed shows an honest fallback ("Shared during counselling") or stays hidden.

| What | Where | Current state |
| --- | --- | --- |
| **Official logo** | `public/brand/` + `data/site.ts → logo` | Typographic stand-in. Drop in the real file, update `src`/`width`/`height`, set `isPlaceholder: false`. Also replace `app/icon.svg`. |
| Phone / email / address / socials | `data/site.ts → contact`, `social` | Empty, so the site hides them |
| WhatsApp number | `NEXT_PUBLIC_WHATSAPP_NUMBER` | Empty, so WhatsApp actions fall back to the on-site forms |
| Program names, duration, mode, fees, certificate | `data/programs.ts` | Indicative structure; facts are `null` |
| Curriculum | `data/curriculum.ts` | Indicative, standard medical-coding path |
| Faculty | `data/faculty.ts` | Empty, so a "profiles being published" state shows. Placeholders appear only with `NEXT_PUBLIC_SHOW_PLACEHOLDERS=true` |
| Testimonials | `data/testimonials.ts` | Empty, so the section is hidden |
| Statistics | `data/stats.ts` | Empty, so the section is hidden. Each stat needs a `source` |
| FAQ answers | `data/faqs.ts` | Unconfirmed answers are `null` and are left out of FAQ schema |
| Learning features | `data/learning.ts` | Toggle `enabled` to match what EMC actually offers |
| Eligibility rules | `data/learning.ts → eligibilityRules` | Empty |
| Career roles | `data/careers.ts` | Indicative; keep only the roles that are relevant |
| Intro video | `data/intro.ts → src` | Plays an animated explainer until a video is set |
| Founding story | `app/about/page.tsx → story` | Generic mission copy |
| Legal pages | `app/privacy`, `app/terms`, `app/disclaimer` | Template text that needs legal review |
| Insights articles | `data/insights.ts` | General explainers that EMC should review and attribute |

## Platform architecture

```
app/(site)          public website (unchanged design, now in a route group)
app/(auth)          login, forgot/reset password
app/academy         authenticated platform (shell + role areas)
app/verify/[id]     public certificate verification
app/api             leads (website → CRM), search, files (signed URLs), webhooks
proxy.ts            optimistic auth gate for /academy
lib/platform        domain types, permissions (RBAC), navigation, formatting
server/auth         sessions (signed httpOnly cookie + server-side session store), passwords (scrypt), rate limiting
server/db           store (demo in-memory) + seed  →  prisma/schema.prisma for PostgreSQL
server/repositories read models used by screens
server/actions      server actions (each checks a permission, validates, audits, emits events)
server/events       domain event bus
server/services     notification engine, communication service, templates, AI service, audit, leads
server/jobs         background job queue (in-process; swap for BullMQ/Cloud Tasks)
integrations/       email · whatsapp · sms · ai · storage · payments · analytics — interface + adapters
design-system/      shared tokens + components for website and academy
```

- **Authorization is by permission, not role.** Roles are bundles of permissions (`lib/platform/rbac.ts`), and each page and action checks the permission it needs on the server.
- **Events drive communication.** Business code emits events such as `lead.created` or `certificate.issued`. The notification engine matches templates, respects preferences, opt-in and template approval, picks the channel, and calls `CommunicationService`, which uses whichever provider adapter is configured. Business logic never names a provider.
- **AI is provider-agnostic and permission-scoped.** `AIService` builds a minimal context from records the user may access, adds a safety preamble, returns drafts only, and logs requests without storing their content. No provider is configured, so AI features show a clear "not switched on" state.
- **Secrets stay on the server.** Every provider credential is a server env var (see `.env.example`), and the Integrations screen shows variable names only, never values.

### Going live (what's still needed)

1. **Database.** Install Prisma, set `DATABASE_URL`, run the migration from `prisma/schema.prisma`, then implement `server/repositories/*` and the store writes against Prisma. The screens don't change.
2. **Production secrets.** Set `AUTH_SECRET`.
3. **Two-step verification for admins.** MFA is modelled (`mfaEnabled`) but not enforced. Add TOTP or your identity provider before launch.
4. **OTP, Google and Microsoft sign-in.** Plug in an auth provider behind `server/auth`.
5. **Providers.** Choose them (email, WhatsApp, SMS, storage, payments, AI), add their adapters in `integrations/*`, and set the env vars.
6. **Job queue.** Swap `server/jobs/queue.ts` for a durable queue.
7. **Rate limiting.** It's in-memory now; use a shared store such as Redis when running more than one server instance.

## Website architecture

```
app/                 routes (/, /programs, /programs/[slug], /medical-coding, /career, /faculty,
                     /demo, /counselling, /insights, /insights/[slug], /about, /contact,
                     /login, /student/*, legal, sitemap, robots, OG image, /api/leads)
components/
  hero/              Hero, record→code console, intro modal
  3d/                DataFlowScene (R3F) — loaded dynamically, desktop only, paused off-screen
  interactive/       Code Journey (signature), Coding Lab, career quiz
  curriculum/        Interactive curriculum map
  programs/ career/ faculty/ forms/ sections/ student/ layout/ ui/
data/                all editable content (CMS-ready)
lib/                 types (entity model), analytics, leads, seo/JSON-LD, whatsapp, auth seam
hooks/               media-query / in-view helpers
```

### Integrations

- **Leads / CRM:** every form posts to `/api/leads`. The route validates the lead and forwards it to `LEADS_WEBHOOK_URL` (a CRM, Zapier/Make, Apps Script and so on). No database is bundled.
- **Analytics:** `lib/analytics.ts → track()` pushes to `window.dataLayer` and dispatches an `emc:track` DOM event, so it isn't tied to any vendor. It tracks these events: `course_view`, `course_enquiry`, `demo_started`, `demo_completed`, `counselling_started`, `counselling_completed`, `whatsapp_click`, `phone_click`, `fee_view`, `application_started`, `application_completed`, `quiz_completed` and `lab_submitted`.
- **Payments:** set `fee.paymentLink` on a program and a "Pay & enrol" button appears.
- **LMS / auth:** `lib/auth.ts` is the seam for this. `/login` and `/student/*` are UI shells marked as a concept preview, and they're excluded from indexing.
- **CRM entities:** see `lib/types.ts` (Lead, Program, Batch, Faculty, Student, Testimonial, …).

## Compliance guardrails built in

- Every patient case is fictional and labelled as such. The Coding Lab and Code Journey say they're educational simulations, not coding tools.
- The site never claims guaranteed jobs, salaries, placement, accreditation or student counts.
- It separates EMC course certificates from external professional certification.
- CPT® trademark attribution appears in the footer, the lab and the legal pages.

## Accessibility and performance

The site uses semantic landmarks, a skip link, labelled forms with inline errors, keyboard-operable tabs and dialogs, and visible focus states. With `prefers-reduced-motion`, the 3D scene is removed and the scroll story becomes a stepper. Three.js is code-split and loaded only on desktop, and its render loop pauses when the hero is off-screen.
