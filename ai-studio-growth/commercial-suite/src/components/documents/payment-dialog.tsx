"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Banknote } from "lucide-react";
import { paymentSchema, type PaymentInput } from "@/lib/validation/schemas";
import { recordPaymentAction } from "@/app/actions/documents";
import { PAYMENT_METHOD_LABEL } from "@/lib/documents/meta";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function PaymentDialog({ documentId, balance, today, minDate }: { documentId: string; balance: string; today: string; minDate: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const form = useForm<PaymentInput>({ resolver: zodResolver(paymentSchema), defaultValues: { documentId, paymentDate: today, amount: balance, method: "BANK_TRANSFER", reference: "", notes: "" } });
  const { register, handleSubmit, formState: { errors }, reset } = form;
  const submit = handleSubmit((v) =>
    start(async () => {
      const res = await recordPaymentAction(v);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      setOpen(false);
      reset({ ...v, amount: "" });
      router.refresh();
    }),
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}><Banknote /> Record payment</Button>
      <DialogContent title="Record payment" description={`Outstanding balance: ${formatMoney(balance)}. Partial payments are supported; amounts above the balance are rejected.`}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Payment date" htmlFor="paymentDate" error={errors.paymentDate?.message} required>
            <Input id="paymentDate" type="date" min={minDate} max={today} {...register("paymentDate")} />
          </Field>
          <Field label="Amount (₹)" htmlFor="amount" error={errors.amount?.message} required>
            <Input id="amount" inputMode="decimal" {...register("amount")} aria-invalid={!!errors.amount} />
          </Field>
          <Field label="Method" htmlFor="method">
            <Select id="method" {...register("method")}>
              {Object.entries(PAYMENT_METHOD_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Reference number" htmlFor="reference" hint="UTR, cheque number, transaction ID">
            <Input id="reference" {...register("reference")} />
          </Field>
          <Field label="Notes" htmlFor="pnotes" className="sm:col-span-2">
            <Textarea id="pnotes" rows={2} {...register("notes")} />
          </Field>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={pending}>Record payment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
