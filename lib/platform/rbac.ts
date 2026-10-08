import type { Permission, RoleKey } from "./types";

/**
 * Permission-based access control.
 * Roles are only bundles of permissions; every check in the app asks for a
 * permission (`can(user, "leads.edit")`), never for a role name. Future roles
 * (counsellor, content manager, finance, support, HR) are added here as new
 * bundles without touching screens.
 */
export interface RoleDefinition {
  key: RoleKey;
  label: string;
  /** One word that sums up what this role comes to do. */
  purpose: string;
  home: string;
  permissions: Permission[];
}

export const ALL_PERMISSIONS: { key: Permission; group: string; label: string }[] = [
  { key: "learning.access", group: "Learning", label: "Use the learning space" },
  { key: "students.view", group: "Students", label: "View students" },
  { key: "students.create", group: "Students", label: "Create students" },
  { key: "students.edit", group: "Students", label: "Edit students" },
  { key: "students.delete", group: "Students", label: "Delete students" },
  { key: "courses.view", group: "Courses", label: "View courses" },
  { key: "courses.create", group: "Courses", label: "Create courses" },
  { key: "courses.edit", group: "Courses", label: "Edit courses" },
  { key: "courses.publish", group: "Courses", label: "Publish courses" },
  { key: "content.manage", group: "Teaching", label: "Manage course content" },
  { key: "assessments.manage", group: "Teaching", label: "Build assessments" },
  { key: "assignments.review", group: "Teaching", label: "Review assignments" },
  { key: "attendance.manage", group: "Teaching", label: "Mark attendance" },
  { key: "faculty.manage", group: "Academy", label: "Manage faculty" },
  { key: "batches.manage", group: "Academy", label: "Manage batches" },
  { key: "admissions.manage", group: "Academy", label: "Manage admissions" },
  { key: "certificates.manage", group: "Academy", label: "Issue and revoke certificates" },
  { key: "leads.view", group: "Growth", label: "View leads" },
  { key: "leads.edit", group: "Growth", label: "Edit leads" },
  { key: "campaigns.manage", group: "Growth", label: "Manage campaigns" },
  { key: "marketing.content", group: "Growth", label: "Manage marketing content" },
  { key: "communications.send", group: "Communication", label: "Send communications" },
  { key: "communications.view", group: "Communication", label: "View communication history (leads and students)" },
  { key: "templates.manage", group: "Communication", label: "Manage message templates" },
  { key: "analytics.view", group: "Insights", label: "View analytics" },
  { key: "finance.view", group: "Finance", label: "View finance" },
  { key: "finance.manage", group: "Finance", label: "Record payments and send reminders" },
  { key: "audit.view", group: "Platform", label: "View audit log" },
  { key: "integrations.manage", group: "Platform", label: "Manage integrations" },
  { key: "settings.manage", group: "Platform", label: "Manage settings" },
  { key: "users.manage", group: "Platform", label: "Manage users and roles" },
  { key: "system.manage", group: "Platform", label: "Manage the system" },
];

export const ROLES: Record<RoleKey, RoleDefinition> = {
  student: {
    key: "student",
    label: "Student",
    purpose: "Learn",
    home: "/academy/student",
    permissions: ["learning.access"],
  },
  faculty: {
    key: "faculty",
    label: "Faculty",
    purpose: "Teach",
    home: "/academy/faculty",
    permissions: [
      "students.view",
      "courses.view",
      "content.manage",
      "assessments.manage",
      "assignments.review",
      "attendance.manage",
      "communications.send",
    ],
  },
  marketing: {
    key: "marketing",
    label: "Marketing",
    purpose: "Grow",
    home: "/academy/marketing",
    permissions: [
      "leads.view",
      "leads.edit",
      "campaigns.manage",
      "marketing.content",
      "communications.send",
      "communications.view",
      "templates.manage",
      "analytics.view",
    ],
  },
  admin: {
    key: "admin",
    label: "Super Admin",
    purpose: "Operate",
    home: "/academy/admin",
    permissions: ALL_PERMISSIONS.map((p) => p.key).filter((p) => p !== "learning.access"),
  },
};

export function permissionsFor(role: RoleKey, extra: Permission[] = []): Permission[] {
  return Array.from(new Set([...ROLES[role].permissions, ...extra]));
}

export function can(user: { permissions: Permission[] } | null | undefined, permission: Permission) {
  return !!user && user.permissions.includes(permission);
}
