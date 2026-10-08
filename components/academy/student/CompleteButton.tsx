"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function CompleteButton({ label, done }: { label: string; done: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={done ? "outline" : "primary"} icon={done ? "arrow" : "check"} disabled={pending} className="w-full sm:w-auto">
      {pending ? "Saving…" : label}
    </Button>
  );
}
