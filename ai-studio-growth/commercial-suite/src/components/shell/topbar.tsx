"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as D from "@radix-ui/react-dialog";
import { ChevronDown, FilePlus2, FileSignature, FileSpreadsheet, FileText, LogOut, Menu, Receipt, Settings, X } from "lucide-react";
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown";
import { buttonClass } from "@/components/ui/button";
import { BrandMark, SidebarNav } from "./sidebar";
import { logoutAction } from "@/app/actions/auth";

const CREATE = [
  { slug: "proposals", label: "Commercial Proposal", hint: "Multi-section premium proposal", icon: FileSignature },
  { slug: "quotations", label: "Quotation", hint: "Priced offer with validity", icon: FileText },
  { slug: "invoices", label: "Invoice", hint: "GST tax invoice", icon: Receipt },
  { slug: "proforma", label: "Proforma Invoice", hint: "Advance / approval invoice", icon: FileSpreadsheet },
];

export function CreateMenu({ size = "md" }: { size?: "sm" | "md" }) {
  const router = useRouter();
  return (
    <Dropdown>
      <DropdownTrigger className={buttonClass({ size })}>
        <FilePlus2 />
        <span className="hidden sm:inline">Create New Document</span>
        <span className="sm:hidden">New</span>
        <ChevronDown className="opacity-70" />
      </DropdownTrigger>
      <DropdownContent className="w-72">
        <DropdownLabel>Create new</DropdownLabel>
        {CREATE.map((c) => (
          <DropdownItem key={c.slug} onSelect={() => router.push(`/documents/${c.slug}/new`)}>
            <c.icon />
            <span>
              <span className="block font-medium">{c.label}</span>
              <span className="block text-xs text-muted">{c.hint}</span>
            </span>
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}

export function Topbar({ user }: { user: { name: string; email: string; role: string } }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const initials = user.name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur md:px-6">
      <D.Root open={open} onOpenChange={setOpen}>
        <D.Trigger className="rounded-lg p-2 text-muted hover:bg-canvas lg:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </D.Trigger>
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden" />
          <D.Content className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-navy-900 p-4 lg:hidden">
            <D.Title className="sr-only">Navigation</D.Title>
            <D.Description className="sr-only">Main navigation</D.Description>
            <div className="mb-6 flex items-center justify-between">
              <BrandMark />
              <D.Close className="rounded-md p-1.5 text-indigo-100 hover:bg-white/10" aria-label="Close navigation">
                <X className="size-5" />
              </D.Close>
            </div>
            <SidebarNav isAdmin={user.role === "ADMIN"} onNavigate={() => setOpen(false)} />
          </D.Content>
        </D.Portal>
      </D.Root>
      <div className="lg:hidden">
        <Link href="/" className="font-display text-sm font-bold text-ink">Quote Studio</Link>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <CreateMenu size="sm" />
        <Dropdown>
          <DropdownTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-canvas" aria-label="Account menu">
            <span className="flex size-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">{initials}</span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-[13px] font-medium text-ink">{user.name}</span>
              <span className="block text-[11px] text-muted">{user.role === "ADMIN" ? "Administrator" : "Staff"}</span>
            </span>
            <ChevronDown className="hidden size-4 text-muted md:block" />
          </DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>{user.email}</DropdownLabel>
            <DropdownItem onSelect={() => router.push("/settings/company")}>
              <Settings /> Company settings
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onSelect={() => logoutAction()}>
              <LogOut /> Sign out
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  );
}
