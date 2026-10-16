// Creates an invitation link from the command line (first administrator, or to recover a locked-out account).
// Usage: npm run invite -- <email> ["Full Name"] [ADMIN|STAFF]
import { PrismaClient } from "@prisma/client";
import { inviteUser, resetAccess } from "../src/lib/auth/accounts";

const db = new PrismaClient();
(async () => {
  const [email, name = "Administrator", role = "ADMIN"] = process.argv.slice(2);
  if (!email || !/^[^@\s]+@[^@\s]+$/.test(email)) {
    console.error('Usage: npm run invite -- <email> ["Full Name"] [ADMIN|STAFF]');
    process.exit(1);
  }
  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  const token =
    existing && existing.passwordHash
      ? await resetAccess(db, existing.id, null)
      : (await inviteUser(db, { name, email, role: role === "STAFF" ? "STAFF" : "ADMIN" }, null)).token;
  const base = (process.env.PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  console.log(`${existing?.passwordHash ? "Access reset for" : "Invitation created for"} ${email}. One-time link (valid 72 hours):\n\n  ${base}/invite/${token}\n`);
  await db.$disconnect();
})().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
