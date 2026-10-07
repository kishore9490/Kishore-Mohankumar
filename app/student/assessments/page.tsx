import { EmptyPanel } from "@/components/student/EmptyPanel";
export default function StudentAssessments() {
  return (
    <>
      <h1 className="heading text-4xl">Assessments</h1>
      <div className="mt-8">
        <EmptyPanel icon="file" title="Checkpoints and mock tests will appear here." text="Your scheduled and completed assessments, with feedback." />
      </div>
    </>
  );
}
