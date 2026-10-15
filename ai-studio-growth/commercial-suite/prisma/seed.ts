import { PrismaClient } from "@prisma/client";
import { seedBase, seedSampleData } from "../src/lib/sample-data";

const prisma = new PrismaClient();

async function main() {
  const log = (m: string) => console.log(`• ${m}`);
  await seedBase(prisma, { log });
  if (process.env.SEED_SAMPLE_DATA !== "false") {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
    await seedSampleData(prisma, admin?.id ?? null, { log });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
