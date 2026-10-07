import type { Testimonial } from "@/lib/types";

/**
 * TESTIMONIALS — only real, consented, verified student stories.
 * The testimonial section renders nothing publicly while this list is empty.
 */
export const testimonials: Testimonial[] = [];

export const publishedTestimonials = testimonials.filter((t) => t.verified);
