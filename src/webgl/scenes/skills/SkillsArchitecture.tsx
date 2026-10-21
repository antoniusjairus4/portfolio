'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, type Group, type InstancedMesh, Object3D, Vector3 } from 'three';
import { assemblyProgress, SKILLS_REGIONS, skillAnchor } from '@/components/skills/skillsSpatial';
import { skillCategories } from '@/content/skills';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { type SkillsFinish, useSkillsMaterials } from './SkillsMaterials';

type Point = [number, number, number];
interface Member {
  position: Point;
  size: Point;
  tone: string;
  rotation?: Point;
  finish?: SkillsFinish;
}
const PAPER = '#F2E8D5';
const STONE = '#b9ae96';
const INK = '#111111';
const CHARCOAL = '#343b3b';
const CRIMSON = '#8B1E2D';
function member(position: Point, size: Point, tone = PAPER, rotation?: Point): Member {
  return { position, size, tone, rotation };
}
function rail(from: Point, to: Point, width: number, tone = STONE): Member {
  const direction = new Vector3(...to).sub(new Vector3(...from));
  const object = new Object3D();
  object.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
  return member(
    from.map((value, axis) => (value + to[axis]) / 2) as Point,
    [width, direction.length(), width],
    tone,
    [object.rotation.x, object.rotation.y, object.rotation.z],
  );
}

// Each family is one instanced draw, including its different material colours.
// Unit boxes, no textures, no per-object shadows or imported resources.
function MemberBatch({ pieces, finish }: { pieces: Member[]; finish: SkillsFinish }) {
  const mesh = useRef<InstancedMesh>(null);
  const resources = useSkillsMaterials();
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const transform = new Object3D();
    const color = new Color();
    pieces.forEach((piece, index) => {
      transform.position.set(...piece.position);
      transform.scale.set(...piece.size);
      transform.rotation.set(...(piece.rotation ?? [0, 0, 0]));
      transform.updateMatrix();
      mesh.current?.setMatrixAt(index, transform.matrix);
      mesh.current?.setColorAt(index, color.set(piece.tone));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [pieces]);
  return (
    <instancedMesh
      ref={mesh}
      args={[resources.geometry, resources.materials[finish], pieces.length]}
      castShadow={finish !== 'translucent'}
      receiveShadow
      dispose={null}
    />
  );
}

function Members({ pieces }: { pieces: Member[] }) {
  const batches = useMemo(() => {
    const result = new Map<SkillsFinish, Member[]>();
    for (const piece of pieces) {
      const finish =
        piece.finish ??
        (piece.tone === PAPER
          ? 'mineral'
          : piece.tone === STONE
            ? 'stone'
            : piece.tone === CRIMSON
              ? 'signal'
              : piece.tone === INK
                ? 'technical'
                : 'metal');
      const batch = result.get(finish) ?? [];
      batch.push(piece);
      result.set(finish, batch);
    }
    return Array.from(result);
  }, [pieces]);
  return (
    <>
      {batches.map(([finish, batch]) => (
        <MemberBatch key={finish} finish={finish} pieces={batch} />
      ))}
    </>
  );
}

function createDomain(domain: number, portrait: boolean) {
  const fixed: Member[] = [];
  const moving: Member[] = [];
  const bays = portrait ? [-5.5, 4] : [-6, 0, 6];
  switch (domain) {
    case 0: {
      // Foundation: ordered intersections hold the landscape above the void.
      for (const z of bays) {
        for (const x of [-5.8, 5.8]) {
          fixed.push(member([x, 2.4, z], [0.52, 8.4, 0.65]));
          fixed.push(member([x, -1.5, z], [1.2, 0.65, 1.3], INK));
        }
        fixed.push(member([0, -1.25, z], [13.6, 0.55, 1.3], STONE));
        moving.push(member([0, 6.55, z], [12.4, 0.42, 0.7]));
      }
      for (const x of [-4.2, -2.1, 0, 2.1, 4.2]) {
        fixed.push(member([x, -0.68, 0], [0.18, 0.38, 18], CHARCOAL));
      }
      // DSA has a repeated structural order around its inscription.
      for (const y of [1.4, 2.9, 4.4]) {
        fixed.push(member([-5.7, y, -0.8], [0.16, 0.16, 10.8], STONE));
      }
      break;
    }
    case 1: {
      // Composition: layered cantilevers widen around the same central route.
      for (const side of [-1, 1]) {
        fixed.push(member([side * 7.2, 2.4, 0], [0.35, 8.4, 17], CHARCOAL));
        for (const level of [0.4, 3.4, 6.4]) {
          moving.push(member([side * 5.6, level, -1], [4.3, 0.2, 16]));
        }
        fixed.push(member([side * 6.7, 2.8, -3.8], [0.22, 6.2, 0.35], STONE));
      }
      for (const z of portrait ? [-4, 3] : [-5, -1, 3, 7]) {
        fixed.push(member([6.7, 4.8, z], [1.4, 3.4, 0.12], STONE));
      }
      fixed.push(member([0, 6.7, -6], [15, 0.24, 3.8]));
      fixed.push(rail([-6, 0.28, -5], [-2.4, -0.4, -13], 0.22));
      break;
    }
    case 2: {
      // Infrastructure: descended foundations, wells and longitudinal conduits.
      for (const side of [-1, 1]) {
        for (const tier of [0, 1, 2]) {
          fixed.push(
            member(
              [side * (4.3 + tier * 1.25), -1.1 - tier * 1.25, 0],
              [1.1, 1.2, 18],
              tier === 0 ? PAPER : CHARCOAL,
            ),
          );
          fixed.push(
            member([side * (4.7 + tier * 0.65), 5.3 + tier * 0.45, -1], [0.18, 0.24, 21], STONE),
          );
        }
        fixed.push(member([side * 6.5, 0, -5], [0.6, 10, 0.7]));
        fixed.push(member([side * 5.4, 1.7, 1.2], [0.4, 4.2, 0.6], CHARCOAL));
        moving.push(member([side * 2.5, 0.36, 0], [0.13, 0.18, 17.5]));
      }
      fixed.push(member([0, -4.7, 0], [18, 0.4, 18], CHARCOAL));
      break;
    }
    case 3: {
      // Perforated boundaries and terminated side routes, not an enclosed room.
      for (const side of [-1, 1]) {
        fixed.push(member([side * 4.4, 0.7, 0], [0.4, 1.4, 18]));
        fixed.push(member([side * 4.4, 5.7, 0], [0.4, 2, 18]));
        for (const z of [-6, 5]) {
          fixed.push(member([side * 4.4, 3.2, z], [0.42, 3.8, 2.6], STONE));
        }
        fixed.push(member([side * 2.5, 0.12, 0], [0.12, 0.18, 19], CHARCOAL));
        fixed.push(rail([side * 5.2, 1.8, 5], [side * 5.2, 1.8, -0.5], 0.12));
        fixed.push(member([side * 5.2, 2.05, -0.5], [0.5, 0.6, 0.16], INK));
      }
      moving.push(member([0, 6.1, -3], [8.5, 0.32, 0.8]));
      break;
    }
    case 4: {
      // Mechanism: branching/merging load-bearing rails and a sliding coupling.
      for (const side of [-1, 1]) {
        fixed.push(rail([side * 1.8, 0.35, 8], [side * 6, 0.35, 0], 0.32, PAPER));
        fixed.push(rail([side * 6, 0.35, 0], [side * 2.2, 0.35, -9], 0.32, PAPER));
        fixed.push(rail([side * 1.8, 5.8, 8], [side * 6, 5.8, 0], 0.18));
        fixed.push(rail([side * 6, 5.8, 0], [side * 2.2, 5.8, -9], 0.18));
        fixed.push(member([side * 6, 1.8, 0], [0.62, 8.4, 1.5], CHARCOAL));
        fixed.push(member([side * 5.2, -0.5, -4], [2.6, 0.25, 7], STONE));
      }
      for (const y of [1.4, 2.2, 3]) {
        fixed.push(member([-6.8, y, -2], [2.4, 0.16, 7.5], STONE));
      }
      moving.push(member([0, 5.8, -2], [11.8, 0.38, 1.2]));
      break;
    }
    case 5: {
      // Orchestration combines earlier languages into one larger open span.
      for (const side of [-1, 1]) {
        fixed.push(member([side * 7.2, 2.5, -3], [0.65, 10, 0.8]));
        fixed.push(member([side * 6, 1.4, -2], [3, 0.22, 18], STONE));
        fixed.push(member([side * 6.6, 4.6, -4], [3.8, 0.16, 14]));
        fixed.push(rail([side * 2.2, 0.2, 8], [side * 7.2, 0.2, -6], 0.24));
        fixed.push(member([side * 4.3, -2.6, -2], [0.25, 5.5, 17], CHARCOAL));
        fixed.push(member([side * 8.5, 3.5, -6], [0.25, 7.5, 4], STONE));
      }
      moving.push(member([0, 7.1, -3], [15.2, 0.4, 2.2]));
      fixed.push(member([0, -3.6, -3], [21, 0.5, 22], STONE));
      break;
    }
  }
  // Pass 2 detailing grows from the approved frame; the central authored route
  // remains clear. The large outer spans make the inner system read as inhabited scale.
  for (const side of [-1, 1]) {
    fixed.push(member([side * 10.8, 3.2, -2], [1.2, 13.5, 2.1], STONE));
    fixed.push(member([side * 10.8, -3.3, -2], [2.2, 0.25, 3], INK));
    fixed.push(member([side * 7.8, 7.6, -5], [7.4, 0.66, 1.7], PAPER));
  }
  if (domain === 0) {
    fixed.push(member([0, 8.8, -2], [24, 1.05, 2.4], PAPER));
    for (const z of [-3, -1, 1]) {
      fixed.push(rail([-8.8, 4.6, z], [-5.7, 3.1, z - 2], 0.08, STONE));
      fixed.push(member([-8.8, 4.6, z], [0.24, 0.24, 0.24], PAPER));
    }
    // C and C++ share a root before their ordered tracks separate.
    fixed.push(rail([1, 0.16, 3], [1, 0.16, -3], 0.13, PAPER));
    fixed.push(rail([1, 0.16, -3], [3, 0.16, -7], 0.13, PAPER));
    fixed.push(rail([1, 0.16, -3], [-1.5, 0.16, -7], 0.13, PAPER));
    for (let i = 0; i < 5; i++) {
      fixed.push(member([7.7 + Math.sin(i * 0.7) * 0.55, 2.5, -i * 1.3], [0.18, 5.4, 0.3], STONE));
    }
  } else if (domain === 1) {
    for (const side of [-1, 1]) {
      moving.push(member([side * 10.6, 3.4, -2], [7.2, 0.24, 17], PAPER));
      fixed.push({
        ...member([side * 8.5, 5.1, -3], [3.8, 0.08, 13], '#c6d3cf'),
        finish: 'translucent',
      });
    }
    for (let i = 0; i < (portrait ? 3 : 6); i++) {
      fixed.push(member([8.4, 1.8 + i * 0.18, -1.5 - i * 0.5], [5.7, 0.06, 6], STONE));
    }
    for (const x of [-7.6, -6.2, -4.8]) {
      for (const y of [1.2, 2.6]) fixed.push(member([x, y, -10], [1.2, 0.12, 2.6], PAPER));
    }
  } else if (domain === 2) {
    fixed.push(member([0, 7.5, -3], [20, 0.9, 12], PAPER));
    for (const side of [-1, 1]) {
      for (const y of [-1.4, 1.3, 4]) {
        fixed.push(rail([side * 7.4, y, 5], [side * 7.4, y, -9], 0.14, CHARCOAL));
        fixed.push(rail([side * 7.4, y, -9], [side * 5, y - 1.3, -11], 0.14, STONE));
      }
      fixed.push(member([side * 8.3, -1.4, -5], [3, 0.65, 10], PAPER));
    }
  } else if (domain === 3) {
    for (const side of [-1, 1]) {
      moving.push(member([side * 5.1, 3.1, -3], [0.26, 5.5, 2.2], CHARCOAL));
      fixed.push(rail([side * 7.6, 0.4, 6], [side * 4.8, 0.4, 0], 0.09, STONE));
      fixed.push(rail([side * 4.8, 0.4, 0], [side * 4.8, 0.4, -8], 0.09, STONE));
    }
    for (let i = 0; i < 5; i++) {
      fixed.push(member([-7.8, 0.6 + i * 0.65, -7], [3.2, 0.08, 3.8], STONE));
    }
    moving.push(member([-6.2, 1.9, -6], [2.8, 0.11, 1.2], PAPER));
  } else if (domain === 4) {
    for (const side of [-1, 1]) {
      fixed.push(rail([side * 2.3, 6.9, 7], [side * 9.5, 6.9, -1], 0.3, PAPER));
      fixed.push(rail([side * 9.5, 6.9, -1], [side * 2.5, 6.9, -10], 0.3, PAPER));
      moving.push(member([side * 5.8, 5.8, -2], [1.3, 0.8, 1.5], CHARCOAL));
      fixed.push(member([side * 8, 0.2, -5], [4, 0.6, 12], PAPER));
    }
  } else {
    // The final mechanism carries beams, fins, routes and boundary elements together.
    for (const side of [-1, 1]) {
      moving.push(member([side * 5.7, 6.7, -3], [0.3, 0.3, 16], CHARCOAL));
      moving.push(member([side * 8.3, 6.8, -5], [4.2, 0.12, 11], PAPER));
      moving.push(member([side * 7.4, 5.5, -6], [0.16, 3, 1.8], STONE));
      fixed.push({
        ...member([side * 8, 2.2, -5], [4.5, 0.09, 12], '#c6d3cf'),
        finish: 'translucent',
      });
    }
    moving.push(rail([-7.5, 6.8, -1], [0, 6.8, -8], 0.15, STONE));
    moving.push(rail([7.5, 6.8, -1], [0, 6.8, -8], 0.15, STONE));
    fixed.push(member([0, 9.2, -9], [27, 0.8, 3], PAPER));
  }
  const origin = SKILLS_REGIONS[domain];
  if (portrait) {
    // One shared structural opening carries the portrait recognition sequence.
    // Its uprights return to the overhead span; individual marks have no UI plaques.
    for (const side of [-1, 1]) {
      fixed.push(member([side * 1.75, 4.15, -5.6], [0.1, 4.9, 0.35], CHARCOAL));
      fixed.push(member([side * 2.6, 6.55, -5.6], [1.8, 0.22, 0.5], STONE));
    }
    fixed.push(member([0, 4.65, -5.6], [3.6, 0.1, 0.3], STONE));
  }
  skillCategories[domain].skills.forEach((_, skill) => {
    const anchor = skillAnchor(domain, skill, portrait);
    const x = anchor[0] - origin.x;
    const y = anchor[1] - origin.y - 0.34;
    const z = anchor[2] - origin.z;
    const side = x < 0 ? -1 : 1;
    const support = domain === 3 ? 4.4 : domain === 0 ? 5.8 : 6.5;
    // Thin inscription ledges return into the structural system. No backing cards.
    fixed.push(rail([x, y, z], [side * support, y, z], 0.025, STONE));
  });
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
  const connection = useRef<Group>(null);
  const pieces = useMemo(() => createDomain(domain, portrait), [domain, portrait]);
  const accent = useMemo(() => [member([0, 0.95, -2], [1.4, 0.035, 0.05], CRIMSON)], []);
  const region = SKILLS_REGIONS[domain];
  useFrame(() => {
    const group = mechanism.current;
    if (!group) return;
    const assembly = assemblyProgress(controller.progress.current, domain);
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
      <Members pieces={pieces.fixed} />
      <group ref={mechanism}>
        <Members pieces={pieces.moving} />
      </group>
      <group ref={connection}>
        <Members pieces={accent} />
      </group>
    </group>
  );
}

function TransitionSpan({
  destination,
  controller,
}: {
  destination: number;
  controller: ChapterProgressController;
}) {
  const members = useRef<(Group | null)[]>([]);
  const resources = useSkillsMaterials();
  const before = SKILLS_REGIONS[destination - 1];
  const after = SKILLS_REGIONS[destination];
  useFrame(() => {
    const phase = assemblyProgress(controller.progress.current, destination);
    members.current.forEach((group, index) => {
      if (!group) return;
      const side = index - 1;
      group.position.set(side * 3.4, 6.7, 0);
      group.rotation.set(0, 0, 0);
      group.scale.set(2.2, 0.6, 7);
      if (destination === 1) {
        // The same rigid members become the Web's wide, separated surface layers.
        group.position.x = side * (3.4 + phase * 1.5);
        group.position.y += side * phase * 0.65;
        group.scale.set(2.2 + phase * 1.8, 0.6 - phase * 0.43, 7);
      } else if (destination === 2) {
        // Surface seams open while the exposed rails below stay connected.
        group.position.x = side * (3.4 + phase * 1.2);
        group.position.y += phase * 1.1;
        group.rotation.z = side * phase * 0.09;
        group.scale.set(2.8, 0.2, 9);
      } else if (destination === 3) {
        // Outer conduits acquire boundary fins around an unchanged clear opening.
        group.position.x = side * 4.7;
        group.position.y = side === 0 ? 6.7 : 5.1;
        group.rotation.z = side * phase * Math.PI * 0.42;
        group.scale.set(2.4, 0.2, 6.4);
      } else if (destination === 4) {
        // Checkpoint members spread into manipulable fork/merge tracks.
        group.position.x = side * (3.4 + phase);
        group.rotation.y = side * phase * 0.42;
        group.scale.set(0.35, 0.35, 9.5);
      } else {
        // Previously divergent tracks coordinate with a broad common span.
        group.position.x = side * (4.5 - phase * 1.1);
        group.position.y += (1 - phase) * Math.abs(side);
        group.rotation.y = side * (1 - phase) * 0.42;
        group.scale.set(2.4, 0.2 + phase * 0.24, 8);
      }
    });
  });
  return (
    <group
      position={[(before.x + after.x) / 2, (before.y + after.y) / 2, (before.z + after.z) / 2]}
    >
      {[0, 1, 2].map((index) => (
        <group
          key={index}
          ref={(node) => {
            members.current[index] = node;
          }}
        >
          <mesh
            geometry={resources.geometry}
            material={resources.surfaces.mineral}
            castShadow
            receiveShadow
            dispose={null}
          />
          <mesh
            geometry={resources.geometry}
            material={resources.surfaces.metal}
            position={[0, -0.56, 0]}
            scale={[0.95, 0.1, 0.98]}
            dispose={null}
          />
        </group>
      ))}
    </group>
  );
}

export function SkillsArchitecture({
  portrait,
  controller,
}: {
  portrait: boolean;
  controller: ChapterProgressController;
}) {
  const connectiveTissue = useMemo(() => {
    const pieces: Member[] = [];
    for (let i = 0; i < SKILLS_REGIONS.length - 1; i++) {
      const start = SKILLS_REGIONS[i];
      const end = SKILLS_REGIONS[i + 1];
      // These shared bridges and service rails survive every change of language.
      pieces.push(
        rail([start.x, start.y - 1.1, start.z + 8], [end.x, end.y - 1.1, end.z + 8], 2.1, CHARCOAL),
      );
      for (const side of [-1, 1]) {
        pieces.push(
          rail(
            [start.x + side * 1.35, start.y, start.z + 8],
            [end.x + side * 1.35, end.y, end.z + 8],
            0.08,
            PAPER,
          ),
        );
        pieces.push(
          rail(
            [start.x + side * 7.8, start.y - 2, start.z + 8],
            [end.x + side * 7.8, end.y - 2, end.z + 8],
            0.3,
          ),
        );
      }
    }
    pieces.push(member([0, -1.1, 12], [2.1, 2.1, 8], CHARCOAL));
    pieces.push(member([0, -0.1, -80], [2.1, 2.1, 16], CHARCOAL));
    pieces.push(member([0, -6, -37], [48, 0.5, 116], CHARCOAL));
    pieces.push(member([-16, 2, -40], [0.8, 18, 112], STONE));
    pieces.push(member([18, 5, -44], [0.8, 24, 118], INK));
    return pieces;
  }, []);
  return (
    <group>
      <Members pieces={connectiveTissue} />
      {SKILLS_REGIONS.map((region, domain) => (
        <StructuralSystem
          key={region.z}
          domain={domain}
          portrait={portrait}
          controller={controller}
        />
      ))}
      {[1, 2, 3, 4, 5].map((destination) => (
        <TransitionSpan key={destination} destination={destination} controller={controller} />
      ))}
    </group>
  );
}
