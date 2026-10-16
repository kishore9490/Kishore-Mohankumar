import type { PrismaClient, ChallengePurpose, Role } from "@prisma/client";
import { randomToken, sha256 } from "./tokens";
import { hashPassword } from "./password";
import { generateRecoveryCodes, generateTotpSecret, normalizeRecoveryCode, verifyTotp } from "./totp";
import { encryptSecret, tryDecryptSecret } from "../crypto/secret-box";
import { ServiceError } from "../services/errors";

export const INVITE_TTL_HOURS = 72;
export const CHALLENGE_TTL_MINUTES = 10;
export const MAX_CHALLENGE_ATTEMPTS = 5;

// ───────── Invitations ─────────

/** Creates (or re-invites) a user. Returns the raw invitation token — it is shown/sent once and only its hash is stored. */
export async function inviteUser(db: PrismaClient, input: { name: string; email: string; role: Role }, createdById: string | null) {
  const email = input.email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing && existing.passwordHash && existing.active) throw new ServiceError("This person already has an active account. Use “Reset access” instead.");
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { name: input.name, role: input.role, active: true, invitedAt: new Date() } })
    : await db.user.create({ data: { name: input.name, email, role: input.role, invitedAt: new Date() } });
  const token = await createInvitation(db, user.id, createdById);
  return { userId: user.id, token };
}

/** Issues a fresh invitation link; any earlier unused links for the user are revoked. */
export async function createInvitation(db: PrismaClient, userId: string, createdById: string | null) {
  const token = randomToken(32);
  await db.$transaction([
    db.invitation.updateMany({ where: { userId, usedAt: null, revokedAt: null }, data: { revokedAt: new Date() } }),
    db.invitation.create({ data: { userId, createdById, tokenHash: sha256(token), expiresAt: new Date(Date.now() + INVITE_TTL_HOURS * 3_600_000) } }),
  ]);
  return token;
}

export async function revokeInvitations(db: PrismaClient, userId: string) {
  await db.invitation.updateMany({ where: { userId, usedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function resolveInvitation(db: PrismaClient, token: string) {
  if (!/^[A-Za-z0-9_-]{30,64}$/.test(token)) return null;
  const inv = await db.invitation.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!inv || inv.usedAt || inv.revokedAt || inv.expiresAt < new Date() || !inv.user.active) return null;
  return inv;
}

/**
 * Accepting an invitation sets the password and clears any previous MFA so the user enrols a fresh
 * authenticator. Existing sessions are revoked. Returns the user id.
 */
export async function acceptInvitation(db: PrismaClient, token: string, password: string) {
  const inv = await resolveInvitation(db, token);
  if (!inv) throw new ServiceError("This invitation link is invalid, expired or has already been used. Ask an administrator for a new one.");
  const passwordHash = await hashPassword(password);
  await db.$transaction([
    db.invitation.update({ where: { id: inv.id }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: inv.userId }, data: { passwordHash, activatedAt: inv.user.activatedAt ?? new Date(), mfaEnabled: false, mfaSecretEnc: null, mfaLastStep: null } }),
    db.recoveryCode.deleteMany({ where: { userId: inv.userId } }),
    db.session.deleteMany({ where: { userId: inv.userId } }),
  ]);
  return inv.userId;
}

// ───────── Challenges (password step → MFA step) ─────────

export async function createChallenge(db: PrismaClient, userId: string, purpose: ChallengePurpose) {
  const token = randomToken(32);
  await db.authChallenge.deleteMany({ where: { OR: [{ userId }, { expiresAt: { lt: new Date() } }] } });
  await db.authChallenge.create({
    data: { userId, purpose, tokenHash: sha256(token), expiresAt: new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60_000), pendingSecretEnc: purpose === "ENROLL" ? encryptSecret(generateTotpSecret()) : null },
  });
  return token;
}

export async function getChallenge(db: PrismaClient, token: string | undefined, purpose: ChallengePurpose) {
  if (!token) return null;
  const ch = await db.authChallenge.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!ch || ch.purpose !== purpose || ch.expiresAt < new Date() || ch.attempts >= MAX_CHALLENGE_ATTEMPTS || !ch.user.active) return null;
  return ch;
}

export type CodeResult = { ok: true; userId: string; usedRecoveryCode?: boolean; remainingRecoveryCodes?: number } | { ok: false; error: string; attemptsLeft: number; restart?: boolean };

async function failAttempt(db: PrismaClient, challengeId: string, attempts: number, message: string): Promise<CodeResult> {
  const used = attempts + 1;
  const left = MAX_CHALLENGE_ATTEMPTS - used;
  if (left <= 0) {
    await db.authChallenge.delete({ where: { id: challengeId } }).catch(() => {});
    return { ok: false, error: "Too many incorrect codes. Please sign in again.", attemptsLeft: 0, restart: true };
  }
  await db.authChallenge.update({ where: { id: challengeId }, data: { attempts: used } });
  return { ok: false, error: message, attemptsLeft: left };
}

/** Verifies a TOTP code (or a one-time recovery code) for the LOGIN challenge. */
export async function verifyLoginCode(db: PrismaClient, token: string | undefined, rawCode: string): Promise<CodeResult> {
  const ch = await getChallenge(db, token, "LOGIN");
  if (!ch) return { ok: false, error: "Your sign-in session expired. Please sign in again.", attemptsLeft: 0, restart: true };
  const code = rawCode.trim();
  const user = ch.user;
  if (!user.mfaEnabled || !user.mfaSecretEnc) return { ok: false, error: "Multi-factor authentication is not set up for this account.", attemptsLeft: 0, restart: true };

  const secret = tryDecryptSecret(user.mfaSecretEnc);
  if (!secret) return { ok: false, error: "Your authenticator could not be verified because the server encryption key changed. Ask an administrator to reset your access.", attemptsLeft: 0, restart: true };

  if (/^\d{6}$/.test(code)) {
    const step = verifyTotp(secret, code, user.mfaLastStep);
    if (step === null) return failAttempt(db, ch.id, ch.attempts, "That code is not valid. Check your authenticator app and try again.");
    // Atomic replay guard: only succeeds if no newer step was accepted in the meantime
    const updated = await db.user.updateMany({ where: { id: user.id, OR: [{ mfaLastStep: null }, { mfaLastStep: { lt: step } }] }, data: { mfaLastStep: step } });
    if (updated.count === 0) return failAttempt(db, ch.id, ch.attempts, "That code was already used. Wait for the next code.");
    await db.authChallenge.delete({ where: { id: ch.id } });
    return { ok: true, userId: user.id };
  }

  const normalized = normalizeRecoveryCode(code);
  if (normalized.length === 8) {
    const hash = sha256(`${user.id}:${normalized}`);
    const consumed = await db.recoveryCode.updateMany({ where: { userId: user.id, codeHash: hash, usedAt: null }, data: { usedAt: new Date() } });
    if (consumed.count === 1) {
      await db.authChallenge.delete({ where: { id: ch.id } });
      const remaining = await db.recoveryCode.count({ where: { userId: user.id, usedAt: null } });
      return { ok: true, userId: user.id, usedRecoveryCode: true, remainingRecoveryCodes: remaining };
    }
    return failAttempt(db, ch.id, ch.attempts, "That recovery code is not valid or was already used.");
  }
  return failAttempt(db, ch.id, ch.attempts, "Enter the 6-digit code from your authenticator app.");
}

export async function enrollmentSecret(db: PrismaClient, token: string | undefined) {
  const ch = await getChallenge(db, token, "ENROLL");
  const secret = tryDecryptSecret(ch?.pendingSecretEnc);
  if (!ch || !secret) return null;
  return { secret, email: ch.user.email, name: ch.user.name };
}

/** Confirms the first TOTP code, enables MFA and returns fresh recovery codes (shown once). */
export async function confirmEnrollment(db: PrismaClient, token: string | undefined, code: string): Promise<CodeResult & { recoveryCodes?: string[] }> {
  const ch = await getChallenge(db, token, "ENROLL");
  if (!ch || !ch.pendingSecretEnc) return { ok: false, error: "Your setup session expired. Please sign in again.", attemptsLeft: 0, restart: true };
  const secret = tryDecryptSecret(ch.pendingSecretEnc);
  if (!secret) return { ok: false, error: "Your setup session could not be read. Please sign in again.", attemptsLeft: 0, restart: true };
  const step = verifyTotp(secret, code.trim());
  if (step === null) return failAttempt(db, ch.id, ch.attempts, "That code does not match. Make sure you scanned the latest QR code and try again.");
  const codes = generateRecoveryCodes();
  await db.$transaction([
    db.user.update({ where: { id: ch.userId }, data: { mfaSecretEnc: encryptSecret(secret), mfaEnabled: true, mfaLastStep: step } }),
    db.recoveryCode.deleteMany({ where: { userId: ch.userId } }),
    db.recoveryCode.createMany({ data: codes.map((c) => ({ userId: ch.userId, codeHash: sha256(`${ch.userId}:${normalizeRecoveryCode(c)}`) })) }),
    db.authChallenge.delete({ where: { id: ch.id } }),
  ]);
  return { ok: true, userId: ch.userId, recoveryCodes: codes };
}

/** Re-verifies a TOTP code for an already signed-in user (sensitive actions). */
export async function verifyCurrentUserCode(db: PrismaClient, userId: string, code: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId } });
  const secret = tryDecryptSecret(user?.mfaSecretEnc);
  if (!user?.mfaEnabled || !secret) return false;
  const step = verifyTotp(secret, code.trim(), user.mfaLastStep);
  if (step === null) return false;
  const updated = await db.user.updateMany({ where: { id: userId, OR: [{ mfaLastStep: null }, { mfaLastStep: { lt: step } }] }, data: { mfaLastStep: step } });
  return updated.count === 1;
}

export async function regenerateRecoveryCodes(db: PrismaClient, userId: string) {
  const codes = generateRecoveryCodes();
  await db.$transaction([
    db.recoveryCode.deleteMany({ where: { userId } }),
    db.recoveryCode.createMany({ data: codes.map((c) => ({ userId, codeHash: sha256(`${userId}:${normalizeRecoveryCode(c)}`) })) }),
  ]);
  return codes;
}

/**
 * Admin action: revokes the password, MFA and all sessions, and issues a new invitation link.
 * The user regains access only through that link (new password + new authenticator).
 */
export async function resetAccess(db: PrismaClient, userId: string, createdById: string | null) {
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { passwordHash: null, mfaEnabled: false, mfaSecretEnc: null, mfaLastStep: null, invitedAt: new Date() } }),
    db.recoveryCode.deleteMany({ where: { userId } }),
    db.session.deleteMany({ where: { userId } }),
    db.authChallenge.deleteMany({ where: { userId } }),
  ]);
  return createInvitation(db, userId, createdById);
}
