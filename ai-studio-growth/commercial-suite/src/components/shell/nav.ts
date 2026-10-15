import { Building2, FileSignature, FileSpreadsheet, FileText, History, LayoutDashboard, Package, Plug, Receipt, Send, Users, UserCog } from "lucide-react";

export const NAV_GROUPS = [
  { label: "Overview", items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Documents",
    items: [
      { href: "/documents/proposals", label: "Commercial Proposals", icon: FileSignature },
      { href: "/documents/quotations", label: "Quotations", icon: FileText },
      { href: "/documents/invoices", label: "Invoices", icon: Receipt },
      { href: "/documents/proforma", label: "Proforma Invoices", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/catalogue", label: "Products & Services", icon: Package },
    ],
  },
  {
    label: "Activity",
    items: [
      { href: "/communications", label: "Communications", icon: Send },
      { href: "/history", label: "Document History", icon: History },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/settings/company", label: "Company Settings", icon: Building2 },
      { href: "/settings/integrations", label: "Integrations", icon: Plug },
      { href: "/settings/users", label: "Users", icon: UserCog, adminOnly: true },
    ],
  },
] as const;

