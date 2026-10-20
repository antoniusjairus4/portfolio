import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import {
  BufferGeometry,
  DoubleSide,
  type PointLight,
  Float32BufferAttribute,
  type Group,
  type LineBasicMaterial,
  type MeshBasicMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';
import { rangeProgress, smoothstep } from '@/components/neuroshield/neuroShieldChoreography';
import { NEURO_IMAGE_IDS, NEURO_IMAGE_URLS } from '@/experience/assets/manifest';
import type { ProductionAssetLease } from '@/experience/assets/types';
import { useProductionAssetManager } from '@/experience/ProjectExperienceProvider';

const IMAGE_Z = [-7.2, -10.9, -14.6, -18.3];
const FOCUS_WINDOWS = [
  [0.31, 0.44],
  [0.42, 0.54],
  [0.52, 0.64],
  [0.59, 0.7],
] as const;
const WORKSPACE = [
  [-3.15, 3.25, -27.3],
  [-1.05, 1.32, -26.2],
  [1.1, 3.18, -27.2],
  [3.17, 1.28, -26.3],
] as const;

function cornerGeometry() {
  const positions: number[] = [];
  const halfX = 1.55;
  const halfY = 1.43;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const x = sx * halfX;
      const y = sy * halfY;
      positions.push(x, y - sy * 0.23, 0.025, x, y, 0.025);
      positions.push(x, y, 0.025, x - sx * 0.23, y, 0.025);
    }
  }
  return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(positions, 3));
}

export function ImagingSequence({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const manager = useProductionAssetManager();
  const { gl, invalidate, camera } = useThree();
  const filmLight = useRef<PointLight>(null);
  const [textures, setTextures] = useState<(Texture | null)[]>(() =>
    NEURO_IMAGE_IDS.map(() => null),
  );
  const groups = useRef<(Group | null)[]>([]);
  const imageMaterials = useRef<(MeshBasicMaterial | null)[]>([]);
  const markMaterials = useRef<(LineBasicMaterial | null)[]>([]);
  const corner = useMemo(cornerGeometry, []);
  const lineGeometry = useMemo(
    () =>
      new BufferGeometry().setAttribute(
        'position',
        new Float32BufferAttribute(new Float32Array(12), 3),
      ),
    [],
  );
  const focusGeometry = useMemo(
    () =>
      new BufferGeometry().setAttribute(
        'position',
        new Float32BufferAttribute(new Float32Array(6), 3),
      ),
    [],
  );
  const relationshipMaterial = useRef<LineBasicMaterial>(null);
  const focusMaterial = useRef<LineBasicMaterial>(null);

  useEffect(
    () => () => {
      corner.dispose();
      lineGeometry.dispose();
      focusGeometry.dispose();
    },
    [corner, lineGeometry, focusGeometry],
  );

  useEffect(() => {
    let cancelled = false;
    const leases: ProductionAssetLease<Texture>[] = [];
    const directTextures: Texture[] = [];
    const textureLoader = new TextureLoader();
    NEURO_IMAGE_IDS.forEach((id, index) => {
      void (async () => {
        let lease: ProductionAssetLease<Texture> | null = null;
        try {
          lease = manager ? await manager.activate<Texture>(id, 'neuroshield', { gl }) : null;
        } catch {
          lease = null;
        }
        let texture = lease?.value ?? null;
        if (!texture) {
          try {
            texture = await textureLoader.loadAsync(NEURO_IMAGE_URLS[index]);
            texture.colorSpace = SRGBColorSpace;
            directTextures.push(texture);
          } catch {
            return;
          }
        }
        if (cancelled) {
          lease?.release(false);
          if (!lease) texture.dispose();
          return;
        }
        if (lease) leases.push(lease);
        setTextures((current) => {
          const next = [...current];
          next[index] = texture;
          return next;
        });
      })();
    });
    return () => {
      cancelled = true;
      leases.forEach((lease) => {
        lease.release();
      });
      directTextures.forEach((texture) => {
        texture.dispose();
      });
    };
  }, [manager, gl]);

  useEffect(() => {
    if (textures.some(Boolean)) invalidate();
  }, [textures, invalidate]);

  useFrame(() => {
    const p = progress.current;
    const organize = smoothstep(rangeProgress(p, 0.59, 0.74));
    const uncertainty = smoothstep(rangeProgress(p, 0.8, 0.97));
    let brightest = 0;
    let selected = 0;
    groups.current.forEach((group, index) => {
      if (!group) return;
      const [start, end] = FOCUS_WINDOWS[index];
      const focus =
        smoothstep(rangeProgress(p, start, start + 0.025)) *
        (1 - smoothstep(rangeProgress(p, end - 0.025, end)));
      const image = imageMaterials.current[index];
      const marks = markMaterials.current[index];
      const hasTexture = Boolean(textures[index]);
      const opacity = hasTexture
        ? Math.max(focus, organize * (index === 1 || index === 2 ? 0.82 : 0.58)) *
          (1 - uncertainty * (index === 0 || index === 3 ? 0.98 : 0.78))
        : 0;
      group.visible = opacity > 0.005;
      group.position.set(
        (index % 2 === 0 ? -1 : 1) * (1.35 - focus * 1.05) * (1 - organize) +
          WORKSPACE[index][0] * organize * (portrait ? 0.47 : 1) +
          uncertainty * (index % 2 === 0 ? -0.45 : 0.45),
        1.8 * (1 - organize) + WORKSPACE[index][1] * organize,
        IMAGE_Z[index] * (1 - organize) +
          WORKSPACE[index][2] * organize -
          uncertainty * (index === 0 || index === 3 ? 1.6 : 0),
      );
      const passing = smoothstep(rangeProgress(p, end - 0.06, end));
      group.position.x += (index % 2 === 0 ? -1 : 1) * passing * (1 - organize) * 1.35;
      group.rotation.y =
        (index % 2 === 0 ? 1 : -1) * ((1 - focus) * 0.93 + passing * 0.48) * (1 - organize) +
        organize * (index % 2 === 0 ? -0.16 : 0.16) +
        uncertainty * (index === 3 ? 0.34 : 0);
      group.rotation.z = (index % 2 === 0 ? 1 : -1) * 0.035 * (1 - focus);
      const scale = 0.86 + focus * 0.08 - organize * 0.16;
      group.scale.setScalar(scale);
      // Retire the frontal image before crossing its physical plane, retaining
      // the angled film in peripheral depth instead of filling the viewport.
      const clearance = smoothstep(
        rangeProgress(Math.abs(camera.position.z - group.position.z), 0.8, 2.3),
      );
      const readable = opacity * Math.max(organize, clearance);
      if (image) image.opacity = readable;
      if (marks) marks.opacity = readable * (0.16 + focus * 0.42);
      if (focus * clearance > brightest) {
        brightest = focus * clearance;
        selected = index;
      }
    });
    const activeFilm = groups.current[selected];
    if (filmLight.current && activeFilm) {
      filmLight.current.position.copy(activeFilm.position);
      filmLight.current.position.z += 0.7;
      filmLight.current.intensity = brightest * (1 - uncertainty) * 1.15;
    }

    const position = lineGeometry.attributes.position;
    const focusPosition = focusGeometry.attributes.position;
    for (const [segment, a, b] of [
      [0, 0, 1],
      [1, 2, 3],
    ] as const) {
      const from = groups.current[a]?.position;
      const to = groups.current[b]?.position;
      if (from && to) {
        position.setXYZ(segment * 2, from.x, from.y, from.z);
        position.setXYZ(segment * 2 + 1, to.x, to.y, to.z);
      }
    }
    const from = groups.current[1]?.position;
    const to = groups.current[2]?.position;
    if (from && to) {
      focusPosition.setXYZ(0, from.x, from.y, from.z);
      focusPosition.setXYZ(1, to.x, to.y, to.z);
    }
    position.needsUpdate = true;
    focusPosition.needsUpdate = true;
    const relationships = smoothstep(rangeProgress(p, 0.61, 0.76));
    if (relationshipMaterial.current)
      relationshipMaterial.current.opacity = relationships * (1 - uncertainty * 0.65) * 0.46;
    if (focusMaterial.current)
      focusMaterial.current.opacity = relationships * (1 - uncertainty) * 0.72;
  });

  return (
    <>
      <pointLight ref={filmLight} color="#B2D5DD" intensity={0} distance={7} decay={2} />
      {NEURO_IMAGE_IDS.map((id, index) => {
        const texture = textures[index];
        const bitmap = texture?.image as ImageBitmap | undefined;
        const aspect = bitmap ? bitmap.width / bitmap.height : 1;
        return (
          <group
            key={id}
            ref={(group) => {
              groups.current[index] = group;
            }}
          >
            {texture && (
              <mesh scale={[2.7 * aspect, 2.7, 1]}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial
                  ref={(material) => {
                    imageMaterials.current[index] = material;
                  }}
                  map={texture}
                  alphaMap={texture}
                  side={DoubleSide}
                  toneMapped={false}
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </mesh>
            )}
            <lineSegments geometry={corner} scale={[aspect * 0.871, 0.944, 1]}>
              <lineBasicMaterial
                ref={(material) => {
                  markMaterials.current[index] = material;
                }}
                color={index === 2 ? '#F2E8D5' : '#9CC6C5'}
                transparent
                opacity={0}
                depthWrite={false}
              />
            </lineSegments>
          </group>
        );
      })}
      <lineSegments geometry={lineGeometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={relationshipMaterial}
          color="#A9D4D4"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
      <lineSegments geometry={focusGeometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={focusMaterial}
          color="#8B1E2D"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
    </>
  );
}
