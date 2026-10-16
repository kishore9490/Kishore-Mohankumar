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

/** Non-secret view of DATABASE_URL so the person deploying can spot typos (the password is never shown). */
export function describeDatabaseUrl(): { rows: [string, string][]; warnings: string[] } {
  const raw = process.env.DATABASE_URL ?? "";
  const warnings: string[] = [];
  if (!raw) return { rows: [["DATABASE_URL", "not set"]], warnings: ["DATABASE_URL is empty."] };
  if (raw !== raw.trim()) warnings.push("DATABASE_URL has spaces at the start or end — remove them.");
  if (/^["'<]|["'>]$/.test(raw.trim())) warnings.push("DATABASE_URL is wrapped in quotes or < > — remove them.");
  const m = raw.trim().replace(/^["'<]|["'>]$/g, "").match(/^mysql:\/\/([^:@/]*)(?::(.*))?@([^:/?#]+)(?::(\d+))?\/([^?#]*)/);
  if (!m) return { rows: [["DATABASE_URL", "could not be read"]], warnings: [...warnings, "Use the format mysql://USERNAME:PASSWORD@HOST:3306/DATABASE_NAME"] };
  const [, user, pass = "", host, port = "3306", db] = m;
  if (/YOUR_PASSWORD|PASSWORD$/i.test(pass)) warnings.push("The password is still the placeholder text — put your real database password.");
  if (!pass) warnings.push("No password found in DATABASE_URL.");
  if (/[@:/#?%\s]/.test(pass)) warnings.push("The password contains @ : / # ? % or spaces — change it in hPanel to letters and numbers only.");
  if (pass.includes("@")) warnings.push("An @ in the password makes the app read the wrong host.");
  if (user && !/^u\d+_/.test(user)) warnings.push("Hostinger usernames start with u…_ (e.g. u643405007_quote).");
  if (db && !/^u\d+_/.test(db)) warnings.push("Hostinger database names start with u…_ (e.g. u643405007_quote).");
  return {
    rows: [
      ["Username", user || "(empty)"],
      ["Password", pass ? `${pass.length} characters (hidden)` : "(empty)"],
      ["Host", host],
      ["Port", port],
      ["Database", db || "(empty)"],
    ],
    warnings,
  };
}

/** The database server's own message (never contains the password), e.g. "Access denied for user 'x'@'host'". */
export function serverMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  const line = msg.split("\n").map((l) => l.trim()).filter(Boolean).find((l) => /denied|authentication|reach|unknown|exist|refused/i.test(l));
  return (line ?? "").slice(0, 300);
}
