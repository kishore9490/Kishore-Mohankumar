import type { Instrumentation } from "next";

/**
 * Records server-side errors so they can be diagnosed without access to hosting logs:
 * written to the console (hosting logs) and to the audit trail as "system.error"
 * (visible to signed-in users in Document History → System errors, matched by the digest
 * shown on the error page). Messages are truncated; credentials never appear in them.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const err = error as Error & { digest?: string };
  const frame = (err.stack ?? "").split("\n").find((l) => l.includes("/src/") || l.includes(".next/server")) ?? "";
  const summary = `[${err.digest ?? "no-digest"}] ${request.method} ${request.path} (${context.routeType} ${context.routePath}) — ${err.name}: ${err.message}${frame ? ` @ ${frame.trim()}` : ""}`;
  console.error("[server-error]", summary);
  try {
    const { prisma } = await import("./lib/prisma");
    await prisma.auditEvent.create({ data: { action: "system.error", summary: summary.replace(/\s+/g, " ").slice(0, 500) } });
  } catch {
    // the database itself may be the problem — the console line above still has the details
  }
};
