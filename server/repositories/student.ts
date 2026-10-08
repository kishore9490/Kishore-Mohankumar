import "server-only";
import { db } from "@/server/db/store";
import type * as T from "@/lib/platform/types";
import {
  attendanceRate, batchById, courseById, courseOutline, courseProgress, enrollmentFor, istDay, programById, progressMap,
  studentAssessments, userName,
} from "./learning";

/**
 * Student read models. Every function is scoped to the given student and only
 * returns records from the program they are actively enrolled in.
 */

/* ------------------------------------------------------------------ */
/* Per-user in-memory stores (demo only — PostgreSQL tables later)     */
/* ------------------------------------------------------------------ */

const g = globalThis as unknown as {
  __emcLessonNotes?: Map<string, { text: string; updatedAt: string }>;
  __emcAttemptStarts?: Map<string, string>;
};

/** Personal lesson notes keyed by `${userId}:${lessonId}`. */
export function lessonNotesStore() {
  if (!g.__emcLessonNotes) g.__emcLessonNotes = new Map();
  return g.__emcLessonNotes;
}

/** Server-recorded start time of an in-progress assessment attempt, keyed by `${userId}:${assessmentId}`. */
export function attemptStartsStore() {
  if (!g.__emcAttemptStarts) g.__emcAttemptStarts = new Map();
  return g.__emcAttemptStarts;
}

export function lessonNote(userId: string, lessonId: string) {
  return lessonNotesStore().get(`${userId}:${lessonId}`) ?? null;
}

/** Grace period after the timer ends, to absorb network latency on auto-submit. */
export const ATTEMPT_GRACE_SEC = 90;

export function activeAttemptStart(userId: string, assessment: T.Assessment) {
  const startedAt = attemptStartsStore().get(`${userId}:${assessment.id}`);
  if (!startedAt) return null;
  const deadline = new Date(startedAt).getTime() + (assessment.durationMin * 60 + ATTEMPT_GRACE_SEC) * 1000;
  return deadline > Date.now() ? startedAt : null;
}

/* ------------------------------------------------------------------ */
/* Program & courses                                                   */
/* ------------------------------------------------------------------ */

export function enrolledCourseIds(userId: string) {
  const e = enrollmentFor(userId);
  return e ? programById(e.programId)?.courseIds ?? [] : [];
}

export function canAccessCourse(userId: string, courseId: string) {
  const c = courseById(courseId);
  return !!c && c.status === "published" && enrolledCourseIds(userId).includes(courseId);
}

export type CourseState = "not_started" | "in_progress" | "completed";

export function myCourses(userId: string) {
  const pm = progressMap(userId);
  return enrolledCourseIds(userId)
    .map((id) => courseById(id))
    .filter((c): c is T.Course => !!c && c.status === "published")
    .map((course) => {
      const outline = courseOutline(course.id);
      const lessons = outline.flatMap((o) => o.lessons);
      const prog = courseProgress(userId, course.id);
      const next = lessons.find((l) => pm.get(l.id)?.status === "in_progress") ?? lessons.find((l) => pm.get(l.id)?.status !== "completed") ?? null;
      const currentModule = next ? outline.find((o) => o.module.id === next.moduleId)?.module ?? null : outline.at(-1)?.module ?? null;
      const state: CourseState = prog.total && prog.done === prog.total ? "completed" : prog.done > 0 || lessons.some((l) => pm.has(l.id)) ? "in_progress" : "not_started";
      return {
        course,
        faculty: course.facultyIds.map((f) => userName(f)),
        outline: outline.map((o) => ({
          module: o.module,
          lessons: o.lessons.map((l) => ({ lesson: l, status: pm.get(l.id)?.status ?? ("not_started" as T.ProgressStatus) })),
          done: o.lessons.filter((l) => pm.get(l.id)?.status === "completed").length,
        })),
        progress: prog,
        next,
        currentModule,
        state,
        minutes: lessons.reduce((s, l) => s + l.durationMin, 0),
      };
    });
}

/** Everything the course player needs, or null when the student may not open this lesson. */
export function lessonContext(userId: string, courseId: string, lessonId: string) {
  if (!canAccessCourse(userId, courseId)) return null;
  const course = courseById(courseId)!;
  const outline = courseOutline(courseId);
  const flat = outline.flatMap((o) => o.lessons);
  const index = flat.findIndex((l) => l.id === lessonId);
  if (index < 0) return null;
  const lesson = flat[index];
  const module = outline.find((o) => o.module.id === lesson.moduleId)!.module;
  const pm = progressMap(userId);
  const assessments = db().assessments.filter((a) => a.courseId === courseId && a.status === "published");
  const now = Date.now();
  const quiz =
    assessments.find((a) => new Date(a.opensAt).getTime() <= now && new Date(a.closesAt).getTime() >= now) ?? assessments[0] ?? null;
  return {
    course,
    program: programById(course.programId)!,
    module,
    lesson,
    progress: pm.get(lesson.id) ?? null,
    prev: flat[index - 1] ?? null,
    next: flat[index + 1] ?? null,
    position: { index: index + 1, total: flat.length },
    outline: outline.map((o) => ({
      module: o.module,
      lessons: o.lessons.map((l) => ({ id: l.id, title: l.title, type: l.type, durationMin: l.durationMin, status: pm.get(l.id)?.status ?? ("not_started" as T.ProgressStatus) })),
    })),
    courseProgress: courseProgress(userId, courseId),
    quiz,
  };
}

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

/** What the browser may see of a question before submission — never `correct` or `acceptedAnswers`. */
export interface PublicQuestion {
  id: string;
  type: T.QuestionType;
  prompt: string;
  scenario: string | null;
  options: string[];
  points: number;
}

export function publicQuestions(a: T.Assessment): PublicQuestion[] {
  return a.questions.map((q) => ({ id: q.id, type: q.type, prompt: q.prompt, scenario: q.scenario ?? null, options: q.options, points: q.points }));
}

export function assessmentForStudent(userId: string, assessmentId: string) {
  return studentAssessments(userId).find((x) => x.assessment.id === assessmentId) ?? null;
}

export function attemptForStudent(userId: string, attemptId: string) {
  return db().attempts.find((a) => a.id === attemptId && a.studentId === userId) ?? null;
}

/** Server-side grading. Used by the submit action and the result page. */
export function gradeQuestion(q: T.Question, answer: number[] | string | undefined) {
  if (answer === undefined) return { correct: false, earned: 0, answered: false };
  if (q.type === "short") {
    const given = typeof answer === "string" ? answer.trim().toLowerCase().replace(/\s+/g, " ") : "";
    const ok = !!given && (q.acceptedAnswers ?? []).some((a) => a.trim().toLowerCase() === given);
    return { correct: ok, earned: ok ? q.points : 0, answered: !!given };
  }
  const picked = Array.isArray(answer) ? [...new Set(answer)].sort((a, b) => a - b) : [];
  const expected = [...q.correct].sort((a, b) => a - b);
  const ok = picked.length === expected.length && picked.every((v, i) => v === expected[i]);
  return { correct: ok, earned: ok ? q.points : 0, answered: picked.length > 0 };
}

/* ------------------------------------------------------------------ */
/* Performance                                                         */
/* ------------------------------------------------------------------ */

export function performanceFor(userId: string) {
  const courses = myCourses(userId);
  const assessments = studentAssessments(userId);
  const attempts = db()
    .attempts.filter((a) => a.studentId === userId)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const scores = attempts.map((a) => ({
    label: new Date(a.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }),
    value: Math.round((a.score / Math.max(1, a.maxScore)) * 100),
    title: db().assessments.find((x) => x.id === a.assessmentId)?.title ?? "Assessment",
  }));

  // Tag accuracy from recorded answers only.
  const tags = new Map<string, { right: number; total: number }>();
  let answered = 0;
  for (const at of attempts) {
    const a = db().assessments.find((x) => x.id === at.assessmentId);
    if (!a || !Object.keys(at.answers).length) continue;
    for (const q of a.questions) {
      const r = gradeQuestion(q, at.answers[q.id]);
      answered++;
      for (const t of q.tags) {
        const v = tags.get(t) ?? { right: 0, total: 0 };
        v.total++;
        if (r.correct) v.right++;
        tags.set(t, v);
      }
    }
  }
  const tagRows = [...tags.entries()]
    .filter(([, v]) => v.total >= 2)
    .map(([tag, v]) => ({ tag, accuracy: Math.round((v.right / v.total) * 100), total: v.total }))
    .sort((a, b) => b.accuracy - a.accuracy);

  // Activity: lessons touched or assessments submitted, last 14 days (IST).
  const activeDays = new Set<string>([
    ...db().progress.filter((p) => p.userId === userId).map((p) => istDay(p.updatedAt)),
    ...attempts.map((a) => istDay(a.submittedAt)),
  ]);
  const activity = Array.from({ length: 14 }, (_, i) => activeDays.has(istDay(new Date(Date.now() - (13 - i) * 86400000))));

  const totalLessons = courses.reduce((s, c) => s + c.progress.total, 0);
  const doneLessons = courses.reduce((s, c) => s + c.progress.done, 0);
  const scored = assessments.filter((a) => a.best);
  return {
    courses,
    completion: totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0,
    doneLessons,
    totalLessons,
    scores,
    averageScore: scored.length ? Math.round(scored.reduce((s, a) => s + (a.best!.score / a.best!.maxScore) * 100, 0) / scored.length) : null,
    assessmentsTaken: scored.length,
    attendance: attendanceRate(userId),
    attendanceCounts: attendanceCounts(userId),
    activity,
    strengths: tagRows.filter((t) => t.accuracy >= 70).slice(0, 4),
    improve: tagRows.filter((t) => t.accuracy < 70).reverse().slice(0, 4),
    answeredQuestions: answered,
  };
}

function attendanceCounts(userId: string) {
  const rows = db().attendance.filter((a) => a.studentId === userId);
  const c = { present: 0, late: 0, absent: 0, excused: 0 };
  for (const r of rows) c[r.status]++;
  return { ...c, total: rows.length };
}

/* ------------------------------------------------------------------ */
/* Certificates & messages                                             */
/* ------------------------------------------------------------------ */

export function myCertificates(userId: string) {
  return db()
    .certificates.filter((c) => c.studentId === userId)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
    .map((c) => ({
      certificate: c,
      program: programById(c.programId),
      template: db().certificateTemplates.find((t) => t.id === c.templateId) ?? null,
      holder: userName(c.studentId),
    }));
}

/** Public verification view — deliberately minimal personal data. */
export function verifyCertificate(id: string) {
  const c = db().certificates.find((x) => x.id === id.trim().toUpperCase());
  if (!c) return null;
  const name = userName(c.studentId).replace(/^Dr\.\s*/, "").split(" ");
  return {
    id: c.id,
    status: c.status,
    holder: `${name[0]}${name[1] ? ` ${name[1][0]}.` : ""}`,
    program: programById(c.programId)?.name ?? "EMC program",
    template: db().certificateTemplates.find((t) => t.id === c.templateId)?.name ?? "EMC course certificate",
    issuedAt: c.issuedAt,
  };
}

export function myFaculty(userId: string) {
  const e = enrollmentFor(userId);
  const b = e ? batchById(e.batchId) : null;
  if (!b) return { batch: null, faculty: [] as { id: string; name: string; title: string | null }[] };
  return {
    batch: b,
    faculty: b.facultyIds
      .map((id) => db().users.find((u) => u.id === id && u.status === "active"))
      .filter((u): u is T.User => !!u)
      .map((u) => ({ id: u.id, name: u.name, title: u.title })),
  };
}

export function myCommunications(userId: string) {
  return db()
    .communications.filter((c) => c.studentId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
