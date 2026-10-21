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
import { identityAnchor, SKILLS_REGIONS, skillAnchor } from '@/components/skills/skillsSpatial';
import { type SkillIdentity, skillIdentities } from '@/content/skillIdentities';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { useSkillsMaterials } from './SkillsMaterials';
import { ToolsLandmark } from './ToolsLandmark';

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
  const installation = useRef<Group>(null);
  const resources = useSkillsMaterials();
  const label = useMemo(() => skillAnchor(domain, skill, portrait), [domain, skill, portrait]);
  const casing = useMemo(() => {
    const backing = resources.surfaces.technical.clone();
    backing.color.set('#0d181e');
    backing.metalness = 0.05;
    backing.envMapIntensity = 0.06;
    backing.roughness = domain === 4 ? 0.8 : 0.56;
    if (domain === 4) backing.color.set('#10191d');
    backing.transparent = true;
    const mounting = resources.surfaces.metal.clone();
    mounting.color.set(domain === 4 ? '#d8cfbc' : '#a4a49a');
    mounting.transparent = true;
    const light = resources.surfaces.light.clone();
    light.transparent = true;
    return { backing, mounting, light };
  }, [resources, domain]);
  useEffect(
    () => () =>
      Object.values(casing).forEach((material) => {
        material.dispose();
      }),
    [casing],
  );
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
        emissiveIntensity: 0.6,
        color: '#000000',
        toneMapped: false,
        envMapIntensity: 0,
        transparent: true,
        opacity: 0,
        alphaTest: 0.015,
        depthWrite: false,
        roughness: identity.treatment === 'stamp' ? 0.88 : 0.55,
        metalness: 0,
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
      mark.current.rotation.y = 0;
    }
    // Illumination carries the active state; the installation never scales like a UI tile.
    if (installation.current) installation.current.visible = presence > 0.002;
    for (const surface of Object.values(casing)) {
      const solidity = Math.min(1, presence / 0.18);
      surface.opacity = solidity * solidity * (3 - 2 * solidity);
      surface.depthWrite = surface.opacity > 0.95;
    }
    casing.light.emissiveIntensity = 0.4 + focus * 2.2;
    casing.backing.emissive.set('#b5bdba');
    casing.backing.emissiveIntensity = 0.005 + focus * 0.012;
    material.opacity = presence;
    material.emissiveIntensity = 0.55 + focus * 0.45;
    material.color.setScalar(0);
  });

  const width = portrait ? 3.4 : 3.5;
  const side = skill % 2 ? 1 : -1;
  const floor = SKILLS_REGIONS[domain].y - 0.4;
  const ceiling = SKILLS_REGIONS[domain].y + 8.4;
  const suspended = skill % 3 === 1;
  const bottom = label[1] - 1.15;
  const top = label[1] + 2.85;
  const mountStart = suspended ? top : floor;
  const mountEnd = suspended ? ceiling : bottom;
  return (
    <group name={`skills-exhibit-${domain}-${skill}`} ref={installation}>
      <group name="skills-exhibit-structure">
        {domain === 4 ? (
          <ToolsLandmark label={label} skill={skill} portrait={portrait} materials={casing} />
        ) : (
          <>
            <mesh
              geometry={resources.geometry}
              material={casing.backing}
              position={[label[0], label[1] + 0.85, label[2] - 0.26]}
              scale={[width, 4, 0.4]}
              receiveShadow
              dispose={null}
            />
            <mesh
              geometry={resources.geometry}
              material={casing.mounting}
              position={[
                label[0] + side * (width / 2 + 0.06),
                (mountStart + mountEnd) / 2,
                label[2] - 0.48,
              ]}
              scale={[0.11, Math.max(0.15, mountEnd - mountStart), 0.18]}
              dispose={null}
            />
            <mesh
              geometry={resources.geometry}
              material={casing.light}
              position={[label[0] + side * (width / 2 - 0.035), label[1] + 0.85, label[2] - 0.045]}
              scale={[0.025, 4, 0.025]}
              dispose={null}
            />
            <mesh
              geometry={resources.geometry}
              material={casing.mounting}
              position={[label[0], suspended ? top + 0.05 : bottom - 0.05, label[2] - 0.26]}
              scale={[width + 0.18, 0.08, 0.48]}
              dispose={null}
            />
          </>
        )}
      </group>
      <group ref={mark} position={position}>
        <mesh
          name={`skills-logo-${domain}-${skill}`}
          geometry={face}
          material={material}
          dispose={null}
        />
      </group>
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
        light.position.set(position[0], position[1] + 0.35, position[2] + 1.4);
        light.color.set('#ffe7c4');
      }
    }
    light.intensity = strongest * (portrait ? 2 : 3);
  });
  return (
    <>
      <pointLight ref={response} intensity={0} distance={6} decay={2} />
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
