import { randomBytes } from 'node:crypto'

/**
 * BID identifiers.
 *
 * Format: BID-<TYPE>-<8 chars Crockford Base32><1 check char>
 *
 * Crockford excludes I, L, O and U, which removes the 1/I/l and 0/O confusions
 * that make identifiers painful to read aloud or transcribe. Nothing is encoded
 * in the value — no sequence, no date, no PII — because anything encoded is
 * wrong the moment the entity changes, and leaks information in the meantime.
 */

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // Crockford Base32
const BODY_LEN = 8

export type BidType = 'BUS' | 'PER' | 'VER' | 'CRED' | 'CAMP' | 'REQ' | 'CON' | 'POL' | 'REL' | 'EVD'

/** ISO 7064-style mod-N check character over the Crockford alphabet. */
function checkChar(body: string): string {
  let sum = 0
  for (const ch of body) {
    const v = ALPHABET.indexOf(ch)
    sum = (sum + v) * 2 % (ALPHABET.length + 1)
  }
  return ALPHABET[(ALPHABET.length + 1 - sum) % ALPHABET.length]
}

export function mintBidId(type: BidType): string {
  const bytes = randomBytes(BODY_LEN)
  let body = ''
  for (let i = 0; i < BODY_LEN; i++) body += ALPHABET[bytes[i] % ALPHABET.length]
  return `BID-${type}-${body}${checkChar(body)}`
}

/** Forgiving on input: accepts lowercase, missing hyphens and the four Crockford substitutions. */
export function normalizeBidId(input: string): string | null {
  const cleaned = input
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .replace(/I|L/g, '1')
    .replace(/O/g, '0')
    .replace(/U/g, 'V')
  const m = cleaned.match(/^BID(BUS|PER|VER|CRED|CAMP|REQ|CON|POL|REL|EVD)([0-9A-Z]{9})$/)
  if (!m) return null
  return `BID-${m[1]}-${m[2]}`
}

export function isValidBidId(input: string): boolean {
  const norm = normalizeBidId(input)
  if (!norm) return false
  const body = norm.split('-')[2]
  return checkChar(body.slice(0, BODY_LEN)) === body[BODY_LEN]
}

/** Random URL-safe token for scoped, expiring invitations. */
export function inviteToken(): string {
  return randomBytes(24).toString('base64url')
}
