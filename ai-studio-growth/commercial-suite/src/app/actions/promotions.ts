"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth/session";
import { ServiceError, toActionError, type ActionResult } from "@/lib/services/errors";
import { loadWhatsApp } from "@/lib/integrations/config";
import { buildChatUrl, normalizeWhatsAppNumber } from "@/lib/integrations/phone";
import { renderTemplate } from "@/lib/integrations/messages";
import { audit } from "@/lib/services/audit";
import { brandLine } from "@/lib/documents/render-model";

/**
 * Promotions are sent one-by-one from the WhatsApp Business app (click-to-send) to customers who
 * have opted in. The app never sends on its own; each message is opened prefilled and the team
 * member presses Send, which keeps the business number within WhatsApp's rules.
 */

const campaignSchema = z.object({
  name: z.string().trim().min(2, "Give the promotion a name").max(120),
  message: z.string().trim().min(5, "Write the message").max(1500),
  customerIds: z.array(z.string()).max(2000).optional(),
});

export async function createCampaignAction(input: z.input<typeof campaignSchema>): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await assertUser();
    const d = campaignSchema.parse(input);
    const { settings } = await loadWhatsApp();
    const audience = await prisma.customer.findMany({
      where: { archived: false, whatsappConsent: true, phone: { not: null }, ...(d.customerIds?.length ? { id: { in: d.customerIds } } : {}) },
      select: { id: true, phone: true },
    });
    const recipients = audience
      .map((c) => ({ customerId: c.id, phone: normalizeWhatsAppNumber(c.phone!, settings.defaultCountryCode || "91") }))
      .filter((r): r is { customerId: string; phone: string } => !!r.phone);
    if (!recipients.length) throw new ServiceError("No opted-in customers with a valid WhatsApp number were selected. Record WhatsApp opt-in on customers first.");
    const campaign = await prisma.campaign.create({
      data: { name: d.name, message: d.message, createdById: user.id, recipients: { create: recipients } },
    });
    await audit(prisma, { userId: user.id, action: "promotion.created", summary: `Promotion “${d.name}” created for ${recipients.length} opted-in customer(s)` });
    revalidatePath("/promotions");
    return { ok: true, data: { id: campaign.id }, message: `Promotion ready for ${recipients.length} customer(s)` };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

/** Opens a recipient's chat with the personalised message; logs it as prepared. */
export async function openRecipientAction(recipientId: string): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await assertUser();
    const r = await prisma.campaignRecipient.findUnique({ where: { id: recipientId }, include: { campaign: true, customer: true } });
    if (!r) throw new ServiceError("Recipient not found.");
    if (!r.customer.whatsappConsent) throw new ServiceError("This customer has withdrawn WhatsApp consent.");
    const [{ settings }, company] = await Promise.all([loadWhatsApp(), prisma.companyProfile.findFirst({ where: { isDefault: true } })]);
    const text = renderTemplate(r.campaign.message, {
      customerName: r.customer.contactPerson || r.customer.name,
      customerCompany: r.customer.name,
      companyName: company ? brandLine(company) : "",
    });
    await prisma.$transaction([
      prisma.campaignRecipient.update({ where: { id: r.id }, data: { status: r.status === "SENT" ? "SENT" : "OPENED", openedAt: new Date() } }),
      prisma.communicationLog.create({
        data: { customerId: r.customerId, campaignId: r.campaignId, channel: "WHATSAPP_MANUAL", messageType: "PROMOTION", mode: "MANUAL", recipient: `+${r.phone}`, status: "PREPARED", createdById: user.id },
      }),
    ]);
    revalidatePath(`/promotions/${r.campaignId}`);
    return { ok: true, data: { url: buildChatUrl(r.phone, text, settings.openWith ?? "desktop") } };
  } catch (e) {
    return toActionError(e);
  }
}

export async function setRecipientStatusAction(recipientId: string, status: "SENT" | "SKIPPED" | "PENDING"): Promise<ActionResult> {
  try {
    await assertUser();
    const r = await prisma.campaignRecipient.update({ where: { id: recipientId }, data: { status, sentAt: status === "SENT" ? new Date() : null } });
    if (status === "SENT") {
      const log = await prisma.communicationLog.findFirst({ where: { campaignId: r.campaignId, customerId: r.customerId, status: "PREPARED" }, orderBy: { createdAt: "desc" } });
      if (log) await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "SENT_MANUAL", statusUpdatedAt: new Date() } });
    }
    revalidatePath(`/promotions/${r.campaignId}`);
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function archiveCampaignAction(id: string, archived: boolean): Promise<ActionResult> {
  try {
    await assertUser();
    await prisma.campaign.update({ where: { id }, data: { archived } });
    revalidatePath("/promotions");
    return { ok: true, message: archived ? "Promotion archived" : "Promotion restored" };
  } catch (e) {
    return toActionError(e);
  }
}
