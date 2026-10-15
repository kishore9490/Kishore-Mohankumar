"use client";
import * as M from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Dropdown = M.Root;
export const DropdownTrigger = M.Trigger;

export function DropdownContent({ children, align = "end", className }: { children: ReactNode; align?: "start" | "end" | "center"; className?: string }) {
  return (
    <M.Portal>
      <M.Content align={align} sideOffset={6} className={cn("z-50 min-w-[220px] rounded-xl border border-line bg-white p-1.5 shadow-xl shadow-navy-900/10", className)}>
        {children}
      </M.Content>
    </M.Portal>
  );
}

export function DropdownItem({ children, onSelect, className, disabled }: { children: ReactNode; onSelect?: (e: Event) => void; className?: string; disabled?: boolean }) {
  return (
    <M.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn("flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-800 [&_svg]:size-4 [&_svg]:text-muted", className)}
    >
      {children}
    </M.Item>
  );
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <M.Label className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-muted uppercase">{children}</M.Label>;
}
export function DropdownSeparator() {
  return <M.Separator className="my-1 h-px bg-line" />;
}
export const DropdownItemLink = M.Item;
