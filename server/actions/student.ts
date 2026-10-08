"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission, AuthError } from "@/server/auth/session";
import { db, newId } from "@/server/db/store";
import { audit } from "@/server/services/audit";
import { askAI } from "@/server/services/ai";
import { emit } from "@/server/events/bus";
import { UPLOAD_RULES } from "@/integrations/storage";
import { enrollmentFor, studentAssignments } from "@/server/repositories/learning";
import {
  activeAttemptStart, assessmentForStudent, attemptStartsStore, ATTEMPT_GRACE_SEC, gradeQuestion, lessonContext, lessonNotesStore, myFaculty,
} from "@/server/repositories/student";

/**
 * Student server actions. Every action re-checks `learning.access`, scopes the
 * target record to the signed-in student, validates and clips input, audits,
 * then revalidates.
 */

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const clip = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function student() {
  try {
    return await assertPermission("learning.access");
  } catch (e) {
    if (e instanceof AuthError) return null;
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/* Course player                                                       */
/* ------------------------------------------------------------------ */

/** Marks a lesson complete and moves on to the next one (or back to My learning). */
export async function completeLesson(courseId: string, lessonId: string) {
  const user = await assertPermission("learning.access");
  const ctx = lessonContext(user.id, String(courseId).slice(0, 80), String(lessonId).slice(0, 80));
  if (!ctx) throw new Error("Lesson not available.");
  const now = new Date().toISOString();
  const row = db().progress.find((p) => p.userId === user.id && p.lessonId === ctx.lesson.id);
  if (row) Object.assign(row, { status: "completed", percent: 100, updatedAt: now });
  else db().progress.push({ userId: user.id, lessonId: ctx.lesson.id, status: "completed", percent: 100, positionSec: 0, updatedAt: now });
  await audit({ user, action: "lesson.completed", objectType: "Lesson", objectId: ctx.lesson.id, meta: { courseId: ctx.course.id } });
  revalidatePath("/academy/student", "layout");
  redirect(ctx.next ? `/academy/student/learn/${ctx.course.id}/${ctx.next.id}` : `/academy/student/learning#${ctx.course.id}`);
}

const MAX_NOTE = 4000;

export async function saveLessonNote(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await student();
  if (!user) return { ok: false, error: "Please sign in again." };
  const courseId = clip(form.get("courseId"), 80);
  const lessonId = clip(form.get("lessonId"), 80);
  if (!lessonContext(user.id, courseId, lessonId)) return { ok: false, error: "This lesson isn’t available to you." };
  const text = clip(form.get("note"), MAX_NOTE);
  const key = `${user.id}:${lessonId}`;
  if (text) lessonNotesStore().set(key, { text, updatedAt: new Date().toISOString() });
  else lessonNotesStore().delete(key);
  await audit({ user, action: "lesson.note_saved", objectType: "Lesson", objectId: lessonId, meta: { length: text.length } });
  return { ok: true, message: text ? "Note saved" : "Note cleared" };
}

export async function askLessonAssistant(
  _prev: { ok: boolean; text?: string; error?: string } | null,
  form: FormData,
): Promise<{ ok: true; text: string; label: string } | { ok: false; error: string }> {
  const user = await student();
  if (!user) return { ok: false, error: "Please sign in again." };
  const courseId = clip(form.get("courseId"), 80);
  const lessonId = clip(form.get("lessonId"), 80);
  const prompt = clip(form.get("prompt"), 1000);
  if (prompt.length < 3) return { ok: false, error: "Type a question about this lesson first." };
  if (!lessonContext(user.id, courseId, lessonId)) return { ok: false, error: "This lesson isn’t available to you." };
  const res = await askAI(user, { purpose: "tutor.explain_lesson", contextId: lessonId, prompt });
  return res.ok ? { ok: true, text: res.draft, label: res.label } : { ok: false, error: res.reason };
}

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

function windowError(a: NonNullable<ReturnType<typeof assessmentForStudent>>) {
  const now = Date.now();
  if (new Date(a.assessment.opensAt).getTime() > now) return "This assessment hasn’t opened yet.";
  if (new Date(a.assessment.closesAt).getTime() < now) return "This assessment has closed.";
  if (a.attempts.length >= a.assessment.maxAttempts) return "You have used all your attempts.";
  return null;
}

/** Starts (or resumes) an attempt. The start time is recorded on the server, not trusted from the browser. */
export async function startAssessment(assessmentId: string): Promise<{ ok: true; startedAt: string; durationMin: number } | { ok: false; error: string }> {
  const user = await student();
  if (!user) return { ok: false, error: "Please sign in again." };
  const a = assessmentForStudent(user.id, String(assessmentId).slice(0, 80));
  if (!a) return { ok: false, error: "Assessment not found." };
  const err = windowError(a);
  if (err) return { ok: false, error: err };
  let startedAt = activeAttemptStart(user.id, a.assessment);
  if (!startedAt) {
    startedAt = new Date().toISOString();
    attemptStartsStore().set(`${user.id}:${a.assessment.id}`, startedAt);
    await audit({ user, action: "assessment.started", objectType: "Assessment", objectId: a.assessment.id });
  }
  return { ok: true, startedAt, durationMin: a.assessment.durationMin };
}

export async function submitAssessment(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const user = await student();
  if (!user) return { ok: false, error: "Please sign in again." };
  const assessmentId = clip(form.get("assessmentId"), 80);
  const a = assessmentForStudent(user.id, assessmentId);
  if (!a) return { ok: false, error: "Assessment not found." };
  const err = windowError(a);
  if (err) return { ok: false, error: err };
  const startedAt = attemptStartsStore().get(`${user.id}:${a.assessment.id}`);
  if (!startedAt) return { ok: false, error: "Start the assessment before submitting." };
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
  if (elapsed > a.assessment.durationMin * 60 + ATTEMPT_GRACE_SEC) {
    attemptStartsStore().delete(`${user.id}:${a.assessment.id}`);
    return { ok: false, error: "The time limit for this attempt has passed. Start a new attempt if you have any left." };
  }

  // Parse answers defensively: only known question ids, only valid option indices.
  let raw: unknown = {};
  try {
    raw = JSON.parse(clip(form.get("answers"), 20000) || "{}");
  } catch {
    return { ok: false, error: "We couldn’t read your answers. Please try again." };
  }
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const answers: Record<string, number[] | string> = {};
  for (const q of a.assessment.questions) {
    const v = input[q.id];
    if (q.type === "short") {
      if (typeof v === "string" && v.trim()) answers[q.id] = v.trim().slice(0, 200);
    } else if (Array.isArray(v)) {
      const idx = [...new Set(v.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < q.options.length))];
      const allowed = q.type === "multiple" ? idx : idx.slice(0, 1);
      if (allowed.length) answers[q.id] = allowed;
    }
  }

  let score = 0;
  const maxScore = a.assessment.questions.reduce((s, q) => s + q.points, 0);
  for (const q of a.assessment.questions) score += gradeQuestion(q, answers[q.id]).earned;

  const attempt = {
    id: newId("att"), assessmentId: a.assessment.id, studentId: user.id, answers, score, maxScore, startedAt, submittedAt: new Date().toISOString(),
  };
  db().attempts.push(attempt);
  attemptStartsStore().delete(`${user.id}:${a.assessment.id}`);
  const percent = Math.round((score / Math.max(1, maxScore)) * 100);
  await audit({ user, action: "assessment.submitted", objectType: "Attempt", objectId: attempt.id, meta: { assessmentId: a.assessment.id, score, maxScore } });
  await emit("assessment.completed", {
    studentIds: [user.id],
    vars: { assessment_title: a.assessment.title, score: `${percent}%` },
    href: `/academy/student/assessments/${a.assessment.id}/result/${attempt.id}`,
  });
  revalidatePath("/academy/student", "layout");
  redirect(`/academy/student/assessments/${a.assessment.id}/result/${attempt.id}`);
}

/* ------------------------------------------------------------------ */
/* Assignments                                                         */
/* ------------------------------------------------------------------ */

const OPEN_FOR_SUBMISSION = ["not_started", "in_progress", "returned"];

export async function submitAssignment(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await student();
  if (!user) return { ok: false, error: "Please sign in again." };
  const assignmentId = clip(form.get("assignmentId"), 80);
  const row = studentAssignments(user.id).find((x) => x.assignment.id === assignmentId);
  if (!row) return { ok: false, error: "Assignment not found." };
  if (row.submission && !OPEN_FOR_SUBMISSION.includes(row.submission.status)) return { ok: false, error: "This assignment has already been submitted." };

  const text = clip(form.get("text"), 8000);
  const fileName = clip(form.get("fileName"), 160).replace(/[^\w.\- ()]/g, "_");
  const fileType = clip(form.get("fileType"), 120);
  const fileSize = Number(clip(form.get("fileSize"), 20));
  const rules = UPLOAD_RULES.submission;
  if (fileName) {
    if (!(rules.types as readonly string[]).includes(fileType)) return { ok: false, error: "That file type isn’t accepted. Use PDF, Word (.docx), PNG or JPEG." };
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > rules.maxBytes) return { ok: false, error: `Files must be under ${rules.maxBytes / 1024 / 1024} MB.` };
  }
  if (text.length < 20 && !fileName) return { ok: false, error: "Write your answer (at least 20 characters) or attach a file." };

  const now = new Date().toISOString();
  const files = fileName ? [{ name: fileName, storageKey: `submissions/${assignmentId}/${user.id}/${Date.now()}-${fileName}`, sizeKb: Math.ceil(fileSize / 1024) }] : [];
  if (row.submission) {
    Object.assign(row.submission, {
      status: "submitted", text, submittedAt: now,
      files: files.length ? files : row.submission.files,
      revision: row.submission.status === "returned" ? row.submission.revision + 1 : row.submission.revision,
    });
  } else {
    db().submissions.push({
      id: newId("sub"), assignmentId, studentId: user.id, status: "submitted", text, files, submittedAt: now, score: null, feedback: null, reviewedBy: null, revision: 0,
    });
  }
  await audit({ user, action: "assignment.submitted", objectType: "Assignment", objectId: assignmentId, meta: { files: files.length, chars: text.length } });
  revalidatePath("/academy/student", "layout");
  return { ok: true, message: "Submitted. Your faculty will review it and you’ll be notified when feedback is ready." };
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export async function messageFaculty(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await student();
  if (!user) return { ok: false, error: "Please sign in again." };
  const subject = clip(form.get("subject"), 120);
  const body = clip(form.get("body"), 2000);
  const to = clip(form.get("facultyId"), 80);
  if (subject.length < 3) return { ok: false, error: "Add a short subject." };
  if (body.length < 10) return { ok: false, error: "Your message is too short." };
  const { faculty } = myFaculty(user.id);
  if (!faculty.length || !enrollmentFor(user.id)) return { ok: false, error: "You don’t have a batch faculty to message yet." };
  const recipients = to === "all" || !to ? faculty : faculty.filter((f) => f.id === to);
  if (!recipients.length) return { ok: false, error: "Choose one of your faculty." };

  const now = new Date().toISOString();
  for (const f of recipients) {
    db().notifications.unshift({
      id: newId("ntf"), userId: f.id, category: "learning", title: `Message from ${user.name}: ${subject}`, body: body.slice(0, 600),
      href: "/academy/faculty/students", createdAt: now, readAt: null,
    });
  }
  db().communications.unshift({
    id: newId("com"), userId: user.id, leadId: null, studentId: user.id, channel: "in_app", provider: "in_app", templateId: null, direction: "inbound",
    status: "delivered", providerMessageId: null, preview: `To ${recipients.map((r) => r.name).join(", ")} — ${subject}: ${body}`.slice(0, 140),
    contentReference: null, event: "student.message", createdAt: now, deliveredAt: now, readAt: null, failedAt: null, error: null,
  });
  await audit({ user, action: "message.sent", objectType: "Message", objectId: null, meta: { recipients: recipients.length, channel: "in_app" } });
  revalidatePath("/academy/student/messages");
  return { ok: true, message: `Sent to ${recipients.map((r) => r.name).join(", ")}.` };
}
