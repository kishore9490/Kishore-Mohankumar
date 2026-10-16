import "server-only";
import { prisma } from "../prisma";
import { loadRenderableDocument } from "../documents/load";
import { renderTemplate, templateVars } from "./messages";

/** Builds prefilled email compose text from the stored message templates. */
export async function composeDefaults(documentId: string, senderName: string) {
  const doc = await loadRenderableDocument(documentId);
  if (!doc) return null;
  const templates = await prisma.messageTemplate.findMany();
  const vars = templateVars(doc, senderName);
  const pick = (channel: string, key: string) => templates.find((t) => t.channel === channel && t.key === key);
  const docKey = doc.type;
  const make = (channel: string, key: string) => {
    const t = pick(channel, key);
    return { subject: t?.subject ? renderTemplate(t.subject, vars) : "", body: t ? renderTemplate(t.body, vars) : "" };
  };
  return {
    email: { DOCUMENT: make("EMAIL", docKey), PAYMENT_REMINDER: make("EMAIL", "PAYMENT_REMINDER") },
  };
}
