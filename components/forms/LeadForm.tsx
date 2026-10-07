"use client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { demoAvailability, educationOptions } from "@/data/site";
import { programs } from "@/data/programs";
import { track, type TrackEvent } from "@/lib/analytics";
import { submitLead, validateEmail, validatePhone } from "@/lib/leads";
import type { LeadType } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { whatsappLink } from "@/lib/whatsapp";

type FieldName =
  | "name"
  | "phone"
  | "email"
  | "education"
  | "experience"
  | "interest"
  | "preferredContact"
  | "preferredSlot"
  | "mode"
  | "message"
  | "programSlug";

interface Config {
  type: LeadType;
  fields: FieldName[];
  required: FieldName[];
  submitLabel: string;
  success: { title: string; text: string };
  events: { start: TrackEvent; done: TrackEvent };
}

export const formConfigs: Record<"demo" | "counselling" | "contact", Config> = {
  demo: {
    type: "demo",
    fields: ["name", "phone", "email", "education", "preferredSlot", "mode", "message"],
    required: ["name", "phone", "education"],
    submitLabel: "Book my demo",
    success: {
      title: "Your demo request is received.",
      text: "Our team will contact you to confirm a date and time. Meanwhile, try the Coding Lab to get a feel for the work.",
    },
    events: { start: "demo_started", done: "demo_completed" },
  },
  counselling: {
    type: "counselling",
    fields: ["name", "phone", "education", "experience", "interest", "preferredContact"],
    required: ["name", "phone", "education"],
    submitLabel: "Talk to EMC",
    success: {
      title: "Thank you — we’ll be in touch.",
      text: "A counsellor will reach out using your preferred contact method to help you understand the right learning path.",
    },
    events: { start: "counselling_started", done: "counselling_completed" },
  },
  contact: {
    type: "enquiry",
    fields: ["name", "phone", "email", "programSlug", "message"],
    required: ["name", "phone"],
    submitLabel: "Send enquiry",
    success: { title: "Enquiry received.", text: "We’ll get back to you shortly." },
    events: { start: "application_started", done: "course_enquiry" },
  },
};

const experienceOptions = ["Fresher / student", "Healthcare experience (non-coding)", "0–2 years in coding / billing", "2+ years in coding / billing"];
const interestOptions = ["Starting a career in medical coding", "Upskilling / advanced coding", "Certification preparation", "Not sure yet"];

export function LeadForm({
  variant,
  defaultProgram,
  defaultInterest,
  dark,
  compact,
}: {
  variant: keyof typeof formConfigs;
  defaultProgram?: string;
  defaultInterest?: string;
  dark?: boolean;
  compact?: boolean;
}) {
  const cfg = formConfigs[variant];
  const uid = useId();
  const started = useRef(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName | "consent", string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const has = (f: FieldName) => cfg.fields.includes(f);
  const req = (f: FieldName) => cfg.required.includes(f);

  const onFocus = () => {
    if (started.current) return;
    started.current = true;
    track(cfg.events.start, { form: variant });
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const errs: typeof errors = {};
    if (v("name").length < 2) errs.name = "Please enter your name.";
    if (!validatePhone(v("phone"))) errs.phone = "Please enter a valid 10-digit mobile number.";
    if (has("email") && v("email") && !validateEmail(v("email"))) errs.email = "Please check your email address.";
    if (req("education") && !v("education")) errs.education = "Please select your background.";
    if (!fd.get("consent")) errs.consent = "Please allow us to contact you.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      (e.currentTarget.querySelector(`[name="${first}"]`) as HTMLElement | null)?.focus();
      return;
    }
    setState("sending");
    setServerError(null);
    const slot = [v("preferredSlot"), v("preferredDate"), v("mode")].filter(Boolean).join(" · ");
    const res = await submitLead({
      type: cfg.type,
      name: v("name"),
      phone: v("phone"),
      email: v("email") || undefined,
      education: v("education") || undefined,
      experience: v("experience") || undefined,
      interest: v("interest") || undefined,
      preferredContact: (v("preferredContact") || undefined) as "phone" | "whatsapp" | "email" | undefined,
      preferredSlot: slot || undefined,
      message: v("message") || undefined,
      programSlug: v("programSlug") || defaultProgram,
      consent: true,
    });
    if (res.ok) {
      setState("done");
      track(cfg.events.done, { form: variant, program: v("programSlug") || defaultProgram });
    } else {
      setState("error");
      setServerError(res.error ?? "Something went wrong.");
    }
  }

  const labelCls = labelClass(dark);
  const fieldCls = cn("field", dark && "!border-white/15 !bg-white/[.06] !text-white placeholder:!text-white/35");
  const errCls = "mt-1.5 text-[12.5px] text-orange-600";
  const fp = (name: FieldName | "preferredDate") => ({
    htmlFor: `${uid}-${name}`,
    error: errors[name as FieldName],
    errId: `${uid}-${name}-err`,
    dark,
  });
  const aria = (name: FieldName) => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-err` : undefined,
    "aria-required": req(name) || undefined,
  });

  const wa = whatsappLink(variant === "demo" ? "demo" : "counsellor");

  return (
    <AnimatePresence mode="wait">
      {state === "done" ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn("rounded-2xl p-8 text-center md:p-12", dark ? "bg-white/[.05]" : "border border-line bg-white")}
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan text-ink"
          >
            <Icon name="check" size={28} />
          </motion.div>
          <p className="heading mt-7 text-3xl md:text-4xl">{cfg.success.title}</p>
          <p className={cn("mx-auto mt-4 max-w-md text-[16px] leading-relaxed", dark ? "text-white/70" : "text-muted")}>{cfg.success.text}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/#lab" className={cn("text-[14px] font-medium underline underline-offset-4", dark ? "text-white" : "text-ink")}>
              Try the Coding Lab
            </Link>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[14px] font-medium text-cyan-ink">
                <Icon name="whatsapp" size={16} /> Message us on WhatsApp
              </a>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          noValidate
          onSubmit={onSubmit}
          onFocus={onFocus}
          className={cn("grid gap-4", !compact && "sm:grid-cols-2")}
          aria-label={cfg.submitLabel}
        >
          <Field {...fp("name")} label="Name">
            <input {...aria("name")} className={fieldCls} autoComplete="name" placeholder="Your full name" />
          </Field>
          <Field {...fp("phone")} label="Mobile">
            <input {...aria("phone")} className={fieldCls} type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit mobile number" />
          </Field>
          {has("email") && (
            <Field {...fp("email")} label="Email" optional={!req("email")}>
              <input {...aria("email")} className={fieldCls} type="email" autoComplete="email" placeholder="you@example.com" />
            </Field>
          )}
          {has("education") && (
            <Field {...fp("education")} label="Educational background">
              <select {...aria("education")} className={fieldCls} defaultValue="">
                <option value="" disabled>Select…</option>
                {educationOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          )}
          {has("experience") && (
            <Field {...fp("experience")} label="Experience" optional>
              <select {...aria("experience")} className={fieldCls} defaultValue="">
                <option value="">Select…</option>
                {experienceOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          )}
          {has("interest") && (
            <Field {...fp("interest")} label="Area of interest" optional>
              <select {...aria("interest")} className={fieldCls} defaultValue={defaultInterest ?? ""}>
                <option value="">Select…</option>
                {[...interestOptions, ...(defaultInterest && !interestOptions.includes(defaultInterest) ? [defaultInterest] : [])].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          )}
          {has("programSlug") && (
            <Field {...fp("programSlug")} label="Program" optional>
              <select {...aria("programSlug")} className={fieldCls} defaultValue={defaultProgram ?? ""}>
                <option value="">Not sure yet</option>
                {programs.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
            </Field>
          )}
          {has("preferredSlot") && (
            <Field {...fp("preferredSlot")} label="Preferred time" optional>
              <select {...aria("preferredSlot")} className={fieldCls} defaultValue="">
                <option value="">Any time</option>
                {demoAvailability.slots.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          )}
          {has("preferredSlot") && (
            <Field {...fp("preferredDate")} label="Preferred date" optional>
              <input id={`${uid}-preferredDate`} name="preferredDate" type="date" className={fieldCls} min={new Date().toISOString().slice(0, 10)} />
            </Field>
          )}
          {has("mode") && demoAvailability.modes.length > 1 && (
            <fieldset className={cn(!compact && "sm:col-span-2")}>
              <legend className={labelCls}>Demo format <span className={dark ? "text-white/40" : "text-muted"}>(optional)</span></legend>
              <div className="flex flex-wrap gap-2">
                {demoAvailability.modes.map((m) => (
                  <label key={m} className={cn("cursor-pointer rounded-full border px-4 py-2 text-[14px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white", dark ? "border-white/20 has-[:checked]:!border-cyan has-[:checked]:!bg-cyan has-[:checked]:!text-ink" : "border-line")}>
                    <input type="radio" name="mode" value={m} className="sr-only" /> {m}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {has("preferredContact") && (
            <fieldset className={cn(!compact && "sm:col-span-2")}>
              <legend className={labelCls}>Preferred contact method</legend>
              <div className="flex flex-wrap gap-2">
                {[
                  ["phone", "Phone call"],
                  ["whatsapp", "WhatsApp"],
                  ["email", "Email"],
                ].map(([v, l], i) => (
                  <label key={v} className={cn("cursor-pointer rounded-full border px-4 py-2 text-[14px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white", dark ? "border-white/20 has-[:checked]:!border-cyan has-[:checked]:!bg-cyan has-[:checked]:!text-ink" : "border-line")}>
                    <input type="radio" name="preferredContact" value={v} defaultChecked={i === 0} className="sr-only" /> {l}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {has("message") && (
            <div className={cn(!compact && "sm:col-span-2")}>
              <Field {...fp("message")} label="Message" optional>
                <textarea {...aria("message")} rows={3} className={fieldCls} placeholder="Anything you’d like us to know?" />
              </Field>
            </div>
          )}

          <div className={cn(!compact && "sm:col-span-2")}>
            <label className={cn("flex items-start gap-3 text-[13px] leading-snug", dark ? "text-white/65" : "text-muted")}>
              <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-blue)]" aria-invalid={errors.consent ? true : undefined} />
              <span>
                I agree to be contacted by EMC about my request by phone, WhatsApp or email. See our{" "}
                <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.
              </span>
            </label>
            {errors.consent && <p className={errCls} role="alert">{errors.consent}</p>}
          </div>

          <div className={cn("flex flex-col gap-3", !compact && "sm:col-span-2")}>
            <Button type="submit" size="lg" icon="arrow" variant={dark ? "accent" : "primary"} disabled={state === "sending"} className="w-full sm:w-auto sm:self-start">
              {state === "sending" ? "Sending…" : cfg.submitLabel}
            </Button>
            {serverError && <p className={errCls} role="alert">{serverError}</p>}
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

const labelClass = (dark?: boolean) => cn("mb-1.5 block text-[13px] font-medium", dark ? "text-white/80" : "text-ink");

function Field({
  htmlFor,
  label,
  optional,
  error,
  errId,
  dark,
  children,
}: {
  htmlFor: string;
  label: string;
  optional?: boolean;
  error?: string;
  errId: string;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass(dark)}>
        {label} {optional && <span className={dark ? "text-white/40" : "text-muted"}>(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={errId} className="mt-1.5 text-[12.5px] text-orange-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
