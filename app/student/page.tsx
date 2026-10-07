import { CampusPreview } from "@/components/student/CampusPreview";
export default function StudentHome() {
  return (
    <>
      <h1 className="heading text-4xl">Your learning space</h1>
      <p className="mt-2 text-muted">Course progress, current module, practice cases, assessments and certificates.</p>
      <CampusPreview className="mt-8" />
    </>
  );
}
