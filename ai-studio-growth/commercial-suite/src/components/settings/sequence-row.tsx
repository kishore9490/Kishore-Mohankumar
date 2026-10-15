"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSequenceAction } from "@/app/actions/settings";
import { formatDocumentNumber } from "@/lib/documents/numbering";
import { todayISO } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/input";

export function SequenceRow({ id, label, prefix, nextNumber, padding, includeFinancialYear, disabled }: { id: string; label: string; prefix: string; nextNumber: number; padding: number; includeFinancialYear: boolean; disabled?: boolean }) {
  const router = useRouter();
  const [v, setV] = useState({ prefix, nextNumber: String(nextNumber), padding: String(padding), includeFinancialYear });
  const [pending, start] = useTransition();
  const preview = /^[A-Za-z0-9-]+$/.test(v.prefix) && Number(v.nextNumber) > 0 ? formatDocumentNumber({ prefix: v.prefix, padding: Number(v.padding) || 4, includeFinancialYear: v.includeFinancialYear }, Number(v.nextNumber), todayISO()) : "—";
  return (
    <div className="grid items-end gap-3 border-b border-line px-5 py-4 last:border-0 md:grid-cols-[150px_120px_110px_90px_1fr_auto]">
      <div className="text-sm font-medium">{label}</div>
      <label className="text-xs text-muted">Prefix<Input value={v.prefix} onChange={(e) => setV({ ...v, prefix: e.target.value })} disabled={disabled} /></label>
      <label className="text-xs text-muted">Next number<Input inputMode="numeric" value={v.nextNumber} onChange={(e) => setV({ ...v, nextNumber: e.target.value })} disabled={disabled} /></label>
      <label className="text-xs text-muted">Digits<Input inputMode="numeric" value={v.padding} onChange={(e) => setV({ ...v, padding: e.target.value })} disabled={disabled} /></label>
      <div className="space-y-1">
        <Checkbox label="Include financial year" checked={v.includeFinancialYear} onChange={(e) => setV({ ...v, includeFinancialYear: e.target.checked })} disabled={disabled} />
        <div className="text-xs text-muted">Next: <span className="font-mono text-ink">{preview}</span></div>
      </div>
      {!disabled && (
        <Button size="sm" variant="outline" loading={pending} onClick={() => start(async () => { const r = await saveSequenceAction(id, { ...v, nextNumber: Number(v.nextNumber), padding: Number(v.padding) }); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); })}>Save</Button>
      )}
    </div>
  );
}
