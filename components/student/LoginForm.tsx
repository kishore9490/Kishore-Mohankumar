"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** UI only. Submits to nothing until an auth provider is connected (see lib/auth.ts). */
export function LoginForm() {
  const [notice, setNotice] = useState(false);
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setNotice(true);
      }}
    >
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-[13px] font-medium">Email or student ID</label>
        <input id="login-email" name="email" autoComplete="username" className="field" required />
      </div>
      <div>
        <label htmlFor="login-pass" className="mb-1.5 block text-[13px] font-medium">Password</label>
        <input id="login-pass" name="password" type="password" autoComplete="current-password" className="field" required />
      </div>
      <Button type="submit" size="lg" icon="arrow" className="mt-2 w-full">Sign in</Button>
      {notice && (
        <p role="status" className="flex gap-2 rounded-xl bg-soft px-4 py-3 text-[14px] leading-snug text-ink">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-blue" />
          <span>
            Student sign-in opens when the EMC learning platform goes live. Enrolled students will receive their login details from EMC.{" "}
            <Link href="/student" className="font-medium text-blue underline-offset-2 hover:underline">Preview the dashboard →</Link>
          </span>
        </p>
      )}
    </form>
  );
}
