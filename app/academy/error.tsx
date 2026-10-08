"use client";
import { ErrorState } from "@/components/academy/ui";
import { Button } from "@/components/ui/Button";

export default function AcademyError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <div className="py-10">
      <ErrorState
        title={offline ? "You’re offline" : "Something went wrong"}
        text={offline ? "Check your connection, then try again. Nothing you saved has been lost." : `This screen couldn’t load. Try again — if it keeps happening, tell the EMC team${error.digest ? ` (ref ${error.digest})` : ""}.`}
        action={<Button onClick={reset} icon="refresh">Try again</Button>}
      />
    </div>
  );
}
