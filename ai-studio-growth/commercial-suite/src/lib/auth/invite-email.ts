import "server-only";
import { brevoSendEmail } from "../integrations/brevo";
import { brevoStatus } from "../integrations/config";
import { INVITE_TTL_HOURS } from "./accounts";

/** Emails an invitation link via Brevo when configured. The link is always also shown to the admin. */
export async function sendInviteEmail(to: string, name: string, url: string, kind: "invite" | "reset", invitedBy: string): Promise<{ sent: boolean; reason?: string }> {
  const status = await brevoStatus();
  if (!status.configured) return { sent: false, reason: "Email is not configured — share the link securely yourself." };
  if (status.mode === "mock") return { sent: false, reason: "Email is in development mock mode — share the link yourself." };
  const intro = kind === "invite" ? `${invitedBy} has invited you to AI Studio Quote Studio.` : `${invitedBy} has reset your access to AI Studio Quote Studio.`;
  try {
    await brevoSendEmail({
      to,
      toName: name,
      subject: kind === "invite" ? "You're invited to AI Studio Quote Studio" : "Reset your AI Studio Quote Studio access",
      text: `Hello ${name},\n\n${intro}\n\nOpen this secure link to set your password and connect an authenticator app:\n${url}\n\nThe link can be used once and expires in ${INVITE_TTL_HOURS} hours.\n\nIf you were not expecting this email, you can ignore it.`,
      tags: ["invitation"],
    });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: `Email could not be sent (${(e as Error).message}). Share the link yourself.` };
  }
}
