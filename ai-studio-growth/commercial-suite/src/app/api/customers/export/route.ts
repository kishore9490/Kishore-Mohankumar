import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/services/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Quotes a CSV cell and neutralises spreadsheet formulas (=, +, -, @ at the start). */
function cell(v: string | null | undefined) {
  let s = (v ?? "").replace(/\r?\n/g, " ");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** GET /api/customers/export — active customers as CSV (used by the WhatsApp sender script). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const customers = await prisma.customer.findMany({ where: { archived: false }, orderBy: { name: "asc" } });
  const rows = [
    ["name", "contact_person", "phone", "email", "opted_in"].join(","),
    ...customers.map((c) => [cell(c.name), cell(c.contactPerson), cell(c.phone), cell(c.email), c.whatsappConsent ? "yes" : "no"].join(",")),
  ];
  await audit(prisma, { userId: user.id, action: "customer.exported", summary: `Exported ${customers.length} customers to CSV` });
  return new NextResponse(`﻿${rows.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="customers.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
