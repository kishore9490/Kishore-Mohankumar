import type { Faculty } from "@/lib/types";
import { showPlaceholders } from "./site";

/**
 * FACULTY — add verified profiles here (status: "confirmed").
 * Never publish experience or credentials that EMC has not verified.
 */
export const faculty: Faculty[] = [];

/**
 * DEVELOPMENT-ONLY placeholders, used to preview the component.
 * Rendered only when NEXT_PUBLIC_SHOW_PLACEHOLDERS=true and visibly labelled.
 */
const placeholderFaculty: Faculty[] = [
  {
    id: "placeholder-1",
    status: "placeholder",
    name: "Faculty name",
    designation: "Designation",
    experience: null,
    specialization: ["Specialisation"],
    bio: "Placeholder profile. Replace with a verified faculty biography supplied by EMC.",
    photo: null,
    linkedin: null,
  },
  {
    id: "placeholder-2",
    status: "placeholder",
    name: "Faculty name",
    designation: "Designation",
    experience: null,
    specialization: ["Specialisation"],
    bio: "Placeholder profile. Replace with a verified faculty biography supplied by EMC.",
    photo: null,
    linkedin: null,
  },
];

export const visibleFaculty: Faculty[] =
  faculty.length > 0 ? faculty : showPlaceholders ? placeholderFaculty : [];
