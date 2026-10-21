'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { getSkillRecognition } from '@/components/skills/skillsChoreography';
import { assemblyProgress, SKILLS_REGIONS } from '@/components/skills/skillsSpatial';
import { skillCategories } from '@/content/skills';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { SkillsBoulevard } from './SkillsBoulevard';
import { useSkillsMaterials } from './SkillsMaterials';
import { type Member, Members, member, type Point } from './SkillsStructure';
import { createSkillsRibbon } from './skillsRibbon';
import { ToolsArchitecture } from './ToolsArchitecture';

const PAPER = '#F2E8D5';
const STONE = '#d8d0be';
const CHARCOAL = '#344149';
const CRIMSON = '#8B1E2D';
function createDomain(domain: number, portrait: boolean) {
  const fixed: Member[] = [];
  const moving: Member[] = [];
  const edge = portrait ? 5.6 : 7.5;
  // One structural gesture per domain. The shared ribbons/axis do the connecting;
  // repeated lintels, small footings and intermediate slab banks are retired.
  if (domain === 0) {
    for (const side of [-1, 1]) {
      fixed.push(member([side * edge, 3.5, -2], [0.8, 11, 1.5], PAPER));
      moving.push(member([side * (edge - 1.5), 8.8, -2], [4.2, 0.65, 4], PAPER));
      fixed.push({
        ...member([side * (edge - 0.44), 3.6, -1.25], [0.055, 9, 0.045]),
        finish: 'light',
      });
    }
  } else if (domain === 1) {
    fixed.push(member([edge + 1.4, 3.8, -6], [0.7, 11.5, 8], PAPER));
    moving.push(member([-edge - 1.5, 8.6, -4], [6, 0.7, 10], PAPER));
    fixed.push({ ...member([edge + 1.02, 3.8, -2.5], [0.04, 9, 0.06]), finish: 'light' });
  } else if (domain === 2) {
    for (const side of [-1, 1]) {
      fixed.push(member([side * edge, -2.4, -1], [3.6, 3.8, 15], STONE));
      fixed.push(member([side * (edge + 1.3), 3, -5], [1.4, 12, 3.4], PAPER));
      moving.push(member([side * (edge - 1), 6.8, -2], [0.18, 0.24, 16], CHARCOAL));
      fixed.push({
        ...member([side * (edge - 1.82), -0.45, -1], [0.04, 0.055, 15]),
        finish: 'light',
      });
    }
  } else if (domain === 3) {
    for (const side of [-1, 1]) {
      fixed.push(member([side * edge, 3.1, -5], [0.65, 10, 3], PAPER));
      moving.push(member([side * (edge + 1.5), 3.2, 3], [0.4, 7.2, 2], CHARCOAL));
      fixed.push({
        ...member([side * (edge - 0.36), 3.1, -3.5], [0.04, 8.5, 0.045]),
        finish: 'light',
      });
    }
  } else if (domain === 4) {
    // Tools has its own connected, tool-authored structure below.
  } else {
    fixed.push(member([-edge - 1.4, 4.5, -5], [0.65, 13, 4.5], PAPER, [0, 0.16, 0]));
    moving.push(member([edge + 1.7, 8.3, -7], [7.5, 0.6, 13], PAPER, [0, -0.12, 0]));
    fixed.push({ ...member([-edge - 1.05, 4.5, -2.9], [0.045, 11, 0.04]), finish: 'light' });
  }
  return { fixed, moving };
}

function StructuralSystem({
  domain,
  portrait,
  controller,
}: {
  domain: number;
  portrait: boolean;
  controller: ChapterProgressController;
}) {
  const mechanism = useRef<Group>(null);
  const surround = useRef<Group>(null);
  const connection = useRef<Group>(null);
  const pieces = useMemo(() => createDomain(domain, portrait), [domain, portrait]);
  const accent = useMemo(() => [member([0, 0.95, -2], [1.4, 0.035, 0.05], CRIMSON)], []);
  const region = SKILLS_REGIONS[domain];
  useFrame(() => {
    const group = mechanism.current;
    if (!group) return;
    const p = controller.progress.current;
    const focus = Math.max(
      ...skillCategories[domain].skills.map((_, skill) =>
        getSkillRecognition(p, domain, skill, skillCategories[domain].skills.length),
      ),
    );
    // The outer structure gives the exhibit a little more air as it becomes active.
    if (surround.current) surround.current.scale.x = 1 + focus * 0.035;
    const assembly = assemblyProgress(p, domain);
    const remaining = 1 - assembly;
    // Absolute assignments: seek, restore and reverse equal forward playback.
    group.position.set(0, 0, 0);
    group.rotation.set(0, 0, 0);
    group.scale.set(1, 1, 1);
    if (domain === 0) group.position.y = remaining * 1.6;
    if (domain === 1) {
      group.scale.x = 0.76 + assembly * 0.24;
      group.scale.y = 1 + remaining * 0.1;
    }
    if (domain === 2) {
      group.scale.z = 0.3 + assembly * 0.7;
      group.position.y = remaining * 0.9;
    }
    if (domain === 3) group.rotation.y = remaining * 0.32;
    if (domain === 4) {
      group.position.z = remaining * 4;
      group.rotation.y = remaining * -0.14;
    }
    if (domain === 5) {
      group.position.y = remaining * 2;
      group.scale.x = 1 + remaining * 0.16;
    }
    // Crimson marks only the connection currently being made.
    if (connection.current) {
      connection.current.visible = assembly > 0 && assembly < 1;
      connection.current.scale.x = Math.sin(assembly * Math.PI);
    }
  });
  return (
    <group position={[region.x, region.y, region.z]}>
      <group ref={surround}>
        <Members pieces={pieces.fixed} />
      </group>
      <group ref={mechanism}>
        <Members pieces={pieces.moving} />
      </group>
      <group ref={connection}>
        <Members pieces={accent} />
      </group>
    </group>
  );
}

function Ribbon({
  points,
  width,
  thickness,
  offset = 0,
  lift = 0,
  finish = 'mineral',
  portrait,
}: {
  points: Point[];
  width: number;
  thickness: number;
  offset?: number;
  lift?: number;
  finish?: 'mineral' | 'light' | 'floor';
  portrait: boolean;
}) {
  const resources = useSkillsMaterials();
  const geometry = useMemo(
    () =>
      createSkillsRibbon(
        points.map((p) => [p[0], p[1] + lift, p[2]]),
        width,
        thickness,
        portrait ? 28 : 48,
        offset,
      ),
    [points, width, thickness, portrait, offset, lift],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      name="skills-ribbon"
      geometry={geometry}
      material={resources.surfaces[finish]}
      castShadow={finish === 'mineral'}
      receiveShadow={finish !== 'light'}
      dispose={null}
    />
  );
}

export function SkillsArchitecture({
  portrait,
  controller,
}: {
  portrait: boolean;
  controller: ChapterProgressController;
}) {
  const architecture = useMemo(() => {
    const path: Point[] = [
      [0, -0.35, 20],
      ...SKILLS_REGIONS.map((r) => [r.x, r.y - 0.35, r.z + 8] as Point),
      [0, 0.65, -115],
    ];
    const low: Point[] = [
      [-6.4, -0.8, 18],
      [-7.6, -0.6, 2],
      [-6.2, -0.35, -14],
      [-8.5, -1.5, -30],
      [-9.8, -2.2, -42],
    ];
    const high: Point[] = [
      [9, 8.1, 18],
      [7.5, 8.5, -4],
      [8.6, 8.2, -23],
      [9.7, 7.2, -43],
      [8.2, 8.2, -66],
      [10, 9, -92],
    ];
    const base: Member[] = [
      { ...member([0, -4.8, -43], [48, 0.5, 156], '#273139'), finish: 'floor' },
      // Open the Tools reach of the old continuous walls into a structural void.
      member([-13.5, 5, -9], [0.8, 22, 82], CHARCOAL),
      member([-13.5, 5, -101], [0.8, 22, 34], CHARCOAL),
      member([18, 8, -9], [0.8, 28, 82], STONE),
      member([18, 8, -103], [0.8, 28, 38], STONE),
      // Distant structural planes, large and sparse, give the blue horizon scale.
      member([-8, 8, -111], [1.8, 25, 9], PAPER),
      member([9, 10, -124], [2.4, 30, 10], PAPER),
      member([0, 17, -128], [22, 0.9, 7], PAPER),
    ];
    return { path, low, high, base };
  }, []);
  return (
    <group name="skills-architecture">
      <Members pieces={architecture.base} />
      <Ribbon
        points={architecture.path}
        width={3.1}
        thickness={0.16}
        finish="floor"
        portrait={portrait}
      />
      <Ribbon
        points={architecture.high}
        width={portrait ? 2.6 : 4.6}
        thickness={0.48}
        portrait={portrait}
      />
      <Ribbon
        points={architecture.high}
        width={0.06}
        thickness={0.055}
        offset={portrait ? -1.24 : -2.24}
        lift={-0.265}
        finish="light"
        portrait={portrait}
      />
      <Ribbon
        points={architecture.low}
        width={portrait ? 1.4 : 3.2}
        thickness={0.42}
        portrait={portrait}
      />
      <Ribbon
        points={architecture.low}
        width={0.055}
        thickness={0.055}
        offset={portrait ? 0.66 : 1.56}
        lift={0.235}
        finish="light"
        portrait={portrait}
      />
      <SkillsBoulevard portrait={portrait} />
      <ToolsArchitecture controller={controller} portrait={portrait} />
      {SKILLS_REGIONS.map((region, domain) => (
        <StructuralSystem
          key={region.z}
          domain={domain}
          portrait={portrait}
          controller={controller}
        />
      ))}
    </group>
  );
}
