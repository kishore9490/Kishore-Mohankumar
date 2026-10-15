import Link from "next/link";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { toRenderCompany } from "@/lib/documents/load";
import { brandLine } from "@/lib/documents/render-model";
import { DOCUMENT_TYPE_META, type DocumentType } from "@/lib/documents/meta";
import type { CompanyInput } from "@/lib/validation/schemas";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { CompanyForm } from "@/components/settings/company-form";
import { LogoUploader } from "@/components/settings/logo-uploader";
import { SequenceRow } from "@/components/settings/sequence-row";
import { ActionButton } from "@/components/forms/action-button";
import { clearSampleDataAction, resetSampleDataAction } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

export const metadata = { title: "Company Settings" };
export const dynamic = "force-dynamic";

const BLANK: CompanyInput = {
  brandName: "", coBrandName: "", tagline: "", primaryColor: "#0D1235", accentColor: "#5B4CE6", logoPrimaryTile: "light", logoSecondaryTile: "dark", legalName: "", address: "", phone: "", email: "", website: "",
  gstin: "", pan: "", state: "", stateCode: "", bankName: "", bankAccountName: "", bankAccountNumber: "", bankIfsc: "", bankBranch: "", upiId: "", paymentInstructions: "", authorisedSignatory: "",
  documentFooter: "", termsQuotation: "", termsInvoice: "", termsProposal: "", currency: "INR", defaultTaxRate: "18", roundingMode: "NEAREST_RUPEE", isDefault: false,
};

export default async function CompanySettingsPage({ searchParams }: { searchParams: Promise<{ id?: string; new?: string }> }) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const { id, new: isNew } = await searchParams;
  const companies = await prisma.companyProfile.findMany({ orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }], include: { sequences: true } });
  const company = isNew ? null : companies.find((c) => c.id === id) ?? companies[0];
  const sampleCount = await prisma.document.count({ where: { isSample: true } });
  const missing = company ? (["legalName", "address", "gstin", "stateCode", "bankAccountNumber", "bankIfsc"] as const).filter((k) => !company[k]) : [];
  const labels: Record<string, string> = { legalName: "Legal name", address: "Address", gstin: "GSTIN", stateCode: "State", bankAccountNumber: "Bank account", bankIfsc: "IFSC" };
  const render = company ? toRenderCompany(company) : null;
  const defaults: CompanyInput = company
    ? Object.fromEntries(Object.entries(BLANK).map(([k]) => [k, (company as unknown as Record<string, unknown>)[k] ?? (BLANK as Record<string, unknown>)[k]])) as CompanyInput
    : BLANK;
  if (company) defaults.defaultTaxRate = company.defaultTaxRate.toString();

  return (
    <>
      <PageHeader title="Company Settings" description="Company profiles, branding, legal details, numbering and defaults." actions={isAdmin && <Link href="/settings/company?new=1" className={buttonClass({ variant: "outline", size: "sm" })}><Plus /> New company profile</Link>} />
      {!isAdmin && <div className="mb-4 rounded-lg bg-canvas px-4 py-3 text-sm text-muted ring-1 ring-line">Only administrators can change company settings. You are viewing them read-only.</div>}
      {companies.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {companies.map((c) => (
            <Link key={c.id} href={`/settings/company?id=${c.id}`} className={cn("rounded-lg border px-3 py-1.5 text-sm", company?.id === c.id ? "border-brand-500 bg-brand-50 text-brand-800" : "border-line bg-white hover:border-brand-300")}>
              {brandLine(c)} {c.isDefault && <Badge tone="purple" className="ml-1">Default</Badge>}
            </Link>
          ))}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <CompanyForm key={company?.id ?? "new"} id={company?.id} defaults={defaults} readOnly={!isAdmin} />
        <div className="space-y-6">
          {company && render && (
            <>
              {missing.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
                  <div className="font-medium">Not yet configured</div>
                  <p className="mt-1 text-amber-800">{missing.map((m) => labels[m]).join(", ")}. These are left blank on documents until you add them.</p>
                </Card>
              )}
              <Card>
                <CardHeader title="Logos" description="Logos are configurable. Without one, a clean typographic brand treatment is used." />
                <CardBody className="space-y-3">
                  <LogoUploader companyId={company.id} slot="primary" label={`Primary logo — ${company.brandName}`} src={render.logoPrimary ?? null} tile={render.logoPrimaryTile} disabled={!isAdmin} />
                  <LogoUploader companyId={company.id} slot="secondary" label={`Secondary logo — ${company.coBrandName ?? "co-brand"}`} src={render.logoSecondary ?? null} tile={render.logoSecondaryTile} disabled={!isAdmin} />
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </div>
      {company && (
        <Card className="mt-6">
          <CardHeader title="Document numbering" description="Numbers are allocated inside a database transaction and enforced unique per company and series. Tax invoices are numbered when issued." />
          {company.sequences.sort((a, b) => a.type.localeCompare(b.type)).map((s) => (
            <SequenceRow key={s.id} id={s.id} label={DOCUMENT_TYPE_META[s.type as DocumentType].label} prefix={s.prefix} nextNumber={s.nextNumber} padding={s.padding} includeFinancialYear={s.includeFinancialYear} disabled={!isAdmin} />
          ))}
        </Card>
      )}
      {isAdmin && (
        <Card className="mt-6" id="sample-data">
          <CardHeader title="Sample data" description={`${sampleCount} sample document(s) currently present. Sample records are labelled and watermarked; they are not real transactions.`} />
          <CardBody className="flex flex-wrap gap-2">
            <ActionButton action={resetSampleDataAction} confirm={{ title: "Reset sample data?", description: "All sample customers, catalogue items and documents are deleted and recreated. Your own records are not affected." }} confirmLabel="Reset"><RotateCcw /> Reset sample data</ActionButton>
            <ActionButton danger action={clearSampleDataAction} confirm={{ title: "Remove all sample data?", description: "Sample customers, catalogue items and documents will be deleted. Your own records are not affected." }} confirmLabel="Remove"><Trash2 /> Remove sample data</ActionButton>
          </CardBody>
        </Card>
      )}
    </>
  );
}
