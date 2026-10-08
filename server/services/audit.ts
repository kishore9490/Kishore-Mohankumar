import "server-only";
import { headers } from "next/headers";
import { db, newId } from "@/server/db/store";
import type { AuditLog, SessionUser } from "@/lib/platform/types";

/** Append-only audit trail. Call it from every privileged action. */
export async function audit(entry: {
  user: Pick<SessionUser, "id" | "name"> | null;
  action: string;
  objectType: string;
  objectId?: string | null;
  result?: AuditLog["result"];
  meta?: AuditLog["meta"];
}) {
  let ip: string | null = null;
  try {
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");
  } catch {
    /* outside a request (background job) */
  }
  db().auditLogs.unshift({
    id: newId("aud"),
    userId: entry.user?.id ?? null,
    userName: entry.user?.name ?? "System",
    action: entry.action,
    objectType: entry.objectType,
    objectId: entry.objectId ?? null,
    result: entry.result ?? "success",
    meta: entry.meta ?? {},
    at: new Date().toISOString(),
    ip,
  });
}
