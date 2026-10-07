import Link from "next/link";
import { dealership, formattedAddress } from "@/data/dealership";
import { bikes } from "@/data/bikes";
import { formatPhone } from "@/lib/format";
import { Wordmark } from "./Wordmark";
import { TrackedLink } from "./TrackedLink";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/[0.07] bg-ink pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+1rem)] pt-16 text-bone lg:pb-10">
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Wordmark />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-bone/55">
              From your first ride to every service after it — we&apos;re here for the journey.
            </p>
            <address className="mt-6 text-sm not-italic leading-relaxed text-bone/70">{formattedAddress}</address>
          </div>

          <FooterCol title="Motorcycles">
            {bikes.slice(0, 6).map((b) => (
              <li key={b.slug}>
                <Link href={`/bikes/${b.slug}`} className="hover:text-bone">
                  {b.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/bikes" className="hover:text-bone">
                All bikes →
              </Link>
            </li>
          </FooterCol>

          <FooterCol title="Ride & own">
            {[
              ["/test-ride", "Book a test ride"],
              ["/finance", "EMI calculator"],
              ["/bikes#help-me-choose", "Help me choose"],
              ["/accessories", "Accessories"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-bone">
                  {label}
                </Link>
              </li>
            ))}
          </FooterCol>

          <FooterCol title="Service">
            {[
              ["/service/book", "Book service"],
              ["/service/track", "Track service"],
              ["/garage", "My Honda garage"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-bone">
                  {label}
                </Link>
              </li>
            ))}
          </FooterCol>

          <FooterCol title="Talk to us">
            <li>
              <TrackedLink href={`tel:${dealership.phone.sales}`} event="phone_click" source="footer_sales" className="hover:text-bone">
                Sales {formatPhone(dealership.phone.sales)}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={`tel:${dealership.phone.service}`} event="phone_click" source="footer_service" className="hover:text-bone">
                Service {formatPhone(dealership.phone.service)}
              </TrackedLink>
            </li>
            <li>
              <a href={`mailto:${dealership.email}`} className="hover:text-bone">
                {dealership.email}
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-bone">
                Directions & hours
              </Link>
            </li>
          </FooterCol>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.07] pt-8 text-xs leading-relaxed text-bone/45 md:flex-row md:items-start md:justify-between">
          <p className="max-w-3xl">
            {dealership.name} is an independently owned authorised Honda two-wheeler dealership. Honda, model names and
            related marks belong to their respective owner. Prices shown are indicative ex-showroom prices and may change
            without notice; specifications are for reference — please confirm with our team before purchase. EMI figures
            are estimates only and do not constitute a finance offer.
            {dealership.isSampleData && (
              <strong className="mt-2 block font-medium text-amber">
                Preview build: dealership details, prices and specifications on this site are sample content pending
                verification.
              </strong>
            )}
          </p>
          <p className="shrink-0">© {year} {dealership.name}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-2">
      <h2 className="eyebrow mb-5 text-bone/45">{title}</h2>
      <ul className="flex flex-col gap-3 text-sm text-bone/70">{children}</ul>
    </div>
  );
}
