"use client";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-xl bg-white p-6 ring-1 ring-line">
      <div className="flex items-center gap-2 text-red-700"><AlertTriangle className="size-5" /><h2 className="font-display text-lg font-bold">Something went wrong on this page</h2></div>
      <p className="mt-2 text-sm text-muted">The error has been recorded. Open <strong>Document History</strong> and choose <strong>System errors</strong> to see the details{error.digest ? <> — look for reference <code className="rounded bg-canvas px-1">{error.digest}</code></> : null}.</p>
      <div className="mt-5 flex gap-2">
        <Button onClick={reset}><RotateCcw /> Try again</Button>
        <Link href="/history?action=system." className={buttonClass({ variant: "outline" })}>View system errors</Link>
      </div>
    </div>
  );
}
