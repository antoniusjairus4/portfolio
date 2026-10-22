'use client';

import { useEffect, useMemo } from 'react';
import { SKILLS_REGIONS } from '@/components/skills/skillsSpatial';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { SkillsBoulevard } from './SkillsBoulevard';
import { SkillsLandscape } from './SkillsLandscape';
import { useSkillsMaterials } from './SkillsMaterials';
import type { Point } from './SkillsStructure';
import type { SkillsPointerState } from './skillsInteraction';
import { createSkillsRibbon } from './skillsRibbon';

type RoadFinish = 'floor' | 'landscape' | 'metal';

function Ribbon({
  points,
  width,
  thickness,
  offset = 0,
  lift = 0,
  finish,
  portrait,
}: {
  points: Point[];
  width: number;
  thickness: number;
  offset?: number;
  lift?: number;
  finish: RoadFinish;
  portrait: boolean;
}) {
  const resources = useSkillsMaterials();
  const geometry = useMemo(
    () =>
      createSkillsRibbon(
        points.map((point) => [point[0], point[1] + lift, point[2]]),
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
      name={`skills-${finish}-ribbon`}
      geometry={geometry}
      material={resources.surfaces[finish]}
      castShadow={finish === 'landscape' && !portrait}
      receiveShadow
      dispose={null}
    />
  );
}

export function SkillsArchitecture({
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
  const lastRegion = SKILLS_REGIONS[SKILLS_REGIONS.length - 1];
  const path = useMemo(
    (): Point[] => [
      [0, -0.35, 24],
      ...SKILLS_REGIONS.map((region) => [region.x, region.y - 0.35, region.z + 8] as Point),
      [lastRegion.x + 1.5, lastRegion.y - 0.35, lastRegion.z - 34],
    ],
    [lastRegion],
  );

  return (
    <group name="skills-night-road-world">
      <Ribbon points={path} width={3.15} thickness={0.18} finish="floor" portrait={portrait} />
      {[-1, 1].map((side) => (
        <Ribbon
          key={`shoulder-${side}`}
          points={path}
          width={portrait ? 1.5 : 2.2}
          thickness={0.28}
          offset={side * (portrait ? 2.3 : 2.7)}
          lift={-0.17}
          finish="landscape"
          portrait={portrait}
        />
      ))}
      {[-1, 1].map((side) => (
        <Ribbon
          key={`terrain-${side}`}
          points={path}
          width={portrait ? 3.4 : 5.8}
          thickness={0.55}
          offset={side * (portrait ? 4.7 : 6.7)}
          lift={-0.48}
          finish="landscape"
          portrait={portrait}
        />
      ))}
      {[-1, 1].map((side) => (
        <Ribbon
          key={`curb-${side}`}
          points={path}
          width={0.12}
          thickness={0.14}
          offset={side * 1.65}
          lift={-0.015}
          finish="metal"
          portrait={portrait}
        />
      ))}
      <SkillsLandscape portrait={portrait} pointer={pointer} interactive={interactive} />
      <SkillsBoulevard
        controller={controller}
        portrait={portrait}
        pointer={pointer}
        interactive={interactive}
      />
    </group>
  );
}
