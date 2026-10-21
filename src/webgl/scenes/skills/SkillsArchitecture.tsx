'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { CatmullRomCurve3, Color, type Group, type InstancedMesh, Object3D, Vector3 } from 'three';
import { getSkillRecognition } from '@/components/skills/skillsChoreography';
import { assemblyProgress, SKILLS_REGIONS } from '@/components/skills/skillsSpatial';
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
  // Reserve the entire central travel volume, not just a ray through the logo.
  // No mid-height slab enters x=-4.6..4.6. Portrait moves structural returns
  // toward the edge of its narrower frustum while retaining both sides.
  const edge = portrait ? 5.2 : 6.7;
  switch (domain) {
    case 0: {
      // Keep the foundation's vertical rhythm; retire the intermediate shelves.
      for (const z of [-5, 5]) {
        for (const side of [-1, 1]) {
          fixed.push(member([side * edge, 2.6, z], [0.52, 9.4, 0.65]));
          fixed.push(member([side * edge, -1.8, z], [1.2, 0.65, 1.3], INK));
        }
        fixed.push(member([0, -1.8, z], [edge * 2 + 1, 0.5, 1.3], STONE));
        moving.push(member([0, 7.6, z], [edge * 2 + 1, 0.38, 0.65]));
      }
      for (const side of [-1, 1]) {
        fixed.push(rail([side * 3.2, -0.8, 6], [side * 3.2, -0.8, -8], 0.12, STONE));
        fixed.push(rail([side * edge, 5.6, -4], [side * (edge + 3), 7.3, -7], 0.12));
      }
      break;
    }
    case 1: {
      // A single flowing ribbon replaces the banks of stacked Web shelves.
      fixed.push(member([-edge - 2.4, 2, -2], [0.3, 11, 13], CHARCOAL));
      fixed.push(member([edge + 2, 3.2, -6], [0.24, 8, 6], PAPER, [0, -0.18, 0]));
      moving.push(member([-edge - 1.1, -1.4, -2], [5, 0.23, 13], PAPER));
      moving.push(member([edge + 1.6, 8.3, -4], [6, 0.2, 10], PAPER, [0, 0.12, 0]));
      const ribbon = new CatmullRomCurve3([
        new Vector3(edge, 4.8, 8),
        new Vector3(edge + 2, 6.6, 1),
        new Vector3(edge + 1, 7.1, -6),
        new Vector3(edge - 0.5, 7.5, -11),
      ]);
      const segments = portrait ? 10 : 16;
      for (let i = 0; i < segments; i++) {
        fixed.push(
          rail(
            ribbon.getPoint(i / segments).toArray() as Point,
            ribbon.getPoint((i + 1) / segments).toArray() as Point,
            0.26,
            PAPER,
          ),
        );
      }
      break;
    }
    case 2: {
      // Infrastructure retains the descended wells, with two routes instead of
      // three stacks on both sides and a full ceiling slab.
      for (const side of [-1, 1]) {
        fixed.push(member([side * edge, -2.3, -1], [2.2, 2.4, 17], STONE));
        fixed.push(member([side * (edge + 2), -3.6, -3], [1.2, 4, 12], CHARCOAL));
        fixed.push(member([side * edge, 1, -6], [0.65, 12, 0.9], PAPER));
        moving.push(member([side * (edge - 0.7), 6.6, -1], [0.16, 0.22, 19], STONE));
        fixed.push(rail([side * edge, -0.9, 5], [side * (edge + 2), -2.6, -9], 0.14, PAPER));
      }
      fixed.push(member([0, -5.4, -1], [22, 0.4, 19], CHARCOAL));
      break;
    }
    case 3: {
      // Segmented boundaries frame a protected central passage; no shelf wall.
      for (const side of [-1, 1]) {
        for (const z of [-6, 5]) {
          fixed.push(member([side * (edge - 0.3), 2.5, z], [0.45, 8.2, 1.8], STONE));
        }
        fixed.push(member([side * (edge - 0.3), -1.5, 0], [0.4, 0.6, 17], PAPER));
        moving.push(member([side * (edge + 1), 3.1, -3], [0.24, 5.5, 2.2], CHARCOAL));
        fixed.push(rail([side * 3.3, -0.8, 7], [side * (edge - 0.4), -0.8, 0], 0.1));
        fixed.push(member([side * (edge - 0.4), -0.6, 0], [0.4, 0.5, 0.18], INK));
      }
      moving.push(member([0, 7.9, -4], [edge * 2, 0.24, 0.6]));
      break;
    }
    case 4: {
      // Retain fork/merge rails and their coupling. Remove every intermediate shelf.
      for (const side of [-1, 1]) {
        fixed.push(rail([side * 3.6, -0.8, 8], [side * edge, -0.8, 0], 0.26, PAPER));
        fixed.push(rail([side * edge, -0.8, 0], [side * 3.6, -0.8, -9], 0.26, PAPER));
        fixed.push(rail([side * 4.8, 7.4, 8], [side * (edge + 1), 7.4, 0], 0.16));
        fixed.push(rail([side * (edge + 1), 7.4, 0], [side * 4.8, 7.4, -9], 0.16));
        fixed.push(member([side * (edge + 1), 2.5, 0], [0.62, 10.4, 1.2], CHARCOAL));
        moving.push(member([side * (edge + 1), 7.4, -2], [1, 0.6, 1.4], PAPER));
      }
      break;
    }
    case 5: {
      // Earlier spans and routes converge in an open suspended landscape.
      for (const side of [-1, 1]) {
        fixed.push(member([side * (edge + 1), 3.8, -6], [0.45, 12, 1.1], STONE));
        fixed.push(rail([side * 3.5, -0.6, 8], [side * (edge + 1), -0.6, -8], 0.2));
        moving.push(rail([side * (edge + 1), 8.4, 3], [side * 2.8, 8.4, -9], 0.18, PAPER));
      }
      moving.push(member([edge + 1.6, 7.8, -5], [5.2, 0.2, 9], PAPER, [0, 0.2, 0]));
      fixed.push(member([-edge - 2, 3.5, -8], [0.25, 8.5, 5], PAPER, [0, 0.22, 0]));
      fixed.push(member([0, -4.1, -3], [23, 0.4, 22], STONE));
      break;
    }
  }
  // Sparse background masses carry scale. Alternating sides creates open volumes
  // between clusters, instead of duplicating a giant gateway in every region.
  const side = domain % 2 ? 1 : -1;
  fixed.push(member([side * (edge + 5), 3.8, -4], [1.1, 15, portrait ? 3 : 5], STONE));
  if (!portrait) fixed.push(member([-side * 11.8, 7.8, -7], [7, 0.35, 2.2], PAPER));
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
      const side = index === 0 ? -1 : 1;
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
        group.position.y = 5.1;
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
      group.position.x = side * Math.max(6.7, Math.abs(group.position.x));
      group.position.y = Math.max(7.6, group.position.y);
      group.scale.x = Math.min(1.2, group.scale.x);
      group.scale.y = Math.min(0.24, group.scale.y);
    });
  });
  return (
    <group
      position={[(before.x + after.x) / 2, (before.y + after.y) / 2, (before.z + after.z) / 2]}
    >
      {[0, 1].map((index) => (
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
    <group name="skills-architecture">
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
