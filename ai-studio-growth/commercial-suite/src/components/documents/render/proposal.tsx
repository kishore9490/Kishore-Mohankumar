import type { ReactNode } from "react";
import {
  BadgeCheck, Bot, Calendar, CalendarClock, CircleCheck, ClipboardCheck, Cpu, Layers, Lightbulb, ListChecks, Mail,
  MessageCircle, MessagesSquare, Phone, Repeat, Route, Search, ShieldCheck, Signpost, Sparkles, Target, TrendingUp,
  User, UserCheck, Workflow, X, Zap,
} from "lucide-react";
import { daysBetweenISO, formatDate } from "@/lib/dates";
import { BILLING_FREQUENCY_LABEL } from "@/lib/documents/meta";
import type { RenderableDocument, RenderLine, RenderPart } from "@/lib/documents/render-model";
import { brandLine, enabledSections, pageFormatFor } from "@/lib/documents/render-model";
import type { ProposalSectionData, SectionItem } from "@/lib/proposal/sections";
import { dec } from "@/lib/money";
import { Logos, money, Note, packagePrice, RichText, frequencySuffix, Watermark } from "./shared";

const ICONS = [MessageCircle, Search, ClipboardCheck, Signpost, MessagesSquare, UserCheck, Sparkles, Zap, ShieldCheck, Layers, Workflow, TrendingUp, Target, Lightbulb, Route, Repeat];
const COMPONENT_ICONS = [Phone, Cpu, Bot, Workflow, Sparkles, Layers];

function iconFor(i: number, size = 18, set = ICONS) {
  const Icon = set[i % set.length];
  return <Icon size={size} strokeWidth={2} />;
}

/** Decorative gauge inspired by the reference proposal's allocation dials. */
export function Gauge({ size = 300, progress = 0.82, children }: { size?: number; progress?: number; children?: ReactNode }) {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const start = 135;
  const sweep = 270;
  const polar = (deg: number, rad = r) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };
  const arc = (from: number, to: number) => {
    const [x1, y1] = polar(from);
    const [x2, y2] = polar(to);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  const end = start + sweep * progress;
  const [ex, ey] = polar(end);
  const ticks = Array.from({ length: 31 }, (_, i) => start + (sweep / 30) * i);
  const gid = `g${size}${Math.round(progress * 100)}`;
  return (
    <div className="doc-gauge-wrap" style={{ width: size, height: size * 0.86, margin: "0 auto" }}>
      <svg className="doc-gauge" width={size} height={size * 0.86} viewBox={`0 0 ${size} ${size * 0.86}`} aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="#5b4ce6" />
            <stop offset="100%" stopColor="#b39dff" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => {
          const [x1, y1] = polar(t, r + size * 0.06);
          const [x2, y2] = polar(t, r + size * (i % 5 === 0 ? 0.11 : 0.085));
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.35)" strokeWidth={i % 5 === 0 ? 2 : 1} />;
        })}
        <path d={arc(start, start + sweep)} stroke="rgba(255,255,255,0.10)" strokeWidth={size * 0.03} fill="none" strokeLinecap="round" />
        <path d={arc(start, end)} stroke={`url(#${gid})`} strokeWidth={size * 0.03} fill="none" strokeLinecap="round" />
        <circle cx={ex} cy={ey} r={size * 0.022} fill="#fff" />
      </svg>
      <div className="doc-gauge-center">{children}</div>
    </div>
  );
}

function CoverArt() {
  const pts = [[150, 110], [228, 150], [196, 222], [118, 200], [262, 236], [176, 286], [95, 262], [240, 92]];
  const links = [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [2, 5], [5, 6], [3, 6], [0, 7], [7, 1], [4, 5]];
  return (
    <svg className="doc-cover-art" width="400" height="400" viewBox="0 0 400 400" aria-hidden>
      <defs>
        <linearGradient id="cv" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="#5b4ce6" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,0.06)" />
      {Array.from({ length: 41 }, (_, i) => {
        const deg = 135 + (270 / 40) * i;
        const a = ((deg - 90) * Math.PI) / 180;
        const r1 = 168;
        const r2 = i % 5 === 0 ? 184 : 176;
        return <line key={i} x1={200 + r1 * Math.cos(a)} y1={200 + r1 * Math.sin(a)} x2={200 + r2 * Math.cos(a)} y2={200 + r2 * Math.sin(a)} stroke="rgba(255,255,255,0.28)" strokeWidth={i % 5 === 0 ? 2 : 1} />;
      })}
      <path d="M 81.2 318.8 A 168 168 0 1 1 340 120" stroke="url(#cv)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="340" cy="120" r="7" fill="#fff" />
      {links.map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="rgba(199,203,255,0.35)" strokeWidth="1" />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 2 ? 5 : 3} fill={i === 2 ? "#fff" : "#c7cbff"} />
      ))}
    </svg>
  );
}

function SectionHead({ section, index, eyebrow }: { section: ProposalSectionData; index: number; eyebrow?: ReactNode }) {
  return (
    <div className="doc-section-head avoid-break">
      <div className="doc-eyebrow">{eyebrow ?? section.content.eyebrow}</div>
      <span className="doc-section-num">{String(index + 1).padStart(2, "0")}</span>
      <h2 className="doc-h2">{section.title}</h2>
    </div>
  );
}

function presentedBy(doc: RenderableDocument) {
  return (
    <div className="presented">
      <div className="doc-presented-label">Presented by</div>
      <Logos company={doc.company} height={pageFormatFor(doc) === "slide" ? 58 : 50} />
    </div>
  );
}

// ───────── Full-page sections ─────────

function Cover({ doc, section }: { doc: RenderableDocument; section: ProposalSectionData }) {
  const c = section.content;
  const price = c.highlight?.trim() || (doc.lines.length ? packagePrice(doc) : "");
  return (
    <div className="doc-cover doc-dark">
      {pageFormatFor(doc) === "slide" && <CoverArt />}
      <div className="eyebrow">{c.eyebrow || "Proposal for"}</div>
      <div className="customer">{doc.customer.name}</div>
      <h1>{doc.title || "Commercial Proposal"}</h1>
      {c.body && <div className="tagline">{c.body}</div>}
      {price && (
        <div className="price-box">
          <div className="k">{c.highlightLabel || "Package price"}</div>
          <div className="v">{price}</div>
          {c.note && <div className="n">{c.note}</div>}
        </div>
      )}
      {presentedBy(doc)}
      {doc.isSample && <div className="sample"><span className="doc-sample-ribbon">Sample proposal</span></div>}
    </div>
  );
}

function Closing({ doc, section }: { doc: RenderableDocument; section: ProposalSectionData }) {
  const c = section.content;
  const paragraphs = (c.body ?? "").split(/\n{2,}/).filter(Boolean);
  const price = c.highlight?.trim() || (doc.lines.length ? packagePrice(doc) : "");
  const contactIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("phone") || l.includes("mobile")) return <Phone size={18} />;
    if (l.includes("email") || l.includes("mail")) return <Mail size={18} />;
    return <User size={18} />;
  };
  const validity = doc.validUntil ? `${daysBetweenISO(doc.issueDate, doc.validUntil)} days (until ${formatDate(doc.validUntil)})` : null;
  return (
    <div className="doc-closing doc-dark">
      <div className="left">
        <div className="doc-eyebrow" style={{ color: "#a5b4fc" }}>{c.eyebrow || "Thank you"}</div>
        <h1>{section.title}</h1>
        {paragraphs[0] && <p className="first">{paragraphs[0]}</p>}
        {paragraphs.slice(1).map((p, i) => (
          <p className="rest" key={i}>{p}</p>
        ))}
        {price && <div style={{ margin: "18px 0 26px" }}><span className="doc-pill" style={{ fontSize: 15, letterSpacing: 0, textTransform: "none", padding: "11px 24px" }}>{price}</span></div>}
        {presentedBy(doc)}
      </div>
      <div className="doc-contact-panel">
        <div className="t">Proposal contact details</div>
        {(c.items ?? []).filter((i) => i.title || i.detail).map((it, i) => (
          <div className="doc-contact-row" key={i}>
            {contactIcon(it.title)}
            <div>
              <div className="k">{it.title}</div>
              <div className="v">{it.detail}</div>
            </div>
          </div>
        ))}
        <div className="doc-contact-row">
          <Calendar size={18} />
          <div>
            <div className="k">Proposal date</div>
            <div className="v">{formatDate(doc.issueDate)}</div>
          </div>
        </div>
        {validity && (
          <div className="doc-contact-row">
            <CalendarClock size={18} />
            <div>
              <div className="k">Proposal validity</div>
              <div className="v">{validity}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────── Flow sections ─────────

/** Shortens text for summary pages; the full text is shown on service detail pages. */
function summarize(text: string | null | undefined, max = 170): string | undefined {
  if (!text) return undefined;
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[,.;:\s]+$/, "")}…`;
}

function hasServicePages(doc: RenderableDocument) {
  return enabledSections(doc).some((s) => s.type === "SERVICE_OVERVIEW");
}

function componentItems(doc: RenderableDocument, items?: SectionItem[]): SectionItem[] {
  if (items && items.length) return items;
  return doc.lines.map((l) => ({ title: l.name, detail: summarize(l.description, 140), tag: l.details?.badge }));
}

function ExecutiveSummary({ doc, section, index }: SectionProps) {
  const c = section.content;
  const items = componentItems(doc, c.items);
  return (
    <>
      <SectionHead section={section} index={index} />
      <div className="doc-cols doc-cols--wide-right doc-cols--stack-a4">
        <div>
          <RichText text={c.body} className="doc-lead" />
          {c.highlight && (
            <>
              <div className="doc-label">{c.highlightLabel || "Objective"}</div>
              <p>{c.highlight}</p>
            </>
          )}
        </div>
        <div className="doc-component-list">
          {items.map((it, i) => (
            <div className="doc-card doc-component" key={i}>
              <span className="doc-icon">{iconFor(i, 18, COMPONENT_ICONS)}</span>
              <div>
                <h4>
                  {it.title}
                  {it.tag && <span className="doc-badge">{it.tag}</span>}
                </h4>
                {it.detail && <p>{it.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {doc.lines.length > 0 && (
        <div className="doc-band">
          <div>
            <div className="k">Total package price</div>
            <div className="v">{packagePrice(doc)}</div>
          </div>
          <div className="r">{doc.lines.map((l) => l.name).join(" + ")}</div>
        </div>
      )}
      <Note text={c.note} />
    </>
  );
}

function ServicePage({ doc, line, n, eyebrowBase, first }: { doc: RenderableDocument; line: RenderLine; n: number; eyebrowBase: string; first: boolean }) {
  const d = line.details ?? {};
  const description = d.detailedDescription || line.description;
  const hasMetric = !!d.metricValue;
  const free = dec(line.unitPrice).isZero();
  const panel = (
    <div className="doc-dark-panel">
      <Gauge size={pageFormatFor(doc) === "slide" ? 300 : 230} progress={free ? 0.55 : 0.82}>
        <div className="k">{d.metricLabel || (free ? "Included" : "Allocation")}</div>
        <div className={`metric ${(d.metricValue ?? "").length > 5 ? "long" : ""}`}>{d.metricValue}</div>
        {d.metricUnit && <div className="k">{d.metricUnit}</div>}
      </Gauge>
      {(d.metricNote || d.badge) && <hr />}
      {d.badge && <div style={{ marginBottom: 10 }}><span className="doc-pill doc-pill--light">{d.badge}</span></div>}
      {d.metricNote && <p style={{ fontSize: 15, color: "#fff", margin: 0 }}>{d.metricNote}</p>}
    </div>
  );
  const details = (
    <div>
      <RichText text={description} className="doc-lead" />
      {!!d.inclusions?.length && (
        <>
          <div className="doc-label">Potential applications &amp; inclusions</div>
          <div className="doc-chips">
            {d.inclusions.map((x, i) => (
              <span className="doc-chip" key={i}>{x}</span>
            ))}
          </div>
        </>
      )}
      {!!d.benefits?.length && (
        <>
          <div className="doc-label">How it may help</div>
          <ul className="doc-checklist doc-checklist--2">
            {d.benefits.map((x, i) => (
              <li key={i}>
                <span className="doc-icon doc-icon--soft" style={{ width: 26, height: 26 }}>{iconFor(i + 3, 14)}</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {!!d.exclusions?.length && (
        <>
          <div className="doc-label">Not included</div>
          <ul className="doc-checklist">
            {d.exclusions.map((x, i) => (
              <li key={i}>
                <X size={14} style={{ color: "var(--doc-muted)" }} />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="doc-totals-strip">
        <span>Commercial treatment: <b>{d.treatment || (free ? "Included at no additional charge" : money(doc, line.taxableAmount, { compact: true }))}</b></span>
        {line.billingFrequency && <span>Billing: <b>{BILLING_FREQUENCY_LABEL[line.billingFrequency]}</b></span>}
      </div>
    </div>
  );
  return (
    <div className="doc-section">
      {!first && <div className="doc-page-break" />}
      <div className="doc-section-head avoid-break">
        <div className="doc-eyebrow">
          {eyebrowBase} {String(n).padStart(2, "0")}
          <span className="sep">·</span>
          {line.name}
        </div>
        <h2 className="doc-h2">{line.name}</h2>
      </div>
      {hasMetric ? (
        <div className="doc-cols doc-cols--wide-right doc-cols--stack-a4">
          {panel}
          {details}
        </div>
      ) : (
        details
      )}
    </div>
  );
}

function Features({ section, index }: SectionProps) {
  const c = section.content;
  return (
    <>
      <SectionHead section={section} index={index} />
      <RichText text={c.body} className="doc-lead" />
      <div className="doc-grid doc-grid--3">
        {(c.items ?? []).map((it, i) => (
          <div className="doc-card doc-feature" key={i}>
            <div className="head">
              <span className="doc-icon">{iconFor(i)}</span>
              <h4>{it.title}</h4>
            </div>
            {it.detail && <p>{it.detail}</p>}
          </div>
        ))}
      </div>
      <Note text={c.note} />
    </>
  );
}

function BusinessValue({ doc, section, index }: SectionProps) {
  const c = section.content;
  return (
    <>
      <SectionHead section={section} index={index} />
      <div className="doc-cols doc-cols--wide-left doc-cols--stack-a4">
        <div>
          <RichText text={c.body} className="doc-lead" />
          <div className="doc-grid doc-grid--2" style={{ gap: 22 }}>
            {(c.items ?? []).map((it, i) => (
              <div className="doc-value" key={i}>
                <span className="doc-icon doc-icon--soft">{iconFor(i + 6)}</span>
                <div>
                  <h4>{it.title}</h4>
                  {it.detail && <p>{it.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
        {c.highlight && (
          <div className="doc-dark-panel">
            <div className="k">{c.highlightLabel || "Our objective"}</div>
            <p style={{ fontSize: 20, lineHeight: 1.4, color: "#fff", fontWeight: 700, margin: "14px 0" }}>{c.highlight}</p>
            <div className="muted">{brandLine(doc.company)}</div>
          </div>
        )}
      </div>
      <Note text={c.note} />
    </>
  );
}

function NumberedTerms({ section, index }: SectionProps) {
  const c = section.content;
  return (
    <>
      <SectionHead section={section} index={index} />
      <RichText text={c.body} className="doc-lead" />
      {c.itemsLabel && <div className="doc-label" style={{ marginTop: 0 }}>{c.itemsLabel}</div>}
      <div className="doc-numbered" style={{ gridTemplateRows: `repeat(${Math.ceil((c.items ?? []).length / 2)}, auto)`, gridAutoFlow: "column" }}>
        {(c.items ?? []).map((it, i) => (
          <div className="n" key={i}>
            <span className="i">{i + 1}</span>
            <div>
              <h4>{it.title}</h4>
              {it.detail && <p>{it.detail}</p>}
            </div>
          </div>
        ))}
      </div>
      <ConfirmBox label={c.secondaryLabel} items={c.secondaryItems} />
      <Note text={c.note} />
    </>
  );
}

function ConfirmBox({ label, items }: { label?: string; items?: SectionItem[] }) {
  const list = (items ?? []).filter((i) => i.title);
  if (!list.length) return null;
  return (
    <div className="doc-confirm-box">
      <div className="t">
        <ClipboardCheck size={16} />
        {label || "To be confirmed"}
      </div>
      <ul>
        {list.map((it, i) => (
          <li key={i}>
            {it.title}
            {it.detail ? ` — ${it.detail}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pricing({ doc, section, index }: SectionProps) {
  const c = section.content;
  const t = doc.totals;
  const suffix = frequencySuffix(doc);
  const slide = pageFormatFor(doc) === "slide";
  const priceDisplay = money(doc, t.taxableTotal, { compact: true });
  return (
    <>
      <SectionHead section={section} index={index} />
      <div className="doc-cols doc-cols--wide-left doc-cols--stack-a4">
        <div>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Included service</th>
                <th className="r">Commercial treatment</th>
              </tr>
            </thead>
            <tbody>
              {doc.lines.map((l, i) => (
                <tr key={i}>
                  <td className="item-name">{l.name}</td>
                  <td>
                    {(hasServicePages(doc) ? summarize(l.description) : l.description) || "—"}
                    {dec(l.quantity).gt(1) && <div className="doc-small">Qty {dec(l.quantity).toString()} {l.unit} × {money(doc, l.unitPrice)}</div>}
                  </td>
                  <td className="r treat">
                    {l.details?.treatment || money(doc, l.taxableAmount, { compact: true })}
                  </td>
                </tr>
              ))}
              <tr className="highlight">
                <td>Total package price</td>
                <td>Complete proposed package</td>
                <td className="r">{packagePrice(doc)}</td>
              </tr>
            </tbody>
          </table>
          <div className="doc-totals-strip">
            <span>Taxable value <b className="doc-num">{money(doc, t.taxableTotal)}</b></span>
            {doc.taxMode === "INTRA_STATE" && (
              <>
                <span>CGST <b className="doc-num">{money(doc, t.cgstTotal)}</b></span>
                <span>SGST <b className="doc-num">{money(doc, t.sgstTotal)}</b></span>
              </>
            )}
            {doc.taxMode === "INTER_STATE" && <span>IGST <b className="doc-num">{money(doc, t.igstTotal)}</b></span>}
            {!dec(t.roundOff).isZero() && <span>Round off <b className="doc-num">{money(doc, t.roundOff)}</b></span>}
            <span>Total including GST <b className="doc-num">{money(doc, t.grandTotal)}</b></span>
          </div>
          {c.body && <RichText text={c.body} className="doc-lead" />}
          <Note text={c.note} />
        </div>
        <div className="doc-dark-panel" style={{ textAlign: "center" }}>
          <div className="k">Package price</div>
          <Gauge size={slide ? 250 : 220} progress={0.86}>
            <div className="metric long" style={{ fontSize: priceDisplay.length > 9 ? 30 : 40 }}>{priceDisplay}</div>
            {doc.taxMode !== "NO_TAX" && <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>+ GST</div>}
            {suffix && <div className="k" style={{ marginTop: 4 }}>Per {suffix.replace(" / ", "").toLowerCase()}</div>}
          </Gauge>
          <hr />
          <ul className="doc-checklist" style={{ textAlign: "left" }}>
            {doc.lines.map((l, i) => (
              <li key={i}>
                <BadgeCheck size={16} style={{ color: "#c7cbff" }} />
                <span style={{ color: "#fff" }}>
                  <strong style={{ color: "#fff" }}>{l.name}</strong>
                  {l.details?.treatment ? <span style={{ color: "#a5b4fc" }}> · {l.details.treatment.toLowerCase()}</span> : null}
                </span>
              </li>
            ))}
          </ul>
          {doc.taxMode !== "NO_TAX" && <p className="muted" style={{ marginTop: 12, textAlign: "left" }}>Applicable GST is charged in addition to the package price.</p>}
        </div>
      </div>
    </>
  );
}

function Timeline({ section, index }: SectionProps) {
  const c = section.content;
  const items = c.items ?? [];
  return (
    <>
      <SectionHead section={section} index={index} />
      <RichText text={c.body} className="doc-lead" />
      <div className={`doc-timeline ${items.length > 5 ? "doc-timeline--vertical" : ""}`}>
        {items.map((it, i) => (
          <div className="ph" key={i}>
            {it.tag && <div className="tag">{it.tag}</div>}
            <h4>{it.title}</h4>
            {it.detail && <p>{it.detail}</p>}
          </div>
        ))}
      </div>
      <Note text={c.note} />
    </>
  );
}

function Acceptance({ doc, section, index }: SectionProps) {
  const c = section.content;
  return (
    <>
      <SectionHead section={section} index={index} />
      <RichText text={c.body} className="doc-lead" />
      <div className="doc-totals-strip" style={{ marginBottom: 6 }}>
        <span>Proposal <b>{doc.number ?? "Draft"}</b></span>
        <span>Package <b>{packagePrice(doc)}</b></span>
        {doc.validUntil && <span>Valid until <b>{formatDate(doc.validUntil)}</b></span>}
      </div>
      <div className="doc-sign doc-sign--two">
        <div className="box" style={{ textAlign: "left" }}>
          <div><strong>For {doc.customer.name}</strong></div>
          <div className="line">Name, signature &amp; date</div>
        </div>
        <div className="box" style={{ textAlign: "left" }}>
          <div><strong>For {doc.company.legalName || brandLine(doc.company)}</strong></div>
          <div className="line">{doc.company.authorisedSignatory ? `${doc.company.authorisedSignatory} · Authorised signatory` : "Authorised signatory"}</div>
        </div>
      </div>
      <Note text={c.note} />
    </>
  );
}

type ListStyle = "check" | "numbered" | "cards" | "muted" | "exclude";
function GenericList({ section, index, style }: SectionProps & { style: ListStyle }) {
  const c = section.content;
  const items = c.items ?? [];
  return (
    <>
      <SectionHead section={section} index={index} />
      <div className={c.highlight ? "doc-cols doc-cols--wide-left doc-cols--stack-a4" : ""}>
        <div>
          <RichText text={c.body} className="doc-lead" />
          {style === "numbered" && (
            <div className={`doc-numbered ${items.length <= 4 ? "doc-numbered--single" : ""}`}>
              {items.map((it, i) => (
                <div className="n" key={i}>
                  <span className="i">{i + 1}</span>
                  <div>
                    <h4>{it.title}</h4>
                    {it.detail && <p>{it.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {style === "cards" && (
            <div className="doc-grid doc-grid--2">
              {items.map((it, i) => (
                <div className="doc-card doc-feature" key={i}>
                  <div className="head">
                    <span className="doc-icon">{iconFor(i + 8)}</span>
                    <h4>{it.title}</h4>
                  </div>
                  {it.detail && <p>{it.detail}</p>}
                </div>
              ))}
            </div>
          )}
          {(style === "check" || style === "muted" || style === "exclude") && (
            <ul className={`doc-checklist ${items.length > 6 ? "doc-checklist--2" : ""}`}>
              {items.map((it, i) => (
                <li key={i}>
                  {style === "exclude" ? <X size={16} style={{ color: "var(--doc-muted)" }} /> : style === "muted" ? <ListChecks size={16} /> : <CircleCheck size={16} />}
                  <span>
                    <strong>{it.title}</strong>
                    {it.detail && <> — {it.detail}</>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {c.highlight && (
          <div className="doc-card">
            <div className="doc-label" style={{ marginTop: 0 }}>{c.highlightLabel || "Highlight"}</div>
            <p style={{ color: "var(--doc-ink)", fontWeight: 700, margin: 0 }}>{c.highlight}</p>
          </div>
        )}
      </div>
      <ConfirmBox label={c.secondaryLabel} items={c.secondaryItems} />
      <Note text={c.note} />
    </>
  );
}

interface SectionProps {
  doc: RenderableDocument;
  section: ProposalSectionData;
  index: number;
}

function FlowSection(props: SectionProps & { first: boolean }) {
  const { doc, section, first } = props;
  if (section.type === "SERVICE_OVERVIEW") {
    return (
      <>
        {doc.lines.map((line, i) => (
          <ServicePage key={i} doc={doc} line={line} n={i + 1} eyebrowBase={section.content.eyebrow || "Service"} first={first && i === 0} />
        ))}
        {!doc.lines.length && <p className="doc-small">Add line items to generate service detail pages.</p>}
      </>
    );
  }
  let inner: ReactNode;
  switch (section.type) {
    case "EXECUTIVE_SUMMARY": inner = <ExecutiveSummary {...props} />; break;
    case "FEATURE_BREAKDOWN": inner = <Features {...props} />; break;
    case "BUSINESS_VALUE": inner = <BusinessValue {...props} />; break;
    case "COMMERCIAL_TERMS": inner = <NumberedTerms {...props} />; break;
    case "PRICING_SUMMARY": inner = <Pricing {...props} />; break;
    case "TIMELINE": inner = <Timeline {...props} />; break;
    case "ACCEPTANCE": inner = <Acceptance {...props} />; break;
    case "SCOPE_OF_WORK":
    case "IMPLEMENTATION_PLAN": inner = <GenericList {...props} style="numbered" />; break;
    case "PROPOSED_SOLUTION": inner = <GenericList {...props} style="cards" />; break;
    case "ASSUMPTIONS": inner = <GenericList {...props} style="muted" />; break;
    case "EXCLUSIONS": inner = <GenericList {...props} style="exclude" />; break;
    default: inner = <GenericList {...props} style="check" />;
  }
  const slide = pageFormatFor(doc) === "slide";
  return (
    <div className="doc-section">
      {slide && !first && <div className="doc-page-break" />}
      {inner}
    </div>
  );
}

function DetailedContents({ doc }: { doc: RenderableDocument }) {
  const flow = enabledSections(doc).filter((s) => s.type !== "COVER" && s.type !== "CLOSING_PAGE");
  if (flow.length < 3) return null;
  return (
    <div className="doc-section avoid-break">
      <div className="doc-eyebrow">Contents</div>
      <ol style={{ columns: 2, columnGap: 32, margin: 0, paddingLeft: 18, color: "var(--doc-ink)", fontWeight: 700 }}>
        {flow.map((s, i) => (
          <li key={i} style={{ padding: "3px 0" }}>
            {s.type === "SERVICE_OVERVIEW" ? `${s.title} (${doc.lines.length} service${doc.lines.length === 1 ? "" : "s"})` : s.title}
          </li>
        ))}
      </ol>
      <div className="doc-totals-strip" style={{ marginTop: 14 }}>
        <span>Prepared for <b>{doc.customer.name}</b></span>
        <span>Proposal <b>{doc.number ?? "Draft"}</b></span>
        <span>Date <b>{formatDate(doc.issueDate)}</b></span>
        {doc.validUntil && <span>Valid until <b>{formatDate(doc.validUntil)}</b></span>}
      </div>
    </div>
  );
}

/** Renders one part (full page or flow run) of a proposal. */
export function ProposalPart({ doc, part }: { doc: RenderableDocument; part: RenderPart }) {
  const sections = enabledSections(doc);
  if (part.kind === "full") {
    const s = sections[part.sectionIndexes[0]];
    return (
      <section className="doc-part doc-part--full">
        {s.type === "COVER" ? <Cover doc={doc} section={s} /> : <Closing doc={doc} section={s} />}
      </section>
    );
  }
  const flowIndexes = sections.map((s, i) => ({ s, i })).filter(({ s }) => s.type !== "COVER" && s.type !== "CLOSING_PAGE");
  const isFirstFlowPart = flowIndexes.length > 0 && part.sectionIndexes[0] === flowIndexes[0].i;
  return (
    <section className="doc-part doc-part--flow">
      <Watermark doc={{ ...doc, isSample: false }} />
      {doc.template === "DETAILED_PROPOSAL" && isFirstFlowPart && <DetailedContents doc={doc} />}
      {part.sectionIndexes.length === 0 && <p className="doc-small">This proposal has no sections enabled.</p>}
      {part.sectionIndexes.map((idx, j) => (
        <FlowSection key={idx} doc={doc} section={sections[idx]} index={flowIndexes.findIndex((f) => f.i === idx)} first={j === 0} />
      ))}
    </section>
  );
}

