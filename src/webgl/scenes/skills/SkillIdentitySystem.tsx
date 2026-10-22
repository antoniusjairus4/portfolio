'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type Group,
  MathUtils,
  MeshStandardMaterial,
  PlaneGeometry,
  type PointLight,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector3,
} from 'three';
import { getSkillRecognition } from '@/components/skills/skillsChoreography';
import {
  identityAnchor,
  SKILLS_REGIONS,
  skillAnchor,
  skillBillboardScale,
  skillFocusProgress,
} from '@/components/skills/skillsSpatial';
import { type SkillIdentity, skillIdentities } from '@/content/skillIdentities';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { useSkillsMaterials } from './SkillsMaterials';
import type { SkillsPointerState } from './skillsInteraction';

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
  pointer,
  interactive,
}: {
  identity: SkillIdentity;
  domain: number;
  skill: number;
  atlasIndex: number;
  atlas: Texture | null;
  portrait: boolean;
  controller: ChapterProgressController;
  pointer: SkillsPointerState;
  interactive: boolean;
}) {
  const mark = useRef<Group>(null);
  const installation = useRef<Group>(null);
  const hover = useRef(0);
  const projection = useMemo(() => new Vector3(), []);
  const resources = useSkillsMaterials();
  const label = useMemo(() => skillAnchor(domain, skill, portrait), [domain, skill, portrait]);
  const casing = useMemo(() => {
    const backing = resources.surfaces.technical.clone();
    backing.color.set('#070c10');
    backing.metalness = 0.1;
    backing.envMapIntensity = 0.04;
    backing.roughness = 0.76;
    backing.transparent = true;
    backing.emissive.set('#141d23');
    const mounting = resources.surfaces.metal.clone();
    mounting.color.set('#756f65');
    mounting.metalness = 0.32;
    mounting.roughness = 0.46;
    mounting.transparent = true;
    mounting.emissive.set('#6f5437');
    const light = resources.surfaces.light.clone();
    light.color.set('#2d241a');
    light.emissive.set('#d8aa68');
    light.transparent = true;
    return { backing, mounting, light };
  }, [resources]);
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
  const billboardScale = skillBillboardScale(portrait);
  const face = useMemo(() => {
    const size = (identity.id === 'dsa' ? 1.9 : portrait ? 1.65 : 1.75) * billboardScale;
    const geometry = new PlaneGeometry(size, size);
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
  }, [atlasIndex, portrait, identity.id, billboardScale]);
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
        opacity: 0.28,
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
  useFrame((state, delta) => {
    const focus = getSkillRecognition(
      controller.progress.current,
      domain,
      skill,
      skillIdentities[domain].length,
    );
    if (mark.current) {
      mark.current.visible = true;
      mark.current.rotation.y = 0;
    }
    // Existence and illumination are deliberately independent. Every installation
    // remains a solid world object while scroll proximity controls its light.
    if (installation.current) installation.current.visible = true;
    for (const surface of Object.values(casing)) {
      surface.opacity = 1;
      surface.depthWrite = true;
    }
    let pointerNear = 0;
    if (interactive && pointer.current.active && focus > 0.12) {
      projection.set(...position).project(state.camera);
      if (projection.z > -1 && projection.z < 1) {
        const dx = pointer.current.ndc.x - projection.x;
        const dy = pointer.current.ndc.y - projection.y;
        pointerNear = Math.max(0, 1 - Math.hypot(dx, dy) / 0.34);
      }
    }
    hover.current = MathUtils.damp(hover.current, pointerNear, 10, delta);
    casing.light.emissive.set('#d8aa68');
    casing.light.emissiveIntensity = 0.05 + focus * 1.34;
    casing.backing.emissiveIntensity = 0.1 + focus * 0.16;
    casing.mounting.emissiveIntensity = 0.015 + focus * 0.22;
    material.opacity = atlas ? 0.18 + focus * 0.82 : 0;
    material.emissiveIntensity = 0.12 + focus * 1.38 + hover.current * 0.08;
    material.color.setScalar(1);
  });

  const width = (portrait ? 3.45 : 3.7) * billboardScale;
  const floor = SKILLS_REGIONS[domain].y - 0.42;
  const bottom = label[1] - 1.15 * billboardScale;
  const supportHeight = Math.max(0.25, bottom - floor);
  return (
    <group name={`skills-exhibit-${domain}-${skill}`} ref={installation}>
      <group name="skills-exhibit-structure">
        <mesh
          geometry={resources.geometry}
          material={casing.backing}
          position={[label[0], label[1] + 0.85 * billboardScale, label[2] - 0.18 * billboardScale]}
          scale={[width, 4 * billboardScale, 0.36 * billboardScale]}
          receiveShadow
          dispose={null}
        />
        {[-1, 1].map((side) => (
          <mesh
            key={`side-${side}`}
            geometry={resources.geometry}
            material={casing.light}
            position={[
              label[0] + side * (width / 2 + 0.045 * billboardScale),
              label[1] + 0.85 * billboardScale,
              label[2] + 0.05 * billboardScale,
            ]}
            scale={[0.055 * billboardScale, 4.14 * billboardScale, 0.46 * billboardScale]}
            dispose={null}
          />
        ))}
        {[-1, 1].map((edge) => (
          <mesh
            key={`edge-${edge}`}
            geometry={resources.geometry}
            material={casing.light}
            position={[
              label[0],
              label[1] + 0.85 * billboardScale + edge * 2.045 * billboardScale,
              label[2] + 0.05 * billboardScale,
            ]}
            scale={[width + 0.1 * billboardScale, 0.05 * billboardScale, 0.46 * billboardScale]}
            dispose={null}
          />
        ))}
        {[-1, 1].map((side) => (
          <mesh
            key={`post-${side}`}
            geometry={resources.geometry}
            material={casing.mounting}
            position={[
              label[0] + side * width * 0.31,
              floor + supportHeight / 2,
              label[2] - 0.28 * billboardScale,
            ]}
            scale={[0.1 * billboardScale, supportHeight, 0.16 * billboardScale]}
            dispose={null}
          />
        ))}
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
  pointer,
  interactive,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
  pointer: SkillsPointerState;
  interactive: boolean;
}) {
  const atlas = useIdentityAtlas(portrait);
  const response = useRef<PointLight>(null);
  const groundSpill = useRef<PointLight>(null);
  const destinationHint = useRef<PointLight>(null);
  const identities = useMemo(() => {
    let atlasIndex = 0;
    return skillIdentities.flatMap((domainIdentities, domain) =>
      domainIdentities.map((identity, skill) => ({
        identity,
        domain,
        skill,
        atlasIndex: atlasIndex++,
        progress: skillFocusProgress(domain, skill),
      })),
    );
  }, []);
  useFrame(() => {
    const light = response.current;
    const spill = groundSpill.current;
    const hint = destinationHint.current;
    if (!light || !spill || !hint) return;
    const p = controller.progress.current;
    let strongest = 0;
    for (const entry of identities) {
      const focus = getSkillRecognition(
        p,
        entry.domain,
        entry.skill,
        skillIdentities[entry.domain].length,
      );
      if (focus > strongest) {
        strongest = focus;
        const position = identityAnchor(entry.domain, entry.skill, portrait);
        light.position.set(
          position[0],
          position[1] + (portrait ? 0.12 : 0.35),
          position[2] + (portrait ? 0.2 : 1.4),
        );
        light.color.set('#ffe7c4');
        spill.position.set(
          position[0],
          SKILLS_REGIONS[entry.domain].y - 0.18,
          position[2] + (portrait ? 0.18 : 0.7),
        );
      }
    }
    light.intensity = strongest * (portrait ? 18 : 28);
    spill.intensity = strongest * (portrait ? 3.8 : 6.5);

    const next = identities.find((entry) => entry.progress > p + 0.008);
    if (next) {
      const approach = 1 - Math.min(1, Math.max(0, (next.progress - p) / 0.075));
      const position = identityAnchor(next.domain, next.skill, portrait);
      hint.position.set(
        position[0],
        position[1] - (portrait ? 0.05 : 0.15),
        position[2] + (portrait ? 0.25 : 1.7),
      );
      hint.intensity = approach * approach * (portrait ? 1.8 : 3.5);
    } else {
      hint.intensity = 0;
    }
  });
  return (
    <>
      <pointLight ref={response} color="#ffd39a" intensity={0} distance={8.5} decay={2} />
      <pointLight
        ref={groundSpill}
        color="#e5b675"
        intensity={0}
        distance={portrait ? 4.5 : 6.5}
        decay={1.8}
      />
      <pointLight ref={destinationHint} color="#dfb278" intensity={0} distance={6} decay={2} />
      {identities.map((entry) => (
        <IdentityMark
          key={entry.identity.id}
          {...entry}
          atlas={atlas}
          portrait={portrait}
          controller={controller}
          pointer={pointer}
          interactive={interactive}
        />
      ))}
    </>
  );
}
