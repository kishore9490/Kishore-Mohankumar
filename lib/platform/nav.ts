import type { IconName } from "@/components/ui/Icon";
import type { Permission, RoleKey } from "./types";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  /** Shown only when the user holds this permission. */
  permission?: Permission;
  /** Exact match for active state (dashboards). */
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Each role gets its own information architecture, not a renamed dashboard. */
export const NAV: Record<RoleKey, NavGroup[]> = {
  student: [
    { label: "Learn", items: [
      { label: "Home", href: "/academy/student", icon: "home", exact: true },
      { label: "My learning", href: "/academy/student/learning", icon: "book" },
      { label: "Coding Lab", href: "/academy/student/lab", icon: "lab" },
    ] },
    { label: "Work", items: [
      { label: "Assignments", href: "/academy/student/assignments", icon: "clipboard" },
      { label: "Assessments", href: "/academy/student/assessments", icon: "file" },
      { label: "Performance", href: "/academy/student/performance", icon: "chart" },
    ] },
    { label: "Plan", items: [
      { label: "Calendar", href: "/academy/student/calendar", icon: "calendar" },
      { label: "Certificates", href: "/academy/student/certificates", icon: "award" },
      { label: "Messages", href: "/academy/student/messages", icon: "message" },
    ] },
  ],
  faculty: [
    { label: "Teach", items: [
      { label: "Command center", href: "/academy/faculty", icon: "home", exact: true },
      { label: "Classes & attendance", href: "/academy/faculty/attendance", icon: "calendar", permission: "attendance.manage" },
      { label: "Students", href: "/academy/faculty/students", icon: "users", permission: "students.view" },
    ] },
    { label: "Review", items: [
      { label: "Assignment reviews", href: "/academy/faculty/reviews", icon: "clipboard", permission: "assignments.review" },
      { label: "Assessment builder", href: "/academy/faculty/assessments", icon: "file", permission: "assessments.manage" },
    ] },
    { label: "Prepare", items: [
      { label: "Content studio", href: "/academy/faculty/content", icon: "pen", permission: "content.manage" },
      { label: "Announcements", href: "/academy/faculty/announcements", icon: "megaphone", permission: "communications.send" },
    ] },
  ],
  marketing: [
    { label: "Grow", items: [
      { label: "Growth center", href: "/academy/marketing", icon: "home", exact: true },
      { label: "Leads", href: "/academy/marketing/leads", icon: "users", permission: "leads.view" },
      { label: "Campaigns", href: "/academy/marketing/campaigns", icon: "target", permission: "campaigns.manage" },
    ] },
    { label: "Engage", items: [
      { label: "Communication center", href: "/academy/marketing/communications", icon: "message", permission: "communications.view" },
      { label: "Templates", href: "/academy/marketing/templates", icon: "file", permission: "templates.manage" },
      { label: "Content studio", href: "/academy/marketing/content", icon: "pen", permission: "marketing.content" },
    ] },
    { label: "Measure", items: [{ label: "Analytics", href: "/academy/marketing/analytics", icon: "chart", permission: "analytics.view" }] },
  ],
  admin: [
    { label: "Operate", items: [
      { label: "Command center", href: "/academy/admin", icon: "home", exact: true },
      { label: "Users", href: "/academy/admin/users", icon: "users", permission: "users.manage" },
      { label: "Roles & permissions", href: "/academy/admin/permissions", icon: "shield", permission: "users.manage" },
    ] },
    { label: "Academy", items: [
      { label: "Courses", href: "/academy/admin/courses", icon: "book", permission: "courses.view" },
      { label: "Batches", href: "/academy/admin/batches", icon: "grid", permission: "batches.manage" },
      { label: "Admissions", href: "/academy/admin/admissions", icon: "flag", permission: "admissions.manage" },
      { label: "Certificates", href: "/academy/admin/certificates", icon: "award", permission: "certificates.manage" },
      { label: "Finance", href: "/academy/admin/finance", icon: "wallet", permission: "finance.view" },
    ] },
    { label: "Growth", items: [
      { label: "Leads", href: "/academy/marketing/leads", icon: "target", permission: "leads.view" },
      { label: "Communications", href: "/academy/admin/communications", icon: "message", permission: "communications.view" },
    ] },
    { label: "Platform", items: [
      { label: "Integrations", href: "/academy/admin/integrations", icon: "plug", permission: "integrations.manage" },
      { label: "Audit log", href: "/academy/admin/audit", icon: "activity", permission: "audit.view" },
    ] },
  ],
};

/** Five thumb-reach destinations per role on phones. */
export const MOBILE_NAV: Record<RoleKey, NavItem[]> = {
  student: [
    { label: "Home", href: "/academy/student", icon: "home", exact: true },
    { label: "Learn", href: "/academy/student/learning", icon: "book" },
    { label: "Calendar", href: "/academy/student/calendar", icon: "calendar" },
    { label: "Messages", href: "/academy/student/messages", icon: "message" },
    { label: "Profile", href: "/academy/profile", icon: "user" },
  ],
  faculty: [
    { label: "Home", href: "/academy/faculty", icon: "home", exact: true },
    { label: "Classes", href: "/academy/faculty/attendance", icon: "calendar" },
    { label: "Students", href: "/academy/faculty/students", icon: "users" },
    { label: "Tasks", href: "/academy/faculty/reviews", icon: "clipboard" },
    { label: "Profile", href: "/academy/profile", icon: "user" },
  ],
  marketing: [
    { label: "Dashboard", href: "/academy/marketing", icon: "home", exact: true },
    { label: "Leads", href: "/academy/marketing/leads", icon: "users" },
    { label: "Campaigns", href: "/academy/marketing/campaigns", icon: "target" },
    { label: "Analytics", href: "/academy/marketing/analytics", icon: "chart" },
    { label: "Profile", href: "/academy/profile", icon: "user" },
  ],
  admin: [
    { label: "Dashboard", href: "/academy/admin", icon: "home", exact: true },
    { label: "Alerts", href: "/academy/notifications", icon: "bell" },
    { label: "Users", href: "/academy/admin/users", icon: "users" },
    { label: "Operations", href: "/academy/admin/batches", icon: "grid" },
    { label: "Profile", href: "/academy/profile", icon: "user" },
  ],
};

/** Command palette actions (⌘K). Filtered by permission on the client and re-checked on the server. */
export const COMMANDS: { label: string; href: string; icon: IconName; permission?: Permission; roles?: RoleKey[]; keywords?: string }[] = [
  { label: "Continue learning", href: "/academy/student", icon: "book", roles: ["student"] },
  { label: "Open the Coding Lab", href: "/academy/student/lab", icon: "lab", roles: ["student"] },
  { label: "View my calendar", href: "/academy/student/calendar", icon: "calendar", roles: ["student"] },
  { label: "Search students", href: "/academy/faculty/students", icon: "users", permission: "students.view", roles: ["faculty"] },
  { label: "Search students", href: "/academy/admin/users?role=student", icon: "users", permission: "users.manage" },
  { label: "Search leads", href: "/academy/marketing/leads", icon: "target", permission: "leads.view" },
  { label: "Create lead", href: "/academy/marketing/leads?new=1", icon: "plus", permission: "leads.edit" },
  { label: "Create announcement", href: "/academy/faculty/announcements", icon: "megaphone", permission: "communications.send", roles: ["faculty", "admin"] },
  { label: "Create assessment", href: "/academy/faculty/assessments/new", icon: "file", permission: "assessments.manage" },
  { label: "Review assignments", href: "/academy/faculty/reviews", icon: "clipboard", permission: "assignments.review" },
  { label: "Send communication", href: "/academy/marketing/communications", icon: "message", permission: "communications.view", roles: ["marketing", "admin"] },
  { label: "View analytics", href: "/academy/marketing/analytics", icon: "chart", permission: "analytics.view" },
  { label: "Open courses", href: "/academy/admin/courses", icon: "book", permission: "courses.view", roles: ["admin"] },
  { label: "Manage users", href: "/academy/admin/users", icon: "users", permission: "users.manage" },
  { label: "Open integrations", href: "/academy/admin/integrations", icon: "plug", permission: "integrations.manage" },
  { label: "Notification settings", href: "/academy/profile#notifications", icon: "settings", keywords: "preferences email whatsapp sms" },
  { label: "Open public website", href: "/", icon: "home" },
];
