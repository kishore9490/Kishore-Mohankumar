import "server-only";
import { db, newId } from "@/server/db/store";
import type { AIRequest, Permission, SessionUser } from "@/lib/platform/types";
import { aiProvider, type AIMessage } from "@/integrations/ai";
import { NotConfiguredError } from "@/integrations/core";
import { audit } from "./audit";

/**
 * AIService — provider-agnostic, permission-scoped.
 *
 *  1. The caller names a purpose and a context (lesson, lead, …), never raw data.
 *  2. The context builder loads only what this user is allowed to see, minimised.
 *  3. A safety preamble frames the model as an educational / drafting assistant.
 *  4. Output is returned as a *draft*; nothing is published or sent automatically.
 *  5. The request is logged (purpose, provider, tokens) without storing content.
 */
export type AIPurpose =
  | "tutor.explain_lesson"
  | "tutor.explain_answer"
  | "tutor.practice_case"
  | "faculty.quiz_draft"
  | "faculty.lesson_summary"
  | "faculty.case_variation"
  | "marketing.lead_summary"
  | "marketing.message_draft"
  | "insights.learning_gaps";

const PURPOSE_RULES: Record<AIPurpose, { permission: Permission; context: AIRequest["contextType"] }> = {
  "tutor.explain_lesson": { permission: "learning.access", context: "lesson" },
  "tutor.explain_answer": { permission: "learning.access", context: "assessment" },
  "tutor.practice_case": { permission: "learning.access", context: "course" },
  "faculty.quiz_draft": { permission: "assessments.manage", context: "lesson" },
  "faculty.lesson_summary": { permission: "content.manage", context: "lesson" },
  "faculty.case_variation": { permission: "content.manage", context: "lesson" },
  "marketing.lead_summary": { permission: "leads.view", context: "lead" },
  "marketing.message_draft": { permission: "communications.send", context: "lead" },
  "insights.learning_gaps": { permission: "students.view", context: "student" },
};

export const AI_SAFETY_PREAMBLE =
  "You are an educational assistant for EMC, a medical coding academy. You explain concepts and draft learning or marketing material for human review. " +
  "You do not provide medical advice, diagnosis, clinical decision support, or authoritative coding determinations. " +
  "Use only the context provided. Clearly say when something should be checked against official guidelines.";

/** Builds the minimum context the model needs — and only from records this user may access. */
function buildContext(user: SessionUser, type: AIRequest["contextType"], id: string): string | null {
  const d = db();
  if (type === "lesson") {
    const l = d.lessons.find((x) => x.id === id && x.status === "published");
    return l ? `Lesson: ${l.title}\nSummary: ${l.summary}\n${l.blocks.map((b) => ("text" in b ? b.text : "items" in b ? b.items.join("; ") : "")).join("\n")}` : null;
  }
  if (type === "lead") {
    if (!user.permissions.includes("leads.view")) return null;
    const l = d.leads.find((x) => x.id === id);
    if (!l) return null;
    const acts = d.leadActivities.filter((a) => a.leadId === id).map((a) => `${a.at.slice(0, 10)} ${a.type}: ${a.summary}`);
    // Contact details are deliberately excluded.
    return `Lead first name: ${l.name.split(" ")[0]}\nInterest: ${l.programInterest}\nStatus: ${l.status}\nSource: ${l.source}\nActivity:\n${acts.join("\n")}`;
  }
  if (type === "course") {
    const c = d.courses.find((x) => x.id === id);
    return c ? `Course: ${c.title} — ${c.description}` : null;
  }
  return null;
}

export async function askAI(user: SessionUser, input: { purpose: AIPurpose; contextId: string; prompt: string }) {
  const rule = PURPOSE_RULES[input.purpose];
  const record: AIRequest = {
    id: newId("ai"), userId: user.id, provider: aiProvider().key, model: null, purpose: input.purpose, contextType: rule.context,
    status: "completed", inputReference: null, outputReference: null, tokens: null, createdAt: new Date().toISOString(),
  };
  db().aiRequests.unshift(record);

  if (!user.permissions.includes(rule.permission)) {
    record.status = "blocked";
    await audit({ user, action: "ai.blocked", objectType: "AIRequest", objectId: record.id, result: "denied", meta: { purpose: input.purpose } });
    return { ok: false as const, reason: "You don’t have access to this AI feature." };
  }
  const context = buildContext(user, rule.context, input.contextId);
  if (!context) {
    record.status = "blocked";
    return { ok: false as const, reason: "That item isn’t available to you." };
  }
  const messages: AIMessage[] = [
    { role: "system", content: AI_SAFETY_PREAMBLE },
    { role: "system", content: `Context:\n${context}` },
    { role: "user", content: input.prompt.slice(0, 2000) },
  ];
  try {
    const res = await aiProvider().complete(messages, { maxTokens: 700, temperature: 0.3 });
    if (!res.ok) {
      record.status = "failed";
      return { ok: false as const, reason: "The AI service didn’t respond. Please try again." };
    }
    record.model = res.data?.model ?? null;
    record.tokens = res.data?.tokens ?? null;
    await audit({ user, action: "ai.request", objectType: "AIRequest", objectId: record.id, meta: { purpose: input.purpose } });
    return { ok: true as const, draft: res.data!.text, label: "AI draft — review before use" };
  } catch (e) {
    record.status = e instanceof NotConfiguredError ? "not_configured" : "failed";
    return { ok: false as const, reason: e instanceof NotConfiguredError ? "AI features are not switched on yet. A Super Admin can connect a provider in Integrations." : "The AI service didn’t respond." };
  }
}
