"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Eye, Save, UserPlus } from "lucide-react";
import { documentSchema, type DocumentInput } from "@/lib/validation/schemas";
import { saveDocumentAction } from "@/app/actions/documents";
import { DOCUMENT_TYPE_META, TAX_MODE_LABEL, TEMPLATE_META, type DocumentTemplate, type DocumentType } from "@/lib/documents/meta";
import { buildLinesAndTotals, brandLine, type LineDetails, type RenderableDocument } from "@/lib/documents/render-model";
import { DEFAULT_PROPOSAL_SECTIONS, defaultSection, type ProposalSectionData } from "@/lib/proposal/sections";
import { suggestTaxMode, type TaxMode } from "@/lib/tax";
import { addDaysISO } from "@/lib/dates";
import { INDIAN_STATES } from "@/lib/indian-states";
import { cn } from "@/lib/utils";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CustomerForm } from "@/components/forms/customer-form";
import { useUnsavedWarning } from "@/components/forms/use-unsaved-warning";
import { LineItemsStep } from "./line-items-step";
import { SectionsEditor } from "./sections-editor";
import { PreviewFrame } from "./preview-frame";
import type { EditorCompany, EditorCustomer, EditorProduct } from "./types";

type StepKey = "customer" | "details" | "items" | "sections" | "terms" | "preview";

const STEP_LABELS: Record<StepKey, string> = {
  customer: "Customer",
  details: "Document details",
  items: "Services & pricing",
  sections: "Proposal sections",
  terms: "Terms & conditions",
  preview: "Design & preview",
};

const STEP_FIELDS: Partial<Record<StepKey, Path<DocumentInput>[]>> = {
  customer: ["customerId", "companyId"],
  details: ["issueDate", "validUntil", "dueDate", "placeOfSupplyCode", "taxMode", "title"],
  items: ["lineItems"],
  terms: ["terms", "notes", "paymentTerms"],
};

export function DocumentEditor({
  type, documentId, documentNumber, initial, companies, customers: initialCustomers, products, preparedBy,
}: {
  type: DocumentType;
  documentId?: string;
  documentNumber?: string | null;
  initial: DocumentInput;
  companies: EditorCompany[];
  customers: EditorCustomer[];
  products: EditorProduct[];
  preparedBy: string;
}) {
  const router = useRouter();
  const meta = DOCUMENT_TYPE_META[type];
  const isProposal = type === "PROPOSAL";
  const steps: StepKey[] = isProposal ? ["customer", "details", "items", "sections", "terms", "preview"] : ["customer", "details", "items", "terms", "preview"];
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState(initialCustomers);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [customerFilter, setCustomerFilter] = useState("");
  const [pending, start] = useTransition();

  const form = useForm<DocumentInput>({ resolver: zodResolver(documentSchema) as never, defaultValues: initial, mode: "onTouched" });
  const { register, control, formState, setValue, trigger, handleSubmit, getValues } = form;
  const errors = formState.errors;
  useUnsavedWarning(formState.isDirty && !formState.isSubmitSuccessful);

  const values = useWatch({ control }) as DocumentInput;
  const company = companies.find((c) => c.id === values.companyId) ?? companies[0];
  const customer = customers.find((c) => c.id === values.customerId);
  const sections = useMemo(() => (values.sections ?? []) as ProposalSectionData[], [values.sections]);

  const sectionCtx = useMemo(
    () => ({ customerName: customer?.name ?? "the customer", brandLine: company ? brandLine(company) : "", companyPhone: company?.phone, companyEmail: company?.email, preparedBy }),
    [customer?.name, company, preparedBy],
  );

  const previewDoc: RenderableDocument | null = useMemo(() => {
    if (!company) return null;
    const { lines, totals } = buildLinesAndTotals(
      (values.lineItems ?? []).map((l) => ({
        name: l.name || "Untitled item",
        description: l.description,
        details: (l.details ?? null) as LineDetails | null,
        hsnSac: l.hsnSac,
        quantity: l.quantity,
        unit: l.unit,
        unitPrice: l.unitPrice,
        discountType: l.discountType,
        discountValue: l.discountValue,
        taxRate: values.taxMode === "NO_TAX" ? "0" : l.taxRate,
        billingFrequency: l.billingFrequency,
      })),
      values.taxMode as TaxMode,
      company.roundingMode,
    );
    return {
      id: documentId ?? "preview",
      type,
      number: documentNumber ?? null,
      status: "DRAFT",
      template: values.template as DocumentTemplate,
      title: values.title,
      reference: values.reference,
      issueDate: values.issueDate,
      validUntil: values.validUntil || null,
      dueDate: values.dueDate || null,
      placeOfSupply: values.placeOfSupply,
      placeOfSupplyCode: values.placeOfSupplyCode,
      taxMode: values.taxMode as TaxMode,
      notes: values.notes,
      terms: values.terms,
      paymentTerms: values.paymentTerms,
      company,
      customer: customer ?? { name: "Select a customer" },
      lines,
      totals,
      sections,
      preparedBy,
      isPreview: true,
    };
  }, [values, company, customer, sections, documentId, documentNumber, type, preparedBy]);

  const selectCustomer = (id: string) => {
    setValue("customerId", id, { shouldDirty: true, shouldValidate: true });
    const c = customers.find((x) => x.id === id);
    if (c) {
      setValue("placeOfSupply", c.state ?? "", { shouldDirty: true });
      setValue("placeOfSupplyCode", c.stateCode ?? "", { shouldDirty: true });
      setValue("taxMode", suggestTaxMode(company?.stateCode, c.stateCode), { shouldDirty: true });
    }
  };

  const setPlaceOfSupply = (code: string) => {
    const st = INDIAN_STATES.find((s) => s.code === code);
    setValue("placeOfSupplyCode", code, { shouldDirty: true });
    setValue("placeOfSupply", st?.name ?? "", { shouldDirty: true });
    if (company?.stateCode && code) setValue("taxMode", suggestTaxMode(company.stateCode, code), { shouldDirty: true });
  };

  const goTo = async (target: number) => {
    if (target > step) {
      const fields = STEP_FIELDS[steps[step]];
      if (fields && !(await trigger(fields))) {
        toast.error("Please fix the highlighted fields before continuing.");
        return;
      }
    }
    if (steps[target] === "sections" && sections.length === 0) {
      setValue("sections", DEFAULT_PROPOSAL_SECTIONS.map((t) => defaultSection(t, sectionCtx)) as DocumentInput["sections"], { shouldDirty: true });
    }
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = (then: "stay" | "view") =>
    handleSubmit(
      () =>
        start(async () => {
          const res = await saveDocumentAction(documentId ?? null, getValues());
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(res.message);
          form.reset(getValues());
          if (then === "view" || !documentId) router.push(res.data!.path);
          router.refresh();
        }),
      (errs) => {
        const first = Object.keys(errs)[0];
        toast.error(first === "lineItems" ? "Some line items are invalid. Check quantities, prices, discounts and GST rates." : "Please complete the required fields.");
        const stepWithError = steps.findIndex((s) => (STEP_FIELDS[s] ?? []).some((f) => String(f).split(".")[0] === first));
        if (stepWithError >= 0) setStep(stepWithError);
      },
    )();

  const filteredCustomers = customers.filter((c) => !customerFilter || c.name.toLowerCase().includes(customerFilter.toLowerCase()));
  const dateField = meta.dateLabel;
  const current = steps[step];

  return (
    <div className="pb-28">
      {/* Stepper */}
      <ol className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1.5">
        {steps.map((s, i) => (
          <li key={s} className="min-w-fit flex-1">
            <button
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors",
                i === step ? "bg-navy-900 text-white" : i < step ? "text-ink hover:bg-canvas" : "text-muted hover:bg-canvas",
              )}
              aria-current={i === step ? "step" : undefined}
            >
              <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full text-[11px]", i === step ? "bg-brand-500 text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-muted")}>
                {i < step ? <Check className="size-3" /> : i + 1}
              </span>
              <span className="whitespace-nowrap">{STEP_LABELS[s]}</span>
            </button>
          </li>
        ))}
      </ol>

      {current === "customer" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader title="Who is this for?" description="Select an existing customer or create a new one." actions={<Button type="button" variant="secondary" size="sm" onClick={() => setNewCustomerOpen(true)}><UserPlus /> New customer</Button>} />
            <CardBody className="space-y-4">
              <Input placeholder="Filter customers…" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} aria-label="Filter customers" />
              {errors.customerId && <p className="text-sm text-red-600" role="alert">{errors.customerId.message}</p>}
              <div className="grid max-h-[420px] gap-2 overflow-y-auto sm:grid-cols-2">
                {filteredCustomers.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => selectCustomer(c.id)}
                    className={cn("rounded-xl border p-3 text-left transition-colors", values.customerId === c.id ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-line hover:border-brand-300")}
                  >
                    <div className="font-medium text-ink">{c.name}</div>
                    <div className="mt-0.5 truncate text-xs text-muted">{[c.contactPerson, c.email, c.state].filter(Boolean).join(" · ") || "No contact details"}</div>
                  </button>
                ))}
                {filteredCustomers.length === 0 && <p className="text-sm text-muted">No customers found. Create a new one.</p>}
              </div>
            </CardBody>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader title="Issuing company" description="Branding and legal details used on the document." />
              <CardBody>
                <Field label="Company profile" htmlFor="companyId" error={errors.companyId?.message}>
                  <Select id="companyId" {...register("companyId")} disabled={!!documentNumber}>
                    {companies.map((c) => <option key={c.id} value={c.id}>{brandLine(c)}{c.legalName ? ` — ${c.legalName}` : ""}</option>)}
                  </Select>
                </Field>
                {company && !company.legalName && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">Legal name, GSTIN and bank details are not configured for this profile. Add them in Company Settings before issuing tax invoices.</p>
                )}
              </CardBody>
            </Card>
            {customer && (
              <Card>
                <CardHeader title="Billing details" description="Frozen onto the document when saved." />
                <CardBody className="space-y-1 text-sm">
                  <div className="font-medium">{customer.name}</div>
                  <div className="whitespace-pre-line text-muted">{customer.billingAddress || "No billing address"}</div>
                  <div className="text-muted">{customer.gstin ? `GSTIN ${customer.gstin}` : "No GSTIN (unregistered)"}</div>
                  <div className="text-muted">{customer.state ? `${customer.state} (${customer.stateCode})` : "State not set"}</div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}

      {current === "details" && (
        <Card>
          <CardHeader title="Document details" description={`${meta.label} number is assigned automatically${type === "INVOICE" ? " when the invoice is issued" : " when first saved"}.`} />
          <CardBody className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label={isProposal ? "Proposal title" : "Subject / title"} htmlFor="title" error={errors.title?.message} className="md:col-span-2" hint={isProposal ? "Shown large on the cover page" : "Optional"}>
              <Input id="title" {...register("title")} placeholder={isProposal ? "e.g. Annual AI Communication & Automation Package" : "e.g. Website redesign"} />
            </Field>
            <Field label="Customer reference / PO" htmlFor="reference">
              <Input id="reference" {...register("reference")} />
            </Field>
            <Field label={type === "INVOICE" ? "Invoice date" : "Issue date"} htmlFor="issueDate" error={errors.issueDate?.message} required>
              <Input id="issueDate" type="date" {...register("issueDate")} />
            </Field>
            <Field label={dateField === "validUntil" ? "Valid until" : "Due date"} htmlFor={dateField} error={errors[dateField]?.message} required={type === "INVOICE"}>
              <Input id={dateField} type="date" {...register(dateField)} />
              <div className="mt-1.5 flex gap-1.5">
                {[7, 15, 30].map((d) => (
                  <button key={d} type="button" className="rounded-md bg-canvas px-2 py-0.5 text-xs text-muted hover:bg-brand-50 hover:text-brand-700" onClick={() => setValue(dateField, addDaysISO(values.issueDate, d), { shouldDirty: true, shouldValidate: true })}>
                    +{d} days
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Place of supply" htmlFor="pos" error={errors.placeOfSupplyCode?.message} hint="Defaults to the customer’s state">
              <Select id="pos" value={values.placeOfSupplyCode ?? ""} onChange={(e) => setPlaceOfSupply(e.target.value)}>
                <option value="">Not specified</option>
                {INDIAN_STATES.map((s) => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
              </Select>
            </Field>
            <Field
              label="GST treatment"
              htmlFor="taxMode"
              className="md:col-span-2"
              hint={
                company?.stateCode && values.placeOfSupplyCode
                  ? `Suggested: ${TAX_MODE_LABEL[suggestTaxMode(company.stateCode, values.placeOfSupplyCode)]} (supplier state ${company.stateCode}, place of supply ${values.placeOfSupplyCode}). You can override it — verify the correct treatment for each supply.`
                  : "Set the company state in Company Settings to get a suggestion. Verify the correct treatment for each supply."
              }
            >
              <Select id="taxMode" {...register("taxMode")}>
                {Object.entries(TAX_MODE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>
          </CardBody>
        </Card>
      )}

      {current === "items" && (
        <LineItemsStep
          control={control}
          register={register}
          errors={errors}
          setValue={setValue}
          products={products}
          totals={previewDoc!.totals}
          isProposal={isProposal}
          defaultTaxRate={company?.defaultTaxRate ?? "18"}
          taxMode={values.taxMode}
        />
      )}

      {current === "sections" && (
        <SectionsEditor sections={sections} onChange={(s) => setValue("sections", s as DocumentInput["sections"], { shouldDirty: true })} ctx={sectionCtx} />
      )}

      {current === "terms" && (
        <Card>
          <CardHeader title="Terms & conditions" description="Pre-filled from the company profile. Edit for this document as needed." />
          <CardBody className="grid gap-4">
            <Field label="Payment terms" htmlFor="paymentTerms" error={errors.paymentTerms?.message} hint="e.g. 50% advance, balance on delivery">
              <Textarea id="paymentTerms" rows={2} {...register("paymentTerms")} />
            </Field>
            <Field label="Terms & conditions" htmlFor="terms" error={errors.terms?.message}>
              <Textarea id="terms" rows={7} {...register("terms")} />
            </Field>
            <Field label="Notes to customer" htmlFor="notes" error={errors.notes?.message}>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </Field>
          </CardBody>
        </Card>
      )}

      {current === "preview" && previewDoc && (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <Card className="h-fit">
            <CardHeader title="Design template" />
            <CardBody className="space-y-2">
              {meta.templates.map((t) => (
                <label key={t} className={cn("block cursor-pointer rounded-xl border p-3 transition-colors", values.template === t ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-line hover:border-brand-300")}>
                  <input type="radio" value={t} {...register("template")} className="sr-only" />
                  <div className="text-sm font-semibold text-ink">{TEMPLATE_META[t].label}</div>
                  <div className="text-xs text-muted">{TEMPLATE_META[t].description}</div>
                  <div className="mt-1 text-[11px] font-medium text-brand-700">{TEMPLATE_META[t].format}</div>
                </label>
              ))}
              <p className="pt-2 text-xs text-muted">The live preview uses the same renderer as the PDF. Exact page breaks, page numbers and footers are applied when the PDF is generated after saving.</p>
            </CardBody>
          </Card>
          <PreviewFrame doc={previewDoc} maxHeight="calc(100vh - 220px)" />
        </div>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 py-3 md:px-8">
          <Link href={documentId ? `/documents/${meta.slug}/${documentId}` : `/documents/${meta.slug}`} className={buttonClass({ variant: "ghost" })}>Cancel</Link>
          <span className="hidden text-xs text-muted md:inline">{formState.isDirty ? "Unsaved changes" : documentId ? "All changes saved" : "Not saved yet"}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}><Eye /> <span className="hidden sm:inline">Preview</span></Button>
            {step > 0 && <Button type="button" variant="outline" onClick={() => goTo(step - 1)}><ChevronLeft /> Back</Button>}
            <Button type="button" variant="secondary" onClick={() => save("stay")} loading={pending}><Save /> Save draft</Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={() => goTo(step + 1)}>Next <ChevronRight /></Button>
            ) : (
              <Button type="button" onClick={() => save("view")} loading={pending}>Save &amp; continue to PDF <ChevronRight /></Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen}>
        <DialogContent title="New customer" description="The customer is saved and selected for this document." wide>
          <CustomerForm
            compact
            onSaved={(c) => {
              setCustomers((prev) => [...prev, { id: c.id, name: c.name, contactPerson: c.contactPerson, email: c.email, phone: c.phone, billingAddress: c.billingAddress, shippingAddress: c.shippingAddress, gstin: c.gstin, state: c.state, stateCode: c.stateCode }].sort((a, b) => a.name.localeCompare(b.name)));
              setNewCustomerOpen(false);
              setTimeout(() => selectCustomer(c.id), 0);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent title="Live preview" description="Unsaved changes are included." className="max-w-5xl">
          {previewDoc && <PreviewFrame doc={previewDoc} maxHeight="75vh" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
