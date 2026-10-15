"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "@/lib/validation/schemas";
import { saveProductAction } from "@/app/actions/catalogue";
import { Button, buttonClass } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StringListEditor } from "./list-editor";
import { useUnsavedWarning } from "./use-unsaved-warning";
import { BILLING_FREQUENCY_LABEL } from "@/lib/documents/meta";

export const SAMPLE_CATEGORIES = ["AI Chatbot Development", "AI Voice Agents", "WhatsApp Automation", "Website Development", "CRM Implementation", "AI Workflow Automation", "Annual Maintenance", "Consulting"];

export function ProductForm({ id, defaults, categories }: { id?: string; defaults?: Partial<ProductInput>; categories: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", category: "", unit: "Nos", defaultQuantity: "1", defaultPrice: "0", taxRate: "18", billingFrequency: "ONE_TIME", inclusions: [], exclusions: [], active: true, ...defaults },
  });
  const { register, handleSubmit, formState, control, setError } = form;
  const e = formState.errors;
  useUnsavedWarning(formState.isDirty && !formState.isSubmitSuccessful);
  const allCategories = [...new Set([...SAMPLE_CATEGORIES, ...categories])].sort();

  const onSubmit = handleSubmit((values) =>
    start(async () => {
      const res = await saveProductAction(id ?? null, values);
      if (!res.ok) {
        toast.error(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([k, v]) => setError(k as Path<ProductInput>, { message: v[0] }));
        return;
      }
      toast.success(res.message);
      form.reset(values);
      router.push("/catalogue");
      router.refresh();
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Card>
        <CardHeader title="Item details" />
        <CardBody className="grid gap-4 md:grid-cols-2">
          <Field label="Name" htmlFor="name" error={e.name?.message} required className="md:col-span-2">
            <Input id="name" {...register("name")} aria-invalid={!!e.name} />
          </Field>
          <Field label="Category" htmlFor="category" error={e.category?.message} required hint="Pick a suggestion or type your own">
            <Input id="category" list="categories" {...register("category")} aria-invalid={!!e.category} />
            <datalist id="categories">{allCategories.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="SKU / internal reference" htmlFor="sku" error={e.sku?.message}>
            <Input id="sku" {...register("sku")} />
          </Field>
          <Field label="Short description" htmlFor="shortDescription" error={e.shortDescription?.message} className="md:col-span-2" hint="Shown under the item name on documents">
            <Input id="shortDescription" {...register("shortDescription")} />
          </Field>
          <Field label="Detailed description" htmlFor="detailedDescription" className="md:col-span-2" hint="Used on proposal service detail pages">
            <Textarea id="detailedDescription" rows={4} {...register("detailedDescription")} />
          </Field>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Pricing & tax" description="Defaults — every value can be changed on individual documents." />
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Default price (₹)" htmlFor="defaultPrice" error={e.defaultPrice?.message} required>
            <Input id="defaultPrice" inputMode="decimal" {...register("defaultPrice")} aria-invalid={!!e.defaultPrice} />
          </Field>
          <Field label="Default quantity" htmlFor="defaultQuantity" error={e.defaultQuantity?.message} required>
            <Input id="defaultQuantity" inputMode="decimal" {...register("defaultQuantity")} aria-invalid={!!e.defaultQuantity} />
          </Field>
          <Field label="Unit of measurement" htmlFor="unit" error={e.unit?.message} required>
            <Input id="unit" list="units" {...register("unit")} />
            <datalist id="units">{["Nos", "Hour", "Day", "Month", "Year", "Project", "Package", "Licence", "Allocation"].map((u) => <option key={u} value={u} />)}</datalist>
          </Field>
          <Field label="GST rate (%)" htmlFor="taxRate" error={e.taxRate?.message} required hint="Verify the applicable rate for each supply">
            <Input id="taxRate" inputMode="decimal" list="rates" {...register("taxRate")} aria-invalid={!!e.taxRate} />
            <datalist id="rates">{["0", "5", "12", "18", "28", "40"].map((r) => <option key={r} value={r} />)}</datalist>
          </Field>
          <Field label="HSN / SAC code" htmlFor="hsnSac" error={e.hsnSac?.message}>
            <Input id="hsnSac" {...register("hsnSac")} />
          </Field>
          <Field label="Billing frequency" htmlFor="billingFrequency">
            <Select id="billingFrequency" {...register("billingFrequency")}>
              {Object.entries(BILLING_FREQUENCY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Scope defaults" description="Copied onto documents when the item is added." />
        <CardBody className="grid gap-6 md:grid-cols-2">
          <Field label="Default inclusions">
            <Controller control={control} name="inclusions" render={({ field }) => <StringListEditor value={field.value ?? []} onChange={field.onChange} placeholder="Inclusion" addLabel="Add inclusion" />} />
          </Field>
          <Field label="Default exclusions">
            <Controller control={control} name="exclusions" render={({ field }) => <StringListEditor value={field.value ?? []} onChange={field.onChange} placeholder="Exclusion" addLabel="Add exclusion" />} />
          </Field>
          <Checkbox label="Active" description="Inactive items stay on existing documents but cannot be added to new ones." {...register("active")} />
        </CardBody>
      </Card>
      <div className="flex justify-end gap-2">
        <Link href="/catalogue" className={buttonClass({ variant: "outline" })}>Cancel</Link>
        <Button type="submit" loading={pending}>{id ? "Save changes" : "Create item"}</Button>
      </div>
    </form>
  );
}
