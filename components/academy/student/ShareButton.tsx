"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Copies the public verification link for a certificate. */
export function ShareButton({ path }: { path: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: "EMC course certificate", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2500);
  };
  return (
    <>
      <Button type="button" variant="outline" size="sm" iconLeft="share" onClick={copy}>
        {state === "copied" ? "Link copied" : state === "failed" ? "Copy failed" : "Share"}
      </Button>
      <span className="sr-only" aria-live="polite">{state === "copied" ? "Verification link copied to clipboard" : state === "failed" ? "Could not copy the link" : ""}</span>
    </>
  );
}
