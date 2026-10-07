import type { Stat } from "@/lib/types";

/**
 * VERIFIED STATISTICS ONLY.
 * Example shape (do not publish until true and sourced):
 *   { id: "batches", label: "Batches completed", value: 0, suffix: "+", source: "EMC records, Mar 2026", verified: true }
 * The stats band is hidden while there are no verified entries.
 */
export const stats: Stat[] = [];

export const verifiedStats = stats.filter((s) => s.verified);
