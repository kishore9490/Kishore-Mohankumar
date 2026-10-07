import { ImageResponse } from "next/og";
import { dealership } from "@/data/dealership";

export const alt = `${dealership.name} — Honda scooters & motorcycles`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(80% 70% at 70% 80%, #23272d 0%, #0a0b0d 70%)",
          color: "#efece6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, letterSpacing: 2 }}>
          <div style={{ width: 40, height: 3, background: "#d8232f" }} />
          <span>{`${dealership.name.toUpperCase()} · ${dealership.address.city.toUpperCase()}`}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3 }}>
          <span>YOUR NEXT RIDE</span>
          <span style={{ color: "#8b8f95" }}>STARTS HERE.</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a3a7ad" }}>{`Bikes · Test rides · EMI · Service — ${dealership.descriptor}`}</div>
      </div>
    ),
    size,
  );
}
