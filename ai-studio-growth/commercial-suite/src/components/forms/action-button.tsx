"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/services/errors";

/**
 * Runs a (bound) server action, optionally after a confirmation dialog, then shows a toast and
 * refreshes or navigates. Keeps every button wired to a real action.
 */
export function ActionButton({
  action,
  children,
  confirm,
  confirmLabel = "Confirm",
  redirectTo,
  redirectToResultPath,
  variant = "outline",
  size = "sm",
  danger,
  ...rest
}: {
  action: () => Promise<ActionResult<unknown>>;
  children: ReactNode;
  confirm?: { title: string; description: ReactNode };
  confirmLabel?: string;
  redirectTo?: string;
  redirectToResultPath?: (data: unknown) => string;
  danger?: boolean;
} & Omit<ButtonProps, "onClick" | "action">) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const run = () =>
    start(async () => {
      const res = await action();
      setOpen(false);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.message) toast.success(res.message);
      if (redirectToResultPath && res.data) router.push(redirectToResultPath(res.data));
      else if (redirectTo) router.push(redirectTo);
      router.refresh();
    });
  if (!confirm)
    return (
      <Button variant={variant} size={size} loading={pending} onClick={run} {...rest}>
        {children}
      </Button>
    );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={variant} size={size} onClick={() => setOpen(true)} {...rest}>
        {children}
      </Button>
      <DialogContent title={confirm.title}>
        <div className="text-sm text-muted">{confirm.description}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} loading={pending} onClick={run}>{confirmLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
