import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Section({
  id,
  children,
  className,
  tone = "light",
  ...rest
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "light" | "mist" | "dark";
  "aria-labelledby"?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-20 md:py-28 lg:py-32",
        tone === "mist" && "bg-mist",
        tone === "dark" && "bg-ink text-white",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  label,
  title,
  intro,
  id,
  align = "left",
  dark,
  className,
  children,
}: {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("label flex items-center gap-2", align === "center" && "justify-center", dark && "text-white/60")}>
        <span className="inline-block h-px w-6 bg-cyan" aria-hidden="true" />
        {label}
      </p>
      <h2 id={id} className="heading mt-5 text-[34px] sm:text-5xl lg:text-[60px]">
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-5 text-[17px] leading-relaxed md:text-lg", dark ? "text-white/70" : "text-muted")}>{intro}</p>
      )}
      {children}
    </header>
  );
}
