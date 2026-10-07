"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/lib/api";

type State<T> =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; data: T }
  | { status: "error"; message: string; code?: string };

/** Tracks an async submission with inline error/success states. */
export function useSubmit<T, A extends unknown[]>(fn: (...args: A) => Promise<T>) {
  const [state, setState] = useState<State<T>>({ status: "idle" });
  const run = useCallback(
    async (...args: A) => {
      setState({ status: "submitting" });
      try {
        const data = await fn(...args);
        setState({ status: "success", data });
        return data;
      } catch (e) {
        const message = e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
        setState({ status: "error", message, code: e instanceof ApiError ? e.code : undefined });
        return null;
      }
    },
    [fn],
  );
  const reset = useCallback(() => setState({ status: "idle" }), []);
  return { state, run, reset };
}
