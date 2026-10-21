'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  CylinderGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  type InstancedMesh,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
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
        tone: (domain + index) % 3 === 0 ? '#15231a' : '#101c17',
      });
    });
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
}: {
  portrait: boolean;
  pointer: SkillsPointerState;
  interactive: boolean;
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
        tone: index % 4 === 0 ? '#1a291e' : tree.tone,
      },
    ]);
    const rocks: LandscapeInstance[] = SKILLS_REGIONS.flatMap((region, domain) => {
      const side = domain % 2 ? -1 : 1;
      return portrait && domain % 2
        ? []
        : [
            {
              position: [region.x + side * 5.1, region.y - 0.35, region.z - 1.7] as [
                number,
                number,
                number,
              ],
              scale: [1.15, 0.55, 1.5] as [number, number, number],
              rotation: [0, domain * 0.83, 0.08] as [number, number, number],
              tone: domain < 3 ? '#263029' : '#202923',
            },
          ];
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
        tone: domain % 2 ? '#0e1a1a' : '#101b1b',
      }));
    });
    return { trees, trunks, crowns, rocks, hills };
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
    }),
    [],
  );
  const materials = useMemo(
    () => ({
      trunk: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, flatShading: true }),
      crown: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, flatShading: true }),
      rock: new MeshStandardMaterial({ color: '#ffffff', roughness: 0.96, flatShading: true }),
      hill: new MeshStandardMaterial({ color: '#ffffff', roughness: 1, flatShading: true }),
    }),
    [],
  );

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
    const mesh = crownMesh.current;
    if (!mesh) return;
    const perRegion = portrait ? 1 : 3;
    let changed = false;
    resources.trees.forEach((tree, index) => {
      if (index % perRegion !== 0) return;
      projection.set(tree.x, tree.y + tree.height * 0.8, tree.z).project(state.camera);
      const inFrame = projection.z > -1 && projection.z < 1;
      const dx = pointer.current.ndc.x - projection.x;
      const dy = pointer.current.ndc.y - projection.y;
      const proximity =
        interactive && pointer.current.active && inFrame
          ? Math.max(0, 1 - Math.hypot(dx, dy) / 0.38)
          : 0;
      const motion = treeMotion.current[index];
      const nextPitch = MathUtils.damp(motion.pitch, Math.sign(dy) * proximity * 0.045, 9, delta);
      const nextRoll = MathUtils.damp(motion.roll, -Math.sign(dx) * proximity * 0.055, 9, delta);
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
    if (changed) {
      mesh.instanceMatrix.needsUpdate = true;
      state.invalidate();
    }
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
    </group>
  );
}
