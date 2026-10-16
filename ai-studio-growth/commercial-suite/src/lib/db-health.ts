import "server-only";
import { Prisma } from "@prisma/client";

/** Turns database errors into safe, actionable messages for the setup / health screens (no secrets). */
export function describeDbError(e: unknown): { title: string; detail: string } {
  const msg = e instanceof Error ? e.message : String(e);
  const code =
    (e instanceof Prisma.PrismaClientInitializationError ? e.errorCode : e instanceof Prisma.PrismaClientKnownRequestError ? e.code : undefined) ??
    (/Authentication failed|Access denied for user/i.test(msg)
      ? "P1000"
      : /Can't reach database server|ECONNREFUSED|ENOTFOUND|getaddrinfo|timed out/i.test(msg)
        ? "P1001"
        : /Unknown database|Database `[^`]*` does not exist/i.test(msg)
          ? "P1003"
          : /table .* does not exist|doesn't exist/i.test(msg)
            ? "P2021"
            : /denied access on the database|access denied/i.test(msg)
              ? "P1010"
              : undefined);
  const url = process.env.DATABASE_URL ?? "";
  let host = "";
  try {
    host = url ? new URL(url).host : "";
  } catch {
    return { title: "DATABASE_URL is not a valid address", detail: "It must look like mysql://USER:PASSWORD@HOST:3306/DATABASE. Use letters and numbers only in the password." };
  }
  if (!url) return { title: "DATABASE_URL is not set", detail: "Add DATABASE_URL in the hosting environment variables and redeploy." };
  if (!url.startsWith("mysql://")) return { title: "DATABASE_URL must start with mysql://", detail: "This app uses a MySQL / MariaDB database (e.g. hPanel → Databases)." };
  switch (code) {
    case "P1000":
      return { title: "Database login failed", detail: "The username or password in DATABASE_URL is wrong. Check them in hPanel → Databases → Management (names include the u…_ prefix). Avoid symbols in the password." };
    case "P1001":
    case "P1002":
      return { title: `Cannot reach the database server (${host})`, detail: "Check the MySQL host shown in hPanel → Databases (usually localhost) and use it in DATABASE_URL." };
    case "P1003":
      return { title: "Database does not exist", detail: "The database name at the end of DATABASE_URL does not match hPanel (it includes the u…_ prefix)." };
    case "P1010":
      return { title: "Database name is wrong, or the user has no access to it", detail: "Check the database name at the end of DATABASE_URL (it includes the u…_ prefix) and that the user belongs to that database in hPanel → Databases." };
    case "P2021":
    case "P2022":
      return { title: "Database tables are missing", detail: "The tables are created automatically when the app starts. Redeploy/restart the app; if this persists, set the build command to npm run build:hosting." };
    default:
      return { title: "Database error", detail: `${code ? `Code ${code}. ` : ""}${e instanceof Error ? e.message.split("\n").filter(Boolean).slice(-1)[0]?.slice(0, 200) ?? "" : ""}` };
  }
}
