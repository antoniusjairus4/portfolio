'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type Group,
  MeshStandardMaterial,
  PlaneGeometry,
  type PointLight,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';
import { getCategoryOpacity, getSkillRecognition } from '@/components/skills/skillsChoreography';
import { identityAnchor } from '@/components/skills/skillsSpatial';
import { type SkillIdentity, skillIdentities } from '@/content/skillIdentities';
import type { ChapterProgressController } from '@/experience/chapterProgress';

function useIdentityAtlas(portrait: boolean) {
  const [atlas, setAtlas] = useState<Texture | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    let active = true;
    setAtlas(null);
    const texture = new TextureLoader().load(
      `/skills/marks/identities${portrait ? '-portrait' : ''}.webp`,
      (loaded) => {
        if (!active) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = SRGBColorSpace;
        loaded.anisotropy = 2;
        setAtlas(loaded);
        invalidate();
      },
      undefined,
      () => {
        if (active) invalidate();
      },
    );
    return () => {
      active = false;
      texture.dispose();
    };
  }, [portrait, invalidate]);
  return atlas;
}

function IdentityMark({
  identity,
  domain,
  skill,
  atlasIndex,
  atlas,
  portrait,
  controller,
}: {
  identity: SkillIdentity;
  domain: number;
  skill: number;
  atlasIndex: number;
  atlas: Texture;
  portrait: boolean;
  controller: ChapterProgressController;
}) {
  const mark = useRef<Group>(null);
  const position = useMemo(
    () => identityAnchor(domain, skill, portrait),
    [domain, skill, portrait],
  );
  const face = useMemo(() => {
    const geometry = new PlaneGeometry(
      portrait ? 1.65 : identity.id === 'dsa' ? 1.9 : 1.75,
      portrait ? 1.65 : identity.id === 'dsa' ? 1.9 : 1.75,
    );
    const uv = geometry.attributes.uv;
    // Tile has a 32px gutter. Sample only its 192px content, so mipmaps never
    // pick up another brand. Keep the atlas shared, with no per-mark texture clones.
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(
        i,
        ((atlasIndex % 4) * 256 + 32 + uv.getX(i) * 192) / 1024,
        1 - (Math.floor(atlasIndex / 4) * 256 + 32 + (1 - uv.getY(i)) * 192) / 2048,
      );
    }
    return geometry;
  }, [atlasIndex, portrait, identity.id]);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        map: atlas,
        emissiveMap: atlas,
        emissive: '#ffffff',
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0,
        alphaTest: 0.015,
        depthWrite: false,
        roughness: identity.treatment === 'stamp' ? 0.88 : 0.55,
        metalness: 0.08,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
    [atlas, identity.treatment],
  );
  useEffect(
    () => () => {
      face.dispose();
      material.dispose();
    },
    [face, material],
  );
  useFrame(() => {
    const focus = getSkillRecognition(
      controller.progress.current,
      domain,
      skill,
      skillIdentities[domain].length,
    );
    const presence = getCategoryOpacity(controller.progress.current, domain) * focus;
    if (mark.current) {
      mark.current.visible = presence > 0.005;
      mark.current.rotation.y = portrait
        ? 0
        : (skill % 2 ? -1 : 1) *
          (0.05 + (identity.treatment === 'junction' ? (1 - focus) * 0.18 : 0.06));
    }
    if (mark.current) mark.current.scale.setScalar(0.96 + focus * 0.04);
    material.opacity = presence;
    material.emissiveIntensity = 0.28 + focus * 0.48;
    material.color.setScalar(0.78 + focus * 0.22);
  });

  return (
    <group ref={mark} position={position}>
      <mesh
        name={`skills-logo-${domain}-${skill}`}
        geometry={face}
        material={material}
        dispose={null}
      />
    </group>
  );
}

export function SkillIdentitySystem({
  controller,
  portrait,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  const atlas = useIdentityAtlas(portrait);
  const response = useRef<PointLight>(null);
  const identities = useMemo(() => {
    let atlasIndex = 0;
    return skillIdentities.flatMap((domainIdentities, domain) =>
      domainIdentities.map((identity, skill) => ({
        identity,
        domain,
        skill,
        atlasIndex: atlasIndex++,
      })),
    );
  }, []);
  useFrame(() => {
    const light = response.current;
    if (!light) return;
    let strongest = 0;
    for (const entry of identities) {
      const focus =
        getSkillRecognition(
          controller.progress.current,
          entry.domain,
          entry.skill,
          skillIdentities[entry.domain].length,
        ) * getCategoryOpacity(controller.progress.current, entry.domain);
      if (focus > strongest) {
        strongest = focus;
        const position = identityAnchor(entry.domain, entry.skill, portrait);
        light.position.set(position[0], position[1] + 0.35, position[2] + 0.6);
        light.color.set(entry.identity.color);
      }
    }
    light.intensity = strongest * (portrait ? 1.8 : 3);
  });
  return (
    <>
      <pointLight ref={response} intensity={0} distance={4.2} decay={2} />
      {atlas &&
        identities.map((entry) => (
          <IdentityMark
            key={entry.identity.id}
            {...entry}
            atlas={atlas}
            portrait={portrait}
            controller={controller}
          />
        ))}
    </>
  );
}
