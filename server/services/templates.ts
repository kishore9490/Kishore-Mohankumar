import "server-only";

/** Renders {{variable}} placeholders. Unknown variables are left visible so gaps are caught in review. */
export function renderTemplate(content: string, vars: Record<string, string | undefined>) {
  return content.replace(/{{\s*(\w+)\s*}}/g, (m, k: string) => vars[k] ?? m);
}

export const TEMPLATE_VARIABLES = [
  "student_name", "course_name", "batch_name", "class_title", "class_date", "faculty_name",
  "assignment_title", "due_date", "payment_amount", "certificate_id", "verify_url",
  "lead_name", "lead_source", "reset_url", "assessment_title", "score",
];
