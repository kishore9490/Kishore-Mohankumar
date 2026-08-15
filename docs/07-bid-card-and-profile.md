# 07 · Digital BID Card & Public Profile

The trust surface: how verified status travels outside the platform. This is BID's marketing engine as much as its product — every card shared and every profile viewed is a distribution event.

> Visual mockups: open [`design/bid-card.html`](../design/bid-card.html) in a browser.

## 7.1 Visual direction

Carried forward from the approved direction:

| Element | Specification |
|---|---|
| **Base** | Navy / dark blue enterprise aesthetic — `#0B1F3A` primary, `#122B4F` elevated |
| **Verification** | Green indicators — `#1DB954`-family for verified states, used *only* for verification status and never decoratively |
| **Caution** | Amber `#F5A623` for expiring, pending, review |
| **Adverse** | Red `#E5484D` for expired, exception, blocked — used sparingly and never for "insufficient evidence" |
| **Typography** | Clean, professional sans (Inter / IBM Plex Sans family). Tabular figures for IDs and dates. |
| **Layout** | Generous whitespace, strong hierarchy, premium SaaS restraint — the design must read as *institutional*, not *startup* |
| **Logo** | BID mark, top-left, always with the wordmark on the card |
| **QR** | Bottom-right, quiet-zone respected, minimum 20mm printed |

Design principle: **the card should look like something a compliance officer would accept, not something a growth team designed.** Restraint signals credibility, and credibility is the product.

## 7.2 The Business BID Card

```
┌──────────────────────────────────────────────┐
│  ◆ BID TRUST                                 │
│                                              │
│  ABC Engineering Pvt Ltd                     │
│  BID-BUS-100821                              │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  ✓  BID VERIFIED                       │  │
│  │     Standard Supplier · L3             │  │
│  └────────────────────────────────────────┘  │
│                                              │
│   Identity      ✓ Verified                   │
│   GST           ✓ Verified                   │
│   Bank          ✓ Verified                   │
│   Compliance    ✓ Verified                   │
│                                              │
│  Verified 15 Aug 2026 · Valid to 15 Aug 2027 │
│                                    ▢▢▢ QR    │
│  bidtrust.in/BID-BUS-100821        ▢▢▢       │
└──────────────────────────────────────────────┘
```

### Rules

1. **The card exposes no sensitive information.** No GSTIN, no PAN, no bank details, no director names, no addresses beyond city. It is a *pointer*, not a record.
2. **The card is not the verification.** It is a claim that resolves to a live profile. A screenshot proves nothing; only the QR resolution does. State this in the UI so recipients learn to scan rather than trust the image.
3. **Status is live.** A card whose verification has expired resolves to an expired profile. There is no way to freeze a favourable historical state.
4. **Anti-forgery.** Cards are generated server-side, carry a signed payload in the QR, and the profile page is the only source of truth. BID must actively monitor for forged card images — someone will make one.
5. **The verification level is always shown.** "Verified" without depth is meaningless and, over time, misleading.

## 7.3 The Person BID Card

Exists, but under materially tighter rules — and the temptation to make it a consumer growth product must be resisted.

```
┌──────────────────────────────────────────────┐
│  ◆ BID TRUST                                 │
│                                              │
│  R••••  K••••                                │
│  BID-PER-••••••                              │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  ✓  IDENTITY VERIFIED                  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│   Identity            ✓                      │
│   Safety Training     ✓  valid to 12 Mar 27  │
│   Electrical Licence  ✓  valid to 30 Jun 27  │
│                                              │
│  Issued to holder · Not publicly resolvable  │
└──────────────────────────────────────────────┘
```

**Constraints:**
- The person controls the card entirely; it is issued to them, not about them.
- It shows **credentials and validity**, never background-check results. A "BGV cleared" badge on a person is a discriminatory artifact waiting to happen and must never exist.
- Not publicly resolvable. Verification is by scan-and-authorize, in-session, by a party the person is presenting to.
- Primary legitimate use: **worker site access** — a technician proving current safety certification at a gate. That is a real, bounded, beneficial use case. It is the only one to build for initially.

## 7.4 The public business profile

`bidtrust.in/BID-BUS-100821`

```
┌───────────────────────────────────────────────────────────┐
│  [logo]  ABC Engineering Pvt Ltd            ✓ BID VERIFIED│
│          BID-BUS-100821 · Bengaluru, Karnataka            │
│          abcengineering.in                                │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ⓘ BID-VERIFIED INFORMATION                               │
│    Verified by BID Trust against authoritative sources    │
│                                                           │
│    Legal entity        ✓  Verified 15 Aug 2026            │
│    GST registration    ✓  Active · verified 15 Aug 2026   │
│    Bank account        ✓  Ownership verified              │
│    Ownership           ✓  Verified                        │
│    Risk screening      ✓  Clear · screened 15 Aug 2026    │
│                                                           │
│    Verification level  L3 — Corroborated                  │
│    Valid until         15 Aug 2027                        │
│    Continuously monitored                                 │
│                                                           │
│  ─────────────────────────────────────────────────────    │
│                                                           │
│  ⓘ COMPANY-PROVIDED INFORMATION                           │
│    Not verified by BID unless individually marked         │
│                                                           │
│    Precision engineering components for automotive        │
│    and industrial applications. Established 2011.         │
│    Employees: 120–150     Categories: Machining, Casting  │
│                                                           │
│  ─────────────────────────────────────────────────────    │
│                                                           │
│  PUBLISHED CREDENTIALS                                    │
│    ISO 9001:2015    ✓ Issuer-verified   to 28 Feb 2027    │
│    IATF 16949       ✓ Issuer-verified   to 15 Nov 2027    │
│                                                           │
│  [ Request Verification ]   [ Share ]   [ QR ]            │
└───────────────────────────────────────────────────────────┘
```

### The most important design rule in the product

> **Company-provided information and BID-verified information must be visually and structurally separated, always, with no exceptions and no ambiguity.**

Two distinct panels, distinct backgrounds, distinct iconography, explicit headers. A visitor must never be able to mistake a self-written company description for a verified fact. Every design review, every marketing page and every partner embed must be checked against this rule.

If BID ever blurs this line — even once, even in an ad — the entire trust proposition is compromised, because the platform's value rests on the claim that verified means verified.

### Profile control

| Controlled by the **company** | Controlled by **BID** |
|---|---|
| Logo, description, website | Verification status |
| Categories, capabilities | Verification level |
| Public contact details | Verification dates and validity |
| Which credentials to publish | Badge authenticity |
| Whether the profile is public at all | Monitoring status |
| Locations shown | The verified/unverified distinction |

The company can make its profile private, but it **cannot** alter, remove or contextually soften a verification result while keeping the profile public. Selective publication of *credentials* is fine; selective publication of *verification outcomes* is not. Otherwise the profile becomes an advertisement rather than evidence.

### Adverse states

A profile whose verification has lapsed shows **"Verification expired — last verified 15 Aug 2026"**, not a red warning implying wrongdoing. An entity that never completed verification shows **"Not yet verified"**, neutrally.

BID must never publicly display an adverse *risk* finding about a business on an open page. Risk findings go to authorized requesters under consent ([§08](08-consent-and-authorized-view.md)). A public "HIGH RISK" badge is a defamation exposure, an appeals nightmare, and a business-destroying weapon that BID has no standing to wield.

## 7.5 Distribution

Every surface is a growth channel:

- **Email signature badge** — small, verified, links to profile
- **Website trust badge** — embeddable, domain-locked, revocable if verification lapses
- **Tender and RFP submissions** — attach the BID Card
- **Invoice and PO footers** — BID ID printed on commercial documents
- **Directory listings, marketplaces, LinkedIn** — profile link
- **QR on physical documents, gate passes, ID cards**

The compounding effect: an unverified supplier receiving an invoice with a BID ID in the footer is a warm inbound lead — and the buyer who receives it is a warm enterprise lead. See [§10](10-reusable-profile.md).

**Badge integrity:** every embedded badge must be validated server-side on render, so a lapsed verification cannot continue displaying a green badge on a customer's website. A stale badge in the wild is a direct attack on the credibility of every other badge.
