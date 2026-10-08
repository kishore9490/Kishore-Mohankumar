import type { SubmissionStatus } from "@/lib/platform/types";

export const ASSIGNMENT_STATUSES: { key: SubmissionStatus; label: string }[] = [
  { key: "not_started", label: "Not Started" },
  { key: "in_progress", label: "In Progress" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "returned", label: "Returned" },
  { key: "completed", label: "Completed" },
];

export const ASSIGNMENT_LABEL = Object.fromEntries(ASSIGNMENT_STATUSES.map((s) => [s.key, s.label])) as Record<SubmissionStatus, string>;

/** Statuses in which the student can (re)submit. */
export const CAN_SUBMIT: SubmissionStatus[] = ["not_started", "in_progress", "returned"];
