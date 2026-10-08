import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { verifyCertificate } from "@/server/repositories/student";
import { formatDate } from "@/lib/platform/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Verify an EMC certificate",
  description: "Confirm that an EMC Academy course certificate is genuine.",
  robots: { index: false, follow: false },
};

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = decodeURIComponent(raw).slice(0, 40);
  const cert = /^[A-Za-z0-9-]+$/.test(id) ? verifyCertificate(id) : null;
  const state = !cert ? "not_found" : cert.status === "valid" ? "valid" : "revoked";
  const tone = {
    valid: { icon: "check" as const, ring: "bg-emerald-50 text-emerald-700 ring-emerald-200", title: "Valid certificate", text: "This certificate was issued by EMC Academy and is currently valid." },
    revoked: { icon: "alert" as const, ring: "bg-orange-50 text-orange-800 ring-orange-200", title: "Certificate revoked", text: "This certificate was issued by EMC Academy but has since been revoked. It should not be relied on." },
    not_found: { icon: "search" as const, ring: "bg-mist text-muted ring-line", title: "Certificate not found", text: "We couldn’t find a certificate with this ID. Check the ID for typos — it looks like EMC-2026-XXXXXX." },
  }[state];

  return (
    <>
      <Header />
      <main id="main" className="bg-mist">
        <section className="py-16 md:py-24">
          <div className="container-x">
            <div className="mx-auto max-w-2xl">
              <p className="label flex items-center gap-2"><span className="inline-block h-px w-5 bg-cyan" aria-hidden="true" />Certificate verification</p>
              <h1 className="heading mt-4 text-[32px] md:text-[44px]">Verify an EMC certificate.</h1>

              <div className="mt-8 overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_30px_80px_-40px_rgba(7,26,51,.35)]">
                <div className="flex items-start gap-4 border-b border-line p-6 md:p-8">
                  <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-1", tone.ring)}><Icon name={tone.icon} size={22} /></span>
                  <div className="min-w-0">
                    <p role="status" className="text-[22px] font-semibold tracking-tight">{tone.title}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{tone.text}</p>
                  </div>
                </div>
                {cert ? (
                  <dl className="grid gap-px bg-line sm:grid-cols-2">
                    {[
                      ["Holder", cert.holder],
                      ["Program", cert.program],
                      ["Certificate", cert.template],
                      ["Issue date", formatDate(cert.issuedAt)],
                      ["Certificate ID", cert.id],
                      ["Issued by", "EMC Academy"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white px-6 py-4 md:px-8">
                        <dt className="label !text-[10px]">{k}</dt>
                        <dd className={cn("mt-1.5 text-[15px] font-medium", k === "Certificate ID" && "font-mono text-[14px]")}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <div className="px-6 py-5 md:px-8">
                    <p className="text-[13px] text-muted">ID checked: <span className="font-mono text-ink">{id || "—"}</span></p>
                  </div>
                )}
              </div>

              <p className="mt-6 flex gap-2.5 text-[13.5px] leading-relaxed text-muted">
                <Icon name="info" size={16} className="mt-0.5 shrink-0" />
                This page verifies an EMC course certificate — recognition of completing coursework at EMC Academy. It is not an external professional
                certification. To protect privacy, only the holder’s first name and last initial are shown.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/programs">Explore EMC programs</ButtonLink>
                <ButtonLink href="/contact" variant="outline">Contact EMC</ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
