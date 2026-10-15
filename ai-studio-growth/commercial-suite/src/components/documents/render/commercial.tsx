import { DOCUMENT_TYPE_META, TAX_MODE_LABEL } from "@/lib/documents/meta";
import type { RenderableDocument } from "@/lib/documents/render-model";
import { brandLine } from "@/lib/documents/render-model";
import {
  AmountInWords, BankDetails, companyLines, LineItemsTable, Logos, metaRows, PartyBlock, Signature, TaxSummary, TextBlock, TotalsTable, Watermark,
} from "./shared";

const PROFORMA_DISCLAIMER =
  "This is a proforma invoice issued for advance payment or approval purposes. It is not a tax invoice and cannot be used to claim input tax credit. A tax invoice will be issued in accordance with applicable rules.";

function titleFor(doc: RenderableDocument) {
  return DOCUMENT_TYPE_META[doc.type].printTitle;
}

function Body({ doc, premium }: { doc: RenderableDocument; premium: boolean }) {
  const isInvoiceLike = doc.type === "INVOICE" || doc.type === "PROFORMA";
  const showShip = doc.customer.shippingAddress && doc.customer.shippingAddress !== doc.customer.billingAddress;
  return (
    <>
      <div className="doc-parties">
        <PartyBlock label={doc.type === "QUOTATION" ? "Prepared for" : "Bill to"} customer={doc.customer} />
        {showShip ? (
          <PartyBlock label="Ship to / Service location" customer={doc.customer} address={doc.customer.shippingAddress} />
        ) : (
          <div className="doc-party">
            <div className="k">Tax treatment</div>
            <div className="name">{TAX_MODE_LABEL[doc.taxMode]}</div>
            <div className="lines">
              {doc.placeOfSupply ? `Place of supply: ${doc.placeOfSupply}${doc.placeOfSupplyCode ? ` (${doc.placeOfSupplyCode})` : ""}` : "Place of supply: not specified"}
              {doc.title ? `\nSubject: ${doc.title}` : ""}
            </div>
          </div>
        )}
      </div>

      <LineItemsTable doc={doc} premium={premium} />

      <div className="doc-summary">
        <div>
          <AmountInWords doc={doc} />
          {doc.type === "INVOICE" && <TaxSummary doc={doc} />}
          {doc.paymentTerms && <TextBlock title="Payment terms" text={doc.paymentTerms} />}
        </div>
        <TotalsTable doc={doc} showPayments={doc.type === "INVOICE" && doc.status !== "DRAFT"} />
      </div>

      {doc.type === "PROFORMA" && <div className="doc-disclaimer">{PROFORMA_DISCLAIMER}</div>}
      {isInvoiceLike && <BankDetails company={doc.company} />}
      <TextBlock title="Notes" text={doc.notes} />
      <TextBlock title="Terms & conditions" text={doc.terms} />
      <Signature company={doc.company} />
      {doc.company.documentFooter && <div className="doc-foot">{doc.company.documentFooter}</div>}
    </>
  );
}

/** Templates 2 & 3 — Professional Quotation / Professional Invoice (compact, print-friendly A4). */
export function ProfessionalCommercial({ doc }: { doc: RenderableDocument }) {
  const c = doc.company;
  return (
    <section className="doc-part doc-part--flow">
      <Watermark doc={doc} />
      <header className="doc-head">
        <div className="company">
          <Logos company={c} height={34} />
          <h3>{c.legalName || brandLine(c)}</h3>
          <div className="lines">{companyLines(c)}</div>
        </div>
        <div className="title">
          <h1>{titleFor(doc)}</h1>
          {doc.isSample && <div style={{ marginTop: 6 }}><span className="doc-sample-ribbon">Sample document — not a real transaction</span></div>}
          <table className="doc-meta">
            <tbody>
              {metaRows(doc).map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </header>
      <Body doc={doc} premium={false} />
    </section>
  );
}

/** Template 1 (A4 variant) — Premium Commercial quotation / invoice with navy header. */
export function PremiumCommercial({ doc }: { doc: RenderableDocument }) {
  const c = doc.company;
  return (
    <section className="doc-part doc-part--flow">
      <Watermark doc={doc} />
      <header className="doc-premium-head">
        <div>
          <div className="eyebrow">{brandLine(c)}</div>
          <h1>{titleFor(doc)}</h1>
          <div className="meta">
            {metaRows(doc).map(([k, v], i) => (
              <span key={k}>
                {i > 0 && "  ·  "}
                {k}: <b>{v}</b>
              </span>
            ))}
          </div>
          {doc.isSample && <div style={{ marginTop: 8 }}><span className="doc-sample-ribbon">Sample document — not a real transaction</span></div>}
        </div>
        <Logos company={c} height={38} />
      </header>
      <div className="doc-premium-company">
        <div>
          <strong>{c.legalName || brandLine(c)}</strong>
          <div className="lines">{companyLines(c)}</div>
        </div>
        {doc.title && (
          <div style={{ textAlign: "right", maxWidth: "45%" }}>
            <div className="doc-label" style={{ marginTop: 0 }}>Subject</div>
            <strong>{doc.title}</strong>
          </div>
        )}
      </div>
      <Body doc={doc} premium />
    </section>
  );
}
