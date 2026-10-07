"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Hero studio: a glossy showroom floor, overhead light strips, drifting dust
 * and a softly sweeping key light around the motorcycle.
 *
 * The motorcycle itself is supplied as an image (licensed photography with
 * transparent background, or the rasterised studio silhouette). It sits on a
 * plane so the floor genuinely reflects it and the camera parallax gives it
 * physical presence — controlled movement, never a spin.
 */
export default function ShowroomScene({
  imageSrc,
  pointer,
  active,
  onReady,
}: {
  /** Image URL / data URL for the bike (transparent background). */
  imageSrc: string;
  /** Normalised pointer (-1…1), written by the parent without re-rendering. */
  pointer: React.RefObject<{ x: number; y: number }>;
  /** Pause rendering when the hero is off-screen. */
  active: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.1, 7.4], fov: 32, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      aria-hidden
    >
      <color attach="background" args={["#0a0b0d"]} />
      <fog attach="fog" args={["#0a0b0d", 7, 17]} />
      <Rig pointer={pointer} />
      <ambientLight intensity={0.25} />
      <KeyLight pointer={pointer} />
      <LightStrips />
      <Bike imageSrc={imageSrc} pointer={pointer} onReady={onReady} />
      <Floor />
      <Sparkles count={70} scale={[9, 3.5, 4]} position={[0, 1.6, 0]} size={1.6} speed={0.18} opacity={0.35} color="#efece6" />
    </Canvas>
  );
}

function Rig({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0.15, 0.05, 0), []);
  useFrame((state, delta) => {
    const p = pointer.current ?? { x: 0, y: 0 };
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-delta * 2.2);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, p.x * 0.9 + Math.sin(t * 0.12) * 0.15, k);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.1 + p.y * 0.3, k);
    camera.lookAt(target);
  });
  return null;
}

function KeyLight({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const light = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const p = pointer.current ?? { x: 0, y: 0 };
    const t = state.clock.elapsedTime;
    if (light.current) {
      light.current.position.x = THREE.MathUtils.lerp(light.current.position.x, -2 + p.x * 3 + Math.sin(t * 0.25) * 0.6, 0.04);
      light.current.target.position.set(0, 0.8, 0);
      light.current.target.updateMatrixWorld();
    }
    if (rim.current) rim.current.intensity = 6 + Math.sin(t * 0.6) * 1.2;
  });
  return (
    <>
      <spotLight ref={light} position={[-2, 5, 4]} angle={0.5} penumbra={0.9} intensity={60} color="#fff4e6" distance={20} decay={1.6} />
      <pointLight ref={rim} position={[3.2, 2.2, -1.5]} color="#ffd9c2" distance={9} decay={1.4} />
      <pointLight position={[-3.5, 1.2, -1]} color="#9fb6d6" intensity={4} distance={8} decay={1.4} />
    </>
  );
}

/** Overhead studio light strips — they read beautifully in the reflective floor. */
function LightStrips() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 + Math.sin(t * 0.4 + i * 1.3) * 0.1;
    });
  });
  return (
    <group ref={group}>
      {[-2.6, 0, 2.6].map((x, i) => (
        <mesh key={i} position={[x, 4.2, -2.4 + i * 0.25]} rotation={[Math.PI / 2.2, 0, 0]}>
          <planeGeometry args={[1.9, 0.07]} />
          <meshBasicMaterial color="#f6f1e7" transparent opacity={0.6} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 2.4, -6]}>
        <planeGeometry args={[14, 0.02]} />
        <meshBasicMaterial color="#d8232f" transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Bike({
  imageSrc,
  pointer,
  onReady,
}: {
  imageSrc: string;
  pointer: React.RefObject<{ x: number; y: number }>;
  onReady?: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const aspect = 800 / 480;
  const width = 3.5;
  const height = width / aspect;
  // In the source frame the ground sits at 430/480 — align it with the floor.
  const groundOffset = height * (1 - 430 / 480);

  useEffect(() => {
    let disposed = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      canvas.width = 2000;
      canvas.height = 1200;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      setTexture(tex);
      requestAnimationFrame(() => onReady?.());
    };
    img.src = imageSrc;
    return () => {
      disposed = true;
    };
  }, [imageSrc, onReady]);

  useEffect(() => () => texture?.dispose(), [texture]);

  useFrame((state) => {
    if (!mesh.current) return;
    const p = pointer.current ?? { x: 0, y: 0 };
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, -p.x * 0.06 + Math.sin(t * 0.2) * 0.012, 0.05);
  });

  if (!texture) return null;
  return (
    <mesh ref={mesh} position={[0, height / 2 - groundOffset, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={texture}
        emissiveMap={texture}
        emissive="#ffffff"
        emissiveIntensity={0.55}
        transparent
        alphaTest={0.02}
        roughness={0.45}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial
        blur={[400, 120]}
        resolution={1024}
        mixBlur={1}
        mixStrength={18}
        roughness={0.9}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0d0e10"
        metalness={0.6}
        mirror={0.5}
      />
    </mesh>
  );
}
