import { EmptyState } from "@/components/academy/ui";
import { ButtonLink } from "@/components/ui/Button";

export default function AcademyNotFound() {
  return (
    <div className="py-10">
      <EmptyState icon="search" title="We couldn’t find that" text="It may have been moved, archived, or you may not have access to it." action={<ButtonLink href="/academy">Back to my dashboard</ButtonLink>} />
    </div>
  );
}
