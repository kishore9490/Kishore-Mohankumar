import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db, users, sessions, workspaces, organizations } from '@/db'

/**
 * Sessions. Uses node:crypto only — no native dependencies, so this installs
 * and runs identically on Windows, macOS and Linux.
 */

const COOKIE = 'bid_session'
const SESSION_DAYS = 14

function secret(): string {
  return process.env.SESSION_SECRET ?? 'dev-only-secret-change-me-before-deploying'
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const key = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${key}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(key, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

function sign(sessionId: string): string {
  const mac = createHmac('sha256', secret()).update(sessionId).digest('base64url')
  return `${sessionId}.${mac}`
}

function unsign(value: string): string | null {
  const idx = value.lastIndexOf('.')
  if (idx < 0) return null
  const sessionId = value.slice(0, idx)
  const mac = value.slice(idx + 1)
  const expected = createHmac('sha256', secret()).update(sessionId).digest('base64url')
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return sessionId
}

export async function createSession(userId: string) {
  const id = randomBytes(24).toString('base64url')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 864e5)
  await db.insert(sessions).values({ id, userId, expiresAt, createdAt: now })
  const jar = await cookies()
  jar.set(COOKIE, sign(id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export async function destroySession() {
  const jar = await cookies()
  const raw = jar.get(COOKIE)?.value
  if (raw) {
    const id = unsign(raw)
    if (id) await db.delete(sessions).where(eq(sessions.id, id))
  }
  jar.delete(COOKIE)
}

export type Principal = {
  userId: string
  name: string
  email: string
  workspaceId: string
  workspaceName: string
  organizationId: string
  organizationName: string
  organizationBidId: string
  role: string
}

/**
 * Resolves the caller and the workspace every query must be scoped to.
 * Nothing tenant-private should ever be read without going through here.
 */
export async function currentPrincipal(): Promise<Principal | null> {
  const jar = await cookies()
  const raw = jar.get(COOKIE)?.value
  if (!raw) return null
  const sessionId = unsign(raw)
  if (!sessionId) return null

  const rows = await db
    .select({
      userId: users.id, name: users.name, email: users.email, role: users.role,
      workspaceId: workspaces.id, workspaceName: workspaces.name,
      organizationId: organizations.id, organizationName: organizations.legalName,
      organizationBidId: organizations.bidId,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(workspaces, eq(users.workspaceId, workspaces.id))
    .innerJoin(organizations, eq(workspaces.organizationId, organizations.id))
    .where(eq(sessions.id, sessionId))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    return null
  }
  const { expiresAt: _drop, ...principal } = row
  void _drop
  return principal
}

export async function requirePrincipal(): Promise<Principal> {
  const p = await currentPrincipal()
  if (!p) throw new Error('UNAUTHENTICATED')
  return p
}
