"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * The 32 panel centers of a truncated icosahedron (a real football):
 *  - 12 icosahedron vertices  → pentagon panels (black)
 *  - 20 icosahedron face mids  → hexagon panels (white)
 * A spherical Voronoi over these seeds reproduces the exact panel layout,
 * with seams where the two nearest seeds tie. Computed once.
 */
function buildSeeds(): THREE.Vector3[] {
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const pos = ico.attributes.position;
  const verts: THREE.Vector3[] = [];
  const seen = new Set<string>();
  const faceCenters: THREE.Vector3[] = [];
  const tris = pos.count / 3;
  for (let f = 0; f < tris; f++) {
    const a = new THREE.Vector3().fromBufferAttribute(pos, f * 3);
    const b = new THREE.Vector3().fromBufferAttribute(pos, f * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(pos, f * 3 + 2);
    faceCenters.push(a.clone().add(b).add(c).normalize());
    for (const v of [a, b, c]) {
      const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
      if (!seen.has(key)) {
        seen.add(key);
        verts.push(v.clone().normalize());
      }
    }
  }
  ico.dispose();
  return [...verts, ...faceCenters]; // 12 pentagons first, then 20 hexagons
}

export function makeBallMaterial(): THREE.MeshPhysicalMaterial {
  const seeds = buildSeeds();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.02,
    clearcoat: 0.55,
    clearcoatRoughness: 0.32,
    sheen: 0.3,
    sheenColor: new THREE.Color(0xffffff),
    envMapIntensity: 1.0,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSeeds = { value: seeds };

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vBallPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n  vBallPos = position;");

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vBallPos;\nuniform vec3 uSeeds[32];"
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `
        #include <color_fragment>
        {
          vec3 bdir = normalize(vBallPos);
          float best = -2.0;
          float second = -2.0;
          int bi = 0;
          for (int i = 0; i < 32; i++) {
            float d = dot(bdir, uSeeds[i]);
            if (d > best) { second = best; best = d; bi = i; }
            else if (d > second) { second = d; }
          }
          // seam: thin dark line where the two nearest panels tie
          float edge = smoothstep(0.0, 0.05, best - second);
          vec3 panel = (bi < 12) ? vec3(0.02) : vec3(0.94);
          vec3 seam = vec3(0.015);
          diffuseColor.rgb = mix(seam, panel, edge);
        }
      `
      );
  };
  mat.customProgramCacheKey = () => "xcup-soccerball-v1";
  return mat;
}

/** Realistic football mesh. Parent controls transform (spin / flight). */
export function SoccerBall({ radius = 0.3, segments = 96 }: { radius?: number; segments?: number }) {
  const material = useMemo(() => makeBallMaterial(), []);
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[radius, segments, segments]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
