"use client";
/**
 * DATA FLOW SCENE
 * A meaningful 3D metaphor for medical coding, not decoration:
 *   left   — loose, unstructured clinical information (a drifting cloud)
 *   centre — the coding step (a precise ring that every point passes through)
 *   right  — standardised, ordered output (points snapped into code "lanes")
 * Kept deliberately light: one Points draw call + two line objects.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const LANES = 7;

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function Flow({ count, active }: { count: number; active: boolean }) {
  const points = useRef<THREE.Points>(null);
  const ring = useRef<THREE.Group>(null);
  const { pointer, camera } = useThree();

  const { positions, colors, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      seeds[i * 4] = hash(i + 1); // phase
      seeds[i * 4 + 1] = hash(i + 11.3); // y spread
      seeds[i * 4 + 2] = hash(i + 23.7); // z spread
      seeds[i * 4 + 3] = Math.floor(hash(i + 37.1) * LANES); // lane
    }
    return { positions, colors, seeds };
  }, [count]);

  const cNavy = useMemo(() => new THREE.Color("#163a6b"), []);
  const cCyan = useMemo(() => new THREE.Color("#12b5d4"), []);
  const cBlue = useMemo(() => new THREE.Color("#1f5fd1"), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const speed = active ? 0.045 : 0.012;
    const pos = positions;
    const col = colors;

    for (let i = 0; i < count; i++) {
      let t = seeds[i * 4] + time * speed;
      t -= Math.floor(t);
      const sy = seeds[i * 4 + 1] * 2 - 1;
      const sz = seeds[i * 4 + 2] * 2 - 1;
      const lane = seeds[i * 4 + 3];
      const laneY = (lane / (LANES - 1)) * 2.4 - 1.2;

      let x: number, y: number, z: number;
      if (t < 0.42) {
        // Unstructured clinical information: wide, drifting
        const k = t / 0.42;
        x = -6.2 + k * 4.4;
        const wob = Math.sin(time * 0.6 + i) * 0.25;
        y = sy * 2.1 * (1 - k * 0.35) + wob;
        z = sz * 1.6 * (1 - k * 0.3);
        tmp.copy(cNavy);
      } else if (t < 0.58) {
        // Funnel through the coding ring
        const k = smooth((t - 0.42) / 0.16);
        const a = seeds[i * 4] * Math.PI * 2 + time * 0.8;
        const r = 1.05 * (1 - k) + 0.15;
        x = -1.8 + k * 3.2;
        const from = sy * 2.1 * 0.65;
        y = THREE.MathUtils.lerp(from, Math.sin(a) * r, Math.min(1, k * 1.6));
        y = THREE.MathUtils.lerp(y, laneY, Math.max(0, k * 1.4 - 0.4));
        z = THREE.MathUtils.lerp(sz, Math.cos(a) * r, Math.min(1, k * 1.6)) * (1 - k * 0.8);
        tmp.copy(cNavy).lerp(cCyan, Math.min(1, k * 1.5));
      } else {
        // Structured output: ordered code lanes
        const k = (t - 0.58) / 0.42;
        x = 1.4 + k * 4.8;
        y = laneY;
        z = 0;
        tmp.copy(cCyan).lerp(cBlue, Math.min(1, k * 2));
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }

    const g = points.current?.geometry;
    if (g) {
      g.attributes.position.needsUpdate = true;
      g.attributes.color.needsUpdate = true;
    }
    if (ring.current) {
      ring.current.rotation.y = 1.18 + Math.sin(time * 0.35) * 0.08;
      ring.current.rotation.x = Math.sin(time * 0.25) * 0.06;
    }
    // Gentle pointer parallax
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.6, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2 + pointer.y * 0.4, 0.04);
    camera.lookAt(0, 0, 0);
  });

  const laneGeom = useMemo(() => {
    const pts: number[] = [];
    for (let l = 0; l < LANES; l++) {
      const y = (l / (LANES - 1)) * 2.4 - 1.2;
      pts.push(1.6, y, 0, 6.4, y, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  return (
    <>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.055} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} />
      </points>

      <group ref={ring} position={[0, 0, 0]} rotation={[0, 1.18, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[1.25, 0.008, 8, 160]} />
          <meshBasicMaterial color="#12b5d4" transparent opacity={0.9} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.48, 0.004, 8, 160]} />
          <meshBasicMaterial color="#1f5fd1" transparent opacity={0.35} />
        </mesh>
      </group>

      <lineSegments geometry={laneGeom}>
        <lineBasicMaterial color="#1f5fd1" transparent opacity={0.12} />
      </lineSegments>
    </>
  );
}

export default function DataFlowScene({ active = true, dense = true }: { active?: boolean; dense?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 7.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={active ? "always" : "demand"}
      aria-hidden="true"
    >
      <Flow count={dense ? 2200 : 900} active={active} />
    </Canvas>
  );
}
