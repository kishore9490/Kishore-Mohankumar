import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink, FileCheck2, Pencil, ArrowLeftRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { loadRenderableDocument } from "@/lib/documents/load";
import {
  DOCUMENT_TYPE_META, PAYMENT_METHOD_LABEL, TAX_MODE_LABEL, TEMPLATE_META, allowedConversions, isEditable, typeFromSlug, type DocumentStatus, type DocumentType,
} from "@/lib/documents/meta";
import { dec, formatMoney } from "@/lib/money";
import { formatDate, formatDateTime, todayISO } from "@/lib/dates";
import { brevoStatus, whatsappStatus, publicAppUrl } from "@/lib/integrations/config";
import { composeDefaults } from "@/lib/integrations/compose";
import { DELIVERY_STATUS_META } from "@/lib/integrations/messages";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, SampleBadge, StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { ActionButton } from "@/components/forms/action-button";
import { PreviewFrame } from "@/components/editor/preview-frame";
import { DocumentMoreMenu } from "@/components/documents/document-actions";
import { PaymentDialog } from "@/components/documents/payment-dialog";
import { EmailDialog, WhatsAppDialog } from "@/components/documents/send-dialogs";
import { docHref } from "@/components/documents/doc-link";
import { deletePaymentAction, issueInvoiceAction } from "@/app/actions/documents";

export const dynamic = "force-dynamic";

export default async function DocumentPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const user = await requireUser();
  const { kind, id } = await params;
  const type = typeFromSlug(kind);
  if (!type) notFound();
  const [doc, raw] = await Promise.all([
    loadRenderableDocument(id),
    prisma.document.findUnique({
      where: { id },
      include: {
        customer: true,
        payments: { orderBy: { paymentDate: "asc" }, include: { recordedBy: { select: { name: true } } } },
        communications: { orderBy: { createdAt: "desc" }, take: 15 },
        auditEvents: { orderBy: { createdAt: "desc" }, take: 15, include: { user: { select: { name: true } } } },
        convertedFrom: { select: { id: true, type: true, number: true } },
        conversions: { select: { id: true, type: true, number: true, status: true } },
      },
    }),
  ]);
  if (!doc || !raw || raw.type !== type) notFound();
  const meta = DOCUMENT_TYPE_META[type];
  const stored = raw.status as DocumentStatus;
  const editable = isEditable({ type, status: stored });
  const existingConversionTypes = raw.conversions.map((c) => c.type as DocumentType);
  const canConvert = (type === "QUOTATION" || type === "PROPOSAL") ? stored === "ACCEPTED" : type === "PROFORMA" ? stored !== "CANCELLED" : false;
  const conversions = canConvert ? allowedConversions(type).filter((t) => !existingConversionTypes.includes(t)) : [];
  const balance = dec(doc.totals.balance);
  const sendable = stored !== "CANCELLED" && !(type === "INVOICE" && stored === "DRAFT") && doc.lines.length > 0;
  const compose = sendable ? await composeDefaults(id, user.name) : null;
  const [brevo, wa, publicUrl] = await Promise.all([brevoStatus(), whatsappStatus(), publicAppUrl()]);
  const waSettings = wa.settings;
  const inWindow = !!raw.customer.whatsappLastInboundAt && Date.now() - raw.customer.whatsappLastInboundAt.getTime() < 24 * 3_600_000;
  const waProps = { mode: wa.mode, apiActive: wa.apiActive, consent: raw.customer.whatsappConsent, inWindow, linksEnabled: !!publicUrl };
  const reminderAllowed = type === "INVOICE" && ["ISSUED", "PARTIALLY_PAID"].includes(stored) && balance.gt(0);
  const dateRows: [string, string][] = [
    ["Issue date", formatDate(doc.issueDate)],
    ...(doc.validUntil ? ([["Valid until", formatDate(doc.validUntil)]] as [string, string][]) : []),
    ...(doc.dueDate ? ([["Due date", formatDate(doc.dueDate)]] as [string, string][]) : []),
    ["Place of supply", doc.placeOfSupply ? `${doc.placeOfSupply} (${doc.placeOfSupplyCode ?? "—"})` : "Not specified"],
    ["GST treatment", TAX_MODE_LABEL[doc.taxMode]],
    ["Template", TEMPLATE_META[doc.template].label],
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: meta.plural, href: `/documents/${meta.slug}` }, { label: doc.number ?? "Draft" }]}
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            {meta.label} {doc.number ?? <span className="text-muted">(draft)</span>}
            <StatusBadge status={doc.status} />
            {doc.isSample && <SampleBadge />}
          </span>
        }
        description={<>{doc.customer.name}{doc.title ? ` · ${doc.title}` : ""}</>}
        actions={
          <>
            {editable && <Link href={`/documents/${meta.slug}/${id}/edit`} className={buttonClass({ variant: "outline", size: "sm" })}><Pencil /> Edit</Link>}
            {type === "INVOICE" && stored === "DRAFT" && (
              <ActionButton variant="primary" action={issueInvoiceAction.bind(null, id)} confirm={{ title: "Issue this tax invoice?", description: "A unique invoice number is assigned from the configured series and the invoice is locked for editing. Totals are re-validated before issuing." }} confirmLabel="Issue invoice">
                <FileCheck2 /> Issue invoice
              </ActionButton>
            )}
            {type === "INVOICE" && ["ISSUED", "PARTIALLY_PAID"].includes(stored) && balance.gt(0) && (
              <PaymentDialog documentId={id} balance={balance.toFixed(2)} today={todayISO()} minDate={doc.issueDate} />
            )}
            <a href={`/api/documents/${id}/pdf`} target="_blank" rel="noopener" className={buttonClass({ variant: "outline", size: "sm" })}><ExternalLink /> Preview PDF</a>
            <a href={`/api/documents/${id}/pdf?download=1`} className={buttonClass({ variant: "navy", size: "sm" })}><Download /> Download PDF</a>
            <DocumentMoreMenu id={id} type={type} storedStatus={stored} conversions={conversions} canDelete={stored === "DRAFT" && !(type === "INVOICE" && raw.number) && raw.conversions.length === 0} />
          </>
        }
      />

      {(type === "QUOTATION" || type === "PROPOSAL") && stored !== "ACCEPTED" && doc.status !== "EXPIRED" && stored !== "REJECTED" && (
        <p className="mb-4 text-[13px] text-muted">Tip: mark the {meta.label.toLowerCase()} as accepted (More → Status) to convert it into an invoice or proforma invoice.</p>
      )}
      {doc.status === "EXPIRED" && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">This {meta.label.toLowerCase()} expired on {formatDate(doc.validUntil)}. Edit the validity date to reopen it, or duplicate it as a new draft.</div>
      )}
      {type === "INVOICE" && stored === "DRAFT" && !doc.company.legalName && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">The company profile has no legal name, GSTIN or bank details. Complete <Link href="/settings/company" className="underline">Company Settings</Link> before issuing real tax invoices.</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-4">
          {sendable && compose && (
            <Card className="flex flex-wrap items-center gap-2 p-3">
              <span className="mr-1 text-[13px] font-medium text-muted">Send to customer:</span>
              <EmailDialog documentId={id} defaultTo={doc.customer.email ?? ""} compose={compose.email.DOCUMENT} kind="DOCUMENT" configured={brevo.configured} mockMode={brevo.mode === "mock"} missing={brevo.missing} label={`Email ${meta.label.toLowerCase()}`} />
              <WhatsAppDialog documentId={id} defaultTo={doc.customer.phone ?? ""} compose={compose.whatsapp.DOCUMENT} kind="DOCUMENT" label="WhatsApp" hasTemplate={!!waSettings.documentTemplateName} {...waProps} />
              {reminderAllowed && (
                <>
                  <EmailDialog documentId={id} defaultTo={doc.customer.email ?? ""} compose={compose.email.PAYMENT_REMINDER} kind="PAYMENT_REMINDER" configured={brevo.configured} mockMode={brevo.mode === "mock"} missing={brevo.missing} label="Email payment reminder" />
                  <WhatsAppDialog documentId={id} defaultTo={doc.customer.phone ?? ""} compose={compose.whatsapp.PAYMENT_REMINDER} kind="PAYMENT_REMINDER" label="WhatsApp reminder" hasTemplate={!!(waSettings.reminderTemplateName || waSettings.documentTemplateName)} {...waProps} />
                </>
              )}
            </Card>
          )}
          {!sendable && stored !== "CANCELLED" && (
            <p className="text-[13px] text-muted">{type === "INVOICE" && stored === "DRAFT" ? "Issue the invoice to enable sending by email or WhatsApp." : "Add at least one line item to enable sending."}</p>
          )}
          <PreviewFrame doc={doc} maxHeight="calc(100vh - 180px)" />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Summary" />
            <CardBody className="space-y-4 text-sm">
              <div>
                <Link href={`/customers/${raw.customerId}`} className="font-medium hover:text-brand-700">{doc.customer.name}</Link>
                <div className="text-xs text-muted">{[doc.customer.email, doc.customer.phone].filter(Boolean).join(" · ")}</div>
              </div>
              <dl className="space-y-2">
                {dateRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>
                ))}
              </dl>
              <dl className="space-y-1.5 border-t border-line pt-3">
                <div className="flex justify-between"><dt className="text-muted">Taxable amount</dt><dd className="tabular">{formatMoney(doc.totals.taxableTotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">GST</dt><dd className="tabular">{formatMoney(doc.totals.taxTotal)}</dd></div>
                <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="tabular">{formatMoney(doc.totals.grandTotal)}</dd></div>
                {type === "INVOICE" && stored !== "DRAFT" && (
                  <>
                    <div className="flex justify-between"><dt className="text-muted">Paid</dt><dd className="tabular text-emerald-700">{formatMoney(doc.totals.amountPaid)}</dd></div>
                    <div className="flex justify-between font-semibold"><dt>Balance due</dt><dd className="tabular text-brand-700">{formatMoney(doc.totals.balance)}</dd></div>
                  </>
                )}
              </dl>
            </CardBody>
          </Card>

          {(raw.convertedFrom || raw.conversions.length > 0) && (
            <Card>
              <CardHeader title="Linked documents" />
              <CardBody className="space-y-2 text-sm">
                {raw.convertedFrom && (
                  <div className="flex items-center gap-2"><ArrowLeftRight className="size-4 text-muted" /> Created from <Link className="font-medium text-brand-700" href={docHref(raw.convertedFrom)}>{DOCUMENT_TYPE_META[raw.convertedFrom.type as DocumentType].label} {raw.convertedFrom.number}</Link></div>
                )}
                {raw.conversions.map((c) => (
                  <div key={c.id} className="flex items-center gap-2"><ArrowLeftRight className="size-4 text-muted" /> Converted to <Link className="font-medium text-brand-700" href={docHref(c)}>{DOCUMENT_TYPE_META[c.type as DocumentType].label} {c.number ?? "(draft)"}</Link></div>
                ))}
              </CardBody>
            </Card>
          )}

          {type === "INVOICE" && (
            <Card>
              <CardHeader title="Payments" description={stored === "DRAFT" ? "Issue the invoice to record payments." : `${raw.payments.length} recorded`} />
              {raw.payments.length === 0 ? (
                <CardBody><p className="text-sm text-muted">No payments recorded. Invoices are never marked paid automatically.</p></CardBody>
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {raw.payments.map((p) => (
                    <li key={p.id} className="flex items-start justify-between gap-3 px-5 py-3">
                      <div>
                        <div className="font-medium tabular">{formatMoney(p.amount.toString())}</div>
                        <div className="text-xs text-muted">{formatDate(p.paymentDate)} · {PAYMENT_METHOD_LABEL[p.method]}{p.reference ? ` · ${p.reference}` : ""}</div>
                        {p.notes && <div className="text-xs text-muted">{p.notes}</div>}
                      </div>
                      {user.role === "ADMIN" && (
                        <ActionButton variant="ghost" danger action={deletePaymentAction.bind(null, p.id)} confirm={{ title: "Remove this payment?", description: "The invoice balance and status will be recalculated." }} confirmLabel="Remove">Remove</ActionButton>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <Card>
            <CardHeader title="Communication" actions={<Link href={`/communications?document=${id}`} className="text-[13px] text-brand-700 hover:underline">All</Link>} />
            {raw.communications.length === 0 ? (
              <CardBody><p className="text-sm text-muted">Nothing sent yet.</p></CardBody>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {raw.communications.map((m) => (
                  <li key={m.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{m.channel === "WHATSAPP_MANUAL" ? "WhatsApp Business" : m.channel === "EMAIL" ? "Email" : "WhatsApp API"} → {m.recipient}</span>
                      <Badge tone={DELIVERY_STATUS_META[m.status].tone}>{DELIVERY_STATUS_META[m.status].label}</Badge>
                    </div>
                    <div className="text-xs text-muted">{m.messageType === "PAYMENT_REMINDER" ? "Payment reminder · " : ""}{formatDateTime(m.createdAt)}{m.mode === "DEV_MOCK" ? " · dev mock" : ""}</div>
                    {m.errorMessage && <div className="mt-1 text-xs text-red-600">{m.errorMessage}</div>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="History" actions={<Link href={`/history?document=${id}`} className="text-[13px] text-brand-700 hover:underline">All</Link>} />
            <ul className="divide-y divide-line text-sm">
              {raw.auditEvents.map((a) => (
                <li key={a.id} className="px-5 py-2.5">
                  <div>{a.summary}</div>
                  <div className="text-xs text-muted">{a.user?.name ?? "System"} · {formatDateTime(a.createdAt)}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
