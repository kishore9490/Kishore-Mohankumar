/**
 * Hero renderer — raw WebGL, no dependencies.
 *
 * The hero is composed in layers:
 *   back canvas  : background plate (Kishore removed), far dust, rear half of the orbits
 *   DOM          : the giant name, then the portrait cutout
 *   front canvas : near dust (bokeh), front half of the orbits
 *
 * Both canvases are driven by one HeroEngine with identical uniforms, so the
 * orbit passes behind and in front of the person with pixel-exact continuity.
 */

export type LayerKind = "back" | "front";

export type Frame = { x: number; y: number; w: number; h: number };

export type EngineState = {
  width: number;
  height: number;
  dpr: number;
  frame: Frame; // portrait frame, css px relative to canvas
  mouse: [number, number]; // smoothed, -1..1
  cursor: [number, number]; // css px
  cursorActive: number; // 0..1
  time: number;
  reveal: number; // 0..1 intro progress
  scroll: number; // 0..1 hero scroll-out progress
  build: number; // 0..1 build mode
};

const QUAD_VS = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const PLATE_FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;
uniform vec2 uRes;      // css px
uniform float uDpr;
uniform vec4 uFrame;    // x, y, w, h css px (top-left origin)
uniform vec2 uMouse;
uniform vec2 uCursor;
uniform float uCursorActive;
uniform float uTime;
uniform float uReveal;
uniform float uScroll;
uniform float uBuild;
uniform float uHasTex;

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr; // css px, top-left
  vec3 ink = vec3(0.039, 0.039, 0.043);
  vec3 amber = vec3(0.949, 0.647, 0.255);

  // Frame uv, plate slightly larger than the cutout and zooming on scroll.
  vec2 uv = (p - uFrame.xy) / uFrame.zw;
  vec2 anchor = vec2(0.5, 0.92);
  float zoom = 1.14 + uScroll * 0.12 + (1.0 - uReveal) * 0.06;
  uv = (uv - anchor) / zoom + anchor;

  // Procedural depth: the corridor recedes to the left, the wall is near on the right.
  float depth = mix(0.25, 1.0, smoothstep(0.25, 1.05, uv.x));
  uv -= uMouse * depth * vec2(0.018, 0.010);

  vec3 col = ink;
  float m = 0.0;
  if (uHasTex > 0.5) {
    vec3 tex = texture2D(uTex, clamp(uv, 0.001, 0.999)).rgb;
    // Edge fade into darkness — the photo dissolves into the page.
    vec2 e = (uv - vec2(0.56, 0.5)) * vec2(1.25, 0.82);
    m = 1.0 - smoothstep(0.2, 0.62, length(e));
    m *= smoothstep(-0.02, 0.2, uv.x) * smoothstep(1.02, 0.86, uv.x);
    tex = pow(tex, vec3(1.18)) * 0.62 * vec3(1.04, 0.96, 0.86);
    col = mix(ink, tex, m);
  }

  // Back light behind the head separates dark hair from the wall.
  vec2 head = uFrame.xy + uFrame.zw * vec2(0.47, 0.22);
  float hd = length((p - head) / (uFrame.z * vec2(0.9, 1.1)));
  col += amber * 0.075 * exp(-hd * hd * 3.0);

  // Cursor light: a warm pool that follows the visitor.
  float cd = length(p - uCursor) / max(uRes.x, uRes.y);
  col += amber * 0.085 * uCursorActive * exp(-cd * cd * 26.0);

  // Light sweep during the intro.
  float sweepX = mix(-0.3, 1.3, uReveal);
  float sweep = exp(-pow((p.x / uRes.x - sweepX) * 5.0, 2.0)) * (1.0 - uReveal);
  col += vec3(1.0, 0.86, 0.66) * sweep * 0.12 * m;

  // Build mode: architectural grid.
  if (uBuild > 0.0) {
    vec2 g = abs(fract(p / 48.0) - 0.5) * 48.0;
    float line = 1.0 - smoothstep(0.0, 1.0, min(g.x, g.y));
    col = mix(col, amber, line * 0.16 * uBuild);
  }

  // Vignette + grain.
  vec2 q = p / uRes - 0.5;
  col *= 1.0 - dot(q, q) * 0.9;
  col += (hash(p + fract(uTime) * 91.7) - 0.5) * 0.035;

  col = mix(ink, col, smoothstep(0.0, 0.55, uReveal));
  gl_FragColor = vec4(col, 1.0);
}`;

const DUST_VS = `
attribute vec4 aSeed; // x, y, z (-1..1), size/hue seed
uniform vec2 uRes;
uniform float uDpr;
uniform vec4 uFrame;
uniform vec2 uMouse;
uniform vec2 uCursor;
uniform float uCursorActive;
uniform float uTime;
uniform float uScroll;
uniform float uFront;
varying float vAlpha;
varying float vHue;
void main(){
  float z = aSeed.z;
  float speed = 0.006 + aSeed.w * 0.012;
  float y = fract(aSeed.y * 0.5 + 0.5 + uTime * speed + uScroll * 0.35) * 2.0 - 1.0;
  float x = aSeed.x + sin(uTime * 0.21 + aSeed.w * 30.0) * 0.025;
  vec2 c = vec2(uRes.x * 0.5, uRes.y * 0.5);
  float s = 1.0 / (1.0 - z * 0.38);
  vec2 sp = c + vec2(x * uRes.x * 0.62, -y * uRes.y * 0.62) * s;
  sp += uMouse * z * vec2(42.0, 26.0);

  // Cursor repulsion.
  vec2 d = sp - uCursor;
  float dist = length(d);
  float push = (1.0 - smoothstep(0.0, 170.0, dist)) * 46.0 * uCursorActive * (0.6 + z * 0.4 + 0.4);
  sp += (d / max(dist, 0.001)) * push;

  vec2 clip = vec2(sp.x / uRes.x * 2.0 - 1.0, 1.0 - sp.y / uRes.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  float size = uFront > 0.5 ? (7.0 + aSeed.w * 18.0) : (1.1 + aSeed.w * 2.3) * s;
  gl_PointSize = size * uDpr;
  float edge = smoothstep(1.0, 0.7, abs(y));
  vAlpha = edge * (uFront > 0.5 ? 0.05 + aSeed.w * 0.07 : 0.22 + aSeed.w * 0.5) * (1.0 - uScroll * 0.6);
  vHue = aSeed.w;
}`;

const DUST_FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uReveal;
uniform float uFront;
varying float vAlpha;
varying float vHue;
void main(){
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = uFront > 0.5 ? smoothstep(1.0, 0.55, r) : smoothstep(1.0, 0.0, r);
  vec3 warm = vec3(1.0, 0.93, 0.82);
  vec3 amber = vec3(0.949, 0.647, 0.255);
  vec3 col = mix(warm, amber, step(0.86, vHue));
  gl_FragColor = vec4(col, a * vAlpha * uReveal);
}`;

const ORBIT_VS = `
attribute float aT; // angle 0..2pi
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uTilt;
uniform float uRoll;
uniform float uRot;
uniform float uPointSize;
uniform float uDpr;
uniform vec2 uMouse;
varying float vZ;
void main(){
  float a = aT + uRot;
  vec3 p = vec3(cos(a) * uRadius, 0.0, sin(a) * uRadius);
  // tilt around X
  float ct = cos(uTilt), st = sin(uTilt);
  p = vec3(p.x, p.y * ct - p.z * st, p.y * st + p.z * ct);
  // roll around Z
  float cr = cos(uRoll), sr = sin(uRoll);
  p = vec3(p.x * cr - p.y * sr, p.x * sr + p.y * cr, p.z);
  float f = uRadius * 4.0;
  float s = f / (f - p.z);
  vec2 sp = uCenter + p.xy * s * vec2(1.0, -1.0) + uMouse * (p.z / uRadius) * vec2(14.0, 8.0);
  gl_Position = vec4(sp.x / uRes.x * 2.0 - 1.0, 1.0 - sp.y / uRes.y * 2.0, 0.0, 1.0);
  gl_PointSize = uPointSize * uDpr * s;
  vZ = p.z / uRadius;
}`;

const ORBIT_FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uFront;   // 1 = draw z>0 only, 0 = z<0 only, 2 = all
uniform float uAlpha;
uniform vec3 uColor;
uniform float uIsPoint;
varying float vZ;
void main(){
  if (uFront < 1.5) {
    if (uFront > 0.5 && vZ < 0.0) discard;
    if (uFront < 0.5 && vZ >= 0.0) discard;
  }
  float a = uAlpha * mix(0.35, 1.0, smoothstep(-1.0, 1.0, vZ));
  if (uIsPoint > 0.5) {
    vec2 q = abs(gl_PointCoord - 0.5);
    float sq = step(max(q.x, q.y), 0.5);
    a *= sq;
  }
  gl_FragColor = vec4(uColor, a);
}`;

type Uniforms = Record<string, WebGLUniformLocation | null>;

function compile(gl: WebGLRenderingContext, vs: string, fs: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  const uniforms: Uniforms = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i)!;
    uniforms[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { program: p, uniforms };
}

// Deterministic PRNG so the composition is identical on every visit.
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RING_SEGMENTS = 240;
const RINGS = [
  // centre y as fraction of frame height, radius as fraction of frame width
  { cy: 0.58, r: 0.6, tilt: 0.2, roll: -0.07, speed: 0.06, alpha: 0.5, nodes: 7 },
  { cy: 0.42, r: 0.86, tilt: 0.3, roll: 0.1, speed: -0.035, alpha: 0.24, nodes: 5 },
];

export class HeroLayer {
  private gl: WebGLRenderingContext;
  private plate?: ReturnType<typeof compile>;
  private dust: ReturnType<typeof compile>;
  private orbit: ReturnType<typeof compile>;
  private quadBuf?: WebGLBuffer | null;
  private dustBuf: WebGLBuffer | null;
  private ringBuf: WebGLBuffer | null;
  private nodeBufs: { buf: WebGLBuffer | null; count: number }[] = [];
  private packetBuf: WebGLBuffer | null;
  private dustCount: number;
  private tex: WebGLTexture | null = null;
  private hasTex = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private kind: LayerKind,
    opts: { particles: number; plateUrl?: string; onTexture?: () => void },
  ) {
    const gl = canvas.getContext("webgl", {
      alpha: kind === "front",
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL unavailable");
    this.gl = gl;

    if (kind === "back") {
      this.plate = compile(gl, QUAD_VS, PLATE_FS);
      this.quadBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    }
    this.dust = compile(gl, DUST_VS, DUST_FS);
    this.orbit = compile(gl, ORBIT_VS, ORBIT_FS);

    // Dust: back layer gets the far field, front layer gets a few large bokeh motes.
    const rand = mulberry(kind === "back" ? 7 : 19);
    this.dustCount = opts.particles;
    const seeds = new Float32Array(this.dustCount * 4);
    for (let i = 0; i < this.dustCount; i++) {
      seeds[i * 4] = rand() * 2 - 1;
      seeds[i * 4 + 1] = rand() * 2 - 1;
      seeds[i * 4 + 2] = kind === "back" ? -rand() * 0.95 : 0.2 + rand() * 0.6;
      seeds[i * 4 + 3] = rand();
    }
    this.dustBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dustBuf);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);

    const ring = new Float32Array(RING_SEGMENTS + 1);
    for (let i = 0; i <= RING_SEGMENTS; i++) ring[i] = (i / RING_SEGMENTS) * Math.PI * 2;
    this.ringBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ringBuf);
    gl.bufferData(gl.ARRAY_BUFFER, ring, gl.STATIC_DRAW);

    const nrand = mulberry(3);
    for (const r of RINGS) {
      const nodes = new Float32Array(r.nodes);
      for (let i = 0; i < r.nodes; i++) nodes[i] = (i / r.nodes) * Math.PI * 2 + nrand() * 0.5;
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.STATIC_DRAW);
      this.nodeBufs.push({ buf, count: r.nodes });
    }
    this.packetBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.packetBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0]), gl.DYNAMIC_DRAW);

    if (kind === "back" && opts.plateUrl) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        this.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        this.hasTex = 1;
        opts.onTexture?.();
      };
      img.src = opts.plateUrl;
    }
  }

  resize(s: EngineState) {
    const w = Math.max(1, Math.round(s.width * s.dpr));
    const h = Math.max(1, Math.round(s.height * s.dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  render(s: EngineState) {
    const gl = this.gl;
    this.resize(s);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 1. Plate
    if (this.plate) {
      const { program, uniforms: u } = this.plate;
      gl.disable(gl.BLEND);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf!);
      const loc = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      if (this.tex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.uniform1i(u.uTex, 0);
      }
      gl.uniform2f(u.uRes, s.width, s.height);
      gl.uniform1f(u.uDpr, s.dpr);
      gl.uniform4f(u.uFrame, s.frame.x, s.frame.y, s.frame.w, s.frame.h);
      gl.uniform2f(u.uMouse, s.mouse[0], s.mouse[1]);
      gl.uniform2f(u.uCursor, s.cursor[0], s.cursor[1]);
      gl.uniform1f(u.uCursorActive, s.cursorActive);
      gl.uniform1f(u.uTime, s.time);
      gl.uniform1f(u.uReveal, s.reveal);
      gl.uniform1f(u.uScroll, s.scroll);
      gl.uniform1f(u.uBuild, s.build);
      gl.uniform1f(u.uHasTex, this.hasTex);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(loc);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // 2. Orbits
    {
      const { program, uniforms: u } = this.orbit;
      gl.useProgram(program);
      const loc = gl.getAttribLocation(program, "aT");
      gl.enableVertexAttribArray(loc);
      gl.uniform2f(u.uRes, s.width, s.height);
      gl.uniform1f(u.uDpr, s.dpr);
      gl.uniform2f(u.uMouse, s.mouse[0], s.mouse[1]);
      gl.uniform1f(u.uFront, this.kind === "front" ? 1 : this.frontless ? 2 : 0);
      const fade = s.reveal * (1 - s.scroll * 0.85);
      RINGS.forEach((r, i) => {
        const rot = s.time * r.speed + s.scroll * 1.2 * Math.sign(r.speed);
        gl.uniform2f(u.uCenter, s.frame.x + s.frame.w * 0.5, s.frame.y + s.frame.h * (r.cy - s.scroll * 0.08));
        gl.uniform1f(u.uRadius, s.frame.w * r.r * (1 + s.scroll * 0.35) * (0.86 + 0.14 * easeOut(s.reveal)));
        gl.uniform1f(u.uTilt, r.tilt + s.mouse[1] * 0.05);
        gl.uniform1f(u.uRoll, r.roll + s.mouse[0] * 0.03);
        gl.uniform1f(u.uRot, rot);

        // ring line
        gl.uniform1f(u.uIsPoint, 0);
        gl.uniform1f(u.uPointSize, 1);
        gl.uniform1f(u.uAlpha, r.alpha * fade);
        gl.uniform3f(u.uColor, 0.93, 0.9, 0.86);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.ringBuf);
        gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_STRIP, 0, RING_SEGMENTS + 1);

        // nodes
        gl.uniform1f(u.uIsPoint, 1);
        gl.uniform1f(u.uPointSize, 4);
        gl.uniform1f(u.uAlpha, 0.9 * fade);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nodeBufs[i].buf);
        gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, this.nodeBufs[i].count);

        // a data packet travelling the ring
        gl.uniform1f(u.uPointSize, 3);
        gl.uniform3f(u.uColor, 0.949, 0.647, 0.255);
        gl.uniform1f(u.uAlpha, fade);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.packetBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([s.time * (i ? -0.55 : 0.4) + i * 2.1]));
        gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, 1);
      });
      gl.disableVertexAttribArray(loc);
    }

    // 3. Dust
    {
      const { program, uniforms: u } = this.dust;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.dustBuf);
      const loc = gl.getAttribLocation(program, "aSeed");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
      gl.uniform2f(u.uRes, s.width, s.height);
      gl.uniform1f(u.uDpr, s.dpr);
      gl.uniform4f(u.uFrame, s.frame.x, s.frame.y, s.frame.w, s.frame.h);
      gl.uniform2f(u.uMouse, s.mouse[0], s.mouse[1]);
      gl.uniform2f(u.uCursor, s.cursor[0], s.cursor[1]);
      gl.uniform1f(u.uCursorActive, s.cursorActive);
      gl.uniform1f(u.uTime, s.time);
      gl.uniform1f(u.uScroll, s.scroll);
      gl.uniform1f(u.uReveal, s.reveal);
      gl.uniform1f(u.uFront, this.kind === "front" ? 1 : 0);
      gl.drawArrays(gl.POINTS, 0, this.dustCount);
      gl.disableVertexAttribArray(loc);
    }
  }

  /** When there is no front canvas, the back layer draws the full orbit. */
  frontless = false;

  dispose() {
    const gl = this.gl;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

export const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
