'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  type InstancedMesh,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  ShaderMaterial,
  Vector3,
} from 'three';
import { SKILLS_REGIONS } from '@/components/skills/skillsSpatial';
import type { SkillsPointerState } from './skillsInteraction';

type Tree = {
  x: number;
  y: number;
  z: number;
  height: number;
  crown: number;
  rotation: number;
  tone: string;
};

type LandscapeInstance = {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  tone: string;
};

type Pond = {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: number;
};

const POND_VERTEX = /* glsl */ `
  uniform float uSkillsPondTime;
  varying vec2 vSkillsPondUv;

  void main() {
    vSkillsPondUv = uv;
    vec3 displaced = position;
    float waveA = sin(position.x * 3.7 + uSkillsPondTime * 0.32);
    float waveB = cos(position.y * 4.6 - uSkillsPondTime * 0.23);
    displaced.z += (waveA + waveB) * 0.008;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const POND_FRAGMENT = /* glsl */ `
  uniform float uSkillsPondTime;
  varying vec2 vSkillsPondUv;

  void main() {
    vec2 centered = (vSkillsPondUv - 0.5) * 2.0;
    float radius = length(centered);
    float edge = 1.0 - smoothstep(0.82, 1.0, radius);
    float ripple = sin(radius * 31.0 - uSkillsPondTime * 0.38 + centered.x * 4.0);
    float crossRipple = sin(centered.y * 17.0 + uSkillsPondTime * 0.21);
    float sheen = smoothstep(0.68, 0.98, ripple * 0.44 + crossRipple * 0.16 + 0.52);
    vec3 deepWater = vec3(0.025, 0.105, 0.145);
    vec3 reflectedSky = vec3(0.18, 0.34, 0.42);
    vec3 color = mix(deepWater, reflectedSky, 0.2 + sheen * 0.22);
    gl_FragColor = vec4(color, edge * 0.82);
  }
`;

function authoredTrees(portrait: boolean) {
  const patterns = [
    [
      [-6.4, 5.2, 4.8, 1.35],
      [7.2, -5.4, 5.7, 1.55],
      [-9.4, -9.2, 4.1, 1.1],
    ],
    [
      [6.7, 4.4, 4.3, 1.25],
      [-7.6, -4.8, 5.4, 1.5],
      [9.5, -10.5, 3.7, 1.05],
    ],
    [
      [-7.2, 4.8, 5.5, 1.5],
      [7.9, -5.6, 4.5, 1.25],
      [-10.2, -10, 4.2, 1.1],
    ],
    [
      [7.1, 4.2, 4.8, 1.35],
      [-8.4, -5.2, 5.8, 1.55],
      [10.4, -10.8, 3.8, 1.05],
    ],
    [
      [-6.8, 4.6, 4.4, 1.25],
      [8, -5.8, 5.2, 1.45],
      [-10.5, -10.2, 3.9, 1.05],
    ],
    [
      [7.3, 4.8, 4.1, 1.2],
      [-8.2, -5.1, 4.7, 1.3],
      [10.8, -10.7, 3.5, 1],
    ],
  ] as const;
  const trees: Tree[] = [];
  patterns.forEach((pattern, domain) => {
    const region = SKILLS_REGIONS[domain];
    const selection = portrait ? [pattern[domain % 2]] : pattern;
    selection.forEach(([dx, dz, height, crown], index) => {
      trees.push({
        x: region.x + dx,
        y: region.y - 0.52,
        z: region.z + dz,
        height,
        crown,
        rotation: domain * 0.71 + index * 1.13,
        tone: (domain + index) % 3 === 0 ? '#1d3427' : '#172b22',
      });
    });
    if (!portrait && domain % 2 === 0) {
      for (let index = 0; index < 2; index++) {
        const side = index ? -1 : 1;
        trees.push({
          x: region.x + side * (10.2 + domain * 0.18),
          y: region.y - 0.56,
          z: region.z - 2.5 - index * 6.4,
          height: 3.6 + ((domain + index) % 3) * 0.55,
          crown: 1.02 + index * 0.12,
          rotation: domain * 0.63 + index * 1.47,
          tone: index ? '#172b22' : '#1d3427',
        });
      }
    }
  });
  return trees;
}

function setInstances(mesh: InstancedMesh | null, instances: LandscapeInstance[]) {
  if (!mesh) return;
  const transform = new Object3D();
  const color = new Color();
  instances.forEach((instance, index) => {
    transform.position.set(...instance.position);
    transform.scale.set(...instance.scale);
    transform.rotation.set(...instance.rotation);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
    mesh.setColorAt(index, color.set(instance.tone));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}

export function SkillsLandscape({
  portrait,
  pointer,
  interactive,
  reducedMotion,
}: {
  portrait: boolean;
  pointer: SkillsPointerState;
  interactive: boolean;
  reducedMotion: boolean;
}) {
  const crownMesh = useRef<InstancedMesh>(null);
  const projection = useMemo(() => new Vector3(), []);
  const transform = useMemo(() => new Object3D(), []);
  const resources = useMemo(() => {
    const trees = authoredTrees(portrait);
    const trunks: LandscapeInstance[] = trees.map((tree) => ({
      position: [tree.x, tree.y + tree.height * 0.34, tree.z],
      scale: [0.16 + tree.crown * 0.025, tree.height * 0.68, 0.16 + tree.crown * 0.025],
      rotation: [0, tree.rotation, 0],
      tone: '#252019',
    }));
    const crowns: LandscapeInstance[] = trees.flatMap((tree, index) => [
      {
        position: [tree.x, tree.y + tree.height * 0.72, tree.z],
        scale: [tree.crown, tree.crown * 0.72, tree.crown * 0.92],
        rotation: [0.08, tree.rotation, index % 2 ? 0.1 : -0.08],
        tone: tree.tone,
      },
      {
        position: [
          tree.x + Math.sin(tree.rotation) * tree.crown * 0.34,
          tree.y + tree.height * 0.93,
          tree.z + Math.cos(tree.rotation) * tree.crown * 0.2,
        ],
        scale: [tree.crown * 0.74, tree.crown * 0.8, tree.crown * 0.7],
        rotation: [-0.08, tree.rotation + 0.8, index % 2 ? -0.12 : 0.1],
        tone: index % 4 === 0 ? '#223b2b' : tree.tone,
      },
    ]);
    const rocks: LandscapeInstance[] = SKILLS_REGIONS.flatMap((region, domain) => {
      const side = domain % 2 ? -1 : 1;
      const count = portrait ? (domain % 2 ? 0 : 1) : domain % 3 === 1 ? 0 : domain % 2 ? 1 : 3;
      return Array.from({ length: count }, (_, index) => ({
        position: [
          region.x + side * (5.1 + index * 1.45),
          region.y - 0.38 + (index % 2) * 0.08,
          region.z - 1.7 - index * 3.2,
        ] as [number, number, number],
        scale: [0.72 + index * 0.2, 0.36 + (index % 2) * 0.15, 0.9 + index * 0.28] as [
          number,
          number,
          number,
        ],
        rotation: [0, domain * 0.83 + index * 0.71, 0.08] as [number, number, number],
        tone: domain < 3 ? '#344039' : '#293631',
      }));
    });
    const hills: LandscapeInstance[] = SKILLS_REGIONS.flatMap((region, domain) => {
      const openness = domain === 5 ? 1.45 : 1;
      return [-1, 1].map((side, index) => ({
        position: [
          region.x + side * (portrait ? 8.5 : 12.5 + index * 1.5),
          region.y - 1.2,
          region.z - 5 - index * 5,
        ] as [number, number, number],
        scale: [4.8 * openness, 2.6 - domain * 0.12, 7.5 * openness] as [number, number, number],
        rotation: [0, domain * 0.42 + index, 0] as [number, number, number],
        tone: domain % 2 ? '#172a2d' : '#192d2f',
      }));
    });
    const grass: LandscapeInstance[] = SKILLS_REGIONS.flatMap((region, domain) =>
      [-1, 1].flatMap((side) =>
        Array.from(
          { length: portrait ? (domain % 2 ? 3 : 6) : domain % 2 ? 9 : 22 },
          (_, index) => {
            const seed = seededGrass(domain, side, index);
            const crossSeed = seededGrass(domain + 7, -side, index + 3);
            const height = 0.2 + seed * 0.34;
            const spread = portrait ? 2.5 : 5.2;
            const longitudinal =
              ((index + 0.5) / (portrait ? 6 : domain % 2 ? 9 : 22) - 0.5) * (portrait ? 13 : 19);
            return {
              position: [
                region.x + side * (3.25 + crossSeed * spread),
                region.y - 0.39 + height / 2 + Math.sin(index * 1.7 + domain) * 0.035,
                region.z + longitudinal + (seed - 0.5) * 2.2,
              ] as [number, number, number],
              scale: [0.035 + (index % 3) * 0.012, height, 0.032] as [number, number, number],
              rotation: [0, domain * 0.53 + index * 0.81, side * 0.08] as [number, number, number],
              tone: index % 3 === 0 ? '#344334' : '#263a2e',
            };
          },
        ),
      ),
    );
    const ponds = (
      [
        {
          position: [
            SKILLS_REGIONS[1].x - 7.2,
            SKILLS_REGIONS[1].y - 0.54,
            SKILLS_REGIONS[1].z - 3.8,
          ],
          scale: [3.2, 1.65, 1],
          rotation: 0.22,
        },
        {
          position: [
            SKILLS_REGIONS[4].x + 7.6,
            SKILLS_REGIONS[4].y - 0.54,
            SKILLS_REGIONS[4].z + 2.6,
          ],
          scale: [2.65, 1.4, 1],
          rotation: -0.34,
        },
      ] satisfies Pond[]
    ).filter((_, index) => !portrait || index === 0);
    return { trees, trunks, crowns, rocks, hills, grass, ponds };
  }, [portrait]);
  const treeMotion = useRef(resources.trees.map(() => ({ lift: 0, pitch: 0, roll: 0 })));
  useLayoutEffect(() => {
    treeMotion.current = resources.trees.map(() => ({ lift: 0, pitch: 0, roll: 0 }));
  }, [resources.trees]);

  const geometry = useMemo(
    () => ({
      trunk: new CylinderGeometry(1, 1.15, 1, 6),
      crown: new IcosahedronGeometry(1, 0),
      rock: new DodecahedronGeometry(1, 0),
      hill: new DodecahedronGeometry(1, 0),
      grass: new ConeGeometry(1, 1, 3),
      pond: new CircleGeometry(1, portrait ? 24 : 40),
    }),
    [portrait],
  );
  const grassTime = useMemo(() => ({ value: 0 }), []);
  const pondTime = useMemo(() => ({ value: 0 }), []);
  const materials = useMemo(() => {
    const grass = new MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.98,
      flatShading: true,
    });
    grass.onBeforeCompile = (shader) => {
      shader.uniforms.uSkillsGrassTime = grassTime;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        '#include <common>\nuniform float uSkillsGrassTime;',
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            vec3 transformed = vec3(position);
            #ifdef USE_INSTANCING
              float bladeWeight = smoothstep(-0.5, 0.5, position.y);
              float bladePhase = instanceMatrix[3].x * 0.47 + instanceMatrix[3].z * 0.31;
              transformed.x += sin(uSkillsGrassTime * 0.55 + bladePhase) * 0.11 * bladeWeight;
              transformed.z += cos(uSkillsGrassTime * 0.43 + bladePhase * 1.31) * 0.045 * bladeWeight;
            #endif
          `,
      );
    };
    grass.customProgramCacheKey = () => 'skills-grass-breeze-v1';
    return {
      trunk: new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.95,
        flatShading: true,
        emissive: '#110e0b',
        emissiveIntensity: 0.1,
      }),
      crown: new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.92,
        flatShading: true,
        emissive: '#07130f',
        emissiveIntensity: 0.14,
      }),
      rock: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.96, flatShading: true }),
      hill: new MeshStandardMaterial({ color: '#ffffff', roughness: 1, flatShading: true }),
      grass,
      pond: new ShaderMaterial({
        vertexShader: POND_VERTEX,
        fragmentShader: POND_FRAGMENT,
        uniforms: { uSkillsPondTime: pondTime },
        transparent: true,
        depthWrite: false,
      }),
    };
  }, [grassTime, pondTime]);

  useLayoutEffect(
    () => () => {
      Object.values(geometry).forEach((item) => {
        item.dispose();
      });
      Object.values(materials).forEach((item) => {
        item.dispose();
      });
    },
    [geometry, materials],
  );

  useFrame((state, delta) => {
    const time = reducedMotion ? 0 : state.clock.elapsedTime;
    grassTime.value = time;
    pondTime.value = time;
    const mesh = crownMesh.current;
    if (!mesh) return;
    const perRegion = portrait ? 1 : 3;
    let changed = false;
    resources.trees.forEach((tree, index) => {
      projection.set(tree.x, tree.y + tree.height * 0.8, tree.z).project(state.camera);
      const inFrame = projection.z > -1 && projection.z < 1;
      const dx = pointer.current.ndc.x - projection.x;
      const dy = pointer.current.ndc.y - projection.y;
      const proximity =
        index % perRegion === 0 && interactive && pointer.current.active && inFrame
          ? Math.max(0, 1 - Math.hypot(dx, dy) / 0.38)
          : 0;
      const motion = treeMotion.current[index];
      const ambient = reducedMotion ? 0 : Math.sin(time * 0.24 + index * 1.73) * 0.008;
      const nextPitch = MathUtils.damp(
        motion.pitch,
        ambient + Math.sign(dy) * proximity * 0.045,
        9,
        delta,
      );
      const nextRoll = MathUtils.damp(
        motion.roll,
        ambient * 0.72 - Math.sign(dx) * proximity * 0.055,
        9,
        delta,
      );
      const nextLift = MathUtils.damp(motion.lift, proximity * 0.018, 9, delta);
      changed ||=
        Math.abs(nextPitch - motion.pitch) > 0.00001 ||
        Math.abs(nextRoll - motion.roll) > 0.00001 ||
        Math.abs(nextLift - motion.lift) > 0.00001;
      motion.pitch = nextPitch;
      motion.roll = nextRoll;
      motion.lift = nextLift;

      transform.position.set(tree.x, tree.y + tree.height * 0.72 + motion.lift, tree.z);
      transform.scale.set(tree.crown, tree.crown * 0.72, tree.crown * 0.92);
      transform.rotation.set(
        0.08 + motion.pitch,
        tree.rotation,
        (index % 2 ? 0.1 : -0.08) + motion.roll,
      );
      transform.updateMatrix();
      mesh.setMatrixAt(index * 2, transform.matrix);

      transform.position.set(
        tree.x + Math.sin(tree.rotation) * tree.crown * 0.34,
        tree.y + tree.height * 0.93 + motion.lift,
        tree.z + Math.cos(tree.rotation) * tree.crown * 0.2,
      );
      transform.scale.set(tree.crown * 0.74, tree.crown * 0.8, tree.crown * 0.7);
      transform.rotation.set(
        -0.08 + motion.pitch * 0.8,
        tree.rotation + 0.8,
        (index % 2 ? -0.12 : 0.1) + motion.roll * 0.8,
      );
      transform.updateMatrix();
      mesh.setMatrixAt(index * 2 + 1, transform.matrix);
    });
    if (changed) mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="skills-roadside-landscape">
      <instancedMesh
        name="skills-tree-trunks"
        ref={(mesh) => setInstances(mesh, resources.trunks)}
        args={[geometry.trunk, materials.trunk, resources.trunks.length]}
        castShadow={!portrait}
        receiveShadow
      />
      <instancedMesh
        name="skills-tree-crowns"
        ref={(mesh) => {
          crownMesh.current = mesh;
          setInstances(mesh, resources.crowns);
        }}
        args={[geometry.crown, materials.crown, resources.crowns.length]}
        castShadow={!portrait}
        receiveShadow
      />
      <instancedMesh
        name="skills-landscape-rocks"
        ref={(mesh) => setInstances(mesh, resources.rocks)}
        args={[geometry.rock, materials.rock, resources.rocks.length]}
        receiveShadow
      />
      <instancedMesh
        name="skills-landscape-hills"
        ref={(mesh) => setInstances(mesh, resources.hills)}
        args={[geometry.hill, materials.hill, resources.hills.length]}
        receiveShadow
      />
      <instancedMesh
        name="skills-roadside-grass"
        ref={(mesh) => setInstances(mesh, resources.grass)}
        args={[geometry.grass, materials.grass, resources.grass.length]}
        receiveShadow
      />
      {resources.ponds.map((pond, index) => (
        <mesh
          key={`skills-pond-${pond.position[2]}`}
          name={`skills-pond-${index}`}
          geometry={geometry.pond}
          material={materials.pond}
          position={pond.position}
          rotation={[-Math.PI / 2, 0, pond.rotation]}
          scale={pond.scale}
          renderOrder={2}
        />
      ))}
    </group>
  );
}

function seededGrass(domain: number, side: number, index: number) {
  return Math.abs(Math.sin(domain * 17.13 + side * 5.71 + index * 13.37));
}
