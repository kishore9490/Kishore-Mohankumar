import { ImageResponse } from "next/og";

export const alt = "EMC — Experts Medical Coding Academy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#071a33", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#12b5d4" }}>EXPERTS MEDICAL CODING ACADEMY</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>
          <span>Turn medical knowledge</span>
          <span style={{ color: "#12b5d4" }}>into a career.</span>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 24, color: "rgba(255,255,255,.6)" }}>
          <span>Clinical information</span><span>→</span><span>Medical coding</span><span>→</span><span>Revenue cycle</span>
        </div>
      </div>
    ),
    size,
  );
}
