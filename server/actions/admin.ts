"use server";
import { randomBytes, randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db, newId } from "@/server/db/store";
import { hashPassword } from "@/server/db/seed";
import { assertPermission, AuthError, revokeUserSessions } from "@/server/auth/session";
import { audit } from "@/server/services/audit";
import { emit } from "@/server/events/bus";
import { emailProvider } from "@/integrations/email";
import { whatsappProvider } from "@/integrations/whatsapp";
import { smsProvider } from "@/integrations/sms";
import { aiProvider } from "@/integrations/ai";
import { paymentProvider } from "@/integrations/payments";
import { storageProvider } from "@/integrations/storage";
import { analyticsProvider } from "@/integrations/analytics";
import { ALL_PERMISSIONS, ROLES } from "@/lib/platform/rbac";
import { formatDate, inr } from "@/lib/platform/format";
import type * as T from "@/lib/platform/types";

/**
 * Super Admin server actions.
 * Pattern for every action: assertPermission → validate & clip → mutate → audit → (emit) → revalidate.
 * Form actions return AdminActionState for useActionState.
 */
export interface AdminActionState {
  ok: boolean | null;
  message?: string;
  error?: string;
  /** A one-time secret (temporary password). Lives only in this response; never stored in plain text. */
  secret?: { label: string; value: string };
  fieldErrors?: Record<string, string>;
  /** Echo of submitted values so a failed form keeps what was typed. */
  values?: Record<string, string>;
  /** Changes on every response so fields re-mount with fresh defaults. */
  n?: number;
}

type State = AdminActionState;
type Actor = Awaited<ReturnType<typeof assertPermission>>;

const ok = (message: string, extra: Partial<State> = {}): State => ({ ok: true, message, n: Date.now(), ...extra });
const fail = (error: string, extra: Partial<State> = {}): State => ({ ok: false, error, n: Date.now(), ...extra });

async function guard(permission: T.Permission, fn: (u: Actor) => Promise<State>): Promise<State> {
  let user: Actor;
  try {
    user = await assertPermission(permission);
  } catch (e) {
    if (e instanceof AuthError) return fail(e.reason === "unauthenticated" ? "Your session has ended. Please sign in again." : "You don’t have permission to do this.");
    throw e;
  }
  return fn(user);
}

/* ---------------- input helpers (validate & clip everything) ---------------- */

const str = (f: FormData, k: string, max = 120) =>
  String(f.get(k) ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
const text = (f: FormData, k: string, max = 600) => String(f.get(k) ?? "").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").trim().slice(0, max);
const int = (f: FormData, k: string) => {
  const v = Number(str(f, k, 12));
  return Number.isFinite(v) ? Math.round(v) : NaN;
};
const oneOf = <X extends string>(v: string, list: readonly X[]): X | null => (list.includes(v as X) ? (v as X) : null);
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,120}\.[a-z]{2,24}$/i;
const PHONE = /^\+?[0-9][0-9\s-]{8,18}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ROLE_KEYS = ["student", "faculty", "marketing", "admin"] as const;
const PERMISSION_KEYS = ALL_PERMISSIONS.map((p) => p.key);
const values = (f: FormData, keys: string[]) => Object.fromEntries(keys.map((k) => [k, str(f, k, 600)]));

/** Readable one-time password: 12 chars, letters + digits, no look-alikes. Demo only. */
function tempPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digit = "23456789";
  const all = upper + lower + digit;
  const chars = [upper[randomInt(upper.length)], lower[randomInt(lower.length)], digit[randomInt(digit.length)]];
  while (chars.length < 12) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8).join("")}`;
}

const activeAdmins = () => db().users.filter((u) => u.role === "admin" && u.status === "active");
const findUser = (id: string) => db().users.find((u) => u.id === id) ?? null;
const dateIso = (d: string) => new Date(`${d}T00:00:00+05:30`).toISOString();

function revalidateAdmin(...paths: string[]) {
  revalidatePath("/academy/admin");
  for (const p of paths) revalidatePath(p);
}

/* ================================================================== */
/* Users                                                               */
/* ================================================================== */

export async function createUser(_: State, form: FormData): Promise<State> {
  return guard("users.manage", async (me) => {
    const v = values(form, ["name", "email", "phone", "role", "title"]);
    const name = str(form, "name", 80);
    const email = str(form, "email", 160).toLowerCase();
    const phone = str(form, "phone", 20);
    const role = oneOf(str(form, "role", 20), ROLE_KEYS);
    const title = str(form, "title", 80);
    const fe: Record<string, string> = {};
    if (name.length < 2) fe.name = "Enter the person’s full name.";
    if (!EMAIL.test(email)) fe.email = "Enter a valid email address.";
    else if (db().users.some((u) => u.email.toLowerCase() === email)) fe.email = "An account with this email already exists.";
    if (phone && !PHONE.test(phone)) fe.phone = "Use a mobile number like +91 98765 43210.";
    if (!role) fe.role = "Choose a role.";
    if (Object.keys(fe).length) return fail("Check the highlighted fields.", { fieldErrors: fe, values: v });

    const bundle = ROLES[role!].permissions;
    const extra = form.getAll("perm").map(String).filter((p): p is T.Permission => PERMISSION_KEYS.includes(p as T.Permission) && !bundle.includes(p as T.Permission));
    const password = tempPassword();
    const user: T.User = {
      id: newId("u"), name, email, phone: phone || null, role: role!, extraPermissions: Array.from(new Set(extra)), status: "active",
      passwordHash: hashPassword(password), mfaEnabled: role === "admin", title: title || null, createdAt: new Date().toISOString(), lastLoginAt: null,
    };
    db().users.push(user);
    await audit({ user: me, action: "user.created", objectType: "User", objectId: user.id, meta: { role: user.role, extraPermissions: user.extraPermissions.length } });
    if (user.extraPermissions.length) await audit({ user: me, action: "permission.changed", objectType: "User", objectId: user.id, meta: { added: user.extraPermissions.join(","), removed: "" } });
    revalidateAdmin("/academy/admin/users", "/academy/admin/permissions");
    return ok(`${name} can now sign in as ${ROLES[user.role].label}.`, { secret: { label: `Temporary password for ${email}`, value: password } });
  });
}

export async function updateUserProfile(_: State, form: FormData): Promise<State> {
  return guard("users.manage", async (me) => {
    const u = findUser(str(form, "id", 60));
    if (!u) return fail("That user no longer exists.");
    const name = str(form, "name", 80);
    const title = str(form, "title", 80);
    const phone = str(form, "phone", 20);
    const fe: Record<string, string> = {};
    if (name.length < 2) fe.name = "Enter the person’s full name.";
    if (phone && !PHONE.test(phone)) fe.phone = "Use a mobile number like +91 98765 43210.";
    if (Object.keys(fe).length) return fail("Check the highlighted fields.", { fieldErrors: fe, values: values(form, ["name", "title", "phone"]) });
    const changed = [name !== u.name && "name", (title || null) !== u.title && "title", (phone || null) !== u.phone && "phone"].filter(Boolean).join(",");
    if (!changed) return ok("No changes to save.");
    Object.assign(u, { name, title: title || null, phone: phone || null });
    await audit({ user: me, action: "user.updated", objectType: "User", objectId: u.id, meta: { fields: changed } });
    revalidateAdmin("/academy/admin/users");
    return ok("Profile saved.");
  });
}

export async function changeUserRole(_: State, form: FormData): Promise<State> {
  return guard("users.manage", async (me) => {
    const u = findUser(str(form, "id", 60));
    const role = oneOf(str(form, "role", 20), ROLE_KEYS);
    if (!u) return fail("That user no longer exists.");
    if (!role) return fail("Choose a role.", { fieldErrors: { role: "Choose a role." } });
    if (role === u.role) return ok("Role unchanged.");
    if (u.id === me.id) return fail("You can’t change your own role. Ask another Super Admin.");
    if (u.role === "admin" && activeAdmins().length <= 1) return fail("At least one active Super Admin must remain.");
    const from = u.role;
    u.role = role;
    u.mfaEnabled = u.mfaEnabled || role === "admin";
    // Drop extra grants that the new bundle already covers.
    u.extraPermissions = u.extraPermissions.filter((p) => !ROLES[role].permissions.includes(p));
    await audit({ user: me, action: "role.changed", objectType: "User", objectId: u.id, meta: { from, to: role } });
    revalidateAdmin("/academy/admin/users", "/academy/admin/permissions");
    return ok(`${u.name} is now ${ROLES[role].label}. Their access changes on their next request.`);
  });
}

export async function setUserStatus(_: State, form: FormData): Promise<State> {
  return guard("users.manage", async (me) => {
    const u = findUser(str(form, "id", 60));
    const status = oneOf(str(form, "status", 20), ["active", "disabled"] as const);
    if (!u || !status) return fail("That user no longer exists.");
    if (u.id === me.id) return fail("You can’t disable your own account.");
    if (status === "disabled" && u.role === "admin" && activeAdmins().length <= 1) return fail("At least one active Super Admin must remain.");
    if (u.status === status) return ok("No change.");
    u.status = status;
    if (status === "disabled") revokeUserSessions(u.id);
    await audit({ user: me, action: status === "disabled" ? "user.disabled" : "user.enabled", objectType: "User", objectId: u.id });
    revalidateAdmin("/academy/admin/users");
    return ok(status === "disabled" ? `${u.name} is disabled and has been signed out everywhere.` : `${u.name} can sign in again.`);
  });
}

export async function resetUserPassword(_: State, form: FormData): Promise<State> {
  return guard("users.manage", async (me) => {
    const u = findUser(str(form, "id", 60));
    if (!u) return fail("That user no longer exists.");
    if (u.id === me.id) return fail("Use “Forgot password” on the sign-in page to reset your own password.");
    const password = tempPassword();
    u.passwordHash = hashPassword(password);
    revokeUserSessions(u.id);
    await audit({ user: me, action: "password.reset", objectType: "User", objectId: u.id, meta: { by: "admin" } });
    revalidateAdmin("/academy/admin/users");
    return ok(`Password reset. ${u.name} has been signed out of every device.`, { secret: { label: `Temporary password for ${u.email}`, value: password } });
  });
}

export async function assignCourseToFaculty(_: State, form: FormData): Promise<State> {
  return guard("users.manage", async (me) => {
    const u = findUser(str(form, "userId", 60));
    const course = db().courses.find((c) => c.id === str(form, "courseId", 60));
    const mode = str(form, "mode", 10) === "remove" ? "remove" : "add";
    if (!u || u.role !== "faculty") return fail("Courses can be assigned to faculty only.");
    if (!course) return fail("Choose a course.", { fieldErrors: { courseId: "Choose a course." } });
    if (mode === "add") {
      if (course.facultyIds.includes(u.id)) return ok(`${u.name} already teaches ${course.title}.`);
      course.facultyIds.push(u.id);
      await emit("course.assigned", { userIds: [u.id], vars: { course_name: course.title }, href: "/academy/faculty" });
    } else {
      course.facultyIds = course.facultyIds.filter((f) => f !== u.id);
    }
    await audit({ user: me, action: mode === "add" ? "course.faculty_assigned" : "course.faculty_removed", objectType: "Course", objectId: course.id, meta: { facultyId: u.id } });
    revalidateAdmin("/academy/admin/users", "/academy/admin/courses");
    return ok(mode === "add" ? `${u.name} now teaches ${course.title}.` : `${u.name} removed from ${course.title}.`);
  });
}

/** Students: enrol (transfer) into a batch. Faculty: add to / remove from the batch’s teaching team. */
export async function assignUserToBatch(_: State, form: FormData): Promise<State> {
  return guard("batches.manage", async (me) => {
    const u = findUser(str(form, "userId", 60));
    const batch = db().batches.find((b) => b.id === str(form, "batchId", 60));
    const mode = str(form, "mode", 10) === "remove" ? "remove" : "add";
    if (!u) return fail("That user no longer exists.");
    if (!batch) return fail("Choose a batch.", { fieldErrors: { batchId: "Choose a batch." } });

    if (u.role === "faculty") {
      if (mode === "remove") batch.facultyIds = batch.facultyIds.filter((f) => f !== u.id);
      else if (!batch.facultyIds.includes(u.id)) batch.facultyIds.push(u.id);
      await audit({ user: me, action: mode === "add" ? "batch.faculty_assigned" : "batch.faculty_removed", objectType: "Batch", objectId: batch.id, meta: { facultyId: u.id } });
      revalidateAdmin("/academy/admin/users", "/academy/admin/batches");
      return ok(mode === "add" ? `${u.name} teaches ${batch.name}.` : `${u.name} removed from ${batch.name}.`);
    }
    if (u.role !== "student") return fail("Only students and faculty can be assigned to batches.");
    if (batch.status === "completed") return fail("This batch has finished. Choose an active or planned batch.");
    if (batch.studentIds.includes(u.id)) return ok(`${u.name} is already in ${batch.name}.`);
    if (batch.studentIds.length >= batch.capacity) return fail(`${batch.name} is full (${batch.capacity} seats). Increase capacity on the batch first.`);

    const d = db();
    let from: string | null = null;
    for (const b of d.batches) if (b.studentIds.includes(u.id)) { b.studentIds = b.studentIds.filter((s) => s !== u.id); from = b.id; }
    for (const e of d.enrollments) if (e.studentId === u.id && e.status === "active") e.status = "paused";
    batch.studentIds.push(u.id);
    d.enrollments.push({ id: newId("enr"), studentId: u.id, programId: batch.programId, batchId: batch.id, enrolledAt: new Date().toISOString(), status: "active" });
    await audit({ user: me, action: "batch.student_assigned", objectType: "Batch", objectId: batch.id, meta: { studentId: u.id, from } });
    revalidateAdmin("/academy/admin/users", "/academy/admin/batches");
    return ok(from ? `${u.name} moved to ${batch.name}.` : `${u.name} enrolled in ${batch.name}.`);
  });
}

/* ================================================================== */
/* Permissions                                                         */
/* ================================================================== */

export async function setExtraPermissions(_: State, form: FormData): Promise<State> {
  return guard("users.manage", async (me) => {
    const u = findUser(str(form, "id", 60));
    if (!u) return fail("That user no longer exists.");
    const bundle = ROLES[u.role].permissions;
    const next = Array.from(new Set(form.getAll("perm").map(String))).filter((p): p is T.Permission => PERMISSION_KEYS.includes(p as T.Permission) && !bundle.includes(p as T.Permission));
    // Learning access belongs to students; staff accounts never get it as an extra.
    const clean: T.Permission[] = next.filter((p) => p !== "learning.access");
    const added = clean.filter((p) => !u.extraPermissions.includes(p));
    const removed = u.extraPermissions.filter((p) => !clean.includes(p));
    if (!added.length && !removed.length) return ok("No changes to save.");
    u.extraPermissions = clean;
    await audit({ user: me, action: "permission.changed", objectType: "User", objectId: u.id, meta: { added: added.join(","), removed: removed.join(",") } });
    revalidateAdmin("/academy/admin/permissions", "/academy/admin/users");
    return ok(`Saved. ${u.name} has ${clean.length} extra permission${clean.length === 1 ? "" : "s"}.`);
  });
}

/* ================================================================== */
/* Courses & academic review                                           */
/* ================================================================== */

const CODE = /^[A-Z]{2,5}-\d{3}$/;

export async function createCourse(_: State, form: FormData): Promise<State> {
  return guard("courses.create", async (me) => {
    const v = values(form, ["programId", "code", "title", "description"]);
    const program = db().programs.find((p) => p.id === str(form, "programId", 60));
    const code = str(form, "code", 12).toUpperCase();
    const title = str(form, "title", 100);
    const description = text(form, "description", 300);
    const fe: Record<string, string> = {};
    if (!program) fe.programId = "Choose a program.";
    if (!CODE.test(code)) fe.code = "Use a code like ADV-403 (letters, dash, three digits).";
    else if (db().courses.some((c) => c.code === code)) fe.code = "That course code is already in use.";
    if (title.length < 4) fe.title = "Give the course a clear title.";
    if (Object.keys(fe).length) return fail("Check the highlighted fields.", { fieldErrors: fe, values: v });
    const course: T.Course = {
      id: `crs_${code.toLowerCase().replace(/[^a-z0-9]/g, "")}`, programId: program!.id, code, title, description, status: "draft", facultyIds: [],
      certificateRule: { minCompletion: 100, minAverageScore: 60 },
    };
    db().courses.push(course);
    program!.courseIds.push(course.id);
    await audit({ user: me, action: "course.created", objectType: "Course", objectId: course.id, meta: { programId: program!.id } });
    revalidateAdmin("/academy/admin/courses");
    return ok(`${code} created as a draft. Assign faculty so they can build its modules.`);
  });
}

export async function updateCourse(_: State, form: FormData): Promise<State> {
  return guard("courses.edit", async (me) => {
    const c = db().courses.find((x) => x.id === str(form, "id", 60));
    if (!c) return fail("That course no longer exists.");
    const title = str(form, "title", 100);
    const description = text(form, "description", 300);
    if (title.length < 4) return fail("Check the highlighted fields.", { fieldErrors: { title: "Give the course a clear title." }, values: values(form, ["title", "description"]) });
    Object.assign(c, { title, description });
    await audit({ user: me, action: "course.updated", objectType: "Course", objectId: c.id });
    revalidateAdmin("/academy/admin/courses");
    return ok("Course details saved.");
  });
}

export async function setCourseStatus(_: State, form: FormData): Promise<State> {
  const status = oneOf(str(form, "status", 20), ["draft", "review", "published", "archived"] as const);
  return guard(status === "published" ? "courses.publish" : "courses.edit", async (me) => {
    const c = db().courses.find((x) => x.id === str(form, "id", 60));
    if (!c || !status) return fail("That course no longer exists.");
    if (status === "published") {
      const mods = db().modules.filter((m) => m.courseId === c.id);
      const lessons = db().lessons.filter((l) => mods.some((m) => m.id === l.moduleId) && l.status === "published");
      if (!lessons.length) return fail("This course has no published lessons yet. Faculty need to build at least one module before it can be published.");
      if (!c.facultyIds.length) return fail("Assign at least one faculty member before publishing.");
    }
    const from = c.status;
    c.status = status;
    await audit({ user: me, action: `course.${status === "review" ? "sent_to_review" : status}`, objectType: "Course", objectId: c.id, meta: { from } });
    revalidateAdmin("/academy/admin/courses");
    return ok(`${c.code} is now ${status}.`);
  });
}

export async function setCourseFaculty(_: State, form: FormData): Promise<State> {
  return guard("courses.edit", async (me) => {
    const c = db().courses.find((x) => x.id === str(form, "id", 60));
    if (!c) return fail("That course no longer exists.");
    const faculty = new Set(db().users.filter((u) => u.role === "faculty").map((u) => u.id));
    const next = Array.from(new Set(form.getAll("faculty").map(String))).filter((f) => faculty.has(f));
    const added = next.filter((f) => !c.facultyIds.includes(f));
    const removed = c.facultyIds.filter((f) => !next.includes(f));
    if (!added.length && !removed.length) return ok("No changes to save.");
    c.facultyIds = next;
    if (added.length) await emit("course.assigned", { userIds: added, vars: { course_name: c.title }, href: "/academy/faculty" });
    await audit({ user: me, action: "course.faculty_changed", objectType: "Course", objectId: c.id, meta: { added: added.join(","), removed: removed.join(",") } });
    revalidateAdmin("/academy/admin/courses", "/academy/admin/users");
    return ok("Teaching team saved.");
  });
}

export async function setCertificateRule(_: State, form: FormData): Promise<State> {
  return guard("courses.edit", async (me) => {
    const c = db().courses.find((x) => x.id === str(form, "id", 60));
    if (!c) return fail("That course no longer exists.");
    const minCompletion = int(form, "minCompletion");
    const minAverageScore = int(form, "minAverageScore");
    const fe: Record<string, string> = {};
    if (!(minCompletion >= 0 && minCompletion <= 100)) fe.minCompletion = "Enter 0–100.";
    if (!(minAverageScore >= 0 && minAverageScore <= 100)) fe.minAverageScore = "Enter 0–100.";
    if (Object.keys(fe).length) return fail("Check the highlighted fields.", { fieldErrors: fe, values: values(form, ["minCompletion", "minAverageScore"]) });
    const from = `${c.certificateRule.minCompletion}/${c.certificateRule.minAverageScore}`;
    c.certificateRule = { minCompletion, minAverageScore };
    await audit({ user: me, action: "course.certificate_rule_changed", objectType: "Course", objectId: c.id, meta: { from, to: `${minCompletion}/${minAverageScore}` } });
    revalidateAdmin("/academy/admin/courses");
    return ok("Certificate requirements saved.");
  });
}

/** Faculty submissions (content in “review”) are approved, published or returned here. */
export async function reviewContent(_: State, form: FormData): Promise<State> {
  const decision = oneOf(str(form, "decision", 12), ["approve", "publish", "return"] as const);
  return guard(decision === "publish" ? "courses.publish" : "courses.edit", async (me) => {
    const item = db().content.find((c) => c.id === str(form, "id", 60) && c.area === "academic");
    if (!item || !decision) return fail("That item no longer exists.");
    if (!["review", "approved"].includes(item.status)) return fail("This item is no longer waiting for review.");
    const note = str(form, "note", 200);
    if (decision === "return" && note.length < 4) return fail("Tell faculty what to change.", { fieldErrors: { note: "Add a short note for faculty." } });
    const from = item.status;
    item.status = decision === "approve" ? "approved" : decision === "publish" ? "published" : "draft";
    item.updatedAt = new Date().toISOString();
    db().notifications.unshift({
      id: newId("ntf"), userId: item.ownerId, category: "learning",
      title: decision === "return" ? "Content returned for changes" : decision === "publish" ? "Your content is published" : "Your content was approved",
      body: decision === "return" ? `“${item.title}”: ${note}` : `“${item.title}”`, href: "/academy/faculty/content", createdAt: new Date().toISOString(), readAt: null,
    });
    await audit({ user: me, action: `content.${decision === "approve" ? "approved" : decision === "publish" ? "published" : "returned"}`, objectType: "ContentItem", objectId: item.id, meta: { from, ...(note ? { note } : {}) } });
    revalidateAdmin("/academy/admin/courses");
    return ok(decision === "return" ? "Returned to faculty with your note." : decision === "publish" ? "Published to students." : "Approved — ready to publish.");
  });
}

/* ================================================================== */
/* Batches                                                             */
/* ================================================================== */

export async function saveBatch(_: State, form: FormData): Promise<State> {
  return guard("batches.manage", async (me) => {
    const id = str(form, "id", 60);
    const existing = id ? db().batches.find((b) => b.id === id) : null;
    if (id && !existing) return fail("That batch no longer exists.");
    const v = values(form, ["name", "programId", "startDate", "endDate", "capacity", "schedule", "status"]);
    const name = str(form, "name", 90);
    const program = db().programs.find((p) => p.id === str(form, "programId", 60));
    const start = str(form, "startDate", 10);
    const end = str(form, "endDate", 10);
    const capacity = int(form, "capacity");
    const schedule = str(form, "schedule", 80);
    const status = oneOf(str(form, "status", 12), ["planned", "active", "completed"] as const);
    const fe: Record<string, string> = {};
    if (name.length < 4) fe.name = "Give the batch a clear name.";
    if (!program) fe.programId = "Choose a program.";
    if (!DATE.test(start)) fe.startDate = "Choose a start date.";
    if (!DATE.test(end)) fe.endDate = "Choose an end date.";
    else if (DATE.test(start) && end <= start) fe.endDate = "End date must be after the start date.";
    if (!(capacity >= 1 && capacity <= 200)) fe.capacity = "Capacity must be 1–200.";
    else if (existing && capacity < existing.studentIds.length) fe.capacity = `${existing.studentIds.length} students are already enrolled.`;
    if (schedule.length < 3) fe.schedule = "Describe when classes run, e.g. “Mon–Fri · 10:00–12:00”.";
    if (!status) fe.status = "Choose a status.";
    if (Object.keys(fe).length) return fail("Check the highlighted fields.", { fieldErrors: fe, values: v });
    const facultySet = new Set(db().users.filter((u) => u.role === "faculty").map((u) => u.id));
    const facultyIds = Array.from(new Set(form.getAll("faculty").map(String))).filter((f) => facultySet.has(f));
    const data = { name, programId: program!.id, startDate: dateIso(start), endDate: dateIso(end), capacity, schedule, status: status!, facultyIds };
    if (existing) {
      Object.assign(existing, data);
      await audit({ user: me, action: "batch.updated", objectType: "Batch", objectId: existing.id });
    } else {
      const b: T.Batch = { id: newId("bat"), studentIds: [], ...data };
      db().batches.push(b);
      await audit({ user: me, action: "batch.created", objectType: "Batch", objectId: b.id, meta: { programId: b.programId, capacity } });
    }
    revalidateAdmin("/academy/admin/batches");
    if (existing) revalidatePath(`/academy/admin/batches/${existing.id}`);
    return ok(existing ? "Batch saved." : `${name} created.`);
  });
}

/* ================================================================== */
/* Admissions                                                          */
/* ================================================================== */

const STAGES: T.AdmissionStage[] = ["application", "counselling", "documents", "payment", "admitted", "batch_assigned", "enrolled"];

export async function createAdmission(_: State, form: FormData): Promise<State> {
  return guard("admissions.manage", async (me) => {
    const name = str(form, "name", 80);
    const phone = str(form, "phone", 20);
    const program = db().programs.find((p) => p.id === str(form, "programId", 60));
    const fe: Record<string, string> = {};
    if (name.length < 2) fe.name = "Enter the applicant’s name.";
    if (!PHONE.test(phone)) fe.phone = "Enter a mobile number.";
    if (!program) fe.programId = "Choose a program.";
    if (Object.keys(fe).length) return fail("Check the highlighted fields.", { fieldErrors: fe, values: values(form, ["name", "phone", "programId"]) });
    const a: T.Admission = { id: newId("adm"), leadId: null, name, phone, programId: program!.id, stage: "application", documentsComplete: false, batchId: null, updatedAt: new Date().toISOString() };
    db().admissions.push(a);
    await audit({ user: me, action: "admission.created", objectType: "Admission", objectId: a.id });
    revalidateAdmin("/academy/admin/admissions");
    return ok(`Application for ${name} added.`);
  });
}

export async function moveAdmission(_: State, form: FormData): Promise<State> {
  return guard("admissions.manage", async (me) => {
    const d = db();
    const a = d.admissions.find((x) => x.id === str(form, "id", 60));
    const stage = oneOf(str(form, "stage", 20), STAGES);
    if (!a) return fail("That application no longer exists.");
    if (!stage) return fail("Choose a stage.", { fieldErrors: { stage: "Choose a stage." } });
    if (a.stage === "enrolled") return fail("This applicant is already enrolled. Manage them from Users.");
    const docs = form.get("documentsComplete") === "on";
    const batchId = str(form, "batchId", 60);
    const batch = batchId ? d.batches.find((b) => b.id === batchId) : null;
    const email = str(form, "email", 160).toLowerCase();
    const idx = STAGES.indexOf(stage);
    const fe: Record<string, string> = {};
    if (idx >= STAGES.indexOf("payment") && !docs) fe.documentsComplete = "Documents must be complete before payment.";
    if (idx >= STAGES.indexOf("batch_assigned")) {
      if (!batch) fe.batchId = "Choose a batch.";
      else if (batch.programId !== a.programId) fe.batchId = "This batch belongs to a different program.";
      else if (batch.status === "completed") fe.batchId = "This batch has finished.";
      else if (stage === "enrolled" && batch.studentIds.length >= batch.capacity) fe.batchId = "This batch is full.";
    }
    const lead = a.leadId ? d.leads.find((l) => l.id === a.leadId) : null;
    const loginEmail = email || lead?.email || "";
    if (stage === "enrolled") {
      if (!EMAIL.test(loginEmail)) fe.email = "Enter the student’s email — it becomes their sign-in.";
      else if (d.users.some((u) => u.email.toLowerCase() === loginEmail.toLowerCase())) fe.email = "An account with this email already exists.";
    }
    if (Object.keys(fe).length) return fail("Check the highlighted fields.", { fieldErrors: fe, values: { ...values(form, ["stage", "batchId", "email"]), documentsComplete: docs ? "on" : "" } });

    const from = a.stage;
    a.stage = stage;
    a.documentsComplete = docs;
    a.batchId = batch?.id ?? a.batchId;
    a.updatedAt = new Date().toISOString();
    await audit({ user: me, action: "admission.stage_changed", objectType: "Admission", objectId: a.id, meta: { from, to: stage } });

    if (stage !== "enrolled") {
      revalidateAdmin("/academy/admin/admissions");
      return ok(`${a.name} moved to ${stage.replace("_", " ")}.`);
    }

    // Enrol: create the student account, enrolment and batch seat, then let the notification engine welcome them.
    const password = tempPassword();
    const student: T.User = {
      id: newId("u_stu"), name: a.name, email: loginEmail, phone: a.phone, role: "student", extraPermissions: [], status: "active",
      passwordHash: hashPassword(password), mfaEnabled: false, title: null, createdAt: new Date().toISOString(), lastLoginAt: null,
    };
    d.users.push(student);
    batch!.studentIds.push(student.id);
    d.enrollments.push({ id: newId("enr"), studentId: student.id, programId: a.programId, batchId: batch!.id, enrolledAt: new Date().toISOString(), status: "active" });
    if (lead) lead.status = "converted";
    const program = d.programs.find((p) => p.id === a.programId);
    const nextClass = d.sessions.filter((s) => s.batchId === batch!.id && new Date(s.startsAt).getTime() > Date.now()).sort((x, y) => x.startsAt.localeCompare(y.startsAt))[0];
    await audit({ user: me, action: "user.created", objectType: "User", objectId: student.id, meta: { role: "student", via: "admission" } });
    await audit({ user: me, action: "student.enrolled", objectType: "Enrollment", objectId: student.id, meta: { batchId: batch!.id, admissionId: a.id } });
    await emit("student.enrolled", {
      studentIds: [student.id],
      vars: { course_name: program?.name ?? "your program", batch_name: batch!.name, class_date: formatDate(nextClass?.startsAt ?? batch!.startDate) },
      href: "/academy/student",
    });
    revalidateAdmin("/academy/admin/admissions", "/academy/admin/users", "/academy/admin/batches");
    return ok(`${a.name} is enrolled in ${batch!.name}. Welcome messages are on their way.`, { secret: { label: `Temporary password for ${loginEmail}`, value: password } });
  });
}

/* ================================================================== */
/* Finance                                                             */
/* ================================================================== */

export async function recordOfflinePayment(_: State, form: FormData): Promise<State> {
  return guard("finance.manage", async (me) => {
    const d = db();
    const inv = d.invoices.find((i) => i.id === str(form, "invoiceId", 60));
    if (!inv) return fail("That invoice no longer exists.");
    const due = Math.max(0, inv.amount - inv.paid);
    const amount = int(form, "amount");
    const method = oneOf(str(form, "method", 20), ["cash", "bank_transfer"] as const);
    const reference = str(form, "reference", 60);
    const paidOn = str(form, "paidOn", 10);
    const fe: Record<string, string> = {};
    if (inv.status === "refunded") return fail("This invoice was refunded.");
    if (due <= 0) return fail("This invoice is already fully paid.");
    if (!(amount >= 1)) fe.amount = "Enter the amount received.";
    else if (amount > due) fe.amount = `More than the ${inr(due)} outstanding.`;
    if (!method) fe.method = "Choose how it was paid.";
    if (method === "bank_transfer" && reference.length < 4) fe.reference = "Add the bank reference (UTR).";
    if (paidOn && (!DATE.test(paidOn) || new Date(dateIso(paidOn)).getTime() > Date.now())) fe.paidOn = "Choose today or an earlier date.";
    if (Object.keys(fe).length) return fail("Check the highlighted fields.", { fieldErrors: fe, values: values(form, ["amount", "method", "reference", "paidOn"]) });

    const payment: T.Payment = {
      id: newId("pay"), invoiceId: inv.id, amount, paidAt: paidOn ? dateIso(paidOn) : new Date().toISOString(), method: method!,
      provider: "offline", providerRef: reference || null, status: "succeeded",
    };
    d.payments.push(payment);
    inv.paid += amount;
    let covered = inv.paid;
    for (const ins of inv.installments) { ins.paid = covered >= ins.amount; covered -= ins.amount; }
    inv.status = inv.paid >= inv.amount ? "paid" : new Date(inv.dueDate).getTime() < Date.now() ? "overdue" : "partially_paid";
    await audit({ user: me, action: "payment.recorded", objectType: "Invoice", objectId: inv.id, meta: { paymentId: payment.id, amount, method: method! } });
    await emit("payment.received", { studentIds: [inv.studentId], vars: { payment_amount: inr(amount), due_date: formatDate(inv.dueDate) }, href: "/academy/student" });
    revalidateAdmin("/academy/admin/finance");
    return ok(`${inr(amount)} recorded against ${inv.number}. Invoice is now ${inv.status.replace("_", " ")}.`);
  });
}

export async function sendPaymentReminder(_: State, form: FormData): Promise<State> {
  return guard("finance.manage", async (me) => {
    if (!me.permissions.includes("communications.send")) return fail("Sending reminders needs the “Send communications” permission.");
    const inv = db().invoices.find((i) => i.id === str(form, "invoiceId", 60));
    if (!inv) return fail("That invoice no longer exists.");
    const due = Math.max(0, inv.amount - inv.paid);
    if (!due || inv.status === "refunded") return fail("Nothing is outstanding on this invoice.");
    const nextIns = inv.installments.find((i) => !i.paid);
    await emit("payment.overdue", { studentIds: [inv.studentId], vars: { payment_amount: inr(nextIns?.amount ?? due), due_date: formatDate(nextIns?.dueDate ?? inv.dueDate) }, href: "/academy/student" });
    await audit({ user: me, action: "payment.reminder_sent", objectType: "Invoice", objectId: inv.id, meta: { amount: nextIns?.amount ?? due } });
    revalidateAdmin("/academy/admin/finance", "/academy/admin/communications");
    return ok("Reminder sent through the notification engine (respecting the student’s preferences).");
  });
}

/* ================================================================== */
/* Certificates                                                        */
/* ================================================================== */

function certificateId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    const bytes = randomBytes(6);
    const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    const id = `EMC-${new Date().getFullYear()}-${code}`;
    if (!db().certificates.some((c) => c.id === id)) return id;
  }
}

export async function issueCertificate(_: State, form: FormData): Promise<State> {
  return guard("certificates.manage", async (me) => {
    const d = db();
    const student = d.users.find((u) => u.id === str(form, "studentId", 60) && u.role === "student");
    const program = d.programs.find((p) => p.id === str(form, "programId", 60));
    const template = d.certificateTemplates.find((t) => t.id === str(form, "templateId", 60));
    const fe: Record<string, string> = {};
    if (!student) fe.studentId = "Choose a student.";
    else if (student.status !== "active") fe.studentId = "This account is disabled.";
    if (!program) fe.programId = "Choose a program.";
    if (!template) fe.templateId = "Choose a template.";
    else if (template.status !== "active") fe.templateId = "This template is still a draft.";
    if (student && program && !d.enrollments.some((e) => e.studentId === student.id && e.programId === program.id)) fe.programId = `${student.name} isn’t enrolled in this program.`;
    if (Object.keys(fe).length) return fail("Check the highlighted fields.", { fieldErrors: fe, values: values(form, ["studentId", "programId", "templateId"]) });
    const id = certificateId();
    d.certificates.push({ id, studentId: student!.id, programId: program!.id, templateId: template!.id, issuedAt: new Date().toISOString(), issuedBy: me.id, status: "valid", revokedReason: null });
    await audit({ user: me, action: "certificate.issued", objectType: "Certificate", objectId: id, meta: { studentId: student!.id, templateId: template!.id } });
    await emit("certificate.issued", { studentIds: [student!.id], vars: { certificate_id: id, course_name: program!.name, verify_url: `/verify/${id}` }, href: "/academy/student/certificates" });
    revalidateAdmin("/academy/admin/certificates");
    return ok(`Certificate ${id} issued to ${student!.name}.`);
  });
}

export async function revokeCertificate(_: State, form: FormData): Promise<State> {
  return guard("certificates.manage", async (me) => {
    const c = db().certificates.find((x) => x.id === str(form, "id", 40));
    if (!c) return fail("That certificate doesn’t exist.");
    if (c.status === "revoked") return fail("This certificate is already revoked.");
    const reason = str(form, "reason", 200);
    if (reason.length < 5) return fail("A reason is required.", { fieldErrors: { reason: "Explain why (at least 5 characters)." } });
    c.status = "revoked";
    c.revokedReason = reason;
    await audit({ user: me, action: "certificate.revoked", objectType: "Certificate", objectId: c.id, meta: { reason } });
    revalidateAdmin("/academy/admin/certificates");
    return ok(`${c.id} revoked. Verification now shows it as revoked.`);
  });
}

/* ================================================================== */
/* Integrations                                                        */
/* ================================================================== */

/** A safe check: reads configuration only — never sends a message, charges, or calls a model. */
export async function testIntegration(_: State, form: FormData): Promise<State> {
  return guard("integrations.manage", async (me) => {
    const key = oneOf(str(form, "key", 20), ["email", "whatsapp", "sms", "ai", "payments", "storage", "analytics", "auth"] as const);
    if (!key) return fail("Unknown integration.");
    const p =
      key === "email" ? emailProvider() : key === "whatsapp" ? whatsappProvider() : key === "sms" ? smsProvider() : key === "ai" ? aiProvider()
      : key === "payments" ? paymentProvider() : key === "storage" ? storageProvider() : key === "analytics" ? analyticsProvider() : null;
    let result: "simulated" | "configured" | "not_configured" | "ok";
    let message: string;
    if (!p) {
      const strong = (process.env.AUTH_SECRET ?? "").length >= 32;
      result = "ok";
      message = strong ? "Sign-in is working and a strong session secret is set." : "Sign-in is working using the demo session secret. Set AUTH_SECRET (32+ characters) before launch.";
    } else if (["simulated", "demo", "internal"].includes(p.key)) {
      result = "simulated";
      message = `${p.label}: simulated — nothing was sent or stored. Configuration check passed.`;
    } else if (p.configured()) {
      result = "configured";
      message = `${p.label}: all required settings are present. A live check will run once the adapter is implemented — nothing was sent.`;
    } else {
      result = "not_configured";
      message = key === "payments" ? "Not configured — no gateway is integrated until configured." : `${p.label}: not configured. Add the listed settings on the server.`;
    }
    await audit({ user: me, action: "integration.tested", objectType: "Integration", objectId: key, result: result === "not_configured" ? "failed" : "success", meta: { provider: p?.key ?? "builtin", result } });
    revalidatePath("/academy/admin/integrations");
    return result === "not_configured" ? fail(message) : ok(message);
  });
}
