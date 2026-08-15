# 06 · BID ID Architecture

## 6.1 Purpose

The BID ID is the public handle for everything in the platform. It appears on cards, in URLs, in emails, in ERP master data, in purchase orders and in audit reports. It is quoted over the phone and typed by hand. It must therefore be **stable, unguessable, non-sequential, PII-free, and human-transcribable**.

## 6.2 Format

```
BID-<TYPE>-<IDENTIFIER><CHECK>
```

- `BID` — fixed namespace
- `TYPE` — three-letter entity class
- `IDENTIFIER` — 8 characters, Crockford Base32
- `CHECK` — 1 check character

Example: `BID-BUS-100821` (short display form used throughout this documentation; the full production form carries the complete 8+1 character body).

### Why Crockford Base32

- Excludes `I`, `L`, `O`, `U` — removes the 1/I/l and 0/O confusions that plague phone-dictated identifiers
- Case-insensitive on input, uppercase on display
- Accepts common transcription errors on read and normalizes them
- 32⁸ ≈ **1.1 × 10¹²** values per type — no practical exhaustion, and random assignment gives no meaningful enumeration surface

### The check character

Computed with a Damm or ISO 7064 mod-37 algorithm. Catches all single-character errors and all adjacent transpositions — the two mistakes humans actually make. Validation is client-side and instant, so a mistyped ID fails at the input box rather than in a support ticket.

## 6.3 Type codes

| Code | Object | Public? | Notes |
|---|---|---|---|
| `BUS` | Business entity | **Yes** | Resolvable at `bidtrust.in/BID-BUS-…` |
| `PER` | Person entity | **No** | Never publicly resolvable. Consent-gated. |
| `VER` | Verification record | Restricted | Shared with authorized parties only |
| `CRED` | Credential | Conditional | Public if the holder publishes it |
| `CAMP` | Campaign | No | Tenant-internal |
| `REQ` | Request | No | Tenant ↔ entity |
| `CON` | Consent artifact | No | Referenced in receipts |
| `POL` | Policy | No | Tenant-internal |
| `REL` | Relationship | No | Tenant-private — highest confidentiality |
| `EVD` | Evidence | No | Restricted |
| `TEN` | Tenant | No | Internal |
| `PRV` | Provider | No | Internal |
| `USR` | User | No | Internal |

Reserved for future use: `GRP` (corporate group), `SIT` (site/location), `AST` (asset), `PRD` (product), `DOC` (document set).

## 6.4 Design rules

1. **Never encode meaning in the identifier.** No sequence, no date, no state, no industry, no geography. Anything encoded becomes wrong the moment the entity changes, and leaks information in the meantime. Sequential IDs also disclose volume — a competitor reading `BID-BUS-000004` learns exactly how few customers exist.
2. **Never derive it from PII.** No hash of PAN, GSTIN or name, however tempting. Hashes of low-entropy identifiers are reversible by brute force, which would make every BID ID a PII disclosure.
3. **Immutable for life.** A business that changes name, address, ownership or even legal form keeps its BID ID. The ID identifies the *entity*, not its current attributes.
4. **Random assignment**, collision-checked at write.
5. **Internal keys are separate.** UUIDv7 primary keys internally; the BID ID is the external handle. This allows the external scheme to evolve without a database migration.
6. **One entity, one ID.** Entity resolution ([§02.7](02-entity-model.md#27-entity-resolution)) enforces this. Merges preserve both IDs, with the retired one permanently redirecting — never reused, never reassigned.

## 6.5 Resolution

```
bidtrust.in/BID-BUS-100821    → public business profile
bidtrust.in/v/BID-VER-88123   → verification record (authorized parties only)
bidtrust.in/c/BID-CRED-77120  → credential verification page (if published)
```

- `BID-PER-…` never resolves publicly. A request for one returns a generic not-found — **the same response as a non-existent ID**, so that the endpoint cannot be used to test whether a person exists in the system.
- Public profile pages are rate-limited and bot-protected. The commercial value of a scraped verified-business directory is high enough that someone will try.
- QR codes encode the full resolution URL, not the bare ID.

## 6.6 Related-identifier handling

Government and third-party identifiers (CIN, PAN, GSTIN, Udyam, DIN, UAN) are **attributes**, never identifiers, and are stored under strict controls:

| Identifier | Storage | Display |
|---|---|---|
| CIN, LLPIN | Plain | Full — public record |
| GSTIN | Plain | Full — public record |
| Udyam | Plain | Full |
| PAN (business) | Encrypted at rest | Masked by default: `AABCX••••M` |
| PAN (individual) | Encrypted at rest | Masked, disclosure-gated |
| Aadhaar or equivalent | **Not stored** unless a lawful, authorized flow requires it, and then only as permitted by that framework | Never displayed |
| Bank account | Encrypted, tokenized | Last 4 digits only |
| DIN, UAN | Encrypted at rest | Masked |

The rule: **verify against an identifier, then store the minimum needed to prove the verification happened.** In most cases that is the verification outcome plus a token, not the raw identifier. Storing a national identifier you do not need is pure liability with no product benefit.

## 6.7 Presentation

| Context | Format |
|---|---|
| UI, cards, documents | `BID-BUS-100821` |
| Spoken / phone | "B-I-D, business, one zero zero eight two one" |
| API | `BID-BUS-100821` — full string, case-normalized on input |
| ERP master-data field | Full string; recommend a dedicated `bid_id` field, never overloading an existing code field |
| QR | `https://bidtrust.in/BID-BUS-100821` |
| Email subject | `[BID-BUS-100821]` for threading |

Input handling is forgiving: accept lowercase, accept missing hyphens, accept the four Crockford substitutions, then normalize and validate the check character before lookup.
