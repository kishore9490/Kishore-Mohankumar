import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { ROLES } from "@/lib/platform/rbac";

/** /academy sends each person to their own home — the role comes from the account, never a picker. */
export default async function AcademyIndex() {
  const user = await requireUser();
  redirect(ROLES[user.role].home);
}
