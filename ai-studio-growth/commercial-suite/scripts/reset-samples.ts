// Deletes and recreates the clearly-labelled sample dataset. Real records are not touched.
// Usage: npm run db:reset-samples
import { PrismaClient } from "@prisma/client";
import { seedSampleData } from "../src/lib/sample-data";

const db = new PrismaClient();
(async () => {
  const admin = await db.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
  await seedSampleData(db, admin?.id ?? null, { log: (m) => console.log(`• ${m}`) });
  await db.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
