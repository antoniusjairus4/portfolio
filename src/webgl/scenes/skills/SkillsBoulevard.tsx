'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, type PointLight, Vector3 } from 'three';
import { getSkillsCategoryIndex } from '@/components/skills/skillsChoreography';
import { SKILLS_REGIONS, skillAnchor } from '@/components/skills/skillsSpatial';
import { skillCategories } from '@/content/skills';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { useSkillsMaterials } from './SkillsMaterials';
import { type Member, Members, member } from './SkillsStructure';
import { useSkillsWind } from './SkillsWind';
import type { SkillsPointerState } from './skillsInteraction';

const METAL = '#242b2b';

export function SkillsBoulevard({
  portrait,
  controller,
  pointer,
  interactive,
}: {
  portrait: boolean;
  controller: ChapterProgressController;
  pointer: SkillsPointerState;
  interactive: boolean;
}) {
  const pool = useRef<PointLight>(null);
  const hover = useRef(0);
  const projection = useMemo(() => new Vector3(), []);
  const resources = useSkillsMaterials();
  const wind = useSkillsWind();
  const fixtures = useMemo(() => {
    const pieces: Member[] = [];
    const lenses: { key: string; position: [number, number, number] }[] = [];
    skillCategories.forEach((category, domain) => {
      const region = SKILLS_REGIONS[domain];
      const anchor = skillAnchor(domain, Math.floor(category.skills.length / 2), portrait);
      const side = domain % 2 ? -1 : 1;
      const x = region.x + side * (portrait ? 4.4 : 5.7);
      const floor = region.y - 0.42;
      const height = portrait ? 4.25 : 5;
      const z = anchor[2] + ((domain % 3) - 1) * 2.1;
      lenses.push({
        key: category.key,
        position: [x - side * 1.2, floor + height - 0.18, z],
      });
      pieces.push(member([x, floor + height / 2, z], [0.1, height, 0.1], METAL));
      pieces.push(member([x - side * 0.62, floor + height - 0.05, z], [1.32, 0.1, 0.2], METAL));
      pieces.push(member([x - side * 1.2, floor + height - 0.1, z], [0.58, 0.12, 0.38], METAL));
    });
    return { pieces, lenses };
  }, [portrait]);
  const lensMaterials = useMemo(
    () => fixtures.lenses.map(() => resources.surfaces.light.clone()),
    [fixtures.lenses, resources],
  );
  useEffect(
    () => () => {
      lensMaterials.forEach((material) => {
        material.dispose();
      });
    },
    [lensMaterials],
  );

  useFrame((state, delta) => {
    if (!pool.current) return;
    const domain = getSkillsCategoryIndex(controller.progress.current);
    projection.set(...fixtures.lenses[domain].position).project(state.camera);
    const dx = pointer.current.ndc.x - projection.x;
    const dy = pointer.current.ndc.y - projection.y;
    const pointerNear =
      interactive && pointer.current.active && projection.z > -1 && projection.z < 1
        ? Math.max(0, 1 - Math.hypot(dx, dy) / 0.4)
        : 0;
    const nextHover = MathUtils.damp(hover.current, pointerNear, 9, delta);
    if (Math.abs(nextHover - hover.current) > 0.00001) state.invalidate();
    hover.current = nextHover;
    const lightBreath =
      1 + Math.sin(wind.current.time * 0.19 + domain * 0.73) * 0.014 * wind.current.strength;
    lensMaterials.forEach((material, index) => {
      material.emissiveIntensity =
        (index === domain ? 0.82 + hover.current * 0.22 : 0.16) * lightBreath;
    });
    pool.current.position.set(...fixtures.lenses[domain].position);
    pool.current.intensity = (portrait ? 5.8 : 7.8) * (1 + hover.current * 0.16) * lightBreath;
    pool.current.distance = 13.5 + hover.current * 0.9;
  });

  return (
    <group name="skills-roadside-lighting">
      <Members pieces={fixtures.pieces} />
      {fixtures.lenses.map((fixture, index) => (
        <mesh
          key={`streetlight-lens-${fixture.key}`}
          name={`skills-streetlight-lens-${fixture.key}`}
          geometry={resources.geometry}
          material={lensMaterials[index]}
          position={fixture.position}
          scale={[0.48, 0.03, 0.3]}
          dispose={null}
        />
      ))}
      <pointLight
        ref={pool}
        name="skills-streetlight-pool"
        color="#e8b773"
        intensity={0}
        distance={13.5}
        decay={1.72}
      />
    </group>
  );
}
