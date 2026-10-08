import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { auditPage } from "@/server/repositories/admin";
import { formatDateTime } from "@/lib/platform/format";
import { DataTable, EmptyState, PageHeader, StatusPill } from "@/components/academy/ui";
import { FilterBar, FilterInput, FilterSelect, MetaChips, Pager, withParams } from "@/components/academy/admin/bits";

export const metadata = { title: "Audit log · EMC Academy" };

const PREFIXES = ["user.", "role.", "permission.", "password.", "auth.", "course.", "content.", "batch.", "admission.", "student.", "payment.", "certificate.", "integration.", "access."];

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ q?: string; result?: string; user?: string; page?: string }> }) {
  await requirePermission("audit.view");
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 60);
  const result = ["success", "denied", "failed"].includes(sp.result ?? "") ? sp.result : undefined;
  const user = (sp.user ?? "").slice(0, 60) || undefined;
  const data = auditPage({ q, result, user, page: Number(sp.page) || 1 });
  const keep = { q: q || undefined, result, user };

  return (
    <>
      <PageHeader
        label="Platform · Audit log"
        title="Audit log."
        intro="An append-only record of every privileged action and sign-in — who did what, to which record, from where. Read-only."
      />
      <div className="space-y-4">
        <FilterBar action="/academy/admin/audit">
          <FilterInput name="q" label="Action or object" defaultValue={q} placeholder="e.g. user. or certificate" />
          <FilterSelect name="user" label="User" defaultValue={user ?? ""} options={[{ value: "", label: "Any user" }, ...data.actors.map(([id, name]) => ({ value: id, label: name }))]} />
          <FilterSelect name="result" label="Result" defaultValue={result ?? ""} options={[{ value: "", label: "Any result" }, { value: "success", label: "Success" }, { value: "denied", label: "Denied" }, { value: "failed", label: "Failed" }]} />
        </FilterBar>
        <nav aria-label="Common filters" className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {PREFIXES.map((p) => (
            <Link key={p} href={withParams("/academy/admin/audit", { ...keep, q: undefined }, { q: p })} aria-current={q === p ? "true" : undefined} className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[11.5px] text-ink/75 hover:border-ink/40 aria-[current]:border-ink aria-[current]:bg-ink aria-[current]:text-white">
              {p}
            </Link>
          ))}
        </nav>
        <DataTable
          caption="Audit log entries"
          rows={data.rows}
          rowKey={(a) => `${a.id}:${a.at}:${a.action}`}
          empty={<EmptyState icon="activity" title="No matching entries" text="Try a broader action prefix or clear the filters." />}
          columns={[
            { key: "action", label: "Action", mobile: "primary", render: (a) => <span className="font-mono text-[13px]">{a.action}</span> },
            { key: "time", label: "Time", render: (a) => <span className="whitespace-nowrap font-mono text-[12px] text-muted">{formatDateTime(a.at)}</span> },
            { key: "user", label: "User", render: (a) => a.userName ?? "System" },
            { key: "object", label: "Object", render: (a) => <span className="block min-w-0"><span className="block text-[13px]">{a.objectType}</span><span className="block max-w-[200px] truncate font-mono text-[11px] text-muted">{a.objectId ?? "—"}</span></span> },
            { key: "result", label: "Result", render: (a) => <StatusPill status={a.result === "success" ? "succeeded" : a.result} label={a.result === "success" ? "Success" : undefined} /> },
            { key: "meta", label: "Metadata", mobile: "hide", className: "max-w-[280px]", render: (a) => <MetaChips meta={a.meta} /> },
            { key: "ip", label: "IP", mobile: "hide", className: "hidden xl:table-cell", render: (a) => <span className="font-mono text-[11.5px] text-muted">{a.ip ?? "—"}</span> },
          ]}
        />
        <Pager page={data.page} pages={data.pages} total={data.total} label="entries" href={(p) => withParams("/academy/admin/audit", keep, { page: p > 1 ? String(p) : undefined })} />
      </div>
    </>
  );
}
