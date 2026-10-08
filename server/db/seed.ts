import "server-only";
import { scryptSync, randomBytes } from "node:crypto";
import { programs as sitePrograms } from "@/data/programs";
import { labCases } from "@/data/lab";
import type * as T from "@/lib/platform/types";
import type { DB } from "./store";

/**
 * DEMO DATA — every person, lead, score and amount below is fictional and exists
 * only so the platform can be explored before it is connected to PostgreSQL.
 * Dates are generated relative to "now" so dashboards always look current.
 */

export const DEMO_ACCOUNTS = [
  { role: "student", email: "student@demo.emc", password: "Student@2026", name: "Ananya Rao" },
  { role: "faculty", email: "faculty@demo.emc", password: "Faculty@2026", name: "Dr. Kavya Menon" },
  { role: "marketing", email: "marketing@demo.emc", password: "Growth@2026", name: "Rahul Iyer" },
  { role: "admin", email: "admin@demo.emc", password: "Admin@2026", name: "Priya Nair" },
] as const;

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$${salt.toString("base64")}$${hash.toString("base64")}`;
}

/* deterministic pseudo-random so the demo is stable between restarts */
let seed = 20261008;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = <X,>(a: readonly X[]) => a[Math.floor(rnd() * a.length)];
const int = (a: number, b: number) => Math.floor(a + rnd() * (b - a + 1));

const DAY = 86_400_000;
/** A time on a given day, expressed in India Standard Time (UTC+5:30). */
function at(daysFromNow: number, hour = 10, minute = 0) {
  const ist = new Date(Date.now() + 330 * 60000);
  ist.setUTCHours(hour, minute, 0, 0);
  return new Date(ist.getTime() - 330 * 60000 + daysFromNow * DAY).toISOString();
}

const FIRST = ["Aarav", "Diya", "Ishaan", "Meera", "Kabir", "Sneha", "Arjun", "Nila", "Rohan", "Fathima", "Vikram", "Lakshmi", "Siddharth", "Aisha", "Karthik", "Pooja", "Nikhil", "Divya", "Joel", "Harini", "Varun", "Neha", "Adil", "Sowmya", "Pranav", "Reshma", "Tanvi", "Gokul", "Ritika", "Manoj"];
const LAST = ["Sharma", "Pillai", "Reddy", "Krishnan", "Das", "Joseph", "Nair", "Varghese", "Patel", "Iyer", "Thomas", "Rao", "Menon", "Shetty", "Khan", "Gupta", "Bose", "Chandran"];
const EDU = ["B.Pharm", "B.Sc Nursing", "BDS", "B.Sc Microbiology", "BPT", "MBBS", "B.Sc Biotechnology", "M.Sc Biochemistry", "Pharm.D"];

/* ---------------- curriculum ---------------- */

const p = (text: string): T.LessonBlock => ({ type: "p", text });

const FEATURED_LESSON: Pick<T.Lesson, "summary" | "blocks"> = {
  summary: "How to find a diagnosis in the Alphabetic Index and confirm it in the Tabular List.",
  blocks: [
    p("ICD-10-CM has two parts that work together. The Alphabetic Index helps you find a candidate code from the main term the clinician documented. The Tabular List is where you confirm that code and read its instructions."),
    { type: "h", text: "The two-step rule" },
    { type: "list", items: ["Locate the main term in the Alphabetic Index — usually the condition, not the body site.", "Follow sub-terms and cross-references (see, see also) to a candidate code.", "Always verify the code in the Tabular List before assigning it.", "Read instructional notes: includes, excludes1, excludes2, code first, use additional code."] },
    { type: "example", title: "Worked example (fictional)", text: "Documentation: “acute upper respiratory infection”. Main term: Infection → respiratory → upper, acute → J06.9. In the Tabular List, J06.9 reads “Acute upper respiratory infection, unspecified”, with no conflicting notes for this record." },
    { type: "callout", text: "Never code directly from the Alphabetic Index. The Tabular List holds the instructions that can change your answer." },
    { type: "h", text: "Check your understanding" },
    p("Open the Coding Lab and try the “Sore throat & cough” case. Notice which phrases in the note decide the code, and which are symptoms that are part of the confirmed diagnosis."),
  ],
};

interface CourseSpec {
  code: string;
  title: string;
  description: string;
  modules: { title: string; lessons: [string, T.LessonType, number][] }[];
}

const CAREER_COURSES: CourseSpec[] = [
  {
    code: "MF-101",
    title: "Medical Foundations",
    description: "The language and science behind every clinical record.",
    modules: [
      { title: "Medical terminology", lessons: [["Word roots, prefixes and suffixes", "video", 22], ["Reading clinical abbreviations", "text", 15], ["Terminology drill", "quiz", 10]] },
      { title: "Anatomy & physiology", lessons: [["Body systems overview", "video", 28], ["Directional and positional terms", "slides", 18], ["Organ systems in documentation", "text", 20], ["Anatomy checkpoint", "quiz", 12]] },
      { title: "Pathology basics", lessons: [["Disease processes", "video", 24], ["Acute vs chronic conditions", "text", 16], ["Common drug classes", "pdf", 14]] },
    ],
  },
  {
    code: "ICD-201",
    title: "ICD-10-CM Diagnosis Coding",
    description: "Classify diagnoses, symptoms and reasons for encounters.",
    modules: [
      { title: "ICD Fundamentals", lessons: [["Why diagnosis codes exist", "video", 14], ["Structure of an ICD-10-CM code", "text", 16], ["Conventions and punctuation", "slides", 20], ["Placeholder characters and 7th characters", "text", 18], ["Excludes1 vs Excludes2", "interactive", 15], ["Using the Alphabetic Index and Tabular List", "video", 26], ["Fundamentals practice case", "lab", 20], ["ICD Fundamentals quiz", "quiz", 15]] },
      { title: "Guidelines in practice", lessons: [["Signs, symptoms and confirmed diagnoses", "video", 22], ["Combination codes", "text", 18], ["Sequencing basics", "slides", 20], ["Guideline practice set", "practice", 25]] },
      { title: "Chapter-specific coding", lessons: [["Respiratory conditions", "video", 24], ["Endocrine and metabolic", "video", 24], ["Circulatory system", "video", 26], ["Chapter review", "quiz", 20]] },
    ],
  },
  {
    code: "PRC-202",
    title: "CPT® & HCPCS Procedure Coding",
    description: "Report procedures, services and supplies accurately.",
    modules: [
      { title: "CPT® structure", lessons: [["Sections and guidelines", "video", 22], ["Evaluation & Management basics", "video", 30], ["Modifiers explained", "text", 20]] },
      { title: "HCPCS Level II", lessons: [["When HCPCS applies", "text", 14], ["Drugs, supplies and DME", "slides", 18], ["HCPCS practice", "practice", 20]] },
    ],
  },
  {
    code: "CPR-301",
    title: "Coding Practice & Career Readiness",
    description: "End-to-end case coding, mock assessments and career preparation.",
    modules: [
      { title: "Practical cases", lessons: [["Outpatient case set", "lab", 35], ["Specialty case set", "lab", 40]] },
      { title: "Career preparation", lessons: [["Building your coding résumé", "text", 15], ["Interview practice", "video", 20], ["Certification pathway guidance", "text", 15]] },
    ],
  },
];

const ADVANCED_COURSES: CourseSpec[] = [
  {
    code: "ADV-401",
    title: "Advanced Guidelines & Complex Cases",
    description: "Multi-diagnosis, multi-procedure cases and audit-style review.",
    modules: [
      { title: "Complex sequencing", lessons: [["Multiple conditions in one encounter", "video", 26], ["Complications and comorbidities", "text", 20]] },
      { title: "Coding quality review", lessons: [["Reading for documentation gaps", "video", 22], ["Audit-style review exercise", "practice", 30]] },
    ],
  },
];

function blocksFor(title: string, type: T.LessonType): Pick<T.Lesson, "summary" | "blocks"> {
  return {
    summary: `${title} — part of your structured EMC learning path.`,
    blocks: [
      p(`This lesson covers ${title.toLowerCase()}. Work through it in order, then use the resources on the right to revise.`),
      { type: "h", text: "What you will be able to do" },
      { type: "list", items: ["Explain the core idea in your own words", "Recognise it in clinical documentation", "Apply it in a practice case"] },
      type === "lab" || type === "practice"
        ? { type: "callout", text: "This is a practice activity with fictional cases. Open the Coding Lab to complete it." }
        : { type: "callout", text: "Lesson content is managed by faculty in the Content Studio and appears here once published." },
    ],
  };
}

/* ---------------- build ---------------- */

export function buildSeed(): DB {
  seed = 20261008;
  const db: DB = {
    users: [], programs: [], courses: [], modules: [], lessons: [], progress: [], batches: [], sessions: [], attendance: [],
    enrollments: [], assignments: [], submissions: [], assessments: [], attempts: [], certificates: [], certificateTemplates: [],
    leads: [], leadActivities: [], campaigns: [], content: [], announcements: [], admissions: [], invoices: [], payments: [],
    communications: [], templates: [], notifications: [], notificationPrefs: [], auditLogs: [], webhookEvents: [], aiRequests: [],
    authSessions: [], loginAttempts: [], passwordResets: [],
  };

  /* users */
  const mk = (id: string, name: string, email: string, role: T.RoleKey, title: string | null, pwd?: string): T.User => ({
    id, name, email, phone: `+91 9${int(100000000, 999999999)}`, role, extraPermissions: [], status: "active",
    passwordHash: pwd ? hashPassword(pwd) : "!", mfaEnabled: role === "admin", title,
    createdAt: at(-int(30, 200)), lastLoginAt: at(-int(0, 6), int(8, 19)),
  });
  const [stu, fac, mkt, adm] = DEMO_ACCOUNTS;
  db.users.push(
    mk("u_stu_1", stu.name, stu.email, "student", "B.Pharm graduate", stu.password),
    mk("u_fac_1", fac.name, fac.email, "faculty", "Lead Faculty — Diagnosis Coding", fac.password),
    mk("u_mkt_1", mkt.name, mkt.email, "marketing", "Growth Lead", mkt.password),
    mk("u_adm_1", adm.name, adm.email, "admin", "Academy Director", adm.password),
    mk("u_fac_2", "Arun Mathew", "arun.mathew@demo.emc", "faculty", "Faculty — Procedure Coding"),
    mk("u_fac_3", "Sana Qureshi", "sana.qureshi@demo.emc", "faculty", "Faculty — Medical Foundations"),
    mk("u_mkt_2", "Deepa Thomas", "deepa.thomas@demo.emc", "marketing", "Admissions Counsellor"),
  );
  const studentIds = ["u_stu_1"];
  for (let i = 0; i < 27; i++) {
    const name = `${FIRST[i % FIRST.length]} ${pick(LAST)}`;
    const id = `u_stu_${i + 2}`;
    db.users.push(mk(id, name, `${name.split(" ")[0].toLowerCase()}.${i + 2}@demo.emc`, "student", pick(EDU)));
    studentIds.push(id);
  }
  db.users.find((u) => u.id === "u_stu_9")!.status = "disabled";

  /* programs & courses */
  const buildProgram = (slug: string, specs: CourseSpec[], facultyFor: (i: number) => string[]) => {
    const sp = sitePrograms.find((x) => x.slug === slug)!;
    const prog: T.Program = { id: `prg_${slug.split("-")[0]}`, slug, name: sp.name, description: sp.summary, courseIds: [] };
    specs.forEach((c, ci) => {
      const courseId = `crs_${c.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      prog.courseIds.push(courseId);
      db.courses.push({
        id: courseId, programId: prog.id, code: c.code, title: c.title, description: c.description,
        status: "published", facultyIds: facultyFor(ci), certificateRule: { minCompletion: 100, minAverageScore: 60 },
      });
      c.modules.forEach((m, mi) => {
        const moduleId = `${courseId}_m${mi + 1}`;
        db.modules.push({ id: moduleId, courseId, order: mi + 1, title: m.title });
        m.lessons.forEach(([title, type, dur], li) => {
          const id = `${moduleId}_l${li + 1}`;
          const featured = title === "Using the Alphabetic Index and Tabular List";
          db.lessons.push({
            id, moduleId, order: li + 1, title, type, durationMin: dur, status: "published",
            ...(featured ? FEATURED_LESSON : blocksFor(title, type)),
            resources: [
              { label: `${title} — notes`, kind: "pdf", storageKey: `lessons/${id}/notes.pdf` },
              ...(type === "slides" || featured ? [{ label: "Lesson slides", kind: "slides" as const, storageKey: `lessons/${id}/slides.pdf` }] : []),
            ],
            videoKey: type === "video" ? `videos/${id}.m3u8` : undefined,
          });
        });
      });
    });
    db.programs.push(prog);
    return prog;
  };
  const career = buildProgram("medical-coding-career-program", CAREER_COURSES, (i) => [["u_fac_3"], ["u_fac_1"], ["u_fac_2"], ["u_fac_1", "u_fac_2"]][i]);
  const advanced = buildProgram("advanced-medical-coding", ADVANCED_COURSES, () => ["u_fac_1"]);
  db.courses.push({
    id: "crs_draft1", programId: advanced.id, code: "ADV-402", title: "Specialty Coding: Orthopaedics", description: "Draft course awaiting curriculum approval.",
    status: "draft", facultyIds: ["u_fac_2"], certificateRule: { minCompletion: 100, minAverageScore: 70 },
  });

  /* batches */
  db.batches.push(
    { id: "bat_oct", name: "Career Program — Oct 2026 (Weekday)", programId: career.id, facultyIds: ["u_fac_1", "u_fac_2", "u_fac_3"], studentIds: studentIds.slice(0, 16), startDate: at(-62), endDate: at(120), capacity: 20, schedule: "Mon–Fri · 10:00–12:00", status: "active" },
    { id: "bat_wkd", name: "Career Program — Weekend", programId: career.id, facultyIds: ["u_fac_1", "u_fac_3"], studentIds: studentIds.slice(16, 24), startDate: at(-30), endDate: at(150), capacity: 15, schedule: "Sat–Sun · 09:30–13:00", status: "active" },
    { id: "bat_adv", name: "Advanced Coding — Nov 2026", programId: advanced.id, facultyIds: ["u_fac_1"], studentIds: studentIds.slice(24), startDate: at(21), endDate: at(110), capacity: 12, schedule: "Tue & Thu · 18:30–20:30", status: "planned" },
  );
  for (const b of db.batches) for (const s of b.studentIds) db.enrollments.push({ id: `enr_${s}_${b.id}`, studentId: s, programId: b.programId, batchId: b.id, enrolledAt: b.startDate, status: "active" });

  /* lesson progress — Ananya is at ICD Fundamentals lesson 6 */
  const careerLessons = db.lessons.filter((l) => db.modules.find((m) => m.id === l.moduleId && career.courseIds.includes(m.courseId)));
  const ordered = career.courseIds.flatMap((cid) =>
    db.modules.filter((m) => m.courseId === cid).sort((a, b) => a.order - b.order).flatMap((m) => careerLessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.order - b.order)),
  );
  const current = ordered.findIndex((l) => l.title === "Using the Alphabetic Index and Tabular List");
  ordered.forEach((l, i) => {
    if (i < current) db.progress.push({ userId: "u_stu_1", lessonId: l.id, status: "completed", percent: 100, positionSec: 0, updatedAt: at(-(current - i) * 1.6) });
    if (i === current) db.progress.push({ userId: "u_stu_1", lessonId: l.id, status: "in_progress", percent: 31, positionSec: 490, updatedAt: at(-1, 19, 40) });
  });
  for (const s of studentIds.slice(1, 24)) {
    const upto = int(4, ordered.length - 2);
    ordered.slice(0, upto).forEach((l) => db.progress.push({ userId: s, lessonId: l.id, status: "completed", percent: 100, positionSec: 0, updatedAt: at(-int(1, 40)) }));
  }

  /* class sessions: past 3 weeks + next 3 weeks, weekdays */
  const topics = ["ICD-10-CM conventions", "Excludes notes workshop", "Respiratory chapter", "E/M basics", "Modifiers lab", "Case clinic", "Anatomy review", "Mock test debrief"];
  for (let d = -21; d <= 21; d++) {
    const day = new Date(Date.now() + d * DAY).getDay();
    if (day === 0 || day === 6) continue;
    const id = `ses_${d + 30}`;
    const courseId = d % 3 === 0 ? "crs_prc202" : "crs_icd201";
    db.sessions.push({ id, batchId: "bat_oct", courseId, title: topics[(d + 21) % topics.length], startsAt: at(d, 10), durationMin: 120, facultyId: courseId === "crs_icd201" ? "u_fac_1" : "u_fac_2", mode: "online" });
    if (d < 0) for (const s of db.batches[0].studentIds) {
      const r = rnd();
      db.attendance.push({ sessionId: id, studentId: s, status: r < 0.82 ? "present" : r < 0.9 ? "late" : r < 0.96 ? "absent" : "excused", markedBy: "u_fac_1", markedAt: at(d, 12, 5) });
    }
  }
  db.sessions.push({ id: "ses_wkd_1", batchId: "bat_wkd", courseId: "crs_mf101", title: "Pathology basics", startsAt: at(2, 9, 30), durationMin: 210, facultyId: "u_fac_3", mode: "classroom" });

  /* assignments + submissions */
  const asg: [string, string, string, number][] = [
    ["Terminology breakdown worksheet", "crs_mf101", "crs_mf101_m1", -25],
    ["Excludes1 vs Excludes2 scenarios", "crs_icd201", "crs_icd201_m1", 2],
    ["Index-to-Tabular walkthrough", "crs_icd201", "crs_icd201_m1", 5],
    ["Respiratory chapter case write-up", "crs_icd201", "crs_icd201_m3", 12],
    ["Modifier selection exercise", "crs_prc202", "crs_prc202_m1", -6],
    ["Anatomy labelling", "crs_mf101", "crs_mf101_m2", -14],
  ];
  asg.forEach(([title, courseId, moduleId, due], i) => {
    const id = `asg_${i + 1}`;
    db.assignments.push({
      id, courseId, moduleId, title, dueAt: at(due, 23, 59), maxScore: 20, createdBy: "u_fac_1",
      description: `Complete the ${title.toLowerCase()} using the fictional records provided. Show your reasoning for each answer, not just the final code.`,
      attachments: [{ label: "Instructions.pdf", storageKey: `assignments/${id}/instructions.pdf` }],
    });
    for (const s of db.batches[0].studentIds) {
      let status: T.SubmissionStatus;
      if (due < 0) status = rnd() < 0.75 ? "completed" : rnd() < 0.5 ? "under_review" : "returned";
      else status = rnd() < 0.35 ? "submitted" : rnd() < 0.5 ? "in_progress" : "not_started";
      if (s === "u_stu_1") status = (["completed", "in_progress", "not_started", "not_started", "under_review", "completed"] as const)[i];
      const done = status === "completed" || status === "returned";
      db.submissions.push({
        id: `sub_${id}_${s}`, assignmentId: id, studentId: s, status,
        text: status === "not_started" ? "" : "My reasoning: identified the main term, located it in the index, verified in the tabular list…",
        files: status === "not_started" || status === "in_progress" ? [] : [{ name: "submission.pdf", storageKey: `submissions/${id}/${s}.pdf`, sizeKb: int(80, 900) }],
        submittedAt: ["submitted", "under_review", "returned", "completed"].includes(status) ? at(Math.min(due, 0) - int(0, 2), int(9, 22)) : null,
        score: done ? int(12, 20) : null,
        feedback: done ? pick(["Clear reasoning. Watch the 7th character on injury codes.", "Good use of the index. Verify excludes notes every time.", "Solid work — explain why symptoms were not coded separately."]) : status === "returned" ? "Please revise question 3 and resubmit." : null,
        reviewedBy: done ? "u_fac_1" : null,
        revision: status === "returned" ? 1 : 0,
      });
    }
  });

  /* assessments (questions built from the coding lab cases) */
  const labQuestions: T.Question[] = labCases.map((c, i) => ({
    id: `q_lab_${i + 1}`, type: "coding_case", prompt: c.task, scenario: c.note.join(" "),
    options: c.options.map((o) => `${o.code} — ${o.label}`), correct: [c.options.findIndex((o) => o.correct)],
    points: 4, explanation: c.takeaway, difficulty: i === 0 ? "easy" : "medium", tags: ["ICD-10-CM", c.specialty.split(" ·")[0]],
  }));
  const conceptQs: T.Question[] = [
    { id: "q_c1", type: "single", prompt: "Which part of ICD-10-CM must you always use to confirm a code?", options: ["Alphabetic Index", "Tabular List", "Table of Drugs", "Neoplasm Table"], correct: [1], points: 2, explanation: "Codes are located in the index but always verified in the Tabular List.", difficulty: "easy", tags: ["conventions"] },
    { id: "q_c2", type: "true_false", prompt: "An Excludes1 note means the two conditions can never be coded together.", options: ["True", "False"], correct: [0], points: 1, explanation: "Excludes1 indicates the conditions are mutually exclusive (with limited documented exceptions in the guidelines).", difficulty: "medium", tags: ["conventions"] },
    { id: "q_c3", type: "multiple", prompt: "Which of these are instructional notes in the Tabular List?", options: ["Code first", "Use additional code", "See also", "Excludes2"], correct: [0, 1, 3], points: 3, explanation: "“See also” is an Alphabetic Index cross-reference, not a Tabular instructional note.", difficulty: "medium", tags: ["conventions"] },
    { id: "q_c4", type: "short", prompt: "What do we call the character “X” used to hold a position in a code?", options: [], correct: [], acceptedAnswers: ["placeholder", "placeholder character", "dummy placeholder"], points: 2, explanation: "ICD-10-CM uses “X” as a placeholder character.", difficulty: "easy", tags: ["structure"] },
  ];
  const mkA = (id: string, title: string, kind: T.AssessmentKind, courseId: string, qs: T.Question[], open: number, close: number, dur: number, attempts: number): T.Assessment =>
    ({ id, courseId, title, kind, durationMin: dur, opensAt: at(open, 9), closesAt: at(close, 23, 59), maxAttempts: attempts, passMark: 60, status: "published", questions: qs, createdBy: "u_fac_1" });
  db.assessments.push(
    mkA("asm_1", "ICD Fundamentals quiz", "quiz", "crs_icd201", conceptQs, -3, 6, 15, 3),
    mkA("asm_2", "Coding Lab: outpatient cases", "practice", "crs_icd201", labQuestions, -10, 30, 25, 5),
    mkA("asm_3", "Medical Foundations module test", "module", "crs_mf101", conceptQs.slice(0, 2), -30, -16, 30, 1),
    mkA("asm_4", "Mock test 1 — Diagnosis coding", "mock", "crs_icd201", [...conceptQs, ...labQuestions], 9, 10, 60, 1),
    mkA("asm_5", "Final assessment — Career Program", "final", "crs_cpr301", [...conceptQs, ...labQuestions], 95, 96, 120, 1),
  );
  const att = (a: string, s: string, score: number, max: number, d: number): T.Attempt => ({ id: `att_${a}_${s}_${d}`, assessmentId: a, studentId: s, answers: {}, score, maxScore: max, startedAt: at(d, 18), submittedAt: at(d, 18, 25) });
  db.attempts.push(att("asm_3", "u_stu_1", 3, 3, -20), att("asm_2", "u_stu_1", 8, 12, -4), att("asm_1", "u_stu_1", 6, 8, -1));
  for (const s of studentIds.slice(1, 16)) db.attempts.push(att("asm_3", s, int(1, 3), 3, -int(16, 25)), att("asm_1", s, int(3, 8), 8, -int(0, 3)));

  /* certificates */
  db.certificateTemplates.push(
    { id: "tpl_completion", name: "Program completion", description: "EMC course-completion certificate. Not an external professional certification.", status: "active" },
    { id: "tpl_module", name: "Module achievement", description: "Recognises completion of a single course module.", status: "active" },
  );
  db.certificates.push(
    { id: "EMC-2026-MF7K2Q", studentId: "u_stu_1", programId: career.id, templateId: "tpl_module", issuedAt: at(-18), issuedBy: "u_adm_1", status: "valid", revokedReason: null },
    { id: "EMC-2026-A9X3LD", studentId: "u_stu_2", programId: career.id, templateId: "tpl_module", issuedAt: at(-17), issuedBy: "u_adm_1", status: "valid", revokedReason: null },
    { id: "EMC-2026-R4T8NW", studentId: "u_stu_5", programId: career.id, templateId: "tpl_module", issuedAt: at(-17), issuedBy: "u_adm_1", status: "revoked", revokedReason: "Issued in error" },
  );

  /* campaigns */
  const camps: [string, T.Channel, T.Campaign["status"], number, number][] = [
    ["Search — Medical coding course", "google", "active", 60000, 41250],
    ["Career switchers — Reels", "instagram", "active", 35000, 22800],
    ["Pharmacy graduates — Lead form", "meta", "active", 45000, 39900],
    ["Alumni referral drive", "referral", "active", 10000, 3500],
    ["Demo-week reminders", "whatsapp", "paused", 8000, 5200],
    ["Monthly newsletter", "email", "ended", 4000, 4000],
  ];
  camps.forEach(([name, channel, status, budget, spend], i) =>
    db.campaigns.push({ id: `cmp_${i + 1}`, name, channel, status, budget, spend, conversions: 0, revenue: 0, startDate: at(-int(20, 75)), endDate: status === "ended" ? at(-5) : null }),
  );

  /* leads */
  const statuses: T.LeadStatus[] = ["new", "new", "new", "contacted", "contacted", "counselling", "counselling", "demo_booked", "demo_booked", "demo_completed", "application", "converted", "lost"];
  const srcByCamp: Record<string, T.LeadSource> = { google: "google", instagram: "instagram", meta: "meta", referral: "referral", whatsapp: "whatsapp", email: "email" };
  for (let i = 0; i < 64; i++) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    const camp = rnd() < 0.7 ? db.campaigns[int(0, 5)] : null;
    const status = pick(statuses);
    const created = -int(0, 45);
    const lead: T.Lead = {
      id: `lead_${i + 1}`, name, phone: `+91 9${int(100000000, 999999999)}`, email: rnd() < 0.7 ? `${name.split(" ")[0].toLowerCase()}${i}@example.com` : null,
      programInterest: rnd() < 0.8 ? career.name : advanced.name, education: pick(EDU),
      source: camp ? srcByCamp[camp.channel] : pick(["website", "organic", "walk_in", "website"] as const),
      campaignId: camp?.id ?? null, status, assignedTo: status === "new" ? null : pick(["u_mkt_1", "u_mkt_2"]),
      lastContactAt: status === "new" ? null : at(created + int(0, -created), int(9, 18)),
      nextFollowUpAt: ["converted", "lost"].includes(status) ? null : at(int(-2, 5), int(10, 17)),
      createdAt: at(created, int(8, 21), int(0, 59)), whatsappOptIn: rnd() < 0.65, lostReason: status === "lost" ? pick(["Chose another institute", "Not eligible yet", "Budget", "No response"]) : null,
    };
    db.leads.push(lead);
    if (camp && status === "converted") { camp.conversions += 1; camp.revenue += 45000; }
    db.leadActivities.push({ id: `act_${lead.id}_0`, leadId: lead.id, type: "form", summary: `Enquiry received via ${lead.source.replace("_", " ")}`, at: lead.createdAt, by: null });
    if (status !== "new") db.leadActivities.push({ id: `act_${lead.id}_1`, leadId: lead.id, type: "call", summary: "Intro call — interested, shared program overview", at: lead.lastContactAt!, by: lead.assignedTo });
    if (["counselling", "demo_booked", "demo_completed", "application", "converted"].includes(status))
      db.leadActivities.push({ id: `act_${lead.id}_2`, leadId: lead.id, type: "counselling", summary: "Counselling session completed — background fits the Career Program", at: at(created + 2, 15), by: lead.assignedTo });
    if (["demo_booked", "demo_completed", "application", "converted"].includes(status))
      db.leadActivities.push({ id: `act_${lead.id}_3`, leadId: lead.id, type: "demo", summary: status === "demo_booked" ? "Demo class booked" : "Attended demo class", at: at(created + 4, 11), by: lead.assignedTo });
  }
  // Ensure the converted students' story is visible: lead 1 is a fresh website enquiry
  Object.assign(db.leads[0], { name: "Meghna Pillai", source: "website", campaignId: null, status: "new", createdAt: at(0, 9, 12), assignedTo: null, programInterest: career.name });

  /* admissions */
  const stages: T.AdmissionStage[] = ["application", "counselling", "documents", "payment", "admitted", "batch_assigned", "enrolled"];
  db.leads.filter((l) => ["application", "converted"].includes(l.status)).forEach((l, i) =>
    db.admissions.push({ id: `adm_${i + 1}`, leadId: l.id, name: l.name, phone: l.phone, programId: l.programInterest === advanced.name ? advanced.id : career.id, stage: l.status === "converted" ? pick(stages.slice(4)) : pick(stages.slice(0, 4)), documentsComplete: rnd() < 0.6, batchId: l.status === "converted" ? "bat_adv" : null, updatedAt: at(-int(0, 10)) }),
  );

  /* finance (demo amounts) */
  studentIds.slice(0, 24).forEach((s, i) => {
    const amount = 45000;
    const paid = i % 5 === 0 ? 45000 : i % 5 === 1 ? 15000 : i % 5 === 2 ? 30000 : i % 5 === 3 ? 15000 : 45000;
    const status: T.InvoiceStatus = paid >= amount ? "paid" : i % 5 === 3 ? "overdue" : "partially_paid";
    db.invoices.push({
      id: `inv_${i + 1}`, number: `EMC/INV/26-27/${String(101 + i).padStart(4, "0")}`, studentId: s, description: "Career Program — course fee (demo)", amount, paid, currency: "INR",
      dueDate: at(i % 5 === 3 ? -6 : 24), status,
      installments: [1, 2, 3].map((n) => ({ label: `Instalment ${n}`, amount: 15000, dueDate: at(-60 + n * 30), paid: paid >= n * 15000 })),
    });
    if (paid > 0) db.payments.push({ id: `pay_${i + 1}`, invoiceId: `inv_${i + 1}`, amount: paid, paidAt: at(-int(1, 50)), method: pick(["upi", "card", "netbanking", "bank_transfer"] as const), provider: null, providerRef: null, status: "succeeded" });
  });

  /* content */
  const contentRows: [T.ContentItem["area"], T.ContentKind, string, T.PublishState, string, string | null][] = [
    ["academic", "lesson", "Excludes1 vs Excludes2 — interactive", "review", "u_fac_1", "crs_icd201"],
    ["academic", "lab_case", "Lab case: Asthma follow-up", "draft", "u_fac_1", "crs_icd201"],
    ["academic", "quiz", "Respiratory chapter quiz", "approved", "u_fac_1", "crs_icd201"],
    ["academic", "video", "E/M levels explained", "published", "u_fac_2", "crs_prc202"],
    ["academic", "document", "Modifier quick reference", "published", "u_fac_2", "crs_prc202"],
    ["academic", "practice_case", "Practice: Type 2 diabetes with hyperglycemia", "draft", "u_fac_1", "crs_icd201"],
    ["academic", "assignment", "Circulatory chapter case write-up", "review", "u_fac_1", "crs_icd201"],
    ["academic", "resource", "Anatomy flashcards", "archived", "u_fac_3", "crs_mf101"],
    ["marketing", "blog", "ICD vs CPT®: what’s the difference?", "published", "u_mkt_1", null],
    ["marketing", "landing_page", "Demo week landing page", "approved", "u_mkt_1", null],
    ["marketing", "social_post", "Reel: A day in the life of a coder", "review", "u_mkt_2", null],
    ["marketing", "email_campaign", "October newsletter", "draft", "u_mkt_1", null],
    ["marketing", "whatsapp_campaign", "Demo reminder broadcast", "approved", "u_mkt_1", null],
    ["marketing", "seo", "Medical coding course page — meta refresh", "draft", "u_mkt_1", null],
    ["marketing", "promo", "Early-bird enrolment banner", "archived", "u_mkt_2", null],
  ];
  contentRows.forEach(([area, kind, title, status, ownerId, courseId], i) =>
    db.content.push({ id: `cnt_${i + 1}`, area, kind, title, status, ownerId, courseId, updatedAt: at(-int(0, 12), int(9, 19)), aiAssisted: false }),
  );

  /* announcements */
  db.announcements.push(
    { id: "ann_1", title: "Mock test 1 opens next week", body: "Mock test 1 on diagnosis coding opens on the scheduled date. Revise ICD Fundamentals and the respiratory chapter first.", audience: "students", batchId: null, createdBy: "u_fac_1", createdAt: at(-1, 17) },
    { id: "ann_2", title: "Case clinic moved to Thursday", body: "This week’s case clinic will run on Thursday at the usual time.", audience: "batch", batchId: "bat_oct", createdBy: "u_fac_1", createdAt: at(-3, 12) },
    { id: "ann_3", title: "Faculty sync — curriculum review", body: "Please submit draft lab cases for review before the curriculum sync.", audience: "faculty", batchId: null, createdBy: "u_adm_1", createdAt: at(-2, 10) },
  );

  /* templates */
  const tpl = (id: string, name: string, channel: T.CommChannel, purpose: string, event: string | null, category: T.NotificationCategory, content: string, subject: string | null = null, approval: T.MessageTemplate["approval"] = "not_required"): T.MessageTemplate => ({
    id, name, channel, purpose, event, category, subject, content, variables: Array.from(new Set(content.match(/{{\s*\w+\s*}}/g)?.map((v) => v.replace(/[{}\s]/g, "")) ?? [])), status: "active", approval,
  });
  db.templates.push(
    tpl("tpl_welcome_email", "Student welcome", "email", "Welcome a newly enrolled student", "student.enrolled", "learning", "Hi {{student_name}}, welcome to EMC! You are enrolled in {{course_name}} ({{batch_name}}). Your first class is on {{class_date}}.", "Welcome to EMC Academy"),
    tpl("tpl_welcome_inapp", "Student welcome (in-app)", "in_app", "Welcome banner", "student.enrolled", "learning", "Welcome to {{course_name}}, {{student_name}}. Start with your first lesson."),
    tpl("tpl_class_wa", "Class reminder", "whatsapp", "Remind students before a live class", "class.scheduled", "learning", "Hi {{student_name}}, your EMC class “{{class_title}}” with {{faculty_name}} starts at {{class_date}}.", null, "approved"),
    tpl("tpl_assign_due", "Assignment reminder", "in_app", "Due-date reminder", "assignment.due", "learning", "“{{assignment_title}}” is due on {{due_date}}."),
    tpl("tpl_cert_email", "Certificate issued", "email", "Notify a student that a certificate was issued", "certificate.issued", "learning", "Congratulations {{student_name}}! Your certificate {{certificate_id}} for {{course_name}} is ready. Verify it at {{verify_url}}.", "Your EMC certificate"),
    tpl("tpl_cert_inapp", "Certificate issued (in-app)", "in_app", "Certificate notice", "certificate.issued", "learning", "Your certificate {{certificate_id}} is ready."),
    tpl("tpl_lead_wa", "Enquiry acknowledgement", "whatsapp", "Reply to a new enquiry", "lead.created", "marketing", "Hi {{lead_name}}, thanks for your interest in EMC. A counsellor will call you shortly.", null, "pending"),
    tpl("tpl_lead_staff", "New lead alert", "in_app", "Alert the growth team about a new lead", "lead.created", "marketing", "New enquiry from {{lead_name}} ({{lead_source}}) for {{course_name}}."),
    tpl("tpl_demo_wa", "Demo confirmation", "whatsapp", "Confirm a booked demo class", "demo.booked", "marketing", "Hi {{lead_name}}, your EMC demo class is confirmed for {{class_date}}.", null, "approved"),
    tpl("tpl_pay_due", "Payment reminder", "email", "Instalment due reminder", "payment.overdue", "payments", "Hi {{student_name}}, your instalment of {{payment_amount}} is due on {{due_date}}.", "Payment reminder from EMC"),
    tpl("tpl_pwd_reset", "Password reset", "email", "Account security", "auth.password_reset", "security", "Use this link to reset your EMC Academy password: {{reset_url}}. It expires in 30 minutes.", "Reset your EMC password"),
  );

  /* communication history (simulated provider) */
  const comm = (o: Partial<T.Communication> & Pick<T.Communication, "channel" | "preview" | "createdAt">): T.Communication => ({
    id: `com_${db.communications.length + 1}`, userId: null, leadId: null, studentId: null, provider: o.channel === "in_app" ? "in_app" : "simulated", templateId: null,
    direction: "outbound", status: "delivered", providerMessageId: o.channel === "in_app" ? null : `sim_${int(100000, 999999)}`, contentReference: null, event: null,
    deliveredAt: o.createdAt, readAt: null, failedAt: null, error: null, ...o,
  });
  db.leads.slice(1, 14).forEach((l) => {
    db.communications.push(comm({ leadId: l.id, channel: "whatsapp", templateId: "tpl_lead_wa", event: "lead.created", preview: `Hi ${l.name.split(" ")[0]}, thanks for your interest in EMC…`, createdAt: l.createdAt, status: l.whatsappOptIn ? "read" : "skipped", readAt: l.whatsappOptIn ? l.createdAt : null }));
  });
  db.communications.push(
    comm({ studentId: "u_stu_1", userId: "u_stu_1", channel: "email", templateId: "tpl_welcome_email", event: "student.enrolled", preview: "Hi Ananya, welcome to EMC! You are enrolled in…", createdAt: at(-62, 9) }),
    comm({ studentId: "u_stu_1", userId: "u_stu_1", channel: "whatsapp", templateId: "tpl_class_wa", event: "class.scheduled", preview: "Hi Ananya, your EMC class “ICD-10-CM conventions”…", createdAt: at(-1, 9), status: "read", readAt: at(-1, 9, 4) }),
    comm({ studentId: "u_stu_12", userId: "u_stu_12", channel: "email", templateId: "tpl_pay_due", event: "payment.overdue", preview: "Hi, your instalment of ₹15,000 is due…", createdAt: at(-2, 10), status: "failed", failedAt: at(-2, 10, 1), deliveredAt: null, error: "Mailbox unavailable (simulated)" }),
  );

  /* notifications */
  const note = (userId: string, category: T.NotificationCategory, title: string, body: string, href: string | null, d: number, read = false): T.AppNotification =>
    ({ id: `ntf_${db.notifications.length + 1}`, userId, category, title, body, href, createdAt: at(d, 9 + db.notifications.length % 8), readAt: read ? at(d, 20) : null });
  db.notifications.push(
    note("u_stu_1", "learning", "Feedback on your assignment", "Dr. Kavya Menon reviewed “Anatomy labelling”.", "/academy/student/assignments", 0),
    note("u_stu_1", "announcements", "Mock test 1 opens next week", "Revise ICD Fundamentals first.", "/academy/student/assessments", -1),
    note("u_stu_1", "learning", "Class tomorrow", "ICD-10-CM conventions · 10:00", "/academy/student/calendar", -1, true),
    note("u_fac_1", "learning", "5 submissions waiting", "Excludes1 vs Excludes2 scenarios has new submissions.", "/academy/faculty/reviews", 0),
    note("u_mkt_1", "marketing", "New website enquiry", "Meghna Pillai asked about the Career Program.", "/academy/marketing/leads/lead_1", 0),
    note("u_adm_1", "system", "Payment reminder failed", "1 email could not be delivered.", "/academy/admin/communications", -2),
    note("u_adm_1", "system", "Draft course awaiting review", "Specialty Coding: Orthopaedics", "/academy/admin/courses", -1),
  );

  /* audit (seed a little history) */
  const audit = (userId: string, action: string, objectType: string, objectId: string | null, d: number, result: T.AuditLog["result"] = "success"): T.AuditLog => ({
    id: `aud_${db.auditLogs.length + 1}`, userId, userName: db.users.find((u) => u.id === userId)?.name ?? null, action, objectType, objectId, result, meta: {}, at: at(d, int(8, 19), int(0, 59)), ip: "203.0.113.10",
  });
  db.auditLogs.push(
    audit("u_adm_1", "certificate.issued", "Certificate", "EMC-2026-MF7K2Q", -18),
    audit("u_adm_1", "certificate.revoked", "Certificate", "EMC-2026-R4T8NW", -9),
    audit("u_fac_1", "course.content.submitted", "ContentItem", "cnt_1", -2),
    audit("u_mkt_1", "campaign.updated", "Campaign", "cmp_5", -4),
    audit("u_adm_1", "user.disabled", "User", "u_stu_9", -6),
    audit("u_fac_1", "grade.changed", "Submission", "sub_asg_6_u_stu_1", -3),
  );

  return db;
}
