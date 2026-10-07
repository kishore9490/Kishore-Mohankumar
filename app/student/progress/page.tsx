import { EmptyPanel } from "@/components/student/EmptyPanel";
export default function StudentProgress() {
  return (
    <>
      <h1 className="heading text-4xl">Progress</h1>
      <div className="mt-8">
        <EmptyPanel icon="chart" title="Module-by-module progress will appear here." text="Track completion and assessment performance once your course begins." />
      </div>
    </>
  );
}
