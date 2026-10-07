"use client";
import Link from "next/link";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/Icon";

/** Renders only the contact channels EMC has configured. */
export function ContactLinks({ dark }: { dark?: boolean }) {
  const { phone, email, address } = site.contact;
  const wa = whatsappLink("courses");
  const item = cn("flex items-start gap-3 text-[14px] transition-colors", dark ? "text-white/75 hover:text-white" : "text-ink hover:text-blue");
  const none = !phone && !email && !address && !wa;
  return (
    <ul className="space-y-3">
      {wa && (
        <li>
          <a href={wa} target="_blank" rel="noopener noreferrer" className={item} onClick={() => track("whatsapp_click", { placement: "contact" })}>
            <Icon name="whatsapp" size={17} className="mt-0.5 shrink-0" /> WhatsApp
          </a>
        </li>
      )}
      {phone && (
        <li>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className={item} onClick={() => track("phone_click", { placement: "contact" })}>
            <Icon name="phone" size={17} className="mt-0.5 shrink-0" /> {phone}
          </a>
        </li>
      )}
      {email && (
        <li>
          <a href={`mailto:${email}`} className={item}>
            <Icon name="mail" size={17} className="mt-0.5 shrink-0" /> {email}
          </a>
        </li>
      )}
      {address && (
        <li className={item}>
          <Icon name="pin" size={17} className="mt-0.5 shrink-0" /> <span>{address}</span>
        </li>
      )}
      {none && (
        <li>
          <Link href="/counselling" className={item}>
            <Icon name="user" size={17} className="mt-0.5 shrink-0" /> Request a call back
          </Link>
        </li>
      )}
    </ul>
  );
}
