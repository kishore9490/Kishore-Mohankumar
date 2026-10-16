"use client";

// Last-resort error screen (errors in the root layout). Shows the reference recorded in the audit trail.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f6f7fb", margin: 0 }}>
        <div style={{ maxWidth: 520, margin: "80px auto", background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e3e6f0" }}>
          <h2 style={{ margin: 0, color: "#b91c1c" }}>Something went wrong</h2>
          <p style={{ color: "#555" }}>
            The error has been recorded{error.digest ? <> with reference <code>{error.digest}</code></> : null}. Open <code>/api/health?token=YOUR_SETUP_TOKEN</code> to see the details.
          </p>
          <p style={{ color: "#888", fontSize: 12 }}>Build {process.env.NEXT_PUBLIC_BUILD_ID}</p>
          <button onClick={reset} style={{ padding: "8px 14px", borderRadius: 8, border: 0, background: "#5b4ce6", color: "#fff" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
