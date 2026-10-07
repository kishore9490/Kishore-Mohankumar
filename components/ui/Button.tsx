"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { Icon, type IconName } from "./Icon";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Variant = "primary" | "light" | "dark" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-medium tracking-[-0.005em] transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "bg-signal text-white shadow-[0_8px_30px_-10px_rgb(216_35_47/0.7)] hover:bg-signal-hover",
  light: "bg-bone text-ink hover:bg-white",
  dark: "bg-ink text-bone hover:bg-ink-3",
  outline: "border border-current/25 hover:border-current/60 hover:bg-current/[0.04]",
  ghost: "hover:bg-current/[0.06]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-[15px]",
};

type Common = {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconLeft?: IconName;
  magnetic?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonProps = Common & Omit<ComponentProps<"button">, keyof Common>;
type LinkProps = Common & { href: string; external?: boolean } & Omit<ComponentProps<"a">, keyof Common | "href">;

function Inner({ icon, iconLeft, loading, children }: Pick<Common, "icon" | "iconLeft" | "loading" | "children">) {
  return (
    <>
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      ) : (
        iconLeft && <Icon name={iconLeft} size={18} />
      )}
      <span>{children}</span>
      {icon && !loading && (
        <Icon name={icon} size={18} className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0.5" />
      )}
    </>
  );
}

function useMagnet(enabled: boolean) {
  const reduced = usePrefersReducedMotion();
  if (!enabled || reduced) return { onPointerMove: undefined, onPointerLeave: undefined };
  return {
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse") return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      el.style.transform = `translate(${x}px, ${y}px)`;
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "";
    },
  };
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, iconLeft, magnetic, loading, children, className, ...rest },
  forwarded,
) {
  const m = useMagnet(!!magnetic);
  return (
    <button
      ref={forwarded}
      onPointerMove={m.onPointerMove}
      onPointerLeave={m.onPointerLeave}
      className={cn(base, variants[variant], sizes[size], className)}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Inner icon={icon} iconLeft={iconLeft} loading={loading}>
        {children}
      </Inner>
    </button>
  );
});

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  iconLeft,
  magnetic,
  children,
  className,
  href,
  external,
  ...rest
}: LinkProps) {
  const m = useMagnet(!!magnetic);
  const cls = cn(base, variants[variant], sizes[size], className);
  const inner = (
    <Inner icon={icon} iconLeft={iconLeft}>
      {children}
    </Inner>
  );
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    return (
      <a
        href={href}
        className={cls}
        onPointerMove={m.onPointerMove}
        onPointerLeave={m.onPointerLeave}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={cls}
      onPointerMove={m.onPointerMove}
      onPointerLeave={m.onPointerLeave}
      {...rest}
    >
      {inner}
    </Link>
  );
}
