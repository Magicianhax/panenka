"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, SMAA } from "@react-three/postprocessing";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { SoccerBall } from "./SoccerBall";

const R = 1.6;

/** Floating, slowly-spinning realistic football. */
function HeroBall() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.28;
    group.current.rotation.x += dt * 0.05;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.9}>
      <group ref={group}>
        <SoccerBall radius={R} segments={128} />
      </group>
    </Float>
  );
}

function Orbiters() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.22;
  });
  const items = [
    { r: 3.3, y: 0.6, s: 0.14, a: 0 },
    { r: 3.7, y: -0.9, s: 0.11, a: 2.1 },
    { r: 2.9, y: 1.5, s: 0.09, a: 4.2 },
  ];
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <mesh key={i} position={[Math.cos(it.a) * it.r, it.y, Math.sin(it.a) * it.r]}>
          <sphereGeometry args={[it.s, 16, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#f59e0b" : "#6366f1"}
            emissive={i % 2 === 0 ? "#f59e0b" : "#6366f1"}
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function ParallaxRig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.35, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.22, 0.05);
  });
  return <group ref={group}>{children}</group>;
}

export default function FootballHero() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      className="!absolute inset-0"
    >
      {/* key + fill so the white leather reads bright and rounded */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 7, 5]} intensity={2.6} color="#ffffff" castShadow />
      <directionalLight position={[-5, 2, -3]} intensity={0.7} color="#c7d2ff" />
      <pointLight position={[-6, -2, -4]} intensity={12} color="#6366f1" />
      <pointLight position={[6, 3, 2]} intensity={8} color="#f2a93b" />

      {/* in-scene studio reflections — no external HDRI download */}
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 4, -3]} scale={[10, 10, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-5, 1, 2]} scale={[6, 6, 1]} color="#cdd6ff" />
        <Lightformer intensity={1.0} position={[5, -2, 1]} scale={[6, 6, 1]} color="#ffe4b5" />
      </Environment>

      <ParallaxRig>
        <HeroBall />
        <Orbiters />
      </ParallaxRig>

      <Sparkles count={50} scale={12} size={2.2} speed={0.3} color="#fcd34d" opacity={0.5} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.7} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur radius={0.8} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
