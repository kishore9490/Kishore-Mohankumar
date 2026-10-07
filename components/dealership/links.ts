import { dealership } from "@/data/dealership";

const { lat, lng } = dealership.geo;
/** Google Maps turn-by-turn directions to the showroom. */
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
/** Interactive embed — loaded only on request. */
export const mapEmbedUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
