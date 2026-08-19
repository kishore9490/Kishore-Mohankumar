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

Requires **Node 18+**. No database server, no Docker — SQLite lives in a file.

```bash
cd bid-platform
npm install
npm run setup      # creates the database and seeds demo data
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

Next.js 16 (App Router) · TypeScript · Tailwind · Drizzle ORM · SQLite via libSQL · Lucide.

libSQL ships prebuilt per-platform binaries, so there is no native compilation step on
Windows, macOS or Linux.

## Moving to production

1. **Swap SQLite for Postgres.** Change the Drizzle dialect and `DATABASE_URL`; the schema
   is portable.
2. **Set `SESSION_SECRET`** to a real random value — see `.env.example`.
3. **Replace the mock providers** with real adapters behind the same interface, and
   negotiate caching/reuse rights in every provider contract.
4. **Add email delivery** for invitations.
5. **Add rate limiting and bot protection** on `/p/[bidId]` — a scraped verified-business
   directory has real commercial value.
6. **Move evidence to write-once object storage** with independent keys, separate from the
   application database.
