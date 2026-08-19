# BID Platform

The BID Trust product — a working application, not a mockup.

This is the MVP defined in [`docs/17-roadmap.md`](../docs/17-roadmap.md) §Phase 1: an
enterprise creates a verification policy, invites counterparties, they complete
verification without an account and without paying, and the requester gets an
evidence-backed record.

> **Not the architecture explorer.** That (`../architecture-explorer`) is a map of the
> system. This is the system.

---

## Run it

Requires **Node 18+** and a **Postgres** connection string. You do not need to install
Postgres — a free hosted database takes about two minutes and works for both local
development and production, which keeps dev and prod on the same engine.

### 1. Get a database

Create a free project at **[neon.tech](https://neon.tech)** (or Supabase, Railway, or any
Postgres) and copy the **pooled** connection string.

### 2. Configure

```bash
cd bid-platform
cp .env.example .env
```

Open `.env` and paste your connection string into `DATABASE_URL`. Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Install and run

```bash
npm install
npm run setup      # creates the tables and seeds demo data
npm run dev
```

Open **http://localhost:3000**

`npm run setup` prints a demo login and three invitation links. Sign in as:

```
priya@abc.example   /   demo1234
```

**Windows:** if PowerShell blocks npm, use `npm.cmd` instead of `npm`, or run
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once.

---

## Deploy it

The app is a standard Next.js project and deploys to Vercel without changes.

1. Push this repository to GitHub (already done if you are reading this there).
2. At **[vercel.com/new](https://vercel.com/new)**, import the repository and set the
   **Root Directory** to `bid-platform`.
3. Add two environment variables:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | your **pooled** Postgres connection string |
   | `SESSION_SECRET` | the random value you generated above |

4. Deploy. Then create the tables and demo data against the production database:

   ```bash
   npm run setup      # with the production DATABASE_URL in your local .env
   ```

**Use the pooled connection string in production.** Serverless functions open many short
connections, and a direct endpoint will hit its connection limit. `src/db/index.ts` already
caps the pool at one connection and disables prepared statements when running on Vercel,
because pooled endpoints do not support them.

---

## Walk the whole loop in five minutes

1. **Sign in** as Priya at ABC Technologies.
2. **Campaigns → Q3 Supplier Onboarding.** Three counterparties are invited and awaiting response.
3. **Copy an invitation link** and open it — this is what the counterparty sees. Note that
   it states what ABC *will* and *will not* see before anything is submitted.
4. **Fill in GSTIN/PAN/CIN, tick consent, submit.** Checks run against the mock providers,
   evidence is captured and hashed, an assessment is produced and a credential is issued.
5. **You land on the counterparty's BID ID.** Open the public profile.
6. **Back in the dashboard**, the campaign now shows the result and the per-check breakdown.

Then try **Deccan Fabricators** — it is seeded to fail its GST check, so you can see the
exception path rather than only the happy one.

---

## What is actually implemented

| Area | Status |
|---|---|
| Sign up / sign in, sessions | Working — scrypt hashing, HMAC-signed cookies, `node:crypto` only |
| Organization identity + BID ID minting | Working — Crockford Base32 with a check character |
| Workspaces (tenants) separate from organizations | Working — every tenant query is workspace-scoped |
| Policy engine with immutable versions | Working — create policies, mark checks required/optional |
| Campaigns and scoped expiring invitations | Working — no account needed by the invitee |
| Consent capture with hashed artifact | Working — purpose-bound, time-boxed |
| Verification orchestration | Working — **mock providers**, routing, simulated failover, cost ledger |
| Immutable evidence with SHA-256 content hash | Working |
| Explainable assessment | Working — deterministic rubric, per-dimension factors |
| Credential issuance | Working |
| Public profile with claimed/verified separation | Working |
| Append-only audit log | Working |

**Not built yet:** monitoring and re-verification, BGV/people verification, the authorized
verification view, billing, the public API, and email delivery (invitation links are shown
in the UI instead of sent).

---

## Deliberate boundaries

These are product positions from the strategy docs, enforced in code rather than in comments:

- **No third-party verification API is integrated.** `src/lib/providers/mock.ts` returns
  deterministic synthetic results. Access to several real channels is legally restricted,
  so nothing here assumes access.
- **`INSUFFICIENT_EVIDENCE` is a distinct state from `HIGH` risk.** A missing identifier is
  recorded as unmeasured, never as adverse. See `src/lib/assessment.ts`.
- **The invitee never pays and never needs an account.** Charging them would stall campaigns
  and the network would never form.
- **The public profile never shows an adverse risk finding.** Assessment detail goes only to
  authorized requesters under consent.
- **Entity level is the weakest required attribute, not an average** — averaging hides gaps.
- **BID is not a government authority** and the UI says so on the public profile.

---

## Project structure

```
bid-platform/
├── src/
│   ├── db/
│   │   ├── schema.ts        Organizations, workspaces, relationships, policies,
│   │   │                    campaigns, verifications, evidence, consents, audit
│   │   ├── index.ts         Drizzle client
│   │   └── seed.ts          Demo data — fictional organizations only
│   ├── lib/
│   │   ├── auth.ts          Sessions, scrypt password hashing, principal resolution
│   │   ├── bidid.ts         BID ID minting, normalisation, check character
│   │   ├── actions.ts       Server actions — signup, policy, campaign, invite, decision
│   │   ├── verification.ts  Orchestration: expand policy → route → evidence → assess
│   │   ├── assessment.ts    Deterministic explainable rubric
│   │   └── providers/mock.ts  Mock adapters — no real API is called
│   ├── components/Brand.tsx   Logo, check badge, verified shield, status pills
│   └── app/
│       ├── page.tsx           Landing
│       ├── signin, signup
│       ├── dashboard/         Overview, policies, campaigns
│       ├── invite/[token]/    The counterparty flow — no account required
│       └── p/[bidId]/         Public profile
└── drizzle.config.ts
```

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind · Drizzle ORM · PostgreSQL via postgres.js · Lucide.

No native compilation step, so `npm install` behaves the same on Windows, macOS and Linux.
The database driver is provider-neutral — Neon, Supabase, Railway, RDS or a local server all
work from the same connection string.

## Moving to production

1. **Set `SESSION_SECRET`** to a real random value — see `.env.example`.
2. **Replace the mock providers** with real adapters behind the same interface, and
   negotiate caching/reuse rights in every provider contract.
3. **Add email delivery** for invitations.
4. **Add rate limiting and bot protection** on `/p/[bidId]` — a scraped verified-business
   directory has real commercial value.
5. **Move evidence to write-once object storage** with independent keys, separate from the
   application database.
6. **Add row-level security** in Postgres as a second line of defence behind the
   application-level workspace scoping.
