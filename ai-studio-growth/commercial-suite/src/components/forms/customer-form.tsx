"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { customerSchema, type CustomerInput } from "@/lib/validation/schemas";
import { saveCustomerAction } from "@/app/actions/customers";
import { INDIAN_STATES } from "@/lib/indian-states";
import { Button, buttonClass } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useUnsavedWarning } from "./use-unsaved-warning";
import Link from "next/link";

export function CustomerForm({ id, defaults, onSaved, compact }: { id?: string; defaults?: Partial<CustomerInput>; onSaved?: (c: { id: string; name: string } & CustomerInput) => void; compact?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", preferredChannel: "EMAIL", whatsappConsent: false, ...defaults },
  });
  const { register, handleSubmit, formState, setValue, watch, setError } = form;
  const e = formState.errors;
  useUnsavedWarning(formState.isDirty && !formState.isSubmitSuccessful);

  const onSubmit = handleSubmit((values) =>
    start(async () => {
      const res = await saveCustomerAction(id ?? null, values);
      if (!res.ok) {
        toast.error(res.error);
        Object.entries(res.fieldErrors ?? {}).forEach(([k, v]) => setError(k as Path<CustomerInput>, { message: v[0] }));
        return;
      }
      toast.success(res.message);
      form.reset(values);
      if (onSaved) onSaved({ ...values, id: res.data!.id, name: values.name });
      else router.push(`/customers/${res.data!.id}`);
      router.refresh();
    }),
  );

  const onStateChange = (code: string) => {
    const st = INDIAN_STATES.find((s) => s.code === code);
    setValue("stateCode", code, { shouldDirty: true });
    setValue("state", st?.name ?? "", { shouldDirty: true });
  };
  const gstin = watch("gstin");
  const stateCode = watch("stateCode");

  const grid = compact ? "grid gap-4 sm:grid-cols-2" : "grid gap-4 md:grid-cols-2";
  const body = (
    <div className="space-y-6">
      <div className={grid}>
        <Field label="Customer / company name" htmlFor="name" error={e.name?.message} required className="sm:col-span-2">
          <Input id="name" {...register("name")} aria-invalid={!!e.name} />
        </Field>
        <Field label="Contact person" htmlFor="contactPerson" error={e.contactPerson?.message}>
          <Input id="contactPerson" {...register("contactPerson")} />
        </Field>
        <Field label="Email" htmlFor="email" error={e.email?.message}>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!e.email} />
        </Field>
        <Field label="Phone / WhatsApp" htmlFor="phone" error={e.phone?.message} hint="Include the country code for WhatsApp, e.g. +91 98765 43210">
          <Input id="phone" {...register("phone")} aria-invalid={!!e.phone} />
        </Field>
        <Field label="Preferred communication channel" htmlFor="preferredChannel">
          <Select id="preferredChannel" {...register("preferredChannel")}>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PHONE">Phone</option>
          </Select>
        </Field>
      </div>
      <div className={grid}>
        <Field label="Billing address" htmlFor="billingAddress" error={e.billingAddress?.message}>
          <Textarea id="billingAddress" rows={3} {...register("billingAddress")} />
        </Field>
        <Field label="Shipping / service address" htmlFor="shippingAddress" hint="Leave blank if same as billing">
          <Textarea id="shippingAddress" rows={3} {...register("shippingAddress")} />
        </Field>
        <Field label="GSTIN" htmlFor="gstin" error={e.gstin?.message} hint={gstin && gstin.length >= 2 && stateCode && gstin.slice(0, 2) !== stateCode ? "GSTIN state prefix differs from the selected state — please check." : "Optional. Required only for registered businesses."}>
          <Input id="gstin" className="uppercase" maxLength={15} {...register("gstin")} aria-invalid={!!e.gstin} />
        </Field>
        <Field label="State (place of supply)" htmlFor="stateCode" error={e.stateCode?.message}>
          <Select id="stateCode" value={stateCode ?? ""} onChange={(ev) => onStateChange(ev.target.value)}>
            <option value="">Not specified</option>
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Notes" htmlFor="notes" hint="Internal notes — not shown on documents">
        <Textarea id="notes" rows={3} {...register("notes")} />
      </Field>
      <Checkbox
        label="Customer has opted in to receive WhatsApp messages"
        description="WhatsApp Business rules require customer opt-in before business-initiated messages."
        {...register("whatsappConsent")}
      />
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      {compact ? (
        body
      ) : (
        <Card>
          <CardHeader title="Customer details" description="Fields marked * are required. GSTIN is optional." />
          <CardBody>{body}</CardBody>
        </Card>
      )}
      <div className="mt-5 flex justify-end gap-2">
        {!compact && <Link href={id ? `/customers/${id}` : "/customers"} className={buttonClass({ variant: "outline" })}>Cancel</Link>}
        <Button type="submit" loading={pending}>{id ? "Save changes" : "Create customer"}</Button>
      </div>
    </form>
  );
}
