import { requirePermission } from "@/server/auth/session";
import { facultyScope, lessonsForCourses } from "@/server/repositories/faculty";
import { EmptyState, PageHeader } from "@/components/academy/ui";
import { AssessmentBuilder } from "@/components/academy/faculty/AssessmentBuilder";

export default async function NewAssessment() {
  const user = await requirePermission("assessments.manage");
  const { courses, courseIds } = facultyScope(user.id);
  const day = 86_400_000;
  const opens = new Date(Date.now() + 7 * day);
  opens.setUTCHours(3, 30, 0, 0); // 09:00 IST
  const closes = new Date(opens.getTime() + 2 * day + 14 * 3_600_000 + 29 * 60_000); // 23:59 IST two days later

  return (
    <>
      <PageHeader back={{ href: "/academy/faculty/assessments", label: "Assessments" }} label="Assessment builder" title="New assessment." intro="Set up the window and rules, then add questions. Save a draft any time." />
      {courses.length === 0 ? (
        <EmptyState icon="book" title="No courses assigned" text="You can build assessments once an admin assigns you to a course." />
      ) : (
        <AssessmentBuilder
          readOnly={false}
          courses={courses.map((c) => ({ id: c.id, label: `${c.code} · ${c.title}` }))}
          lessons={lessonsForCourses(courseIds)}
          initial={{ title: "", courseId: courses[0].id, kind: "quiz", durationMin: 20, opensAt: opens.toISOString(), closesAt: closes.toISOString(), maxAttempts: 2, passMark: 60, status: "draft", questions: [] }}
        />
      )}
    </>
  );
}
