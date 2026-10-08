import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db/store";
import { enrollmentFor, programById } from "@/server/repositories/learning";

/** Permission-aware global search. Each collection is included only if the user may see it. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const has = (p: string) => user.permissions.includes(p as never);
  const m = (...s: (string | null | undefined)[]) => s.some((x) => x?.toLowerCase().includes(q));
  const d = db();
  const out: { type: string; label: string; sub: string; href: string }[] = [];

  if (user.role === "student") {
    const e = enrollmentFor(user.id);
    const courseIds = e ? programById(e.programId)?.courseIds ?? [] : [];
    for (const c of d.courses.filter((c) => courseIds.includes(c.id) && m(c.title, c.code))) out.push({ type: "Course", label: c.title, sub: c.code, href: `/academy/student/learning#${c.id}` });
    for (const l of d.lessons.filter((l) => l.status === "published" && m(l.title))) {
      const mod = d.modules.find((x) => x.id === l.moduleId)!;
      if (courseIds.includes(mod.courseId)) out.push({ type: "Lesson", label: l.title, sub: mod.title, href: `/academy/student/learn/${mod.courseId}/${l.id}` });
    }
    for (const c of d.certificates.filter((c) => c.studentId === user.id && m(c.id))) out.push({ type: "Certificate", label: c.id, sub: c.status, href: "/academy/student/certificates" });
  }
  if (has("students.view") || has("users.manage")) {
    for (const u of d.users.filter((u) => m(u.name, u.email))) {
      if (u.role !== "student" && !has("users.manage")) continue;
      out.push({ type: u.role === "student" ? "Student" : "User", label: u.name, sub: u.email, href: has("users.manage") ? `/academy/admin/users?q=${encodeURIComponent(u.name)}` : `/academy/faculty/students/${u.id}` });
    }
  }
  if (has("courses.view")) {
    for (const c of d.courses.filter((c) => m(c.title, c.code))) out.push({ type: "Course", label: c.title, sub: `${c.code} · ${c.status}`, href: has("courses.edit") ? "/academy/admin/courses" : "/academy/faculty/content" });
  }
  if (has("batches.manage")) for (const b of d.batches.filter((b) => m(b.name))) out.push({ type: "Batch", label: b.name, sub: b.schedule, href: "/academy/admin/batches" });
  if (has("leads.view")) for (const l of d.leads.filter((l) => m(l.name, l.email, l.phone))) out.push({ type: "Lead", label: l.name, sub: `${l.status.replace(/_/g, " ")} · ${l.source}`, href: `/academy/marketing/leads/${l.id}` });
  if (has("campaigns.manage")) for (const c of d.campaigns.filter((c) => m(c.name))) out.push({ type: "Campaign", label: c.name, sub: c.channel, href: "/academy/marketing/campaigns" });
  if (has("certificates.manage")) for (const c of d.certificates.filter((c) => m(c.id))) out.push({ type: "Certificate", label: c.id, sub: c.status, href: "/academy/admin/certificates" });
  if (has("communications.send")) for (const c of d.communications.filter((c) => m(c.preview)).slice(0, 5)) out.push({ type: "Message", label: c.preview.slice(0, 60), sub: `${c.channel} · ${c.status}`, href: has("users.manage") ? "/academy/admin/communications" : "/academy/marketing/communications" });

  return NextResponse.json({ results: out.slice(0, 12) }, { headers: { "Cache-Control": "private, no-store" } });
}
