import "server-only";

/**
 * Background jobs. Requests enqueue work and return immediately; nothing waits
 * on an external provider. This in-process queue (with retries) is the demo
 * implementation — replace `enqueue` with BullMQ/Redis, Cloud Tasks, SQS or
 * Inngest in production without changing callers.
 */
type Handler = (payload: unknown) => Promise<void>;
const handlers = new Map<string, Handler>();

export function registerJob<P>(name: string, handler: (payload: P) => Promise<void>) {
  handlers.set(name, handler as Handler);
}

export function enqueue<P>(name: string, payload: P, opts: { attempts?: number; delayMs?: number } = {}) {
  const attempts = opts.attempts ?? 3;
  const run = async (attempt: number) => {
    const h = handlers.get(name);
    if (!h) return console.error(`[jobs] no handler for ${name}`);
    try {
      await h(payload);
    } catch (e) {
      if (attempt + 1 < attempts) setTimeout(() => run(attempt + 1), 500 * 2 ** attempt);
      else console.error(`[jobs] ${name} failed after ${attempts} attempts`, e);
    }
  };
  setTimeout(() => run(0), opts.delayMs ?? 0);
}

/** Runs a job inline. Used where the demo needs the result in the same request (e.g. in-app notices). */
export async function runNow<P>(name: string, payload: P) {
  await handlers.get(name)?.(payload);
}
