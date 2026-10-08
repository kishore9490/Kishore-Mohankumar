import "server-only";
import { db } from "@/server/db/store";
import type * as T from "@/lib/platform/types";

/**
 * Read models for learning. Screens call these; they never touch the store.
 * Each function returns only what the caller's screen needs.
 */

export const userById = (id: string) => db().users.find((u) => u.id === id);
export const userName = (id: string | null | undefined) => (id ? userById(id)?.name ?? "—" : "—");
export const courseById = (id: string) => db().courses.find((c) => c.id === id);
export const programById = (id: string) => db().programs.find((p) => p.id === id);
export const batchById = (id: string) => db().batches.find((b) => b.id === id);

export function enrollmentFor(studentId: string) {
  return db().enrollments.find((e) => e.studentId === studentId && e.status === "active") ?? null;
}

/** Ordered lessons for a course (module order, then lesson order). */
export function courseOutline(courseId: string) {
  const d = db();
  return d.modules
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.order - b.order)
    .map((m) => ({ module: m, lessons: d.lessons.filter((l) => l.moduleId === m.id && l.status === "published").sort((a, b) => a.order - b.order) }));
}

export function programLessons(programId: string) {
  const p = programById(programId);
  if (!p) return [];
  return p.courseIds.flatMap((cid) => courseOutline(cid).flatMap((o) => o.lessons));
}

export function progressMap(userId: string) {
  const m = new Map<string, T.LessonProgress>();
  for (const p of db().progress) if (p.userId === userId) m.set(p.lessonId, p);
  return m;
}

export function courseProgress(userId: string, courseId: string) {
  const lessons = courseOutline(courseId).flatMap((o) => o.lessons);
  const pm = progressMap(userId);
  const done = lessons.filter((l) => pm.get(l.id)?.status === "completed").length;
  const last = lessons.map((l) => pm.get(l.id)?.updatedAt).filter(Boolean).sort().at(-1) ?? null;
  return { total: lessons.length, done, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0, lastActivity: last };
}

/** The single most important answer: what should this student do next? */
export function nextStep(userId: string) {
  const e = enrollmentFor(userId);
  if (!e) return null;
  const pm = progressMap(userId);
  const lessons = programLessons(e.programId);
  const lesson = lessons.find((l) => pm.get(l.id)?.status === "in_progress") ?? lessons.find((l) => pm.get(l.id)?.status !== "completed");
  if (!lesson) return null;
  const mod = db().modules.find((m) => m.id === lesson.moduleId)!;
  const course = courseById(mod.courseId)!;
  const p = pm.get(lesson.id);
  const remaining = Math.max(1, Math.round(lesson.durationMin * (1 - (p?.percent ?? 0) / 100)));
  return { lesson, module: mod, course, remainingMin: remaining, started: !!p, href: `/academy/student/learn/${course.id}/${lesson.id}` };
}

export function programProgress(userId: string) {
  const e = enrollmentFor(userId);
  if (!e) return null;
  const lessons = programLessons(e.programId);
  const pm = progressMap(userId);
  const done = lessons.filter((l) => pm.get(l.id)?.status === "completed").length;
  return { program: programById(e.programId)!, batch: batchById(e.batchId)!, total: lessons.length, done, percent: Math.round((done / Math.max(1, lessons.length)) * 100) };
}

export function studentAssignments(userId: string) {
  const e = enrollmentFor(userId);
  const courseIds = e ? programById(e.programId)?.courseIds ?? [] : [];
  return db()
    .assignments.filter((a) => courseIds.includes(a.courseId))
    .map((a) => ({
      assignment: a,
      course: courseById(a.courseId)!,
      module: db().modules.find((m) => m.id === a.moduleId)!,
      submission: db().submissions.find((s) => s.assignmentId === a.id && s.studentId === userId) ?? null,
    }))
    .sort((x, y) => x.assignment.dueAt.localeCompare(y.assignment.dueAt));
}

export function studentAssessments(userId: string) {
  const e = enrollmentFor(userId);
  const courseIds = e ? programById(e.programId)?.courseIds ?? [] : [];
  const now = Date.now();
  return db()
    .assessments.filter((a) => courseIds.includes(a.courseId) && a.status === "published")
    .map((a) => {
      const attempts = db().attempts.filter((t) => t.assessmentId === a.id && t.studentId === userId);
      const best = attempts.reduce<T.Attempt | null>((b, t) => (!b || t.score / t.maxScore > b.score / b.maxScore ? t : b), null);
      const open = new Date(a.opensAt).getTime() <= now && new Date(a.closesAt).getTime() >= now;
      const upcoming = new Date(a.opensAt).getTime() > now;
      const maxScore = a.questions.reduce((s, q) => s + q.points, 0);
      const status: "upcoming" | "open" | "completed" | "missed" | "closed" =
        upcoming ? "upcoming" : best && (!open || attempts.length >= a.maxAttempts) ? "completed" : open ? "open" : best ? "completed" : "missed";
      return { assessment: a, course: courseById(a.courseId)!, attempts, best, open, status, maxScore };
    })
    .sort((x, y) => x.assessment.opensAt.localeCompare(y.assessment.opensAt));
}

export function sessionsForBatch(batchId: string) {
  return db().sessions.filter((s) => s.batchId === batchId).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** Calendar-day comparison in India Standard Time. */
export const istDay = (iso: string | Date) => new Date(new Date(iso).getTime() + 330 * 60000).toISOString().slice(0, 10);
export function isSameDay(iso: string, d = new Date()) {
  return istDay(iso) === istDay(d);
}

export function attendanceRate(studentId: string) {
  const rows = db().attendance.filter((a) => a.studentId === studentId);
  if (!rows.length) return null;
  return Math.round((rows.filter((r) => r.status === "present" || r.status === "late").length / rows.length) * 100);
}

/** Consecutive days with learning activity, ending today or yesterday. */
export function learningStreak(userId: string) {
  const days = new Set(db().progress.filter((p) => p.userId === userId).map((p) => p.updatedAt.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const x = new Date();
    x.setDate(x.getDate() - (6 - i));
    return days.has(x.toISOString().slice(0, 10));
  });
  return { streak, week };
}

export function calendarFor(userId: string): T.CalendarEvent[] {
  const e = enrollmentFor(userId);
  if (!e) return [];
  const events: T.CalendarEvent[] = sessionsForBatch(e.batchId).map((s) => ({
    id: s.id, title: s.title, kind: "class", startsAt: s.startsAt, endsAt: new Date(new Date(s.startsAt).getTime() + s.durationMin * 60000).toISOString(),
    href: null, meta: `${userName(s.facultyId)} · ${s.mode === "online" ? "Online" : "Classroom"}`,
  }));
  for (const a of studentAssignments(userId)) events.push({ id: a.assignment.id, title: a.assignment.title, kind: "assignment", startsAt: a.assignment.dueAt, endsAt: null, href: "/academy/student/assignments", meta: "Assignment due" });
  for (const a of studentAssessments(userId)) events.push({ id: a.assessment.id, title: a.assessment.title, kind: "assessment", startsAt: a.assessment.opensAt, endsAt: a.assessment.closesAt, href: "/academy/student/assessments", meta: `${a.assessment.durationMin} min · ${a.assessment.kind}` });
  const b = batchById(e.batchId);
  if (b) events.push({ id: "evt_batch_end", title: "Program end date", kind: "deadline", startsAt: b.endDate, endsAt: null, href: null, meta: b.name });
  events.push({ id: "evt_career", title: "Career guidance webinar", kind: "event", startsAt: new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 11) + "13:30:00.000Z", endsAt: null, href: null, meta: "Academy event" });
  return events.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function announcementsFor(user: { id: string; role: T.RoleKey }) {
  const e = user.role === "student" ? enrollmentFor(user.id) : null;
  return db()
    .announcements.filter((a) =>
      a.audience === "all" ||
      (user.role === "student" && (a.audience === "students" || (a.audience === "batch" && a.batchId === e?.batchId))) ||
      (user.role !== "student" && (a.audience === "faculty" || user.role === "admin")),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function notificationsFor(userId: string) {
  return db().notifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
