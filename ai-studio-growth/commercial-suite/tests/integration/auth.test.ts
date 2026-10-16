import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { acceptInvitation, confirmEnrollment, createChallenge, enrollmentSecret, inviteUser, MAX_CHALLENGE_ATTEMPTS, regenerateRecoveryCodes, resetAccess, resolveInvitation, verifyLoginCode } from "@/lib/auth/accounts";
import { totpAt } from "@/lib/auth/totp";
import { verifyPassword } from "@/lib/auth/password";

const url = process.env.TEST_DATABASE_URL;
const d = url ? describe : describe.skip;
const db = new PrismaClient({ datasources: { db: { url: url ?? "postgresql://invalid" } } });
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "x".repeat(40);

async function enrolledUser(email = "staff@example.com") {
  const { userId, token } = await inviteUser(db, { name: "Staff Member", email, role: "STAFF" }, null);
  await acceptInvitation(db, token, "Str0ngPassword!");
  const ch = await createChallenge(db, userId, "ENROLL");
  const { secret } = (await enrollmentSecret(db, ch))!;
  const res = await confirmEnrollment(db, ch, totpAt(secret));
  if (!res.ok) throw new Error(res.error);
  return { userId, secret, recoveryCodes: res.recoveryCodes! };
}

d("invitations & MFA (MySQL/MariaDB)", () => {
  afterAll(async () => db.$disconnect());
  beforeEach(async () => {
    await db.authChallenge.deleteMany();
    await db.recoveryCode.deleteMany();
    await db.invitation.deleteMany();
    await db.session.deleteMany();
    await db.user.deleteMany({ where: { email: { endsWith: "@example.com" } } });
  });

  it("invitation sets the password once and cannot be reused", async () => {
    const { userId, token } = await inviteUser(db, { name: "New Person", email: "new@example.com", role: "STAFF" }, null);
    expect((await db.user.findUniqueOrThrow({ where: { id: userId } })).passwordHash).toBeNull();
    expect(await resolveInvitation(db, token)).not.toBeNull();
    await acceptInvitation(db, token, "Str0ngPassword!");
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    expect(await verifyPassword("Str0ngPassword!", user.passwordHash!)).toBe(true);
    await expect(acceptInvitation(db, token, "AnotherPass123")).rejects.toThrow(/invalid, expired or has already been used/);
  });

  it("re-inviting revokes earlier links; active accounts cannot be re-invited", async () => {
    const first = await inviteUser(db, { name: "P", email: "p@example.com", role: "STAFF" }, null);
    const second = await inviteUser(db, { name: "P", email: "p@example.com", role: "STAFF" }, null);
    expect(await resolveInvitation(db, first.token)).toBeNull();
    expect(await resolveInvitation(db, second.token)).not.toBeNull();
    await acceptInvitation(db, second.token, "Str0ngPassword!");
    await expect(inviteUser(db, { name: "P", email: "p@example.com", role: "STAFF" }, null)).rejects.toThrow(/already has an active account/);
  });

  it("expired invitations are rejected", async () => {
    const { userId, token } = await inviteUser(db, { name: "Late", email: "late@example.com", role: "STAFF" }, null);
    await db.invitation.updateMany({ where: { userId }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await resolveInvitation(db, token)).toBeNull();
  });

  it("enrolment requires a valid code and then login requires TOTP", async () => {
    const { userId, secret } = await enrolledUser();
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.mfaEnabled).toBe(true);
    expect(user.mfaSecretEnc).not.toContain(secret); // encrypted at rest
    const ch = await createChallenge(db, userId, "LOGIN");
    const bad = await verifyLoginCode(db, ch, "000000");
    expect(bad.ok).toBe(false);
    // the right code works (allow for a step boundary right after enrolment)
    let good = await verifyLoginCode(db, ch, totpAt(secret));
    if (!good.ok) good = await verifyLoginCode(db, ch, totpAt(secret, Date.now() + 30_000));
    expect(good.ok).toBe(true);
  });

  it("locks the challenge after too many wrong codes", async () => {
    const { userId } = await enrolledUser("lock@example.com");
    const ch = await createChallenge(db, userId, "LOGIN");
    let last;
    for (let i = 0; i < MAX_CHALLENGE_ATTEMPTS; i++) last = await verifyLoginCode(db, ch, "111111");
    expect(last && !last.ok && last.restart).toBe(true);
    const after = await verifyLoginCode(db, ch, "222222");
    expect(!after.ok && after.restart).toBe(true);
  });

  it("recovery codes work exactly once", async () => {
    const { userId, recoveryCodes } = await enrolledUser("rc@example.com");
    const ch1 = await createChallenge(db, userId, "LOGIN");
    const r1 = await verifyLoginCode(db, ch1, recoveryCodes[0].toLowerCase());
    expect(r1.ok && r1.usedRecoveryCode && r1.remainingRecoveryCodes).toBe(7);
    const ch2 = await createChallenge(db, userId, "LOGIN");
    expect((await verifyLoginCode(db, ch2, recoveryCodes[0])).ok).toBe(false);
    const fresh = await regenerateRecoveryCodes(db, userId);
    const ch3 = await createChallenge(db, userId, "LOGIN");
    expect((await verifyLoginCode(db, ch3, recoveryCodes[1])).ok).toBe(false); // old set invalidated
    expect((await verifyLoginCode(db, ch3, fresh[0])).ok).toBe(true);
  });

  it("reset access revokes password, MFA and sessions and issues a new link", async () => {
    const { userId } = await enrolledUser("reset@example.com");
    await db.session.create({ data: { userId, tokenHash: "x".repeat(64), expiresAt: new Date(Date.now() + 3_600_000) } });
    const token = await resetAccess(db, userId, null);
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.passwordHash).toBeNull();
    expect(user.mfaEnabled).toBe(false);
    expect(await db.session.count({ where: { userId } })).toBe(0);
    expect(await resolveInvitation(db, token)).not.toBeNull();
  });
});
