# EMC — Experts Medical Coding Academy

Website for EMC: a professional gateway into medical coding. It's built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion and React Three Fiber.

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

## Architecture

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
