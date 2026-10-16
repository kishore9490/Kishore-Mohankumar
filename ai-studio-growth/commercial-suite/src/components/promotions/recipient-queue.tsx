"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, ExternalLink, SkipForward, Undo2, Zap } from "lucide-react";
import { openRecipientAction, setRecipientStatusAction } from "@/app/actions/promotions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Row = { id: string; name: string; contact: string | null; phone: string; status: "PENDING" | "OPENED" | "SENT" | "SKIPPED" };

const TONE = { PENDING: "neutral", OPENED: "info", SENT: "success", SKIPPED: "warning" } as const;
const LABEL = { PENDING: "Not sent", OPENED: "Chat opened", SENT: "Sent", SKIPPED: "Skipped" } as const;

export function RecipientQueue({ rows: initial }: { rows: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();
  const sent = rows.filter((r) => r.status === "SENT").length;
  const next = rows.find((r) => r.status === "PENDING") ?? rows.find((r) => r.status === "OPENED");

  const open = (r: Row) =>
    start(async () => {
      setBusy(r.id);
      const res = await openRecipientAction(r.id);
      setBusy(null);
      if (!res.ok) return void toast.error(res.error);
      window.open(res.data!.url, "_blank", "noopener,noreferrer");
      setRows((rs) => rs.map((x) => (x.id === r.id && x.status !== "SENT" ? { ...x, status: "OPENED" } : x)));
    });
  const mark = (r: Row, status: "SENT" | "SKIPPED" | "PENDING") =>
    start(async () => {
      setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status } : x)));
      const res = await setRecipientStatusAction(r.id, status);
      if (!res.ok) toast.error(res.error);
      router.refresh();
    });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-4">
        <div className="min-w-48 flex-1">
          <div className="flex justify-between text-sm"><span className="font-medium">Progress</span><span className="tabular text-muted">{sent} / {rows.length} sent</span></div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${rows.length ? (sent / rows.length) * 100 : 0}%` }} /></div>
        </div>
        {next ? (
          <Button onClick={() => open(next)} loading={busy === next.id}><Zap /> Open next: {next.name}</Button>
        ) : (
          <Badge tone="success">All customers handled</Badge>
        )}
      </div>
      <div className="divide-y divide-line rounded-xl border border-line bg-white">
        {rows.map((r) => (
          <div key={r.id} className={cn("flex flex-wrap items-center gap-3 px-4 py-3", r.status === "SENT" && "bg-emerald-50/40")}>
            <div className="min-w-48 flex-1">
              <div className="font-medium text-ink">{r.name}</div>
              <div className="text-xs text-muted">{r.contact ? `${r.contact} · ` : ""}+{r.phone}</div>
            </div>
            <Badge tone={TONE[r.status]}>{LABEL[r.status]}</Badge>
            <div className="flex gap-1">
              {r.status !== "SENT" && <Button size="sm" variant={r.status === "OPENED" ? "outline" : "secondary"} onClick={() => open(r)} loading={busy === r.id}><ExternalLink /> {r.status === "OPENED" ? "Open again" : "Open in WhatsApp"}</Button>}
              {r.status === "OPENED" && <Button size="sm" onClick={() => mark(r, "SENT")}><Check /> I sent it</Button>}
              {r.status === "PENDING" && <Button size="sm" variant="ghost" onClick={() => mark(r, "SKIPPED")} aria-label={`Skip ${r.name}`}><SkipForward /></Button>}
              {(r.status === "SENT" || r.status === "SKIPPED") && <Button size="sm" variant="ghost" onClick={() => mark(r, "PENDING")} aria-label={`Undo ${r.name}`}><Undo2 /></Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
