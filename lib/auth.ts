/**
 * Authentication seam. No auth provider is bundled on purpose.
 * Wire this to the chosen LMS / identity provider (e.g. Auth.js, Clerk, the LMS's SSO)
 * and protect /student/* in `proxy.ts` once it exists.
 */
import type { Student } from "./types";

export const authEnabled = false;

export async function getCurrentStudent(): Promise<Student | null> {
  return null;
}
