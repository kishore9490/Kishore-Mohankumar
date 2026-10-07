import { EmptyPanel } from "@/components/student/EmptyPanel";
export default function StudentCertificates() {
  return (
    <>
      <h1 className="heading text-4xl">Certificates</h1>
      <div className="mt-8">
        <EmptyPanel icon="award" title="Certificates you earn will appear here." text="EMC course-completion certificates are issued on completing a program." />
      </div>
    </>
  );
}
