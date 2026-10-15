"use client";
import { useState } from "react";
import { useFieldArray, useWatch, type Control, type UseFormRegister, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Package, Plus, Trash2 } from "lucide-react";
import type { DocumentInput } from "@/lib/validation/schemas";
import { calculateLine, validateLine, type TaxMode } from "@/lib/tax";
import { BILLING_FREQUENCY_LABEL } from "@/lib/documents/meta";
import { formatMoney } from "@/lib/money";
import type { RenderTotals } from "@/lib/documents/render-model";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StringListEditor } from "@/components/forms/list-editor";
import type { EditorProduct } from "./types";

type Line = DocumentInput["lineItems"][number];

export function emptyLine(taxRate = "18"): Line {
  return { name: "", description: "", hsnSac: "", quantity: "1", unit: "Nos", unitPrice: "0", discountType: "PERCENT", discountValue: "0", taxRate, billingFrequency: null, productServiceId: null, details: {} };
}

export function lineFromProduct(p: EditorProduct): Line {
  return {
    productServiceId: p.id,
    name: p.name,
    description: p.shortDescription ?? "",
    hsnSac: p.hsnSac ?? "",
    quantity: p.defaultQuantity,
    unit: p.unit,
    unitPrice: p.defaultPrice,
    discountType: "PERCENT",
    discountValue: "0",
    taxRate: p.taxRate,
    billingFrequency: p.billingFrequency as Line["billingFrequency"],
    details: { detailedDescription: p.detailedDescription ?? "", inclusions: p.inclusions, exclusions: p.exclusions, benefits: [] },
  };
}

export function LineItemsStep({
  control, register, errors, setValue, products, totals, isProposal, defaultTaxRate, taxMode,
}: {
  control: Control<DocumentInput>;
  register: UseFormRegister<DocumentInput>;
  errors: FieldErrors<DocumentInput>;
  setValue: UseFormSetValue<DocumentInput>;
  products: EditorProduct[];
  totals: RenderTotals;
  isProposal: boolean;
  defaultTaxRate: string;
  taxMode: string;
}) {
  const { fields, append, remove, move } = useFieldArray({ control, name: "lineItems" });
  const lines = useWatch({ control, name: "lineItems" }) ?? [];
  const [pick, setPick] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const categories = [...new Set(products.map((p) => p.category))].sort();

  const addProduct = () => {
    const p = products.find((x) => x.id === pick);
    if (!p) return;
    append(lineFromProduct(p));
    setPick("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader
          title="Services & pricing"
          description="Add catalogue items or custom one-off lines. All amounts are calculated with decimal-safe arithmetic."
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-end gap-2 rounded-xl bg-canvas p-3">
            <Field label="Add from catalogue" htmlFor="catalogue-pick" className="min-w-60 flex-1">
              <Select id="catalogue-pick" value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">Choose a product or service…</option>
                {categories.map((c) => (
                  <optgroup key={c} label={c}>
                    {products.filter((p) => p.category === c).map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {formatMoney(p.defaultPrice)}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>
            <Button type="button" variant="navy" onClick={addProduct} disabled={!pick}><Package /> Add item</Button>
            <Button type="button" variant="outline" onClick={() => append(emptyLine(defaultTaxRate))}><Plus /> Custom line</Button>
          </div>

          {fields.length === 0 && (
            <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
              No line items yet. Add a catalogue item or a custom line. Drafts can be saved without items, but documents cannot be sent or issued until at least one valid line exists.
            </div>
          )}

          {fields.map((f, i) => {
            const le = errors.lineItems?.[i];
            const line = lines[i] ?? f;
            const problems = validateLine({ ...line, discountValue: line?.discountValue || "0" });
            return (
              <div key={f.id} className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(13,18,53,0.03)]">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-wider text-muted uppercase">Line {i + 1}{line.productServiceId ? " · from catalogue" : " · custom"}</span>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move line up"><ArrowUp /></Button>
                    <Button type="button" variant="ghost" size="icon" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} aria-label="Move line down"><ArrowDown /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove line"><Trash2 className="text-red-500" /></Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-12">
                  <Field label="Item name" htmlFor={`l${i}-name`} error={le?.name?.message} className="md:col-span-7" required>
                    <Input id={`l${i}-name`} {...register(`lineItems.${i}.name`)} aria-invalid={!!le?.name} />
                  </Field>
                  <Field label="HSN / SAC" htmlFor={`l${i}-hsn`} className="md:col-span-2">
                    <Input id={`l${i}-hsn`} {...register(`lineItems.${i}.hsnSac`)} />
                  </Field>
                  <Field label="Billing" htmlFor={`l${i}-freq`} className="md:col-span-3">
                    <Select id={`l${i}-freq`} {...register(`lineItems.${i}.billingFrequency`, { setValueAs: (v) => v || null })}>
                      <option value="">Not specified</option>
                      {Object.entries(BILLING_FREQUENCY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </Select>
                  </Field>
                  <Field label="Description" htmlFor={`l${i}-desc`} className="md:col-span-12" hint="Long descriptions wrap automatically on the PDF.">
                    <Textarea id={`l${i}-desc`} rows={2} {...register(`lineItems.${i}.description`)} />
                  </Field>
                  <Field label="Quantity" htmlFor={`l${i}-qty`} error={le?.quantity?.message} className="md:col-span-2" required>
                    <Input id={`l${i}-qty`} inputMode="decimal" {...register(`lineItems.${i}.quantity`)} aria-invalid={!!le?.quantity} />
                  </Field>
                  <Field label="Unit" htmlFor={`l${i}-unit`} className="md:col-span-2">
                    <Input id={`l${i}-unit`} {...register(`lineItems.${i}.unit`)} />
                  </Field>
                  <Field label="Unit price (₹)" htmlFor={`l${i}-price`} error={le?.unitPrice?.message} className="md:col-span-3" required>
                    <Input id={`l${i}-price`} inputMode="decimal" {...register(`lineItems.${i}.unitPrice`)} aria-invalid={!!le?.unitPrice} />
                  </Field>
                  <Field label="Discount" htmlFor={`l${i}-disc`} error={le?.discountValue?.message} className="md:col-span-3">
                    <div className="flex gap-1.5">
                      <Input id={`l${i}-disc`} inputMode="decimal" {...register(`lineItems.${i}.discountValue`)} aria-invalid={!!le?.discountValue} />
                      <Select className="w-20 shrink-0" aria-label="Discount type" {...register(`lineItems.${i}.discountType`)}>
                        <option value="PERCENT">%</option>
                        <option value="AMOUNT">₹</option>
                      </Select>
                    </div>
                  </Field>
                  <Field label="GST %" htmlFor={`l${i}-tax`} error={le?.taxRate?.message} className="md:col-span-2">
                    <Input id={`l${i}-tax`} inputMode="decimal" list="gst-rates" {...register(`lineItems.${i}.taxRate`)} aria-invalid={!!le?.taxRate} disabled={taxMode === "NO_TAX"} />
                  </Field>
                </div>
                {problems.length > 0 && !le && (
                  <p className="mt-2 text-xs text-amber-700">{problems.join(" ")}</p>
                )}
                {problems.length === 0 && <LineAmount line={line} taxMode={taxMode} />}
                {isProposal && (
                  <div className="mt-3 border-t border-line pt-3">
                    <button type="button" className="flex items-center gap-1.5 text-[13px] font-medium text-brand-700" onClick={() => setOpen(open === i ? null : i)}>
                      {open === i ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />} Proposal presentation (service page, badge, metric)
                    </button>
                    {open === i && <ProposalLineDetails i={i} register={register} control={control} setValue={setValue} />}
                  </div>
                )}
              </div>
            );
          })}
          <datalist id="gst-rates">{["0", "5", "12", "18", "28", "40"].map((r) => <option key={r} value={r} />)}</datalist>
        </CardBody>
      </Card>
      <TotalsPanel totals={totals} taxMode={taxMode} />
    </div>
  );
}

function LineAmount({ line, taxMode }: { line: Line; taxMode: string }) {
  let r;
  try {
    r = calculateLine({ ...line, discountValue: line.discountValue || "0" }, taxMode as TaxMode);
  } catch {
    return null;
  }
  return (
    <div className="mt-3 flex flex-wrap justify-end gap-x-5 gap-y-1 text-xs text-muted tabular">
      <span>Gross {formatMoney(r.gross.toFixed(2))}</span>
      {!r.discount.isZero() && <span>Discount −{formatMoney(r.discount.toFixed(2))}</span>}
      <span>Taxable {formatMoney(r.taxable.toFixed(2))}</span>
      {taxMode !== "NO_TAX" && <span>GST {formatMoney(r.tax.toFixed(2))}</span>}
      <span className="font-semibold text-ink">Line total {formatMoney(r.total.toFixed(2))}</span>
    </div>
  );
}

function ProposalLineDetails({ i, register, control, setValue }: { i: number; register: UseFormRegister<DocumentInput>; control: Control<DocumentInput>; setValue: UseFormSetValue<DocumentInput> }) {
  const details = useWatch({ control, name: `lineItems.${i}.details` }) ?? {};
  const setList = (key: "inclusions" | "exclusions" | "benefits", v: string[]) => setValue(`lineItems.${i}.details.${key}`, v, { shouldDirty: true });
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-3">
      <Field label="Commercial treatment" htmlFor={`l${i}-treat`} hint="e.g. Included in the package, Free allocation, Complimentary">
        <Input id={`l${i}-treat`} {...register(`lineItems.${i}.details.treatment`)} />
      </Field>
      <Field label="Badge" htmlFor={`l${i}-badge`} hint="Short label, e.g. INCLUDED">
        <Input id={`l${i}-badge`} {...register(`lineItems.${i}.details.badge`)} />
      </Field>
      <Field label="Metric label" htmlFor={`l${i}-ml`} hint="e.g. Monthly allocation">
        <Input id={`l${i}-ml`} {...register(`lineItems.${i}.details.metricLabel`)} />
      </Field>
      <Field label="Metric value" htmlFor={`l${i}-mv`} hint="e.g. 200 or 200K — shows a dial panel">
        <Input id={`l${i}-mv`} {...register(`lineItems.${i}.details.metricValue`)} />
      </Field>
      <Field label="Metric unit" htmlFor={`l${i}-mu`} hint="e.g. Minutes per month">
        <Input id={`l${i}-mu`} {...register(`lineItems.${i}.details.metricUnit`)} />
      </Field>
      <Field label="Metric note" htmlFor={`l${i}-mn`} hint="e.g. Equivalent to 3 hours 20 minutes">
        <Input id={`l${i}-mn`} {...register(`lineItems.${i}.details.metricNote`)} />
      </Field>
      <Field label="Detailed description (service page)" htmlFor={`l${i}-dd`} className="md:col-span-3">
        <Textarea id={`l${i}-dd`} rows={3} {...register(`lineItems.${i}.details.detailedDescription`)} />
      </Field>
      <Field label="Applications / inclusions">
        <StringListEditor value={details.inclusions ?? []} onChange={(v) => setList("inclusions", v)} placeholder="Application" addLabel="Add" />
      </Field>
      <Field label="How it may help (benefits)">
        <StringListEditor value={details.benefits ?? []} onChange={(v) => setList("benefits", v)} placeholder="Benefit" addLabel="Add" />
      </Field>
      <Field label="Not included">
        <StringListEditor value={details.exclusions ?? []} onChange={(v) => setList("exclusions", v)} placeholder="Exclusion" addLabel="Add" />
      </Field>
    </div>
  );
}

export function TotalsPanel({ totals, taxMode }: { totals: RenderTotals; taxMode: string }) {
  const rows: [string, string, string?][] = [
    ["Subtotal", formatMoney(totals.subtotal)],
    ["Discount", `− ${formatMoney(totals.discountTotal)}`],
    ["Taxable amount", formatMoney(totals.taxableTotal), "font-medium"],
  ];
  if (taxMode === "INTRA_STATE") rows.push(["CGST", formatMoney(totals.cgstTotal)], ["SGST", formatMoney(totals.sgstTotal)]);
  else if (taxMode === "INTER_STATE") rows.push(["IGST", formatMoney(totals.igstTotal)]);
  else rows.push(["Tax", "Not applied"]);
  rows.push(["Round off", formatMoney(totals.roundOff)]);
  return (
    <Card className="h-fit xl:sticky xl:top-20">
      <CardHeader title="Totals" description="Recalculated on the server when saved" />
      <CardBody>
        <dl className="space-y-2 text-sm">
          {rows.map(([k, v, cls]) => (
            <div key={k} className={`flex justify-between gap-3 ${cls ?? ""}`}>
              <dt className="text-muted">{k}</dt>
              <dd className="tabular">{v}</dd>
            </div>
          ))}
          <div className="mt-3 flex justify-between gap-3 border-t border-line pt-3 text-base font-semibold">
            <dt>Grand total</dt>
            <dd className="tabular text-brand-700">{formatMoney(totals.grandTotal)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">Discounts and GST are rounded half-up to the paisa per line. The grand total follows the company&apos;s rounding setting.</p>
      </CardBody>
    </Card>
  );
}
