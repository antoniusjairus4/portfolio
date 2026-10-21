'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Color, type InstancedMesh, Object3D, Vector3 } from 'three';
import { type SkillsFinish, useSkillsMaterials } from './SkillsMaterials';
export type Point = [number, number, number];
export interface Member {
  position: Point;
  size: Point;
  tone: string;
  rotation?: Point;
  finish?: SkillsFinish;
}
const PAPER = '#F2E8D5';
const STONE = '#d8d0be';
const INK = '#111111';
const CRIMSON = '#8B1E2D';
export function member(position: Point, size: Point, tone = PAPER, rotation?: Point): Member {
  return { position, size, tone, rotation };
}
export function rail(from: Point, to: Point, width: number, tone = STONE): Member {
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
      castShadow={finish !== 'translucent' && finish !== 'light'}
      receiveShadow
      dispose={null}
    />
  );
}

export function Members({ pieces }: { pieces: Member[] }) {
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
