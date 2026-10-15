/** An error whose message is safe to show to users. Anything else is reported generically. */
export class ServiceError extends Error {
  constructor(message: string, public readonly code: string = "INVALID") {
    super(message);
  }
}

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function toActionError(err: unknown): { ok: false; error: string } {
  if (err instanceof ServiceError) return { ok: false, error: err.message };
  if (err && typeof err === "object" && "constructor" in err && (err as Error).constructor?.name === "AuthError")
    return { ok: false, error: (err as Error).message };
  if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "P2002")
    return { ok: false, error: "This record conflicts with an existing one (duplicate value)." };
  console.error("[action-error]", err instanceof Error ? err.message : err);
  return { ok: false, error: "Something went wrong. Please try again." };
}
