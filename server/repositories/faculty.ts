import "server-only";
import { db } from "@/server/db/store";
import type * as T from "@/lib/platform/types";
import { batchById, courseById, enrollmentFor, programById, programProgress, userById, userName } from "./learning";

/**
 * Faculty read models. Every function is scoped to the given faculty member:
 * they only see batches where `batch.facultyIds` includes them, students in those
 * batches, and courses where `course.facultyIds` includes them.
 */

const DAY = 86_400_000;
/** Calendar day in India Standard Time (YYYY-MM-DD). */
export const istDayOf = (iso: string | Date) => new Date(new Date(iso).getTime() + 330 * 60000).toISOString().slice(0, 10);
export const isTodayIst = (iso: string) => istDayOf(iso) === istDayOf(new Date());

/* ------------------------------------------------------------------ */
/* Scope                                                               */
/* ------------------------------------------------------------------ */

export function facultyScope(facultyId: string) {
  const d = db();
  const batches = d.batches.filter((b) => b.facultyIds.includes(facultyId));
  const courses = d.courses.filter((c) => c.facultyIds.includes(facultyId));
  const studentIds = Array.from(new Set(batches.flatMap((b) => b.studentIds)));
  return {
    batches,
    courses,
    batchIds: batches.map((b) => b.id),
    courseIds: courses.map((c) => c.id),
    studentIds,
  };
}

export type FacultyScope = ReturnType<typeof facultyScope>;

export function isMyStudent(facultyId: string, studentId: string) {
  return db().batches.some((b) => b.facultyIds.includes(facultyId) && b.studentIds.includes(studentId));
}

export function isMyCourse(facultyId: string, courseId: string | null | undefined) {
  return !!courseId && !!courseById(courseId)?.facultyIds.includes(facultyId);
}

export function isMyBatch(facultyId: string, batchId: string | null | undefined) {
  return !!batchId && !!batchById(batchId)?.facultyIds.includes(facultyId);
}

/** The batch (of mine) a student belongs to. */
export function myBatchFor(facultyId: string, studentId: string) {
  return db().batches.find((b) => b.facultyIds.includes(facultyId) && b.studentIds.includes(studentId)) ?? null;
}

/* ------------------------------------------------------------------ */
/* Classes & attendance                                                */
/* ------------------------------------------------------------------ */

/** Class sessions for the batches this faculty member teaches in. */
export function mySessions(facultyId: string) {
  const { batchIds } = facultyScope(facultyId);
  return db().sessions.filter((s) => batchIds.includes(s.batchId)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function todaysSessions(facultyId: string) {
  return mySessions(facultyId).filter((s) => isTodayIst(s.startsAt));
}

/** A session can be marked from the start of its day (IST) onwards — never for a future day. */
export function sessionMarkable(s: T.ClassSession) {
  return istDayOf(s.startsAt) <= istDayOf(new Date());
}

export function sessionAttendance(sessionId: string) {
  const session = db().sessions.find((s) => s.id === sessionId);
  const batch = session ? batchById(session.batchId) : undefined;
  const rows = db().attendance.filter((a) => a.sessionId === sessionId);
  const expected = batch?.studentIds.length ?? 0;
  const attended = rows.filter((r) => r.status === "present" || r.status === "late").length;
  return {
    marked: rows.length,
    expected,
    attended,
    rows,
    percent: rows.length ? Math.round((attended / rows.length) * 100) : null,
    counts: {
      present: rows.filter((r) => r.status === "present").length,
      late: rows.filter((r) => r.status === "late").length,
      absent: rows.filter((r) => r.status === "absent").length,
      excused: rows.filter((r) => r.status === "excused").length,
    },
  };
}

/** Daily attendance % across my batches for the last `days` days (only days with marked sessions). */
export function attendanceTrend(facultyId: string, days = 14) {
  const since = Date.now() - days * DAY;
  const sessions = mySessions(facultyId).filter((s) => new Date(s.startsAt).getTime() >= since && new Date(s.startsAt).getTime() <= Date.now());
  const byDay = new Map<string, { attended: number; marked: number; iso: string }>();
  for (const s of sessions) {
    const a = sessionAttendance(s.id);
    if (!a.marked) continue;
    const k = istDayOf(s.startsAt);
    const cur = byDay.get(k) ?? { attended: 0, marked: 0, iso: s.startsAt };
    cur.attended += a.attended;
    cur.marked += a.marked;
    byDay.set(k, cur);
  }
  const points = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ iso: v.iso, percent: Math.round((v.attended / v.marked) * 100), attended: v.attended, marked: v.marked }));
  const attended = points.reduce((s, p) => s + p.attended, 0);
  const marked = points.reduce((s, p) => s + p.marked, 0);
  return { points, overall: marked ? Math.round((attended / marked) * 100) : null, sessions: points.length };
}

/** Attendance rate for a student across sessions of my batches. */
export function studentAttendance(facultyId: string, studentId: string) {
  const sessionIds = new Set(mySessions(facultyId).map((s) => s.id));
  const rows = db().attendance.filter((a) => a.studentId === studentId && sessionIds.has(a.sessionId));
  if (!rows.length) return { rate: null as number | null, rows, total: 0 };
  const ok = rows.filter((r) => r.status === "present" || r.status === "late").length;
  return { rate: Math.round((ok / rows.length) * 100), rows, total: rows.length };
}

/* ------------------------------------------------------------------ */
/* Student insights                                                    */
/* ------------------------------------------------------------------ */

function programCourseIds(studentId: string) {
  const e = enrollmentFor(studentId);
  return e ? programById(e.programId)?.courseIds ?? [] : [];
}

export interface AttentionFlag {
  key: "attendance" | "score" | "inactive" | "overdue";
  label: string;
}

export function studentSnapshot(facultyId: string, studentId: string) {
  const d = db();
  const u = userById(studentId);
  if (!u || u.role !== "student") return null;
  const batch = myBatchFor(facultyId, studentId);
  if (!batch) return null;
  const courseIds = programCourseIds(studentId);
  const progress = programProgress(studentId);
  const attendance = studentAttendance(facultyId, studentId);

  // Assessment performance: best attempt per assessment.
  const attempts = d.attempts.filter((a) => a.studentId === studentId);
  const bestBy = new Map<string, T.Attempt>();
  for (const a of attempts) {
    const asm = d.assessments.find((x) => x.id === a.assessmentId);
    if (!asm || !courseIds.includes(asm.courseId)) continue;
    const prev = bestBy.get(a.assessmentId);
    if (!prev || a.score / a.maxScore > prev.score / prev.maxScore) bestBy.set(a.assessmentId, a);
  }
  const best = Array.from(bestBy.values());
  const avgScore = best.length ? Math.round(best.reduce((s, a) => s + (a.score / a.maxScore) * 100, 0) / best.length) : null;

  // Assignments in the student's program.
  const assignments = d.assignments
    .filter((a) => courseIds.includes(a.courseId))
    .map((a) => ({ assignment: a, submission: d.submissions.find((s) => s.assignmentId === a.id && s.studentId === studentId) ?? null }))
    .sort((x, y) => x.assignment.dueAt.localeCompare(y.assignment.dueAt));
  const now = Date.now();
  const batchStart = new Date(batch.startDate).getTime();
  const overdue = assignments.filter(
    ({ assignment: a, submission: s }) =>
      new Date(a.dueAt).getTime() < now && new Date(a.dueAt).getTime() > batchStart && (!s || s.status === "not_started" || s.status === "in_progress"),
  );

  const activity = [
    ...d.progress.filter((p) => p.userId === studentId).map((p) => p.updatedAt),
    ...attempts.map((a) => a.submittedAt),
    ...d.submissions.filter((s) => s.studentId === studentId && s.submittedAt).map((s) => s.submittedAt as string),
  ].sort();
  const lastActivity = activity.at(-1) ?? null;
  const inactiveDays = lastActivity ? Math.floor((now - new Date(lastActivity).getTime()) / DAY) : null;

  const flags: AttentionFlag[] = [];
  const active = batch.status === "active" && u.status === "active";
  if (attendance.rate !== null && attendance.rate < 75) flags.push({ key: "attendance", label: `Attendance ${attendance.rate}%` });
  if (avgScore !== null && avgScore < 60) flags.push({ key: "score", label: `Avg. score ${avgScore}%` });
  if (active && (inactiveDays === null || inactiveDays > 5)) flags.push({ key: "inactive", label: inactiveDays === null ? "No activity yet" : `Inactive ${inactiveDays} days` });
  if (active && overdue.length) flags.push({ key: "overdue", label: `${overdue.length} overdue` });

  return {
    student: { id: u.id, name: u.name, email: u.email, title: u.title, status: u.status },
    batch,
    progress,
    attendance,
    avgScore,
    best,
    assignments,
    overdue,
    lastActivity,
    inactiveDays,
    flags,
  };
}

export type StudentSnapshot = NonNullable<ReturnType<typeof studentSnapshot>>;

export function myStudents(facultyId: string) {
  return facultyScope(facultyId)
    .studentIds.map((id) => studentSnapshot(facultyId, id))
    .filter((s): s is StudentSnapshot => !!s)
    .sort((a, b) => b.flags.length - a.flags.length || a.student.name.localeCompare(b.student.name));
}

export function studentsNeedingAttention(facultyId: string) {
  return myStudents(facultyId).filter((s) => s.flags.length > 0);
}

/* ------------------------------------------------------------------ */
/* Private faculty notes (demo store — a PostgreSQL table later)       */
/* ------------------------------------------------------------------ */

export interface FacultyNote {
  id: string;
  text: string;
  createdAt: string;
}

const g = globalThis as unknown as { __emcFacultyNotes?: Map<string, FacultyNote[]> };

/** Keyed by `${facultyId}:${studentId}` — a note is only ever read back by its author. */
export function facultyNotesStore() {
  if (!g.__emcFacultyNotes) g.__emcFacultyNotes = new Map();
  return g.__emcFacultyNotes;
}

export function facultyNotes(facultyId: string, studentId: string) {
  return [...(facultyNotesStore().get(`${facultyId}:${studentId}`) ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ------------------------------------------------------------------ */
/* Assignment reviews                                                  */
/* ------------------------------------------------------------------ */

const REVIEW_ORDER: Record<T.SubmissionStatus, number> = { submitted: 0, under_review: 1, returned: 2, completed: 3, in_progress: 4, not_started: 5 };

export function reviewQueue(facultyId: string) {
  const d = db();
  const { courseIds, studentIds } = facultyScope(facultyId);
  const assignments = d.assignments.filter((a) => courseIds.includes(a.courseId));
  return d.submissions
    .filter((s) => studentIds.includes(s.studentId) && assignments.some((a) => a.id === s.assignmentId) && s.status !== "not_started" && s.status !== "in_progress")
    .map((s) => {
      const assignment = assignments.find((a) => a.id === s.assignmentId)!;
      return { submission: s, assignment, course: courseById(assignment.courseId)!, studentName: userName(s.studentId) };
    })
    .sort((a, b) => REVIEW_ORDER[a.submission.status] - REVIEW_ORDER[b.submission.status] || (a.submission.submittedAt ?? "").localeCompare(b.submission.submittedAt ?? ""));
}

export const needsReview = (s: T.Submission) => s.status === "submitted" || s.status === "under_review";

export function submissionForFaculty(facultyId: string, submissionId: string) {
  const d = db();
  const s = d.submissions.find((x) => x.id === submissionId);
  if (!s) return null;
  const assignment = d.assignments.find((a) => a.id === s.assignmentId);
  if (!assignment || !isMyCourse(facultyId, assignment.courseId) || !isMyStudent(facultyId, s.studentId)) return null;
  const student = userById(s.studentId)!;
  return {
    submission: s,
    assignment,
    course: courseById(assignment.courseId)!,
    module: d.modules.find((m) => m.id === assignment.moduleId) ?? null,
    student: { id: student.id, name: student.name, email: student.email },
    batch: myBatchFor(facultyId, s.studentId),
  };
}

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

export const assessmentMaxScore = (a: Pick<T.Assessment, "questions">) => a.questions.reduce((s, q) => s + q.points, 0);

export function myAssessments(facultyId: string) {
  const d = db();
  const { courseIds, studentIds } = facultyScope(facultyId);
  return d.assessments
    .filter((a) => courseIds.includes(a.courseId))
    .map((a) => {
      const attempts = d.attempts.filter((t) => t.assessmentId === a.id && studentIds.includes(t.studentId));
      const avg = attempts.length ? Math.round(attempts.reduce((s, t) => s + (t.score / t.maxScore) * 100, 0) / attempts.length) : null;
      const now = Date.now();
      const window: "upcoming" | "open" | "closed" =
        new Date(a.opensAt).getTime() > now ? "upcoming" : new Date(a.closesAt).getTime() < now ? "closed" : "open";
      return { assessment: a, course: courseById(a.courseId)!, attempts: attempts.length, students: new Set(attempts.map((t) => t.studentId)).size, avg, window, maxScore: assessmentMaxScore(a) };
    })
    .sort((x, y) => x.assessment.opensAt.localeCompare(y.assessment.opensAt));
}

export function assessmentForFaculty(facultyId: string, id: string) {
  const a = db().assessments.find((x) => x.id === id);
  if (!a || !isMyCourse(facultyId, a.courseId)) return null;
  return a;
}

/** Published lessons in my courses (used as AI context for quiz drafts). */
export function lessonsForCourses(courseIds: string[]) {
  const d = db();
  return d.modules
    .filter((m) => courseIds.includes(m.courseId))
    .sort((a, b) => a.order - b.order)
    .flatMap((m) => d.lessons.filter((l) => l.moduleId === m.id && l.status === "published").sort((a, b) => a.order - b.order).map((l) => ({ id: l.id, title: l.title, courseId: m.courseId, module: m.title })));
}

/* ------------------------------------------------------------------ */
/* Content studio                                                      */
/* ------------------------------------------------------------------ */

export function myContent(facultyId: string) {
  const { courseIds } = facultyScope(facultyId);
  return db()
    .content.filter((c) => c.area === "academic" && !!c.courseId && courseIds.includes(c.courseId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Full course tree for faculty — every lesson regardless of publish state. */
export function courseTree(courseId: string) {
  const d = db();
  return d.modules
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.order - b.order)
    .map((m) => ({ module: m, lessons: d.lessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.order - b.order) }));
}

/* ------------------------------------------------------------------ */
/* Announcements                                                       */
/* ------------------------------------------------------------------ */

/** Announcements that reach my students or were written by me, newest first. */
export function facultyAnnouncements(facultyId: string) {
  const { batchIds } = facultyScope(facultyId);
  return db()
    .announcements.filter((a) => a.createdBy === facultyId || (a.audience === "batch" && !!a.batchId && batchIds.includes(a.batchId)) || a.audience === "faculty" || a.audience === "all")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
