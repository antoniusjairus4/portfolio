'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { getSkillRecognition } from '@/components/skills/skillsChoreography';
import { skillAnchor } from '@/components/skills/skillsSpatial';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { useSkillsMaterials } from './SkillsMaterials';
import { type Member, Members, member, type Point, rail } from './SkillsStructure';
import { createSkillsRibbon } from './skillsRibbon';

const IVORY = '#F2E8D5';
const RECESS = '#1c292e';
const METAL = '#6e7a79';

function toolStructures(portrait: boolean) {
  const pieces: Member[] = [];
  const anchors = Array.from({ length: 5 }, (_, i) => skillAnchor(4, i, portrait));
  const side = portrait ? 5.5 : 7.8;
  const add = (p: Point, s: Point, tone = IVORY) => pieces.push(member(p, s, tone));
  const link = (a: Point, b: Point, width = 0.22, tone = IVORY) =>
    pieces.push(rail(a, b, width, tone));
  const frame = (x: number, y: number, z: number, w: number, h: number, depth = 0.5) => {
    add([x - w / 2, y, z], [0.32, h, depth]);
    add([x + w / 2, y, z], [0.32, h, depth]);
    add([x, y + h / 2, z], [w, 0.32, depth]);
    // An open bottom keeps these structures from reading as browser windows.
  };

  // Git: one deep fork cut through a structural fin; its two arms rejoin above
  // the route. This is load-bearing silhouette, not a graph pasted on a wall.
  const gitZ = anchors[0][2] - 1.3;
  link([-side, -2.4, gitZ], [-side, 3.7, gitZ], 1.1);
  link([-side, 3.7, gitZ], [-side - 3.1, 7, gitZ - 2.5], 0.8);
  link([-side, 3.7, gitZ], [-side + 2.8, 7.4, gitZ - 2.5], 0.8);
  link([-side - 3.1, 7, gitZ - 2.5], [-side, 9.7, gitZ - 5.8], 0.65);
  link([-side + 2.8, 7.4, gitZ - 2.5], [-side, 9.7, gitZ - 5.8], 0.65);
  link([anchors[0][0] - 1.65, -0.55, anchors[0][2] - 0.7], [-side, -0.55, gitZ], 0.55);

  // GitHub: the fork connects to an open repository volume and a remote peer.
  const hubZ = anchors[1][2] - 2.3;
  frame(side + 0.7, 4.1, hubZ, portrait ? 3.7 : 5.2, 8.8, 1.1);
  frame(side + 4.8, 5.5, hubZ - 7.8, 3.1, 6.8, 0.7);
  link([-side, 9.7, gitZ - 5.8], [side + 0.7, 9.7, hubZ], 0.35, METAL);
  link([side + 0.7, 8.5, hubZ], [side + 4.8, 8.9, hubZ - 7.8], 0.32);
  add([side + 0.7, -0.5, hubZ - 0.8], [5.5, 0.6, 3.5]);

  // Linux: a continuous trunk with three recessed directory branches. The
  // negative space between the mineral leaves IS the filesystem structure.
  const linuxZ = anchors[2][2] - 2;
  add([-side - 1.5, 3.4, linuxZ - 0.9], [4.8, 10, 0.7], RECESS);
  add([-side - 3.9, 3.6, linuxZ], [0.65, 10.4, 1.6]);
  for (let i = 0; i < 3; i++) {
    const y = 1.2 + i * 2.25;
    link([-side - 3.6, y, linuxZ + 0.35], [-side - 0.3, y, linuxZ + 0.35], 0.32);
    add([-side + 0.45, y + 0.55, linuxZ], [1.6, 1.5, 1.4]);
  }
  link([anchors[2][0] - 1.7, -0.55, anchors[2][2] - 0.7], [-side - 1, -0.55, linuxZ], 0.5);

  // Kali: staggered boundary fins, with aligned apertures and a single measured
  // route through them. No grids filling the viewport, terminals or hacker motifs.
  const kaliZ = anchors[3][2] - 2;
  for (let i = 0; i < (portrait ? 2 : 3); i++) {
    add([side + i * 1.4, 2.5 + i * 0.35, kaliZ - i * 2], [0.55, 9.5, 1.8]);
    add(
      [side + 1.6 + i * 1.4, 6.5 + i * 0.35, kaliZ - i * 2],
      [3.7, 0.45, 1.8],
      i === 1 ? RECESS : IVORY,
    );
  }
  link([side + 0.2, 0.8, kaliZ + 0.9], [side + 3.2, 0.8, kaliZ - 3.1], 0.16, METAL);
  link([side + 3.2, 0.8, kaliZ - 3.1], [side + 3.2, 4.5, kaliZ - 3.1], 0.16, METAL);

  // Ollama: one local compute core, with a few off-axis modules. All connections
  // terminate here rather than disappearing into a generic network cloud.
  const modelZ = anchors[4][2] - 3;
  add([-side - 0.8, 3.7, modelZ], [3.2, 10.3, 3.4], RECESS);
  add([-side - 0.8, 8.9, modelZ], [3.8, 0.6, 4]);
  for (let i = 0; i < (portrait ? 2 : 3); i++) {
    const x = -side - 4 - i * 1.7;
    const y = 1.2 + i * 2.4;
    const z = modelZ - 2 - i * 3;
    add([x, y, z], [1.6, 2.1, 2.4]);
    link([-side - 1, y, modelZ - 0.3], [x, y, z], 0.22, METAL);
  }
  // A second, quieter bank stays across the path from the core. It makes the
  // local model topology legible from the authored camera without filling the
  // central route or competing with the Ollama mark.
  for (let i = 0; i < (portrait ? 1 : 2); i++) {
    const x = side + 1.8 + i * 2.2;
    const y = 5.4 + i * 1.5;
    const z = modelZ - 4 - i * 3.2;
    add([x, y, z], [1.7, 2.2, 2.6], i === 0 ? RECESS : IVORY);
    link([-side + 0.2, 7.8, modelZ - 0.5], [x, y, z], 0.18, METAL);
  }
  // Deep offset silhouettes continue through the gap left by the retired walls.
  // They sit outside the traversal/skill sightlines, at three different depths.
  for (const [x, z, h] of [
    [-17, -77, 19],
    [16, -88, 24],
    [-22, -102, 31],
  ]) {
    add([x, h / 2 - 4, z], [1.2, h, 8], '#a2b3b7');
    add([x + (x < 0 ? 4 : -4), h - 4, z], [8, 0.65, 6]);
  }
  // Two sparse open frames carry the traversal beyond Ollama. Their cool,
  // lower-contrast material separates them from the warm active architecture.
  for (const [z, w, h] of [
    [-83, 14, 12],
    [-94, 19, 16],
  ]) {
    add([-w / 2, h / 2 - 2.8, z], [0.65, h, 1.4], '#8fa5aa');
    add([w / 2, h / 2 - 2.8, z], [0.65, h, 1.4], '#8fa5aa');
    add([0, h - 2.8, z], [w, 0.65, 1.4], '#8fa5aa');
  }
  return { pieces, anchors, side };
}

function LitSweep({
  points,
  controller,
  skill,
  portrait,
  width = 0.055,
}: {
  points: Point[];
  controller: ChapterProgressController;
  skill: number;
  portrait: boolean;
  width?: number;
}) {
  const resources = useSkillsMaterials();
  const material = useMemo(() => {
    const light = resources.surfaces.light.clone();
    light.emissive.set('#ffd9a5');
    return light;
  }, [resources]);
  const geometry = useMemo(
    () => createSkillsRibbon(points, width, 0.045, portrait ? 12 : 20),
    [points, width, portrait],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useFrame(() => {
    material.emissiveIntensity =
      0.5 + 2.2 * getSkillRecognition(controller.progress.current, 4, skill, 5);
  });
  return <mesh geometry={geometry} material={material} dispose={null} />;
}

export function ToolsArchitecture({
  portrait,
  controller,
}: {
  portrait: boolean;
  controller: ChapterProgressController;
}) {
  const structure = useMemo(() => toolStructures(portrait), [portrait]);
  const resources = useSkillsMaterials();
  const canopy = useMemo(
    () =>
      createSkillsRibbon(
        [
          [-10, 8.8, -49],
          [-7.5, 9.2, -58],
          [-6.2, 10.2, -67],
          [-11, 12, -79],
        ],
        portrait ? 2 : 3.6,
        0.48,
        portrait ? 20 : 32,
      ),
    [portrait],
  );
  useEffect(() => () => canopy.dispose(), [canopy]);
  const seams = useMemo(
    () =>
      structure.anchors.map((a, i): Point[] => {
        const x = i % 2 ? structure.side : -structure.side;
        const z = a[2] - (i === 4 ? 1.25 : 1);
        if (i === 0)
          return [
            [x, -1, z],
            [x, 3.6, z],
            [x + 2.7, 7.3, z - 2.5],
            [x, 9.6, z - 5.8],
          ];
        if (i === 2)
          return [
            [x - 3.5, 0, z],
            [x - 3.5, 3.45, z],
            [x - 0.2, 3.45, z],
            [x - 0.2, 4.4, z],
          ];
        if (i === 4)
          return [
            [x - 2.3, -0.8, z],
            [x - 2.3, 8.5, z],
            [x + 0.7, 8.5, z],
          ];
        return [
          [x - 1.6, -0.4, z],
          [x - 1.6, 8.4, z],
          [x + 2.3, 8.4, z - 1.5],
        ];
      }),
    [structure],
  );
  return (
    <group name="tools-infrastructure">
      <Members pieces={structure.pieces} />
      <mesh
        geometry={canopy}
        material={resources.surfaces.mineral}
        castShadow={!portrait}
        receiveShadow
        dispose={null}
      />
      {seams.map((points, skill) => (
        <LitSweep
          key={points[0].join(':')}
          points={points}
          controller={controller}
          skill={skill}
          portrait={portrait}
        />
      ))}
    </group>
  );
}
