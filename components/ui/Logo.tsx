import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";

/** Renders the official EMC logo file configured in data/site.ts — never redrawn in code. */
export function Logo({ className, invert, priority }: { className?: string; invert?: boolean; priority?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.legalName} — home`} className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src={site.logo.src}
        alt={site.logo.alt}
        width={site.logo.width}
        height={site.logo.height}
        priority={priority}
        unoptimized={site.logo.src.endsWith(".svg")}
        className={cn("h-9 w-auto md:h-10", invert && "rounded-md bg-white px-2 py-1")}
      />
    </Link>
  );
}
