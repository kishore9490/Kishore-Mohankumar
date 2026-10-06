"use client";

import { useSyncExternalStore } from "react";

/** Minimal global store — avoids a state library for three booleans. */
type State = {
  buildMode: boolean;
  consoleOpen: boolean;
  introDone: boolean;
};

let state: State = { buildMode: false, consoleOpen: false, introDone: false };
const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    if (typeof document !== "undefined") {
      document.documentElement.toggleAttribute("data-build", state.buildMode);
    }
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => select(state),
    () => select({ buildMode: false, consoleOpen: false, introDone: false }),
  );
}
