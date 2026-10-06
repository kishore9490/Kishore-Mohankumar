import type { Project } from "@/data/profile";

/**
 * Generated visual signatures for projects — drawn, not stock.
 * Hairline geometry in paper, one element in amber.
 */
const P = "rgb(236 230 220 / 0.55)";
const P2 = "rgb(236 230 220 / 0.22)";
const A = "#F2A541";

function Signal() {
  return (
    <g>
      {[22, 40, 58, 76].map((r, i) => (
        <path key={r} d={`M ${100 - r} 150 A ${r} ${r} 0 0 1 ${100 + r} 150`} fill="none" stroke={i === 0 ? A : P} strokeWidth="1">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </path>
      ))}
      <circle cx="100" cy="150" r="3" fill={A} />
      {[
        [34, 46, 46],
        [112, 34, 54],
        [66, 70, 38],
      ].map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height="16" fill="none" stroke={P2} />
          <line x1={x + 6} y1={y + 8} x2={x + w - 10} y2={y + 8} stroke={P} />
        </g>
      ))}
    </g>
  );
}

function Hub() {
  const n = 8;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [100 + Math.cos(a) * 66, 100 + Math.sin(a) * 66];
  });
  return (
    <g>
      <circle cx="100" cy="100" r="66" fill="none" stroke={P2} strokeDasharray="2 4" />
      <circle cx="100" cy="100" r="34" fill="none" stroke={P2} />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <line x1="100" y1="100" x2={x} y2={y} stroke={P2} />
          <rect x={x - 4} y={y - 4} width="8" height="8" fill="#0A0A0B" stroke={i === 2 ? A : P} />
        </g>
      ))}
      <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[3][0]} y2={pts[3][1]} stroke={P2} />
      <line x1={pts[5][0]} y1={pts[5][1]} x2={pts[7][0]} y2={pts[7][1]} stroke={P2} />
      <rect x="92" y="92" width="16" height="16" fill={A} />
    </g>
  );
}

function Rack() {
  return (
    <g>
      <rect x="52" y="24" width="96" height="152" fill="none" stroke={P} />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x="60" y={32 + i * 16} width="80" height="11" fill="none" stroke={P2} />
          <line x1="66" y1={37.5 + i * 16} x2={100 + ((i * 13) % 20)} y2={37.5 + i * 16} stroke={P2} />
          <circle cx="132" cy={37.5 + i * 16} r="1.6" fill={i === 4 ? A : P}>
            {i === 4 && <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />}
          </circle>
        </g>
      ))}
      <line x1="40" y1="176" x2="160" y2="176" stroke={P2} />
    </g>
  );
}

function Route() {
  return (
    <g>
      <circle cx="100" cy="100" r="70" fill="none" stroke={P2} />
      <ellipse cx="100" cy="100" rx="28" ry="70" fill="none" stroke={P2} />
      <ellipse cx="100" cy="100" rx="56" ry="70" fill="none" stroke={P2} />
      <line x1="30" y1="100" x2="170" y2="100" stroke={P2} />
      <path d="M 52 128 Q 96 18 150 82" fill="none" stroke={A} strokeDasharray="3 4">
        <animate attributeName="stroke-dashoffset" values="14;0" dur="1.2s" repeatCount="indefinite" />
      </path>
      <rect x="48" y="124" width="8" height="8" fill={P} />
      <rect x="146" y="78" width="8" height="8" fill={A} />
    </g>
  );
}

function Candles() {
  const c = [
    [40, 110, 130, 96, 140],
    [58, 100, 116, 92, 124],
    [76, 106, 88, 80, 112],
    [94, 90, 98, 82, 106],
    [112, 96, 74, 66, 100],
    [130, 76, 82, 70, 90],
    [148, 80, 58, 50, 86],
    [166, 60, 52, 44, 66],
  ];
  return (
    <g>
      {[60, 100, 140].map((y) => (
        <line key={y} x1="28" y1={y} x2="178" y2={y} stroke={P2} strokeDasharray="1 4" />
      ))}
      {c.map(([x, o, cl, h, l], i) => (
        <g key={i}>
          <line x1={x} y1={h} x2={x} y2={l} stroke={P} />
          <rect x={x - 4} y={Math.min(o, cl)} width="8" height={Math.max(2, Math.abs(o - cl))} fill={cl < o ? "none" : P2} stroke={cl < o ? A : P} />
        </g>
      ))}
      <polyline points={c.map(([x, o, cl]) => `${x},${(o + cl) / 2 + 22}`).join(" ")} fill="none" stroke={P} strokeWidth="1" />
    </g>
  );
}

function Flask() {
  const pts = [
    [44, 60], [70, 40], [98, 66], [126, 46], [156, 72], [60, 112], [92, 128], [130, 108], [150, 146], [78, 158], [116, 166], [40, 140],
  ];
  const links = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 6], [6, 7], [7, 8], [5, 6], [6, 9], [9, 10]];
  return (
    <g>
      {links.map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={P2} />
      ))}
      {pts.map(([x, y], i) => (
        <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" fill={i === 6 ? A : P} />
      ))}
      <circle cx="92" cy="128" r="16" fill="none" stroke={A} strokeDasharray="2 3">
        <animateTransform attributeName="transform" type="rotate" from="0 92 128" to="360 92 128" dur="12s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

const MAP = { signal: Signal, hub: Hub, rack: Rack, route: Route, candles: Candles, flask: Flask } as const;

export function ProjectGlyph({ glyph, className }: { glyph: Project["glyph"]; className?: string }) {
  const G = MAP[glyph];
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      <G />
    </svg>
  );
}
