"use server";
import { revalidatePath } from "next/cache";
import { db, newId } from "@/server/db/store";
import { AuthError, assertPermission } from "@/server/auth/session";
import { audit } from "@/server/services/audit";
import { askAI } from "@/server/services/ai";
import { channelEnabled } from "@/server/services/notifications";
import { emit, type DomainEvent } from "@/server/events/bus";
import { batchById } from "@/server/repositories/learning";
import { facultyNotesStore, facultyScope, isMyBatch, isMyCourse, isMyStudent, lessonsForCourses, sessionMarkable } from "@/server/repositories/faculty";
import type * as T from "@/lib/platform/types";
import type { Permission, SessionUser } from "@/lib/platform/types";

/**
 * Faculty server actions. Each one: assertPermission → validate & clip input →
 * scope check (my batches / my courses / my students) → mutate → audit → emit → revalidate.
 */

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };
export type FormState = ActionResult | null;

const clip = (v: FormDataEntryValue | null | undefined, max: number) => String(v ?? "").trim().slice(0, max);

async function guard(permission: Permission): Promise<SessionUser | ActionResult> {
  try {
    return await assertPermission(permission);
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: e.reason === "unauthenticated" ? "Your session has expired. Please log in again." : "You don’t have permission to do that." };
    throw e;
  }
}
const isUser = (x: SessionUser | ActionResult): x is SessionUser => "permissions" in x;

/**
 * In-app notices for students. The notification engine only sends for events that
 * have templates; until in-app templates exist for these events we create the notice
 * here so students actually see it (and skip it once a template is added, to avoid duplicates).
 */
function notifyStudents(event: DomainEvent, category: T.NotificationCategory, studentIds: string[], title: string, body: string, href: string) {
  const hasTemplate = db().templates.some((t) => t.event === event && t.channel === "in_app" && t.status === "active");
  if (hasTemplate) return 0;
  const now = new Date().toISOString();
  let n = 0;
  for (const id of new Set(studentIds)) {
    const u = db().users.find((x) => x.id === id && x.status === "active");
    if (!u || !channelEnabled(u.id, category, "in_app")) continue;
    db().notifications.unshift({ id: newId("ntf"), userId: u.id, category, title, body: body.slice(0, 280), href, createdAt: now, readAt: null });
    n++;
  }
  return n;
}

/* ------------------------------------------------------------------ */
/* Attendance                                                          */
/* ------------------------------------------------------------------ */

const ATT: T.AttendanceStatus[] = ["present", "absent", "late", "excused"];

export async function markAttendance(input: { sessionId: string; entries: { studentId: string; status: string }[] }): Promise<ActionResult> {
  const user = await guard("attendance.manage");
  if (!isUser(user)) return user;
  const sessionId = String(input?.sessionId ?? "").slice(0, 80);
  const session = db().sessions.find((s) => s.id === sessionId);
  if (!session || !isMyBatch(user.id, session.batchId)) return { ok: false, error: "That class isn’t in one of your batches." };
  if (!sessionMarkable(session)) return { ok: false, error: "Attendance can’t be marked for a class that hasn’t happened yet." };
  const batch = batchById(session.batchId)!;
  const entries = Array.isArray(input.entries) ? input.entries.slice(0, 500) : [];
  if (!entries.length) return { ok: false, error: "Mark at least one student before saving." };
  for (const e of entries) {
    if (!batch.studentIds.includes(String(e?.studentId))) return { ok: false, error: "One of the students isn’t in this batch." };
    if (!ATT.includes(e?.status as T.AttendanceStatus)) return { ok: false, error: "Choose Present, Absent, Late or Excused for each student." };
  }
  const now = new Date().toISOString();
  const list = db().attendance;
  let changed = 0;
  for (const e of entries) {
    const status = e.status as T.AttendanceStatus;
    const existing = list.find((a) => a.sessionId === session.id && a.studentId === e.studentId);
    if (existing) {
      if (existing.status !== status) changed++;
      Object.assign(existing, { status, markedBy: user.id, markedAt: now });
    } else {
      changed++;
      list.push({ sessionId: session.id, studentId: e.studentId, status, markedBy: user.id, markedAt: now });
    }
  }
  const present = entries.filter((e) => e.status === "present" || e.status === "late").length;
  await audit({ user, action: "attendance.marked", objectType: "ClassSession", objectId: session.id, meta: { batchId: batch.id, students: entries.length, attended: present, changed } });
  revalidatePath("/academy/faculty", "layout");
  return { ok: true, message: `Saved — ${present} of ${entries.length} attended.` };
}

/* ------------------------------------------------------------------ */
/* Private notes                                                       */
/* ------------------------------------------------------------------ */

export async function saveFacultyNote(_: FormState, form: FormData): Promise<FormState> {
  const user = await guard("students.view");
  if (!isUser(user)) return user;
  const studentId = clip(form.get("studentId"), 80);
  const text = clip(form.get("text"), 2000);
  if (!isMyStudent(user.id, studentId)) return { ok: false, error: "That student isn’t in one of your batches." };
  if (text.length < 3) return { ok: false, error: "Check the note.", fieldErrors: { text: "Write at least a few words." } };
  const key = `${user.id}:${studentId}`;
  const store = facultyNotesStore();
  store.set(key, [{ id: newId("fnote"), text, createdAt: new Date().toISOString() }, ...(store.get(key) ?? [])].slice(0, 100));
  await audit({ user, action: "student.note.added", objectType: "User", objectId: studentId, meta: { private: true } });
  revalidatePath(`/academy/faculty/students/${studentId}`);
  return { ok: true, message: "Note saved. Only you can see it." };
}

/* ------------------------------------------------------------------ */
/* Assignment review                                                   */
/* ------------------------------------------------------------------ */

const INTENTS = ["grade", "comment", "revise", "approve"] as const;
type Intent = (typeof INTENTS)[number];

export async function reviewSubmission(_: FormState, form: FormData): Promise<FormState> {
  const user = await guard("assignments.review");
  if (!isUser(user)) return user;
  const intent = clip(form.get("intent"), 20) as Intent;
  if (!INTENTS.includes(intent)) return { ok: false, error: "Choose an action." };
  const s = db().submissions.find((x) => x.id === clip(form.get("submissionId"), 120));
  const assignment = s && db().assignments.find((a) => a.id === s.assignmentId);
  if (!s || !assignment || !isMyCourse(user.id, assignment.courseId) || !isMyStudent(user.id, s.studentId)) return { ok: false, error: "That submission isn’t in your review queue." };
  if (s.status === "not_started" || s.status === "in_progress") return { ok: false, error: "This work hasn’t been submitted yet." };

  const feedback = clip(form.get("feedback"), 3000);
  const rawScore = clip(form.get("score"), 10);
  const fieldErrors: Record<string, string> = {};
  let score: number | null = s.score;
  if (intent === "grade") {
    const n = Number(rawScore);
    if (rawScore === "" || !Number.isFinite(n)) fieldErrors.score = `Enter a score from 0 to ${assignment.maxScore}.`;
    else if (n < 0 || n > assignment.maxScore) fieldErrors.score = `Score must be between 0 and ${assignment.maxScore}.`;
    else score = Math.round(n * 2) / 2;
  }
  if ((intent === "grade" || intent === "comment" || intent === "revise") && feedback.length < 3)
    fieldErrors.feedback = intent === "revise" ? "Explain what the student should change." : "Write feedback for the student.";
  if (intent === "approve" && s.score === null) fieldErrors.score = "Grade this submission before approving it.";
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  const before = { status: s.status, score: s.score };
  if (intent === "grade") Object.assign(s, { score, feedback, status: "completed", reviewedBy: user.id });
  if (intent === "comment") Object.assign(s, { feedback, status: s.status === "submitted" ? "under_review" : s.status, reviewedBy: user.id });
  if (intent === "revise") Object.assign(s, { feedback, status: "returned", revision: s.revision + 1, reviewedBy: user.id });
  if (intent === "approve") Object.assign(s, { status: "completed", reviewedBy: user.id, ...(feedback ? { feedback } : {}) });

  await audit({ user, action: `submission.${intent === "revise" ? "revision_requested" : intent === "grade" ? "graded" : intent === "comment" ? "commented" : "approved"}`, objectType: "Submission", objectId: s.id, meta: { from: before.status, to: s.status } });
  if (before.score !== s.score) await audit({ user, action: "grade.changed", objectType: "Submission", objectId: s.id, meta: { from: before.score, to: s.score, maxScore: assignment.maxScore } });

  const titles: Record<Intent, string> = { grade: "Your assignment was graded", comment: "New feedback on your assignment", revise: "Revision requested", approve: "Your assignment was approved" };
  notifyStudents("assignment.reviewed", "learning", [s.studentId], titles[intent], `${user.name} reviewed “${assignment.title}”.`, "/academy/student/assignments");
  await emit("assignment.reviewed", { studentIds: [s.studentId], vars: { assignment_title: assignment.title }, href: "/academy/student/assignments" });

  revalidatePath("/academy/faculty/reviews");
  revalidatePath(`/academy/faculty/reviews/${s.id}`);
  revalidatePath("/academy/faculty");
  const done: Record<Intent, string> = { grade: `Graded ${s.score}/${assignment.maxScore}. The student has been notified.`, comment: "Feedback shared with the student.", revise: `Returned for revision ${s.revision}. The student has been notified.`, approve: "Approved. The student has been notified." };
  return { ok: true, message: done[intent] };
}

/* ------------------------------------------------------------------ */
/* Assessment builder                                                  */
/* ------------------------------------------------------------------ */

export interface QuestionInput {
  id?: string;
  type: string;
  prompt: string;
  scenario?: string;
  options: string[];
  correct: number[];
  acceptedAnswers?: string[];
  points: number;
  explanation: string;
  difficulty: string;
  tags: string[];
}

export interface AssessmentInput {
  id?: string;
  title: string;
  courseId: string;
  kind: string;
  durationMin: number;
  opensAt: string;
  closesAt: string;
  maxAttempts: number;
  passMark: number;
  questions: QuestionInput[];
  submit: "draft" | "review";
}

const KINDS: T.AssessmentKind[] = ["quiz", "module", "mock", "practice", "final"];
const QTYPES: T.QuestionType[] = ["single", "multiple", "true_false", "scenario", "short", "coding_case"];
const DIFF: T.Question["difficulty"][] = ["easy", "medium", "hard"];
const int = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : Number.NaN);

export async function saveAssessment(input: AssessmentInput): Promise<ActionResult> {
  const user = await guard("assessments.manage");
  if (!isUser(user)) return user;
  const e: Record<string, string> = {};
  const title = String(input?.title ?? "").trim().slice(0, 140);
  const courseId = String(input?.courseId ?? "").slice(0, 60);
  const kind = String(input?.kind ?? "") as T.AssessmentKind;
  const durationMin = int(input?.durationMin);
  const maxAttempts = int(input?.maxAttempts);
  const passMark = int(input?.passMark);
  const opens = new Date(String(input?.opensAt ?? ""));
  const closes = new Date(String(input?.closesAt ?? ""));
  const submit = input?.submit === "review" ? "review" : "draft";

  if (title.length < 4) e.title = "Give the assessment a title (at least 4 characters).";
  if (!isMyCourse(user.id, courseId)) e.courseId = "Choose one of your courses.";
  if (!KINDS.includes(kind)) e.kind = "Choose a type.";
  if (!(durationMin >= 5 && durationMin <= 300)) e.durationMin = "Duration must be 5–300 minutes.";
  if (!(maxAttempts >= 1 && maxAttempts <= 10)) e.maxAttempts = "Attempts must be 1–10.";
  if (!(passMark >= 0 && passMark <= 100)) e.passMark = "Pass mark must be 0–100%.";
  if (Number.isNaN(opens.getTime())) e.opensAt = "Choose when it opens.";
  if (Number.isNaN(closes.getTime())) e.closesAt = "Choose when it closes.";
  else if (!Number.isNaN(opens.getTime()) && closes <= opens) e.closesAt = "Closing time must be after the opening time.";

  const rawQs = Array.isArray(input?.questions) ? input.questions : [];
  if (rawQs.length > 100) e.questions = "An assessment can have at most 100 questions.";
  if (submit === "review" && rawQs.length === 0) e.questions = "Add at least one question before submitting for review.";

  const questions: T.Question[] = [];
  rawQs.slice(0, 100).forEach((q, i) => {
    const n = i + 1;
    const type = String(q?.type ?? "") as T.QuestionType;
    const prompt = String(q?.prompt ?? "").trim().slice(0, 1200);
    const scenario = String(q?.scenario ?? "").trim().slice(0, 3000);
    const explanation = String(q?.explanation ?? "").trim().slice(0, 1500);
    const difficulty = String(q?.difficulty ?? "") as T.Question["difficulty"];
    const points = int(q?.points);
    const tags = (Array.isArray(q?.tags) ? q.tags : []).map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 8);
    if (!QTYPES.includes(type)) return void (e[`q${n}`] = `Question ${n}: choose a question type.`);
    if (prompt.length < 5) return void (e[`q${n}`] = `Question ${n}: write the question prompt.`);
    if (!(points >= 1 && points <= 50)) return void (e[`q${n}`] = `Question ${n}: points must be 1–50.`);
    if (!DIFF.includes(difficulty)) return void (e[`q${n}`] = `Question ${n}: choose a difficulty.`);
    if ((type === "scenario" || type === "coding_case") && scenario.length < 10) return void (e[`q${n}`] = `Question ${n}: add the scenario or case note.`);

    let options: string[] = [];
    let correct: number[] = [];
    let acceptedAnswers: string[] | undefined;
    if (type === "short") {
      acceptedAnswers = (Array.isArray(q?.acceptedAnswers) ? q.acceptedAnswers : []).map((a) => String(a).trim().slice(0, 120)).filter(Boolean).slice(0, 10);
      if (!acceptedAnswers.length) return void (e[`q${n}`] = `Question ${n}: add at least one accepted answer.`);
    } else {
      options = type === "true_false" ? ["True", "False"] : (Array.isArray(q?.options) ? q.options : []).map((o) => String(o).trim().slice(0, 300)).slice(0, 8);
      if (options.length < 2 || options.some((o) => !o)) return void (e[`q${n}`] = `Question ${n}: add at least two options and fill every option.`);
      if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) return void (e[`q${n}`] = `Question ${n}: options must be different from each other.`);
      correct = Array.from(new Set((Array.isArray(q?.correct) ? q.correct : []).map(int))).filter((c) => c >= 0 && c < options.length).sort((a, b) => a - b);
      if (!correct.length) return void (e[`q${n}`] = `Question ${n}: mark the correct answer.`);
      if (type !== "multiple" && correct.length !== 1) return void (e[`q${n}`] = `Question ${n}: mark exactly one correct answer.`);
    }
    if (submit === "review" && explanation.length < 5) return void (e[`q${n}`] = `Question ${n}: add an explanation before submitting for review.`);
    const id = /^[a-z0-9_]{3,60}$/i.test(String(q?.id ?? "")) ? String(q.id) : newId("q");
    questions.push({ id, type, prompt, ...(scenario ? { scenario } : {}), options, correct, ...(acceptedAnswers ? { acceptedAnswers } : {}), points, explanation, difficulty, tags });
  });

  let existing: T.Assessment | undefined;
  if (input?.id) {
    existing = db().assessments.find((a) => a.id === String(input.id));
    if (!existing || !isMyCourse(user.id, existing.courseId)) return { ok: false, error: "That assessment isn’t one of yours." };
    if (existing.status !== "draft" && existing.status !== "review") return { ok: false, error: "Approved or published assessments are locked. Ask an admin to move it back to draft." };
  }
  if (Object.keys(e).length) return { ok: false, error: `Please fix ${Object.keys(e).length} issue${Object.keys(e).length > 1 ? "s" : ""} before saving.`, fieldErrors: e };

  const data = { title, courseId, kind, durationMin, opensAt: opens.toISOString(), closesAt: closes.toISOString(), maxAttempts, passMark, questions, status: submit as T.PublishState };
  let id: string;
  if (existing) {
    Object.assign(existing, data);
    id = existing.id;
  } else {
    id = newId("asm");
    db().assessments.push({ id, createdBy: user.id, ...data });
  }
  await audit({ user, action: existing ? "assessment.updated" : "assessment.created", objectType: "Assessment", objectId: id, meta: { status: submit, questions: questions.length } });
  if (submit === "review") await audit({ user, action: "assessment.submitted_for_review", objectType: "Assessment", objectId: id });
  revalidatePath("/academy/faculty/assessments");
  revalidatePath(`/academy/faculty/assessments/${id}`);
  return { ok: true, id, message: submit === "review" ? "Submitted for review. An admin with publishing rights will approve it." : "Draft saved." };
}

export async function draftQuestionsWithAI(input: { lessonId: string; focus: string; count: number }): Promise<{ ok: true; draft: string; label: string } | { ok: false; error: string }> {
  const user = await guard("assessments.manage");
  if (!isUser(user)) return { ok: false, error: user.ok ? "" : user.error };
  const lessonId = String(input?.lessonId ?? "").slice(0, 80);
  const allowed = lessonsForCourses(facultyScope(user.id).courseIds);
  const lesson = allowed.find((l) => l.id === lessonId);
  if (!lesson) return { ok: false, error: "Choose a lesson from one of your courses." };
  const count = Math.max(1, Math.min(10, int(input?.count) || 3));
  const focus = String(input?.focus ?? "").trim().slice(0, 300);
  const res = await askAI(user, {
    purpose: "faculty.quiz_draft",
    contextId: lesson.id,
    prompt: `Draft ${count} multiple-choice practice questions for medical coding students on this lesson${focus ? `, focusing on: ${focus}` : ""}. For each, give the question, four options, the correct option, and a one-line explanation. Use fictional examples only.`,
  });
  if (!res.ok) return { ok: false, error: res.reason };
  return { ok: true, draft: res.draft, label: res.label };
}

/* ------------------------------------------------------------------ */
/* Content studio                                                      */
/* ------------------------------------------------------------------ */

const ACADEMIC_KINDS: T.ContentKind[] = ["lesson", "video", "document", "resource", "assignment", "quiz", "practice_case", "lab_case"];

export async function createContentItem(_: FormState, form: FormData): Promise<FormState> {
  const user = await guard("content.manage");
  if (!isUser(user)) return user;
  const title = clip(form.get("title"), 140);
  const kind = clip(form.get("kind"), 30) as T.ContentKind;
  const courseId = clip(form.get("courseId"), 60);
  const fe: Record<string, string> = {};
  if (title.length < 4) fe.title = "Give it a title (at least 4 characters).";
  if (!ACADEMIC_KINDS.includes(kind)) fe.kind = "Choose what you’re creating.";
  if (!isMyCourse(user.id, courseId)) fe.courseId = "Choose one of your courses.";
  if (Object.keys(fe).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fe };
  const item: T.ContentItem = { id: newId("cnt"), area: "academic", kind, title, status: "draft", ownerId: user.id, courseId, updatedAt: new Date().toISOString(), aiAssisted: false };
  db().content.unshift(item);
  await audit({ user, action: "course.content.created", objectType: "ContentItem", objectId: item.id, meta: { kind, courseId } });
  revalidatePath("/academy/faculty/content");
  return { ok: true, id: item.id, message: `“${title}” created as a draft.` };
}

const TRANSITIONS: Record<string, { from: T.PublishState[]; to: T.PublishState; action: string }> = {
  submit: { from: ["draft"], to: "review", action: "course.content.submitted" },
  withdraw: { from: ["review"], to: "draft", action: "course.content.withdrawn" },
  archive: { from: ["draft", "review", "approved", "published"], to: "archived", action: "course.content.archived" },
  restore: { from: ["archived"], to: "draft", action: "course.content.restored" },
};

export async function transitionContent(form: FormData): Promise<void> {
  const user = await guard("content.manage");
  if (!isUser(user)) return;
  const item = db().content.find((c) => c.id === clip(form.get("id"), 80));
  const t = TRANSITIONS[clip(form.get("to"), 20)];
  if (!item || !t || item.area !== "academic" || !isMyCourse(user.id, item.courseId)) {
    await audit({ user, action: "course.content.transition", objectType: "ContentItem", objectId: item?.id ?? null, result: "denied" });
    return;
  }
  if (!t.from.includes(item.status)) return;
  const from = item.status;
  item.status = t.to;
  item.updatedAt = new Date().toISOString();
  await audit({ user, action: t.action, objectType: "ContentItem", objectId: item.id, meta: { from, to: t.to } });
  revalidatePath("/academy/faculty/content");
  revalidatePath("/academy/faculty");
}

/* ------------------------------------------------------------------ */
/* Announcements                                                       */
/* ------------------------------------------------------------------ */

export async function publishAnnouncement(_: FormState, form: FormData): Promise<FormState> {
  const user = await guard("communications.send");
  if (!isUser(user)) return user;
  const title = clip(form.get("title"), 120);
  const body = clip(form.get("body"), 1500);
  const target = clip(form.get("audience"), 60);
  const fe: Record<string, string> = {};
  if (title.length < 4) fe.title = "Add a short headline (at least 4 characters).";
  if (body.length < 10) fe.body = "Write the message (at least 10 characters).";
  const { batches } = facultyScope(user.id);
  const targets = target === "all" ? batches.filter((b) => b.status !== "completed") : batches.filter((b) => b.id === target);
  if (!targets.length) fe.audience = "Choose one of your batches, or all your students.";
  if (Object.keys(fe).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fe };

  // One record per batch so each announcement is scoped to students the author actually teaches.
  const createdAt = new Date().toISOString();
  const ids: string[] = [];
  for (const b of targets) {
    const id = newId("ann");
    ids.push(id);
    db().announcements.unshift({ id, title, body, audience: "batch", batchId: b.id, createdBy: user.id, createdAt });
  }
  const studentIds = Array.from(new Set(targets.flatMap((b) => b.studentIds)));
  const notified = notifyStudents("announcement.published", "announcements", studentIds, title, body, "/academy/student");
  await emit("announcement.published", { studentIds, vars: { announcement_title: title }, href: "/academy/student" });
  await audit({ user, action: "announcement.published", objectType: "Announcement", objectId: ids[0], meta: { batches: targets.map((b) => b.id).join(","), recipients: studentIds.length } });
  revalidatePath("/academy/faculty/announcements");
  revalidatePath("/academy/faculty");
  return { ok: true, message: `Published to ${targets.length === 1 ? targets[0].name : `${targets.length} batches`} — ${notified} student${notified === 1 ? "" : "s"} notified in the app.` };
}
