// Removes records created by the e2e test (customers/products whose names start with "E2E ").
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
(async () => {
  const ids = (await db.customer.findMany({ where: { name: { startsWith: "E2E " } }, select: { id: true } })).map((c) => c.id);
  const dids = (await db.document.findMany({ where: { customerId: { in: ids } }, select: { id: true } })).map((d) => d.id);
  await db.communicationLog.deleteMany({ where: { OR: [{ documentId: { in: dids } }, { customerId: { in: ids } }] } });
  await db.auditEvent.deleteMany({ where: { documentId: { in: dids } } });
  await db.document.updateMany({ where: { id: { in: dids } }, data: { convertedFromId: null } });
  await db.document.deleteMany({ where: { id: { in: dids } } });
  await db.customer.deleteMany({ where: { id: { in: ids } } });
  const p = await db.productService.deleteMany({ where: { name: { startsWith: "E2E " } } });
  console.log(`Removed ${ids.length} customers, ${dids.length} documents, ${p.count} products`);
  await db.$disconnect();
})();
