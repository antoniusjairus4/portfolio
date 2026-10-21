import { CatmullRomCurve3, Vector3 } from 'three';
import { SKILLS_CENTERS, clamp01, smoothstep } from './skillsChoreography';

// All systems share this continuous structural datum. Regions overlap along Z;
// neither the route nor the buildings reset at a domain boundary.
export const SKILLS_REGIONS = [
  { x: 0, y: 0, z: 0 },
  { x: 1.6, y: 0.2, z: -16 },
  { x: 0.4, y: -1.6, z: -32 },
  { x: -1.1, y: -1.2, z: -48 },
  { x: 0.8, y: -0.2, z: -64 },
  { x: 0, y: 1, z: -80 },
] as const;

const ROUTE_TIMES = [0, ...SKILLS_CENTERS, 1];

export function createSkillsRoute(portrait: boolean) {
  const positions = SKILLS_REGIONS.map(
    (region, index) =>
      new Vector3(
        region.x + (portrait ? 0 : [0.35, -0.55, 0.35, 0, -0.45, 0.3][index]),
        region.y + (portrait ? 3.6 : 3.1),
        region.z + (portrait ? 12.8 : 10.5),
      ),
  );
  const targets = SKILLS_REGIONS.map(
    (region) => new Vector3(region.x, region.y + (portrait ? 2.2 : 2.35), region.z - 5),
  );
  return {
    camera: new CatmullRomCurve3(
      [
        positions[0].clone().add(new Vector3(0, 0.5, 4)),
        ...positions,
        positions[5].clone().add(new Vector3(0, 0.6, -4)),
      ],
      false,
      'catmullrom',
      0.3,
    ),
    target: new CatmullRomCurve3(
      [
        targets[0].clone().add(new Vector3(0, 0, 4)),
        ...targets,
        targets[5].clone().add(new Vector3(0, 0.3, -4)),
      ],
      false,
      'catmullrom',
      0.3,
    ),
  };
}

export function routeParameter(progress: number) {
  const p = clamp01(progress);
  for (let i = 0; i < ROUTE_TIMES.length - 1; i++) {
    if (p <= ROUTE_TIMES[i + 1]) {
      return (
        (i + (p - ROUTE_TIMES[i]) / (ROUTE_TIMES[i + 1] - ROUTE_TIMES[i])) /
        (ROUTE_TIMES.length - 1)
      );
    }
  }
  return 1;
}

// Non-overlapping construction windows: exactly one structural operation at a time.
export function assemblyProgress(progress: number, domain: number) {
  const seam = domain === 0 ? 0.025 : (SKILLS_CENTERS[domain - 1] + SKILLS_CENTERS[domain]) / 2;
  return smoothstep((progress - (seam - 0.03)) / 0.065);
}

export function skillAnchor(
  domain: number,
  skill: number,
  portrait: boolean,
): [number, number, number] {
  const region = SKILLS_REGIONS[domain];
  if (portrait) {
    // Portrait uses a clear central recognition lane, with depth separation.
    // Scroll reveals one inscription at a time rather than shrinking a desktop list.
    return [region.x, region.y + 1.4, region.z - 4 - skill * 0.28];
  }
  // Positions follow the particular structural operation, not a repeated label grid.
  // Foundations/intersections → layers → lower routes → openings → forks → spans.
  const anchors: [number, number, number][][] = [
    [
      [-3.8, 4.4, -5],
      [2.9, 4.1, -6],
      [-1.5, 2.1, -4],
      [3.4, 1.3, -7],
      [-3.4, 0.3, -8],
    ],
    [
      [-3.4, 4.1, -6],
      [3.4, 4.9, -7],
      [-4.2, 2.3, -7],
      [3.9, 2.5, -8],
      [-2.4, 0.7, -5],
      [2.7, 0.4, -10],
    ],
    [
      [-3, 3.7, -5],
      [2.8, 2.8, -6],
      [-3.4, 0.6, -8],
      [3.8, 0.3, -9],
    ],
    [
      [-2.8, 4.1, -5],
      [2.4, 2.6, -7],
      [-2.2, 0.7, -9],
    ],
    [
      [-3.5, 4.1, -6],
      [3.4, 4.1, -6],
      [-4, 1.8, -8],
      [3.8, 1.4, -9],
      [0, 0.4, -11],
    ],
    [
      [-3.6, 4.5, -6],
      [3.4, 3.7, -7],
      [-3.1, 1.4, -8],
      [3.6, 0.7, -10],
    ],
  ];
  const anchor = anchors[domain][skill];
  return [region.x + anchor[0], region.y + anchor[1], region.z + anchor[2]];
}

export function identityAnchor(
  domain: number,
  skill: number,
  portrait: boolean,
): [number, number, number] {
  const anchor = skillAnchor(domain, skill, portrait);
  return [
    anchor[0] + (portrait ? 0 : skill % 2 ? 0.25 : -0.25),
    anchor[1] + (portrait ? 1.6 : 1.05),
    anchor[2] - 0.18,
  ];
}
