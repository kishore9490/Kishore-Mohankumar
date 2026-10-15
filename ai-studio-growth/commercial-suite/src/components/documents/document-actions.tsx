"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeftRight, CheckCircle2, Copy, MoreHorizontal, Send, Trash2, XCircle, Ban } from "lucide-react";
import { convertDocumentAction, deleteDraftAction, duplicateDocumentAction, setStatusAction } from "@/app/actions/documents";
import { DOCUMENT_TYPE_META, type DocumentStatus, type DocumentType } from "@/lib/documents/meta";
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/services/errors";

export function DocumentMoreMenu({ id, type, storedStatus, conversions, canDelete }: { id: string; type: DocumentType; storedStatus: DocumentStatus; conversions: DocumentType[]; canDelete: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult<unknown>>, after?: (data: unknown) => void, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      const res = await fn();
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      if (after) after(res.data);
      router.refresh();
    });
  };
  const slugOf = (t: DocumentType) => DOCUMENT_TYPE_META[t].slug;
  const statusItems: { status: DocumentStatus; label: string; icon: typeof Send; confirm?: string }[] = [];
  if (type === "QUOTATION" || type === "PROPOSAL") {
    if (storedStatus === "DRAFT") statusItems.push({ status: "SENT", label: "Mark as sent", icon: Send });
    if (storedStatus === "SENT" || storedStatus === "DRAFT") {
      statusItems.push({ status: "ACCEPTED", label: "Mark as accepted", icon: CheckCircle2 });
      statusItems.push({ status: "REJECTED", label: "Mark as rejected", icon: XCircle });
    }
    if (storedStatus === "ACCEPTED" || storedStatus === "REJECTED") statusItems.push({ status: "SENT", label: "Reopen (mark as sent)", icon: Send });
  }
  if (type === "PROFORMA") {
    if (storedStatus === "DRAFT") statusItems.push({ status: "SENT", label: "Mark as sent", icon: Send });
    if (storedStatus !== "CANCELLED") statusItems.push({ status: "CANCELLED", label: "Cancel proforma", icon: Ban, confirm: "Cancel this proforma invoice?" });
  }
  if (type === "INVOICE" && (storedStatus === "ISSUED")) statusItems.push({ status: "CANCELLED", label: "Cancel invoice", icon: Ban, confirm: "Cancel this tax invoice? The number stays used and the invoice is kept for records." });

  return (
    <Dropdown>
      <DropdownTrigger className={buttonClass({ variant: "outline", size: "sm" })} disabled={pending} aria-label="More actions">
        <MoreHorizontal /> More
      </DropdownTrigger>
      <DropdownContent>
        {statusItems.length > 0 && <DropdownLabel>Status</DropdownLabel>}
        {statusItems.map((s) => (
          <DropdownItem key={s.label} onSelect={() => run(() => setStatusAction(id, s.status), undefined, s.confirm)}>
            <s.icon /> {s.label}
          </DropdownItem>
        ))}
        {conversions.length > 0 && (
          <>
            <DropdownSeparator />
            <DropdownLabel>Convert</DropdownLabel>
            {conversions.map((t) => (
              <DropdownItem key={t} onSelect={() => run(() => convertDocumentAction(id, t), (d) => router.push(`/documents/${slugOf(t)}/${(d as { id: string }).id}`), `Create a ${DOCUMENT_TYPE_META[t].label} draft from this document? Customer details and line items will be copied exactly.`)}>
                <ArrowLeftRight /> Convert to {DOCUMENT_TYPE_META[t].label}
              </DropdownItem>
            ))}
          </>
        )}
        <DropdownSeparator />
        <DropdownItem onSelect={() => run(() => duplicateDocumentAction(id), (d) => router.push(`/documents/${slugOf(type)}/${(d as { id: string }).id}/edit`))}>
          <Copy /> Duplicate as new draft
        </DropdownItem>
        {canDelete && (
          <DropdownItem className="text-red-600" onSelect={() => run(() => deleteDraftAction(id), () => router.push(`/documents/${slugOf(type)}`), "Delete this draft permanently?")}>
            <Trash2 /> Delete draft
          </DropdownItem>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
