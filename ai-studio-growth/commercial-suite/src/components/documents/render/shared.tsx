/* Pure presentational building blocks for document rendering (server- and client-safe: no hooks). */
import type { CSSProperties, ReactNode } from "react";
import { Info } from "lucide-react";
import { formatMoney, formatQuantity, dec, amountInWords } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { parseRichText } from "@/lib/proposal/sections";
import { BILLING_FREQUENCY_SUFFIX } from "@/lib/documents/meta";
import type { RenderableDocument, RenderCompany, RenderCustomer } from "@/lib/documents/render-model";

export function docVars(company: RenderCompany): CSSProperties {
  return { ["--doc-navy" as string]: company.primaryColor, ["--doc-accent" as string]: company.accentColor };
}

export function money(doc: Pick<RenderableDocument, "company">, v: string | number, opts: { compact?: boolean } = {}) {
  const s = formatMoney(v, doc.company.currency);
  return opts.compact && dec(v).isInteger() ? s.replace(/\.00$/, "") : s;
}

/** Dominant recurring billing frequency of a document, used for "/ Year" style price suffixes. */
export function frequencySuffix(doc: RenderableDocument): string {
  const freqs = doc.lines.map((l) => l.billingFrequency).filter((f): f is string => !!f && f !== "ONE_TIME");
  return freqs.length ? (BILLING_FREQUENCY_SUFFIX[freqs[0]] ?? "") : "";
}

/** "₹20,000 + Applicable GST / Year" — the package price phrase used throughout premium proposals. */
export function packagePrice(doc: RenderableDocument, opts: { suffix?: boolean } = {}): string {
  const base = money(doc, doc.totals.taxableTotal, { compact: true });
  const gst = doc.taxMode === "NO_TAX" ? "" : " + Applicable GST";
  return `${base}${gst}${opts.suffix === false ? "" : frequencySuffix(doc)}`;
}

export function RichText({ text, className }: { text?: string | null; className?: string }) {
  const blocks = parseRichText(text);
  if (!blocks.length) return null;
  return (
    <div className={className}>
      {blocks.map((b, i) =>
        b.kind === "p" ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i}>
            {b.items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export function Note({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <div className="doc-note avoid-break">
      <Info size={14} />
      <span>{text}</span>
    </div>
  );
}

function LogoTile({ src, tile, height, alt }: { src: string; tile: "light" | "dark"; height: number; alt: string }) {
  return (
    <span className={`doc-logo-tile ${tile}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ height, maxWidth: height * 3.2 }} />
    </span>
  );
}

/** Company brand treatment: configured logos, or a typographic wordmark when no logo is uploaded. */
export function Logos({ company, height = 46 }: { company: RenderCompany; height?: number }) {
  const primary = company.logoPrimary ? (
    <LogoTile src={company.logoPrimary} tile={company.logoPrimaryTile} height={height} alt={company.brandName} />
  ) : (
    <span className="doc-wordmark">{company.brandName}</span>
  );
  const secondary = company.coBrandName ? (
    company.logoSecondary ? (
      <LogoTile src={company.logoSecondary} tile={company.logoSecondaryTile} height={height} alt={company.coBrandName} />
    ) : (
      <span className="doc-wordmark">{company.coBrandName}</span>
    )
  ) : null;
  return (
    <div className="doc-logos">
      {primary}
      {secondary && <span className="x">×</span>}
      {secondary}
    </div>
  );
}

export function addressLines(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join("\n");
}

export function companyLines(c: RenderCompany): string {
  return addressLines([
    c.address,
    c.state ? `${c.state}${c.stateCode ? ` (State code ${c.stateCode})` : ""}` : null,
    [c.phone, c.email].filter(Boolean).join(" · ") || null,
    c.website,
    c.gstin ? `GSTIN: ${c.gstin}` : null,
    c.pan ? `PAN: ${c.pan}` : null,
  ]);
}

export function PartyBlock({ label, customer, address }: { label: string; customer: RenderCustomer; address?: string | null }) {
  return (
    <div className="doc-party">
      <div className="k">{label}</div>
      <div className="name">{customer.name}</div>
      <div className="lines">
        {addressLines([
          customer.contactPerson ? `Attn: ${customer.contactPerson}` : null,
          address ?? customer.billingAddress,
          customer.state ? `${customer.state}${customer.stateCode ? ` (State code ${customer.stateCode})` : ""}` : null,
          [customer.phone, customer.email].filter(Boolean).join(" · ") || null,
          customer.gstin ? `GSTIN: ${customer.gstin}` : null,
        ]) || "—"}
      </div>
    </div>
  );
}

export function LineItemsTable({ doc, premium = false }: { doc: RenderableDocument; premium?: boolean }) {
  const hasDiscount = doc.lines.some((l) => dec(l.discountAmount).gt(0));
  const hasHsn = doc.lines.some((l) => l.hsnSac);
  const showTax = doc.taxMode !== "NO_TAX";
  return (
    <table className={`doc-table ${premium ? "doc-table--premium" : ""}`}>
      <thead>
        <tr>
          <th style={{ width: 26 }}>#</th>
          <th>Item &amp; description</th>
          {hasHsn && <th>HSN/SAC</th>}
          <th className="r">Qty</th>
          <th className="r">Rate</th>
          {hasDiscount && <th className="r">Discount</th>}
          <th className="r">Taxable</th>
          {showTax && <th className="r">GST</th>}
          <th className="r">Amount</th>
        </tr>
      </thead>
      <tbody>
        {doc.lines.length === 0 && (
          <tr>
            <td colSpan={9} className="c" style={{ color: "var(--doc-muted)", padding: 18 }}>
              No line items added yet.
            </td>
          </tr>
        )}
        {doc.lines.map((l, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>
              <div className="item-name">{l.name}</div>
              {l.description && <div className="item-desc">{l.description}</div>}
            </td>
            {hasHsn && <td>{l.hsnSac ?? ""}</td>}
            <td className="r doc-num">
              {formatQuantity(l.quantity)} {l.unit}
            </td>
            <td className="r doc-num">{money(doc, l.unitPrice)}</td>
            {hasDiscount && (
              <td className="r doc-num">
                {dec(l.discountAmount).gt(0) ? (
                  <>
                    {money(doc, l.discountAmount)}
                    {l.discountType === "PERCENT" && <div className="doc-small">{dec(l.discountValue).toString()}%</div>}
                  </>
                ) : (
                  "—"
                )}
              </td>
            )}
            <td className="r doc-num">{money(doc, l.taxableAmount)}</td>
            {showTax && (
              <td className="r doc-num">
                {money(doc, l.taxAmount)}
                <div className="doc-small">{dec(l.taxRate).toString()}%</div>
              </td>
            )}
            <td className="r doc-num" style={{ fontWeight: 700, color: "var(--doc-ink)" }}>
              {money(doc, l.totalAmount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function rateLabel(doc: RenderableDocument, kind: "cgst" | "sgst" | "igst") {
  const rates = [...new Set(doc.lines.map((l) => dec(l.taxRate).toString()))];
  if (rates.length !== 1) return "";
  const r = dec(rates[0]);
  return ` @ ${(kind === "igst" ? r : r.dividedBy(2)).toString()}%`;
}

export function TotalsTable({ doc, showPayments }: { doc: RenderableDocument; showPayments?: boolean }) {
  const t = doc.totals;
  const rows: [string, string, string?][] = [["Subtotal", money(doc, t.subtotal)]];
  if (dec(t.discountTotal).gt(0)) rows.push(["Discount", `− ${money(doc, t.discountTotal)}`]);
  rows.push(["Taxable amount", money(doc, t.taxableTotal), "sep"]);
  if (doc.taxMode === "INTRA_STATE") {
    rows.push([`CGST${rateLabel(doc, "cgst")}`, money(doc, t.cgstTotal)]);
    rows.push([`SGST${rateLabel(doc, "sgst")}`, money(doc, t.sgstTotal)]);
  } else if (doc.taxMode === "INTER_STATE") {
    rows.push([`IGST${rateLabel(doc, "igst")}`, money(doc, t.igstTotal)]);
  } else {
    rows.push(["Tax", "Not applied"]);
  }
  if (!dec(t.roundOff).isZero()) rows.push(["Round off", money(doc, t.roundOff)]);
  return (
    <table className="doc-totals">
      <tbody>
        {rows.map(([k, v, cls], i) => (
          <tr key={i} className={cls}>
            <td>{k}</td>
            <td>{v}</td>
          </tr>
        ))}
        <tr className="grand">
          <td>{doc.type === "QUOTATION" || doc.type === "PROPOSAL" ? "Total amount" : "Grand total"}</td>
          <td>{money(doc, t.grandTotal)}</td>
        </tr>
        {showPayments && dec(t.amountPaid).gt(0) && (
          <tr>
            <td>Amount paid</td>
            <td>− {money(doc, t.amountPaid)}</td>
          </tr>
        )}
        {showPayments && (
          <tr className="balance">
            <td>Balance due</td>
            <td>{money(doc, t.balance)}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export function AmountInWords({ doc }: { doc: RenderableDocument }) {
  return (
    <div className="doc-words">
      <span className="k">Amount in words</span>
      {amountInWords(doc.totals.grandTotal, doc.company.currency)}
    </div>
  );
}

export function TaxSummary({ doc }: { doc: RenderableDocument }) {
  if (doc.taxMode === "NO_TAX" || !doc.totals.taxBreakdown.length) return null;
  const intra = doc.taxMode === "INTRA_STATE";
  return (
    <div className="doc-block">
      <h4>Tax summary</h4>
      <table className="doc-table">
        <thead>
          <tr>
            <th>GST rate</th>
            <th className="r">Taxable value</th>
            {intra ? (
              <>
                <th className="r">CGST</th>
                <th className="r">SGST</th>
              </>
            ) : (
              <th className="r">IGST</th>
            )}
            <th className="r">Total tax</th>
          </tr>
        </thead>
        <tbody>
          {doc.totals.taxBreakdown.map((b) => (
            <tr key={b.rate}>
              <td>{b.rate}%</td>
              <td className="r doc-num">{money(doc, b.taxable)}</td>
              {intra ? (
                <>
                  <td className="r doc-num">{money(doc, b.cgst)}</td>
                  <td className="r doc-num">{money(doc, b.sgst)}</td>
                </>
              ) : (
                <td className="r doc-num">{money(doc, b.igst)}</td>
              )}
              <td className="r doc-num">{money(doc, b.tax)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BankDetails({ company }: { company: RenderCompany }) {
  const rows: [string, string | null | undefined][] = [
    ["Account name", company.bankAccountName],
    ["Bank", company.bankName],
    ["Account no.", company.bankAccountNumber],
    ["IFSC", company.bankIfsc],
    ["Branch", company.bankBranch],
    ["UPI", company.upiId],
  ];
  const present = rows.filter(([, v]) => v);
  if (!present.length && !company.paymentInstructions) return null;
  return (
    <div className="doc-block">
      <h4>Payment details</h4>
      {present.length > 0 && (
        <dl className="doc-bank">
          {present.map(([k, v]) => (
            <Frag key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </Frag>
          ))}
        </dl>
      )}
      {company.paymentInstructions && <div className="body" style={{ marginTop: 6 }}>{company.paymentInstructions}</div>}
    </div>
  );
}

function Frag({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function TextBlock({ title, text }: { title: string; text?: string | null }) {
  if (!text) return null;
  return (
    <div className="doc-block">
      <h4>{title}</h4>
      <div className="body">{text}</div>
    </div>
  );
}

export function Signature({ company }: { company: RenderCompany }) {
  return (
    <div className="doc-sign">
      <div className="box">
        <div>For {company.legalName || company.brandName}</div>
        <div className="line">{company.authorisedSignatory ? `${company.authorisedSignatory} · Authorised signatory` : "Authorised signatory"}</div>
      </div>
    </div>
  );
}

export function Watermark({ doc }: { doc: RenderableDocument }) {
  const word = doc.status === "CANCELLED" ? "cancelled" : doc.status === "DRAFT" ? "draft" : doc.isSample ? "sample" : null;
  if (!word) return null;
  // Image-based so the watermark never pollutes selectable / extracted PDF text.
  return <div className="doc-watermark" aria-hidden style={{ backgroundImage: `url(/brand/watermark-${word}.png)` }} />;
}

export function metaRows(doc: RenderableDocument): [string, string][] {
  const rows: [string, string][] = [];
  rows.push([numberLabel(doc), doc.number ?? (doc.type === "INVOICE" ? "Assigned on issue" : "Draft")]);
  rows.push([doc.type === "INVOICE" ? "Invoice date" : "Date", formatDate(doc.issueDate)]);
  if (doc.validUntil) rows.push(["Valid until", formatDate(doc.validUntil)]);
  if (doc.dueDate) rows.push(["Due date", formatDate(doc.dueDate)]);
  if (doc.placeOfSupply) rows.push(["Place of supply", `${doc.placeOfSupply}${doc.placeOfSupplyCode ? ` (${doc.placeOfSupplyCode})` : ""}`]);
  if (doc.reference) rows.push(["Reference", doc.reference]);
  return rows;
}

function numberLabel(doc: RenderableDocument) {
  switch (doc.type) {
    case "INVOICE":
      return "Invoice no.";
    case "PROFORMA":
      return "Proforma no.";
    case "QUOTATION":
      return "Quotation no.";
    default:
      return "Proposal no.";
  }
}
