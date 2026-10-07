import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "accent" | "outline" | "ghost" | "light" | "outline-light";
type Size = "md" | "lg" | "sm";

const base =
  "group inline-flex items-center justify-center gap-2 font-medium tracking-[-0.005em] rounded-full transition-[background,color,box-shadow,transform,border-color] duration-200 ease-[var(--ease-out-expo)] active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-navy-2 shadow-[0_1px_0_rgba(255,255,255,.12)_inset,0_8px_24px_-12px_rgba(7,26,51,.6)]",
  accent: "bg-cyan text-ink hover:bg-[#2cc5e2] shadow-[0_8px_30px_-12px_rgba(18,181,212,.8)]",
  outline: "border border-line text-ink hover:border-ink bg-white",
  ghost: "text-ink hover:bg-mist",
  light: "bg-white text-ink hover:bg-soft",
  "outline-light": "border border-white/25 text-white hover:border-white hover:bg-white/5",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-13 px-6 text-[15px] min-h-[52px]",
};

interface Common {
  variant?: Variant;
  size?: Size;
  icon?: IconName | null;
  iconLeft?: IconName;
  children: ReactNode;
  className?: string;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon = "arrow",
  iconLeft,
  children,
  className,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  const external = typeof href === "string" && /^https?:/.test(href);
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {iconLeft && <Icon name={iconLeft} size={17} />}
      <span>{children}</span>
      {icon && <Icon name={icon} size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  icon = null,
  iconLeft,
  children,
  className,
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {iconLeft && <Icon name={iconLeft} size={17} />}
      <span>{children}</span>
      {icon && <Icon name={icon} size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />}
    </button>
  );
}
