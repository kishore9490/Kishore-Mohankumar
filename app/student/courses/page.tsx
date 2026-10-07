import { EmptyPanel } from "@/components/student/EmptyPanel";
export default function StudentMycourses() {
  return (
    <>
      <h1 className="heading text-4xl">My courses</h1>
      <div className="mt-8">
        <EmptyPanel icon="book" title="Your enrolled programs will appear here." text="Courses appear once you are enrolled and your account is connected." />
      </div>
    </>
  );
}
