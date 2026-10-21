'use client';

import { useMemo } from 'react';
import { SKILLS_REGIONS, skillAnchor } from '@/components/skills/skillsSpatial';
import { skillCategories } from '@/content/skills';
import { type Member, Members, member } from './SkillsStructure';

const METAL = '#343a3c';
const MIDNIGHT = '#111a21';

// Sparse, instanced architectural fixtures. The real light pool follows the
// visitor in SkillsLighting; these forms make its source physically believable.
export function SkillsBoulevard({ portrait }: { portrait: boolean }) {
  const pieces = useMemo(() => {
    const result: Member[] = [];
    const add = (piece: Member) => result.push(piece);
    for (let domain = 0; domain < skillCategories.length; domain++) {
      const skills = skillCategories[domain].skills;
      const region = SKILLS_REGIONS[domain];
      const indices = portrait ? [0] : [0, skills.length - 1];
      for (const skill of [...new Set(indices)]) {
        const anchor = skillAnchor(domain, skill, portrait);
        const displaySide = anchor[0] < 0 ? -1 : 1;
        const x = displaySide * (portrait ? 4.75 : 6.25);
        const floor = region.y - 0.38;
        const height = portrait ? 4.7 : 5.5;
        const z = anchor[2] + 1.35;
        add(member([x, floor + height / 2, z], [0.12, height, 0.16], METAL));
        add(member([x - displaySide * 0.72, floor + height - 0.05, z], [1.55, 0.12, 0.28], METAL));
        add({
          ...member(
            [x - displaySide * 1.42, floor + height - 0.12, z],
            [0.62, 0.035, 0.42],
            '#000000',
          ),
          finish: 'light',
        });
      }

      // Interrupted path guidance. It establishes perspective without becoming
      // a continuous neon outline or a game-like racing line.
      for (const [index, zOffset] of [5.2, -4.2].entries()) {
        const side = (domain + index) % 2 ? -1 : 1;
        add({
          ...member(
            [region.x + side * 1.61, region.y - 0.22, region.z + zOffset],
            [0.045, 0.035, portrait ? 1.35 : 2.25],
            '#000000',
          ),
          finish: 'light',
        });
      }

      // One recessed vertical seam per district makes the parchment masses
      // readable in shadow and hints at the next zone through the darkness.
      const seamSide = domain % 2 ? -1 : 1;
      add({
        ...member(
          [region.x + seamSide * (portrait ? 5.15 : 7.1), region.y + 2.2, region.z - 3.2],
          [0.035, portrait ? 2.5 : 3.4, 0.04],
          '#000000',
        ),
        finish: 'light',
      });
    }

    if (!portrait) {
      // Tiny warm interruptions give the distant silhouettes scale. They remain
      // far outside every active landmark's protected screen-space region.
      for (let i = 0; i < 7; i++) {
        const side = i % 2 ? -1 : 1;
        add({
          ...member(
            [side * (10.5 + (i % 3) * 1.6), 4.2 + (i % 3) * 1.5, 4 - i * 15.5],
            [0.045, 1.1 + (i % 2) * 0.8, 0.05],
            '#000000',
          ),
          finish: 'light',
        });
        add(member([side * 11.5, 4.8, 4 - i * 15.5], [1.8, 6.5, 2.2], MIDNIGHT));
      }
    }
    return result;
  }, [portrait]);
  return (
    <group name="skills-night-boulevard">
      <Members pieces={pieces} />
    </group>
  );
}
