import type { Offer } from "@/lib/types";

/**
 * Current showroom offers.
 *
 * Only add offers the dealership has actually approved, with their terms.
 * When this list is empty the Offers section is hidden and customers are
 * pointed to the showroom team instead — nothing is invented.
 *
 * Example shape:
 * {
 *   id: "exchange-2026",
 *   title: "Exchange your old two-wheeler",
 *   description: "Get an on-the-spot valuation when you upgrade.",
 *   kind: "exchange",
 *   validUntil: "2026-12-31",
 *   terms: "Subject to vehicle evaluation.",
 * }
 */
export const offers: Offer[] = [];
