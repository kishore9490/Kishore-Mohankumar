"use client";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { loginAction, type LoginState } from "@/server/actions/auth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface Demo {
  role: string;
  label: string;
  email: string;
  password: string;
  name: string;
}

export function LoginForm({ next, demoAccounts }: { next: string; demoAccounts: Demo[] }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { error: null });
  const [show, setShow] = useState(false);
  const idRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  const fill = (d: Demo) => {
    if (idRef.current) idRef.current.value = d.email;
    if (pwRef.current) pwRef.current.value = d.password;
    pwRef.current?.form?.requestSubmit();
  };

  return (
    <>
      <form action={action} className="grid gap-4" noValidate>
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="identifier" className="mb-1.5 block text-[13px] font-medium">Email or mobile</label>
          <input ref={idRef} id="identifier" name="identifier" className="field" autoComplete="username" defaultValue={state.identifier} required aria-invalid={state.error ? true : undefined} aria-describedby={state.error ? "login-error" : undefined} />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium">Password</label>
            <Link href="/forgot-password" className="text-[13px] font-medium text-blue hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input ref={pwRef} id="password" name="password" type={show ? "text" : "password"} className="field pr-16" autoComplete="current-password" required aria-invalid={state.error ? true : undefined} />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[12.5px] font-medium text-muted hover:text-ink" aria-pressed={show}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2.5 text-[14px] text-muted">
          <input type="checkbox" name="remember" className="h-4 w-4 accent-[var(--color-blue)]" /> Remember me on this device
        </label>
        {state.error && (
          <p id="login-error" role="alert" className="flex gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-[14px] text-orange-900">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" /> {state.error}
          </p>
        )}
        <Button type="submit" size="lg" icon="arrow" disabled={pending} className="mt-1 w-full">
          {pending ? "Signing in…" : "Login"}
        </Button>
        <p className="text-center text-[12.5px] text-muted">One-time passcode, Google and Microsoft sign-in will be added later.</p>
      </form>

      {demoAccounts.length > 0 && (
        <section aria-labelledby="demo-accounts" className="mt-10 rounded-2xl border border-dashed border-line p-5">
          <div className="flex items-center justify-between">
            <h2 id="demo-accounts" className="text-[14px] font-semibold">Demo accounts</h2>
            <span className="label !text-[10px]">Demo mode only</span>
          </div>
          <p className="mt-1 text-[12.5px] text-muted">Fictional users for exploring the platform. Removed when a real database is connected.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {demoAccounts.map((d) => (
              <li key={d.email}>
                <button type="button" onClick={() => fill(d)} className="group w-full rounded-xl border border-line bg-white px-3.5 py-3 text-left transition-colors hover:border-ink">
                  <span className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold">{d.label}</span>
                    <Icon name="arrow" size={14} className="text-muted transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted">{d.email}</span>
                  <span className="block font-mono text-[11px] text-muted">{d.password}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
