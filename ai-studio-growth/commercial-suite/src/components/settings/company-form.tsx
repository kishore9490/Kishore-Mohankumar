"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { companySchema, type CompanyInput } from "@/lib/validation/schemas";
import { saveCompanyAction } from "@/app/actions/settings";
import { INDIAN_STATES } from "@/lib/indian-states";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useUnsavedWarning } from "@/components/forms/use-unsaved-warning";

export function CompanyForm({ id, defaults, readOnly }: { id?: string; defaults: CompanyInput; readOnly?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<CompanyInput>({ resolver: zodResolver(companySchema), defaultValues: defaults });
  const { register, handleSubmit, formState, setValue, watch, setError } = form;
  const e = formState.errors;
  useUnsavedWarning(formState.isDirty && !formState.isSubmitSuccessful);
  const submit = handleSubmit((v) =>
    start(async () => {
      const res = await saveCompanyAction(id ?? null, v);
      if (!res.ok) {
        toast.error(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => setError(k as Path<CompanyInput>, { message: m[0] }));
        return;
      }
      toast.success(res.message);
      form.reset(v);
      router.push(`/settings/company?id=${res.data!.id}`);
      router.refresh();
    }),
  );
  const stateCode = watch("stateCode");
  const txt = (name: Path<CompanyInput>, label: string, opts: { hint?: string; type?: string; className?: string; required?: boolean } = {}) => (
    <Field label={label} htmlFor={name} error={(e as Record<string, { message?: string }>)[name]?.message} hint={opts.hint} className={opts.className} required={opts.required}>
      <Input id={name} type={opts.type} {...register(name)} disabled={readOnly} aria-invalid={!!(e as Record<string, unknown>)[name]} />
    </Field>
  );
  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card>
        <CardHeader title="Branding" description="Presentation only — kept separate from legal and tax identity." />
        <CardBody className="grid gap-4 md:grid-cols-2">
          {txt("brandName", "Brand name", { required: true })}
          {txt("coBrandName", "Co-brand name", { hint: "Shown as “Brand × Co-brand”" })}
          {txt("tagline", "Tagline", { className: "md:col-span-2" })}
          <Field label="Primary colour (navy)" htmlFor="primaryColor" error={e.primaryColor?.message}>
            <div className="flex gap-2"><input type="color" aria-label="Pick primary colour" value={watch("primaryColor")} onChange={(ev) => setValue("primaryColor", ev.target.value, { shouldDirty: true })} className="h-9 w-12 rounded border border-line" disabled={readOnly} /><Input id="primaryColor" {...register("primaryColor")} disabled={readOnly} /></div>
          </Field>
          <Field label="Accent colour (purple)" htmlFor="accentColor" error={e.accentColor?.message}>
            <div className="flex gap-2"><input type="color" aria-label="Pick accent colour" value={watch("accentColor")} onChange={(ev) => setValue("accentColor", ev.target.value, { shouldDirty: true })} className="h-9 w-12 rounded border border-line" disabled={readOnly} /><Input id="accentColor" {...register("accentColor")} disabled={readOnly} /></div>
          </Field>
          <Field label="Primary logo tile" htmlFor="logoPrimaryTile" hint="Background drawn behind the logo on light pages">
            <Select id="logoPrimaryTile" {...register("logoPrimaryTile")} disabled={readOnly}><option value="light">Light (white)</option><option value="dark">Dark (navy)</option></Select>
          </Field>
          <Field label="Secondary logo tile" htmlFor="logoSecondaryTile" hint="Use dark for logos with white lettering">
            <Select id="logoSecondaryTile" {...register("logoSecondaryTile")} disabled={readOnly}><option value="light">Light (white)</option><option value="dark">Dark (navy)</option></Select>
          </Field>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Legal & tax identity" description="Leave blank anything you have not confirmed — nothing is invented. Tax invoices need the legal name, address, GSTIN and state." />
        <CardBody className="grid gap-4 md:grid-cols-2">
          {txt("legalName", "Legal company name", { className: "md:col-span-2" })}
          <Field label="Registered address" htmlFor="address" className="md:col-span-2"><Textarea id="address" rows={3} {...register("address")} disabled={readOnly} /></Field>
          {txt("gstin", "GSTIN", { hint: "15 characters" })}
          {txt("pan", "PAN")}
          <Field label="State" htmlFor="stateCode" error={e.stateCode?.message} hint="Used to suggest CGST+SGST vs IGST">
            <Select id="stateCode" value={stateCode ?? ""} disabled={readOnly} onChange={(ev) => { const s = INDIAN_STATES.find((x) => x.code === ev.target.value); setValue("stateCode", ev.target.value, { shouldDirty: true }); setValue("state", s?.name ?? "", { shouldDirty: true }); }}>
              <option value="">Not specified</option>
              {INDIAN_STATES.map((s) => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
            </Select>
          </Field>
          {txt("phone", "Phone")}
          {txt("email", "Email", { type: "email" })}
          {txt("website", "Website")}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Bank & payment details" description="Printed on invoices and proforma invoices." />
        <CardBody className="grid gap-4 md:grid-cols-2">
          {txt("bankAccountName", "Account name")}
          {txt("bankName", "Bank name")}
          {txt("bankAccountNumber", "Account number")}
          {txt("bankIfsc", "IFSC")}
          {txt("bankBranch", "Branch")}
          {txt("upiId", "UPI ID")}
          <Field label="Payment instructions" htmlFor="paymentInstructions" className="md:col-span-2"><Textarea id="paymentInstructions" rows={2} {...register("paymentInstructions")} disabled={readOnly} /></Field>
          {txt("authorisedSignatory", "Authorised signatory")}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Document defaults" />
        <CardBody className="grid gap-4 md:grid-cols-3">
          <Field label="Currency" htmlFor="currency"><Select id="currency" {...register("currency")} disabled={readOnly}>{["INR", "USD", "EUR", "GBP", "AED"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          {txt("defaultTaxRate", "Default GST rate (%)")}
          <Field label="Grand total rounding" htmlFor="roundingMode" hint="Applied to new and re-saved documents">
            <Select id="roundingMode" {...register("roundingMode")} disabled={readOnly}><option value="NEAREST_RUPEE">Round to nearest rupee (show round-off)</option><option value="NONE">No rounding (exact to the paisa)</option></Select>
          </Field>
          {txt("documentFooter", "Document footer", { className: "md:col-span-3" })}
          <Field label="Default quotation terms" htmlFor="termsQuotation" className="md:col-span-3"><Textarea id="termsQuotation" rows={4} {...register("termsQuotation")} disabled={readOnly} /></Field>
          <Field label="Default invoice terms" htmlFor="termsInvoice" className="md:col-span-3"><Textarea id="termsInvoice" rows={4} {...register("termsInvoice")} disabled={readOnly} /></Field>
          <Field label="Default proposal terms" htmlFor="termsProposal" className="md:col-span-3"><Textarea id="termsProposal" rows={3} {...register("termsProposal")} disabled={readOnly} /></Field>
          <Checkbox label="Default company profile for new documents" {...register("isDefault")} disabled={readOnly} />
        </CardBody>
      </Card>
      {!readOnly && <div className="flex justify-end"><Button type="submit" loading={pending}>Save company settings</Button></div>}
    </form>
  );
}
