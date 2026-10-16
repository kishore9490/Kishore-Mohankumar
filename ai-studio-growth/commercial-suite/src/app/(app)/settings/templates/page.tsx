import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { TEMPLATE_PLACEHOLDERS } from "@/lib/integrations/messages";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TemplateEditor } from "@/components/settings/integration-controls";

export const metadata = { title: "Message templates" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const user = await requireUser();
  const templates = await prisma.messageTemplate.findMany({ orderBy: [{ channel: "asc" }, { key: "asc" }] });
  return (
    <Card>
      <CardHeader title="Message templates" description={`Prefilled text when sending documents by email or WhatsApp. Placeholders: ${TEMPLATE_PLACEHOLDERS.map((p) => `{{${p}}}`).join(" ")}`} />
      <CardBody className="grid gap-4 lg:grid-cols-2">
        {templates.map((t) => <TemplateEditor key={t.id} id={t.id} name={t.name} channel={t.channel} subject={t.subject} body={t.body} readOnly={user.role !== "ADMIN"} />)}
      </CardBody>
    </Card>
  );
}
