"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { createCampaignAction } from "@/app/actions/promotions";
import { renderTemplate } from "@/lib/integrations/messages";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type Audience = { id: string; name: string; contactPerson: string | null; phone: string; state: string | null };

const STARTER = "Hello {{customerName}} 👋\n\nWe have launched new AI automation packages at {{companyName}} — WhatsApp calling, AI chatbots and workflow automation.\n\nReply YES and we will share the details.\n\nReply STOP to stop receiving updates.";

export function CampaignForm({ audience, companyName }: { audience: Audience[]; companyName: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState(STARTER);
  const [selected, setSelected] = useState<Set<string>>(new Set(audience.map((a) => a.id)));
  const [filter, setFilter] = useState("");
  const [pending, start] = useTransition();
  const sample = audience.find((a) => selected.has(a.id));
  const preview = useMemo(() => renderTemplate(message, { customerName: sample?.contactPerson || sample?.name || "Customer", customerCompany: sample?.name ?? "", companyName }), [message, sample, companyName]);
  const shown = audience.filter((a) => !filter || a.name.toLowerCase().includes(filter.toLowerCase()));
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card>
          <CardHeader title="Message" description="Placeholders: {{customerName}}, {{customerCompany}}, {{companyName}}. Keep an opt-out line for promotional messages." />
          <CardBody className="space-y-4">
            <Field label="Promotion name (internal)" htmlFor="pname"><Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali AI automation offer" /></Field>
            <Field label="WhatsApp message" htmlFor="pmsg" hint={`${message.length}/1500 characters`}><Textarea id="pmsg" rows={9} value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Audience" description={`${selected.size} of ${audience.length} opted-in customers selected. Customers without WhatsApp opt-in are never included.`}
            actions={<><Button type="button" size="sm" variant="ghost" onClick={() => setSelected(new Set(audience.map((a) => a.id)))}>Select all</Button><Button type="button" size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button></>} />
          <CardBody>
            <Input placeholder="Filter customers…" value={filter} onChange={(e) => setFilter(e.target.value)} className="mb-3" aria-label="Filter audience" />
            {audience.length === 0 ? (
              <p className="text-sm text-muted">No customers have WhatsApp opt-in recorded. Edit a customer and tick “Customer has opted in to receive WhatsApp messages”.</p>
            ) : (
              <div className="grid max-h-80 gap-1 overflow-y-auto sm:grid-cols-2">
                {shown.map((a) => (
                  <Checkbox key={a.id} checked={selected.has(a.id)} onChange={() => toggle(a.id)} label={a.name} description={`${a.phone}${a.state ? ` · ${a.state}` : ""}`} className="rounded-lg p-2 hover:bg-canvas" />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
      <div className="space-y-4 xl:sticky xl:top-20 xl:h-fit">
        <Card>
          <CardHeader title="Preview" description={sample ? `As ${sample.name} will see it` : "Select a customer"} />
          <CardBody className="bg-[#e5ddd5]">
            <div className="ml-auto max-w-[92%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-[13.5px] whitespace-pre-wrap text-[#111b21] shadow-sm">{preview}</div>
          </CardBody>
        </Card>
        <Button className="w-full" size="lg" loading={pending} disabled={!name || !message || selected.size === 0}
          onClick={() => start(async () => {
            const res = await createCampaignAction({ name, message, customerIds: [...selected] });
            if (!res.ok) return void toast.error(res.error);
            toast.success(res.message);
            router.push(`/promotions/${res.data!.id}`);
          })}>
          <Megaphone /> Create promotion queue
        </Button>
        <p className="text-xs text-muted">Next, you will open each chat in WhatsApp Business with the message ready and press Send. Sending one-by-one to opted-in customers keeps your number in good standing.</p>
      </div>
    </div>
  );
}
