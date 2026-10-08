import { formatDate } from "@/lib/platform/format";
import { cn } from "@/lib/cn";

/** A certificate rendered in EMC's style. It is an EMC course certificate — not an external professional certification. */
export function CertificateCard({
  id, holder, program, template, issuedAt, revoked,
}: {
  id: string;
  holder: string;
  program: string;
  template: string;
  issuedAt: string;
  revoked: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-line bg-white p-1.5", revoked && "opacity-70")}>
      <div className="relative overflow-hidden rounded-[13px] border border-ink/10 bg-[linear-gradient(135deg,#fff_0%,#f5f9fd_60%,#eaf6fb_100%)] px-6 py-7 sm:px-9 sm:py-9">
        <div className="grid-bg absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(18,181,212,.18),transparent_65%)]" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink">EMC Academy</p>
              <p className="mt-1 label !text-[9.5px]">EMC course certificate · {template}</p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-cyan/60 bg-white font-mono text-[11px] font-semibold text-cyan-ink" aria-hidden="true">EMC</span>
          </div>
          <p className="mt-8 text-[13px] text-muted">This certifies that</p>
          <p className="display mt-1.5 text-[30px] leading-tight sm:text-[38px]">{holder}</p>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink/80">
            has met the requirements of the <span className="font-semibold text-ink">{template.toLowerCase()}</span> in the <span className="font-semibold text-ink">{program}</span> at EMC Academy.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ink/10 pt-4 sm:grid-cols-3">
            <div><p className="label !text-[9px]">Issued</p><p className="mt-1 text-[13px] font-medium">{formatDate(issuedAt)}</p></div>
            <div><p className="label !text-[9px]">Certificate ID</p><p className="mt-1 font-mono text-[12.5px] font-medium">{id}</p></div>
            <div className="col-span-2 sm:col-span-1"><p className="label !text-[9px]">Verify</p><p className="mt-1 truncate font-mono text-[12px] text-blue">/verify/{id}</p></div>
          </div>
        </div>
        {revoked && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span className="-rotate-12 rounded-lg border-2 border-orange-700/70 px-4 py-1.5 font-mono text-[18px] font-semibold uppercase tracking-[0.2em] text-orange-800/80">Revoked</span>
          </div>
        )}
      </div>
    </div>
  );
}
