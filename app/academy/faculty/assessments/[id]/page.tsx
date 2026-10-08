import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/session";
import { userName } from "@/server/repositories/learning";
import { assessmentForFaculty, facultyScope, lessonsForCourses, myAssessments } from "@/server/repositories/faculty";
import { Notice, PageHeader, StatusPill } from "@/components/academy/ui";
import { AssessmentBuilder } from "@/components/academy/faculty/AssessmentBuilder";

export default async function EditAssessment({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requirePermission("assessments.manage");
  const { id } = await params;
  const { saved } = await searchParams;
  const a = assessmentForFaculty(user.id, id);
  if (!a) notFound();
  const { courses, courseIds } = facultyScope(user.id);
  const stats = myAssessments(user.id).find((x) => x.assessment.id === a.id);
  const readOnly = a.status !== "draft" && a.status !== "review";

  return (
    <>
      <PageHeader
        back={{ href: "/academy/faculty/assessments", label: "Assessments" }}
        label={`Assessment builder · by ${userName(a.createdBy)}`}
        title={a.title}
        intro={stats ? `${stats.attempts} attempts from your students${stats.avg !== null ? ` · average ${stats.avg}%` : ""}.` : undefined}
        actions={<StatusPill status={a.status} label={a.status === "review" ? "In review" : undefined} />}
      />
      {saved && <div className="mb-5"><Notice>Saved. You can keep editing — changes are kept as a {a.status === "review" ? "submission for review" : "draft"}.</Notice></div>}
      <AssessmentBuilder
        key={`${a.id}:${a.status}`}
        readOnly={readOnly}
        courses={courses.map((c) => ({ id: c.id, label: `${c.code} · ${c.title}` }))}
        lessons={lessonsForCourses(courseIds)}
        initial={{
          id: a.id, title: a.title, courseId: a.courseId, kind: a.kind, durationMin: a.durationMin, opensAt: a.opensAt, closesAt: a.closesAt,
          maxAttempts: a.maxAttempts, passMark: a.passMark, status: a.status,
          questions: a.questions.map((q) => ({ id: q.id, type: q.type, prompt: q.prompt, scenario: q.scenario, options: q.options, correct: q.correct, acceptedAnswers: q.acceptedAnswers, points: q.points, explanation: q.explanation, difficulty: q.difficulty, tags: q.tags })),
        }}
      />
    </>
  );
}
