import Link from "next/link";
import { requirePermission } from "@/server/auth/session";
import { commandCenter } from "@/server/repositories/admin";
import { formatTime, formatWeekday, greeting, inr, relative } from "@/lib/platform/format";
import { Funnel, HBars } from "@/components/academy/charts";
import { Avatar, DemoBadge, Metrics, Notice, Panel, Pill, ProgressBar, Ring, StatusPill, TextLink, humanize } from "@/components/academy/ui";
import { Dot, seen } from "@/components/academy/admin/bits";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Command center · EMC Academy" };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  // The command center summarises every area, so it is gated on the platform-operator permission.
  const user = await requirePermission("users.manage");
  const { denied } = await searchParams;
  const cc = commandCenter();
  const m = cc.metrics;
  const f = cc.finance;
  const collectedPct = f.billed ? Math.round((f.collected / f.billed) * 100) : 0;
  const broken = cc.integrations.filter((i) => i.status === "error").length;

  return (
    <div className="space-y-5">
      {denied && <Notice tone="warning">You don’t have the “{denied}” permission, so we brought you back to the command center.</Notice>}

      {/* Focal band: state of the academy + what needs attention */}
      <section aria-labelledby="cc-title" className="relative overflow-hidden rounded-[22px] bg-ink text-white">
        <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(18,181,212,.25),transparent_62%)]" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 md:p-9 lg:grid-cols-[1.1fr_1fr] lg:items-stretch">
          <div className="flex flex-col">
            <p className="label !text-white/55">{greeting()}, {user.firstName} · {formatWeekday(new Date().toISOString())}</p>
            <h1 id="cc-title" className="heading mt-4 text-[34px] md:text-[48px]">EMC Command Center.</h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/65">
              {m.pendingTasks > 0 ? <><span className="font-semibold text-white">{cc.attention.length} areas</span> need attention today.</> : "Nothing needs your attention right now."}{" "}
              {cc.today.classes.length} class{cc.today.classes.length === 1 ? "" : "es"} running, {cc.today.leads.length} new lead{cc.today.leads.length === 1 ? "" : "s"}, {broken ? `${broken} integration error${broken === 1 ? "" : "s"}` : "no integration errors"}.
            </p>
            <dl className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 pt-0 sm:grid-cols-4 lg:mt-8">
              {[
                { k: "Students", v: m.students, h: `${m.activeStudents} active`, href: "/academy/admin/users?role=student" },
                { k: "Faculty", v: m.faculty, h: "active accounts", href: "/academy/admin/users?role=faculty" },
                { k: "Courses", v: m.coursesPublished, h: `${m.coursesDraft} in draft`, href: "/academy/admin/courses" },
                { k: "Batches", v: m.batchesActive, h: `${m.batchesPlanned} planned`, href: "/academy/admin/batches" },
              ].map((x) => (
                <Link key={x.k} href={x.href} className="block bg-ink/80 p-4 transition-colors hover:bg-navy">
                  <dt className="label !text-[10px] !text-white/50">{x.k}</dt>
                  <dd className="mt-2 text-[28px] font-semibold leading-none tabular-nums">{x.v}</dd>
                  <p className="mt-1.5 text-[12px] text-white/50">{x.h}</p>
                </Link>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-5 text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,.6)] md:p-6" id="attention">
            <div className="flex items-center justify-between gap-3">
              <p className="label !text-cyan-ink">Needs attention</p>
              <Pill tone={m.pendingTasks ? "warning" : "success"}>{m.pendingTasks} open item{m.pendingTasks === 1 ? "" : "s"}</Pill>
            </div>
            {cc.attention.length === 0 ? (
              <div className="mt-6 rounded-xl bg-mist px-4 py-6 text-center">
                <Icon name="check" size={22} className="mx-auto text-emerald-600" />
                <p className="mt-2 text-[15px] font-semibold">All clear</p>
                <p className="mt-1 text-[13.5px] text-muted">No overdue invoices, failed messages or stalled reviews.</p>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {cc.attention.map((a) => (
                  <li key={a.key}>
                    <Link href={a.href} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-mist">
                      <Dot tone={a.tone} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-medium leading-snug">{a.title}</span>
                        {a.detail && <span className="block truncate text-[12.5px] text-muted">{a.detail}</span>}
                      </span>
                      <Icon name="chevron" size={15} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Growth & money in one hairline row */}
      <Metrics
        items={[
          { label: "Leads this month", value: m.leadsMonth, hint: `${m.leads30} in the last 30 days`, href: "/academy/marketing/leads" },
          { label: "Admissions open", value: m.admissionsOpen, hint: `${m.admissionsTotal - m.admissionsOpen} enrolled from pipeline`, href: "/academy/admin/admissions" },
          { label: "Collected", value: <span className="text-[26px] md:text-[30px]">{inr(f.collected)}</span>, hint: `${collectedPct}% of ${inr(f.billed)} billed`, href: "/academy/admin/finance" },
          { label: "Outstanding", value: <span className="text-[26px] md:text-[30px]">{inr(f.outstanding)}</span>, hint: `${inr(f.overdue)} overdue`, href: "/academy/admin/finance?status=overdue" },
        ]}
      />

      {/* Today + health */}
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Panel title="Today" label={formatWeekday(new Date().toISOString())} action={<TextLink href="/academy/admin/batches">Batches</TextLink>}>
          {cc.today.classes.length === 0 ? (
            <p className="rounded-xl bg-mist px-4 py-5 text-[14px] text-muted">No live classes scheduled today across any batch.</p>
          ) : (
            <ul className="space-y-2">
              {cc.today.classes.map(({ session: s, batch, faculty, end }) => {
                const live = Date.now() >= new Date(s.startsAt).getTime() && Date.now() <= new Date(end).getTime();
                const done = Date.now() > new Date(end).getTime();
                return (
                  <li key={s.id} className="flex items-center gap-4 rounded-xl border border-line p-4">
                    <div className="w-16 shrink-0">
                      <p className="font-mono text-[13px] font-medium">{formatTime(s.startsAt)}</p>
                      <p className="font-mono text-[10.5px] text-muted">{formatTime(end)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{s.title}</p>
                      <p className="truncate text-[12.5px] text-muted">{batch} · {faculty}</p>
                    </div>
                    {live ? <Pill tone="accent" dot>Live now</Pill> : done ? <Pill>Finished</Pill> : <Pill>{relative(s.startsAt)}</Pill>}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            <div className="bg-white p-4">
              <p className="label !text-[10px]">New leads today</p>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums">{cc.today.leads.length}</p>
              {cc.today.leads.length > 0 ? (
                <p className="mt-1 truncate text-[12.5px] text-muted">{cc.today.leads.slice(0, 3).map((l) => `${l.name} (${humanize(l.source)})`).join(" · ")}</p>
              ) : <p className="mt-1 text-[12.5px] text-muted">No enquiries yet today.</p>}
            </div>
            <div className="bg-white p-4">
              <p className="label !text-[10px]">Payments today</p>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums">{inr(cc.today.payments.reduce((s, p) => s + p.payment.amount, 0))}</p>
              <p className="mt-1 truncate text-[12.5px] text-muted">
                {cc.today.payments.length ? cc.today.payments.slice(0, 2).map((p) => p.student).join(" · ") : "No payments recorded today."}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Academy health" label="Last 2 weeks">
          <div className="flex items-center gap-5">
            <Ring value={cc.health.attendance ?? 0} label="Average attendance">
              <span className="text-[18px] font-semibold tabular-nums">{cc.health.attendance ?? "—"}%</span>
            </Ring>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">Average attendance</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">Present or late across every class held in the last 14 days.</p>
            </div>
          </div>
          <p className="label mt-6 !text-[10px]">Average completion per batch</p>
          <ul className="mt-3 space-y-3.5">
            {cc.health.batches.map((b) => (
              <li key={b.batch.id}>
                <Link href={`/academy/admin/batches/${b.batch.id}`} className="block rounded-md hover:opacity-85">
                  <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                    <span className="truncate">{b.batch.name}</span>
                    <span className="shrink-0 tabular-nums font-medium">{b.completion !== null ? `${b.completion}%` : "—"}</span>
                  </div>
                  <ProgressBar value={b.completion ?? 0} tone="blue" className="mt-1.5" label={`${b.batch.name} completion`} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Learning quality, teaching, pipeline */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Course performance" label="Average score" action={<TextLink href="/academy/admin/courses">Courses</TextLink>}>
          {cc.coursePerformance.length === 0 ? (
            <p className="text-[14px] text-muted">Scores appear once students complete assessments.</p>
          ) : (
            <HBars data={cc.coursePerformance} format={(v) => `${v}%`} max={100} />
          )}
          <p className="mt-4 text-[12px] text-muted">Assessment attempts and reviewed assignments combined.</p>
        </Panel>

        <Panel title="Faculty activity" label="Reviews · sessions" id="faculty" action={<TextLink href="/academy/admin/users?role=faculty">Faculty</TextLink>}>
          {cc.faculty.length === 0 ? (
            <p className="text-[14px] text-muted">No faculty accounts yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {cc.faculty.map((fa) => (
                <li key={fa.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar name={fa.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{fa.name}</p>
                    <p className="truncate text-[12px] text-muted">{fa.lastLogin ? `Last seen ${seen(fa.lastLogin).toLowerCase()}` : "Never signed in"}</p>
                  </div>
                  <div className="grid shrink-0 grid-cols-3 gap-3 text-right">
                    <span><span className="block text-[15px] font-semibold tabular-nums">{fa.reviews}</span><span className="block font-mono text-[9.5px] uppercase text-muted">Reviews</span></span>
                    <span><span className="block text-[15px] font-semibold tabular-nums">{fa.sessions}</span><span className="block font-mono text-[9.5px] uppercase text-muted">Classes</span></span>
                    <span><span className={`block text-[15px] font-semibold tabular-nums ${fa.pending > 5 ? "text-orange-700" : ""}`}>{fa.pending}</span><span className="block font-mono text-[9.5px] uppercase text-muted">Queue</span></span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Admissions pipeline" label="Reached each stage" action={<TextLink href="/academy/admin/admissions">Board</TextLink>}>
          {cc.funnel[0]?.value ? <Funnel stages={cc.funnel} /> : <p className="text-[14px] text-muted">No applications yet.</p>}
        </Panel>

        <Panel title="Finance snapshot" action={<DemoBadge />}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[28px] font-semibold tracking-tight tabular-nums">{inr(f.collected)}</p>
            <p className="text-[13px] text-muted">of {inr(f.billed)} billed</p>
          </div>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-mist" role="img" aria-label={`Collected ${collectedPct}%, overdue ${f.billed ? Math.round((f.overdue / f.billed) * 100) : 0}%`}>
            <span className="h-full bg-cyan" style={{ width: `${collectedPct}%` }} />
            <span className="h-full bg-orange-400" style={{ width: `${f.billed ? (f.overdue / f.billed) * 100 : 0}%` }} />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-muted">
            <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan" />Collected</li>
            <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-400" />Overdue {inr(f.overdue)}</li>
            <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-mist ring-1 ring-line" />Not yet due {inr(Math.max(0, f.outstanding - f.overdue))}</li>
          </ul>
          <p className="label mt-6 !text-[10px]">Overdue — follow up first</p>
          {cc.overdueInvoices.length === 0 ? (
            <p className="mt-2 text-[13.5px] text-muted">No overdue invoices.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {cc.overdueInvoices.map((o) => (
                <li key={o.id}>
                  <Link href={`/academy/admin/finance?invoice=${o.id}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 text-[13.5px] hover:bg-mist">
                    <Dot tone="danger" />
                    <span className="min-w-0 flex-1 truncate"><span className="font-medium">{o.student}</span> <span className="font-mono text-[11.5px] text-muted">{o.number}</span></span>
                    <span className="shrink-0 tabular-nums font-medium">{inr(o.amount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4"><TextLink href="/academy/admin/finance">Open finance</TextLink></div>
        </Panel>
      </div>

      {/* System */}
      <div className="grid gap-5">

        <Panel title="System" label="Integrations · audit" action={<TextLink href="/academy/admin/audit">Audit log</TextLink>}>
          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-4">
            {cc.integrations.map((i) => (
              <li key={i.key} className="flex items-center justify-between gap-3 border-b border-dashed border-line py-1.5 text-[13.5px]">
                <span className="truncate">{i.label}</span>
                <StatusPill status={i.status} />
              </li>
            ))}
          </ul>
          <p className="label mt-6 !text-[10px]">Recent activity</p>
          <ul className="mt-2 grid divide-y divide-line md:grid-cols-2 md:gap-x-8 md:divide-y-0">
            {cc.recentAudit.map((a) => (
              <li key={`${a.id}-${a.at}`} className="flex items-center gap-3 border-line py-2.5 text-[13.5px] md:border-b">
                <Dot tone={a.result === "success" ? "success" : "danger"} />
                <span className="min-w-0 flex-1 truncate"><span className="font-mono text-[12.5px]">{a.action}</span> <span className="text-muted">· {a.userName ?? "System"}</span></span>
                <span className="shrink-0 font-mono text-[11px] text-muted">{relative(a.at)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
