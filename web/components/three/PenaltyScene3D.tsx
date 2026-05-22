"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { SoccerBall } from "./SoccerBall";

const KEEPER_URL = "/models/keeper.glb";
// model: ~2u tall, centred at origin (feet ≈ y -1.0). Stand feet on the line.
const KEEPER_FACE_ROT = 0; // faces the shooter (toward camera)

function ModelKeeper({ diveDir, progressRef }: { diveDir: number | null; progressRef: React.MutableRefObject<number> }) {
  const pivot = useRef<THREE.Group>(null);
  const { scene } = useGLTF(KEEPER_URL);

  // Use the scene directly (single instance) — cloning would detach the skinned mesh
  // from its skeleton. Collect bones + capture their rest-pose quaternions once.
  const { bones, base } = useMemo(() => {
    const bones: Record<string, THREE.Bone> = {};
    const base: Record<string, THREE.Quaternion> = {};
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; }
      const b = o as THREE.Bone;
      if (b.isBone) { bones[b.name] = b; base[b.name] = b.quaternion.clone(); }
    });
    return { bones, base };
  }, [scene]);

  const tmpE = useMemo(() => new THREE.Euler(), []);
  const tmpQ = useMemo(() => new THREE.Quaternion(), []);
  // behaviour state: drift between shuffling and standing
  const sm = useRef({ shuffle: 1, shuffleTarget: 1, nextSwitch: 0 });

  useFrame((state) => {
    if (!pivot.current) return;
    const t = state.clock.elapsedTime;
    const targetX = dirX(diveDir);
    const diveAmt = Math.min(1, Math.max(0, (progressRef.current - 0.3) / 0.7));
    const idle = 1 - diveAmt;
    const side = Math.sign(targetX); // -1 left, +1 right, 0 centre

    // ---- behaviour: randomly drift between shuffling and standing; clap at random ----
    const s = sm.current;
    if (t > s.nextSwitch) {
      s.shuffleTarget = Math.random() < 0.55 ? 1 : 0; // shuffle around, or settle and stand still
      s.nextSwitch = t + 2.5 + Math.random() * 4;
    }
    s.shuffle += (s.shuffleTarget - s.shuffle) * 0.08;   // snappy transition (no slow-mo dwell)
    const shuf = s.shuffle * idle;

    // organic, non-repeating wobble (sum of incommensurate sines)
    const organic = Math.sin(t * 0.9) * 0.6 + Math.sin(t * 0.41) * 0.3 + Math.sin(t * 0.17) * 0.2;

    // side-shuffle footwork, scaled by how much he's shuffling right now
    const W = 1.05;
    const bodyX = Math.sin(t * W) * 0.5 * shuf;
    const liftL = Math.max(0, Math.sin(t * W * 2)) * 0.5 * shuf;
    const liftR = Math.max(0, -Math.sin(t * W * 2)) * 0.5 * shuf;
    const widen = (0.5 - 0.5 * Math.cos(t * W * 2)) * 0.18 * shuf;
    const breath = Math.sin(t * 1.8) * idle;
    const lean = (0.16 + organic * 0.02) * idle; // forward ready-lean, subtly varying

    pivot.current.position.x = THREE.MathUtils.lerp(pivot.current.position.x, targetX * diveAmt + bodyX, 0.25);
    pivot.current.position.y = THREE.MathUtils.lerp(pivot.current.position.y, 0, 0.2);
    pivot.current.rotation.z = THREE.MathUtils.lerp(pivot.current.rotation.z, -side * 0.95 * diveAmt, 0.22);

    // pose a bone = its rest quaternion * a small local offset
    const setBone = (name: string, ex: number, ey: number, ez: number) => {
      const b = bones[name];
      const q = base[name];
      if (!b || !q) return;
      tmpE.set(ex, ey, ez);
      tmpQ.setFromEuler(tmpE);
      b.quaternion.copy(q).multiply(tmpQ);
    };

    // spine: lean + breathing + organic sway; head scans around naturally
    setBone("Spine", lean + breath * 0.025, 0, organic * 0.05 * idle);
    setBone("Spine01", lean * 0.5, 0, organic * 0.03 * idle);
    setBone("neck", -lean * 0.6, organic * 0.12 * idle, 0);
    setBone("Head", -lean * 0.3, Math.sin(t * 0.5) * 0.06 * idle, 0);

    // arms: pull DOWN to the sides. NOTE this rig: LeftArm +Z = down, RightArm −Z = down
    // (the inverse raises them overhead). Dive spreads them up/out (opposite sign).
    const armDown = 1.4 * idle;          // lower arms from the T-pose to the sides
    const armFwd = -0.3 * idle;          // forward (−X) so they're not tilted behind him
    const armBob = Math.sin(t * W * 2) * 0.1 * shuf;
    const spread = diveAmt * 1.0;
    const lead = side * diveAmt * 0.5;
    setBone("LeftArm", armFwd, 0, armDown + armBob - spread + lead);
    setBone("RightArm", armFwd, 0, -armDown - armBob + spread + lead);
    const elbow = 0.35 * idle + (0.5 + 0.5 * Math.sin(t * W * 2)) * 0.1 * shuf + 0.45 * diveAmt;
    setBone("LeftForeArm", elbow, 0, 0);
    setBone("RightForeArm", elbow, 0, 0);

    // legs: alternate foot lift + stance widen for the shuffle; tuck/push on the dive
    setBone("LeftUpLeg", -liftL - 0.3 * diveAmt, 0, widen);
    setBone("RightUpLeg", -liftR - 0.3 * diveAmt, 0, -widen);
    setBone("LeftLeg", liftL * 1.6 + 0.35 * diveAmt, 0, 0);
    setBone("RightLeg", liftR * 1.6 + 0.35 * diveAmt, 0, 0);
  });
  return (
    <group position={[0, 0, GOAL_Z + 0.55]}>
      <group ref={pivot}>
        {/* rigged model's origin is at the feet (local y 0..1.7), so no vertical lift */}
        <group position={[0, 0, 0]} rotation={[0, KEEPER_FACE_ROT, 0]} scale={1.47}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}
useGLTF.preload(KEEPER_URL);

const dirX = (d: number | null) => (d === 0 ? -1.8 : d === 2 ? 1.8 : 0);
const GOAL_Z = -3;
const SPOT_Z = 2.6;
const BALL_START = new THREE.Vector3(0, 0.32, SPOT_Z);
const LINE_Y = 0.02;
const LINE = "#eef3ec";

/** Mowed-stripe grass texture with per-pixel speckle for a natural finish. */
function useGrassTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 1024;
    const g = c.getContext("2d")!;
    const bands = 10;
    const bh = c.height / bands;
    for (let i = 0; i < bands; i++) {
      g.fillStyle = i % 2 === 0 ? "#2f7d36" : "#2a7331";
      g.fillRect(0, i * bh, c.width, bh + 1);
    }
    // grass speckle
    const img = g.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    for (let p = 0; p < d.length; p += 4) {
      const n = (Math.random() - 0.5) * 22;
      d[p] = Math.max(0, Math.min(255, d[p] + n * 0.4));
      d[p + 1] = Math.max(0, Math.min(255, d[p + 1] + n));
      d[p + 2] = Math.max(0, Math.min(255, d[p + 2] + n * 0.4));
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    tex.anisotropy = 16;
    return tex;
  }, []);
}

/** Realistic distant crowd: spaced rows of seated spectators (head + torso) with empty seats. */
function useCrowdTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0a0f1e";
    g.fillRect(0, 0, c.width, c.height);

    const shirt = ["#34507a", "#7a3440", "#3a6a45", "#6b6f86", "#857449", "#2f3e5e", "#8d92a8", "#5a4a6a", "#3b6b78", "#7a5a30"];
    const skin = ["#caa07e", "#a87c5a", "#e0b896", "#8a6244", "#d8a378"];
    const stepX = 17;
    const stepY = 20;
    let row = 0;
    for (let y = 14; y < c.height; y += stepY, row++) {
      const offset = row % 2 ? stepX / 2 : 0;
      for (let x = 10 + offset; x < c.width; x += stepX) {
        if (Math.random() < 0.42) continue;
        const jx = x + (Math.random() * 4 - 2);
        const jy = y + (Math.random() * 3 - 1.5);
        g.globalAlpha = 0.62 + Math.random() * 0.3;
        g.fillStyle = shirt[(Math.random() * shirt.length) | 0];
        g.fillRect(jx - 3, jy, 6, 9);
        g.fillStyle = skin[(Math.random() * skin.length) | 0];
        g.beginPath();
        g.arc(jx, jy - 2.5, 2.6, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.globalAlpha = 1;
    const grad = g.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, "rgba(5,8,18,0.75)");
    grad.addColorStop(0.5, "rgba(5,8,18,0.2)");
    grad.addColorStop(1, "rgba(5,8,18,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1.5);
    tex.anisotropy = 8;
    return tex;
  }, []);
}

/** LED perimeter advertising board texture. */
function useAdTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#06101f";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#00E5FF";
    g.fillRect(0, 6, c.width, 4);
    g.fillStyle = "#FFC940";
    g.fillRect(0, c.height - 10, c.width, 4);
    g.font = "bold 58px 'Chakra Petch', sans-serif";
    g.textBaseline = "middle";
    const segs = ["X·CUP", "X LAYER", "WORLD CUP 2026", "WINNER TAKES POT"];
    const segCols = ["#FFC940", "#00E5FF", "#FFFFFF", "#FF1F8B"];
    let x = 20;
    let i = 0;
    while (x < c.width) {
      const s = segs[i % segs.length];
      g.fillStyle = segCols[i % segCols.length];
      g.fillText(s, x, c.height / 2);
      x += g.measureText(s).width + 60;
      i++;
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
    tex.anisotropy = 8;
    return tex;
  }, []);
}

function Stadium() {
  const crowd = useCrowdTexture();
  const ad = useAdTexture();
  // scroll the LED boards (reverse direction) like a real digital hoarding
  useFrame((_, dt) => {
    ad.offset.x = (ad.offset.x - dt * 0.06 + 1) % 1;
  });
  // shared perimeter for BOTH the LED boards and the crowd walls, so edges line up.
  const HALF = 8;
  const BACK_Z = GOAL_Z - 2;
  const FRONT_Z = GOAL_Z + 9;
  const sideLen = FRONT_Z - BACK_Z;
  const sideMidZ = (BACK_Z + FRONT_Z) / 2;
  const BOARD_Y = 0.55;
  const STAND_Y = 6.5;
  const STAND_H = 15;
  const crowdMat = (
    <meshStandardMaterial map={crowd} emissiveMap={crowd} emissive="#2a3358" emissiveIntensity={0.09} roughness={1} />
  );
  return (
    <group>
      {/* ---- crowd walls: vertical, directly behind each board, corners meet ---- */}
      {/* back stand (slightly behind back board, edges past ±HALF to overlap sides) */}
      <mesh position={[0, STAND_Y, BACK_Z - 0.4]}>
        <planeGeometry args={[HALF * 2 + 1.2, STAND_H]} />
        {crowdMat}
      </mesh>
      {/* left side wall — same x as left board, same z extent */}
      <mesh position={[-(HALF + 0.4), STAND_Y, sideMidZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[sideLen + 1.2, STAND_H]} />
        {crowdMat}
      </mesh>
      {/* right side wall */}
      <mesh position={[HALF + 0.4, STAND_Y, sideMidZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[sideLen + 1.2, STAND_H]} />
        {crowdMat}
      </mesh>

      {/* ---- LED board perimeter: same HALF / BACK_Z / FRONT_Z ---- */}
      <mesh position={[0, BOARD_Y, BACK_Z]}>
        <planeGeometry args={[HALF * 2, 1.1]} />
        <meshBasicMaterial map={ad} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-HALF, BOARD_Y, sideMidZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[sideLen, 1.1]} />
        <meshBasicMaterial map={ad} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[HALF, BOARD_Y, sideMidZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[sideLen, 1.1]} />
        <meshBasicMaterial map={ad} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* camera flashes in the crowd (subtle) */}
      <Sparkles count={36} scale={[34, 9, 14]} position={[0, 7, BACK_Z - 1]} size={2.4} speed={0.5} color="#ffffff" opacity={0.5} />
    </group>
  );
}

function Pitch() {
  const grass = useGrassTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial map={grass} roughness={0.95} metalness={0} />
    </mesh>
  );
}

function L({ w, d, x, z }: { w: number; d: number; x: number; z: number }) {
  return (
    <mesh position={[x, LINE_Y, z]}>
      <boxGeometry args={[w, 0.03, d]} />
      <meshStandardMaterial color={LINE} roughness={0.6} emissive={LINE} emissiveIntensity={0.12} />
    </mesh>
  );
}

function Markings() {
  const PA_X = 5.5; // penalty area half-width
  const PA_FRONT = 4.4; // penalty area front (z)
  const GA_X = 2.9; // goal area half-width
  const GA_FRONT = -1.2;
  const t = 0.07; // line thickness
  return (
    <group>
      {/* goal line + side lines */}
      <L w={17} d={t} x={0} z={GOAL_Z} />
      <L w={t} d={28} x={-8.4} z={GOAL_Z + 14} />
      <L w={t} d={28} x={8.4} z={GOAL_Z + 14} />
      {/* penalty area */}
      <L w={PA_X * 2} d={t} x={0} z={PA_FRONT} />
      <L w={t} d={PA_FRONT - GOAL_Z} x={-PA_X} z={(PA_FRONT + GOAL_Z) / 2} />
      <L w={t} d={PA_FRONT - GOAL_Z} x={PA_X} z={(PA_FRONT + GOAL_Z) / 2} />
      {/* goal area */}
      <L w={GA_X * 2} d={t} x={0} z={GA_FRONT} />
      <L w={t} d={GA_FRONT - GOAL_Z} x={-GA_X} z={(GA_FRONT + GOAL_Z) / 2} />
      <L w={t} d={GA_FRONT - GOAL_Z} x={GA_X} z={(GA_FRONT + GOAL_Z) / 2} />
      {/* penalty spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LINE_Y, SPOT_Z]}>
        <circleGeometry args={[0.1, 24]} />
        <meshStandardMaterial color={LINE} emissive={LINE} emissiveIntensity={0.2} />
      </mesh>
      {/* penalty arc (the D) — front portion only */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LINE_Y, SPOT_Z]}>
        <ringGeometry args={[2.0, 2.07, 48, 1, Math.PI * 1.18, Math.PI * 0.64]} />
        <meshStandardMaterial color={LINE} emissive={LINE} emissiveIntensity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

const GOAL_URL = "/models/goal.glb";
// model normalized ~1.9 wide; scale to span the ~5.8u goal mouth. Tweakables:
const GOAL_SCALE = 3.05;
const GOAL_Y = 1.8; // lifts feet of frame to pitch
const GOAL_Z_OFF = -1.0; // relative to GOAL_Z; net extends back
const GOAL_FACE_ROT = 0; // flip to Math.PI if the opening faces away

function ModelGoal() {
  const { scene } = useGLTF(GOAL_URL, true);
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);
  return (
    <group position={[0, GOAL_Y, GOAL_Z + GOAL_Z_OFF]} rotation={[0, GOAL_FACE_ROT, 0]} scale={GOAL_SCALE}>
      <primitive object={model} />
    </group>
  );
}
useGLTF.preload(GOAL_URL, true);

function CodeGoal() {
  const mat = <meshStandardMaterial color="#f6f8ff" roughness={0.5} metalness={0.1} />;
  return (
    <group>
      <mesh position={[-2.9, 1.6, GOAL_Z]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 3.2, 16]} />
        {mat}
      </mesh>
      <mesh position={[2.9, 1.6, GOAL_Z]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 3.2, 16]} />
        <meshStandardMaterial color="#f6f8ff" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 3.2, GOAL_Z]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 5.96, 16]} />
        <meshStandardMaterial color="#f6f8ff" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.6, GOAL_Z - 0.12]}>
        <planeGeometry args={[5.8, 3.2, 22, 13]} />
        <meshBasicMaterial color="#cfe0e8" wireframe transparent opacity={0.22} />
      </mesh>
      {/* angled side net */}
      <mesh position={[0, 1.6, GOAL_Z - 0.55]}>
        <planeGeometry args={[5.8, 3.2, 22, 13]} />
        <meshBasicMaterial color="#9fb4bd" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function Ball({ shootDir, diveDir, animate, progressRef }: { shootDir: number | null; diveDir: number | null; animate: boolean; progressRef: React.MutableRefObject<number> }) {
  const fly = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const r = 0.3;
  const saved = shootDir !== null && diveDir !== null && shootDir === diveDir;

  useFrame((_, dt) => {
    if (!fly.current || !spin.current) return;
    if (animate && shootDir !== null) progressRef.current = Math.min(1, progressRef.current + dt / 0.9);
    else progressRef.current = 0;
    const p = progressRef.current;
    const targetX = dirX(shootDir);
    const endZ = saved ? GOAL_Z + 0.4 : GOAL_Z - 0.2;
    const end = new THREE.Vector3(targetX, saved ? 1.0 : 1.2, endZ);
    const pos = BALL_START.clone().lerp(end, p);
    pos.y += Math.sin(p * Math.PI) * 1.4;
    fly.current.position.copy(pos);
    fly.current.scale.setScalar(1 - p * 0.2);
    // spin only while the ball is actually in flight; sit still on the spot otherwise
    if (animate) {
      spin.current.rotation.x -= dt * 10;
      spin.current.rotation.y -= dt * 2.2;
    }
  });

  return (
    <group ref={fly} position={BALL_START.toArray()}>
      <group ref={spin}>
        <SoccerBall radius={r} segments={72} />
      </group>
    </group>
  );
}


/** Glowing aim arrow from the ball to the chosen shoot zone (commit-phase preview). */
function AimArrow({ shoot }: { shoot: number }) {
  const { from, quat, shaftLen } = useMemo(() => {
    const from = new THREE.Vector3(0, 0.5, SPOT_Z - 0.1);
    const to = new THREE.Vector3(dirX(shoot), 1.3, GOAL_Z + 0.6);
    const dir = to.clone().sub(from);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { from, quat, shaftLen: len - 0.5 };
  }, [shoot]);
  const C = "#FF2B3D"; // red aim line
  return (
    <group position={[from.x, from.y, from.z]} quaternion={quat}>
      <mesh position={[0, shaftLen / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, shaftLen, 14]} />
        <meshBasicMaterial color={C} transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, shaftLen + 0.24, 0]}>
        <coneGeometry args={[0.17, 0.48, 18]} />
        <meshBasicMaterial color={C} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export default function PenaltyScene3D({
  shootDir,
  diveDir,
  animate = false,
  aimShoot = null,
}: {
  shootDir: number | null;
  diveDir: number | null;
  animate?: boolean;
  aimShoot?: number | null;
}) {
  const progressRef = useRef(0);
  return (
    <Canvas shadows camera={{ position: [0, 2.7, 7.2], fov: 46 }} dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <color attach="background" args={["#060a16"]} />
      <fog attach="fog" args={["#060a16", 12, 30]} />

      <ambientLight intensity={0.5} color="#dfeaff" />
      {/* main floodlight */}
      <spotLight position={[0, 13, 5]} angle={0.7} penumbra={0.5} intensity={160} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002} />
      <directionalLight position={[5, 9, 3]} intensity={1.1} color="#fff6e8" />
      <directionalLight position={[-5, 6, 2]} intensity={0.5} color="#cfe2ff" />
      {/* subtle stadium rim accents */}
      <pointLight position={[-8, 3, -2]} intensity={22} color="#00E5FF" />
      <pointLight position={[8, 3, 0]} intensity={16} color="#FF1F8B" />

      {/* in-scene reflections for the ball's clearcoat (no network HDRI) */}
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 6, 2]} scale={[12, 12, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-6, 2, 3]} scale={[6, 6, 1]} color="#bfe6ff" />
        <Lightformer intensity={0.8} position={[6, 1, -2]} scale={[6, 6, 1]} color="#ffd9a8" />
      </Environment>

      <Stadium />
      <Pitch />
      <Markings />
      <Suspense fallback={<CodeGoal />}>
        <ModelGoal />
      </Suspense>
      <Suspense fallback={null}>
        <ModelKeeper diveDir={diveDir} progressRef={progressRef} />
      </Suspense>
      <Ball shootDir={shootDir} diveDir={diveDir} animate={animate} progressRef={progressRef} />
      {aimShoot !== null && !animate && <AimArrow shoot={aimShoot} />}

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.55} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.78} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
