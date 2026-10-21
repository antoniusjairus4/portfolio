import { CatmullRomCurve3, Vector3 } from 'three';
import { skillCategories } from '@/content/skills';
import { clamp01, SKILLS_CENTERS, smoothstep } from './skillsChoreography';

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

// Presentation points are authored against the camera at each recognition peak.
// They stay fixed in world space; scroll moves through them rather than carrying
// a carousel alongside the lens. The central sightline is reserved by architecture.
export function skillFocusProgress(domain: number, skill: number) {
  const start = domain === 0 ? 0.025 : (SKILLS_CENTERS[domain - 1] + SKILLS_CENTERS[domain]) / 2;
  const end = domain === 5 ? 0.978 : (SKILLS_CENTERS[domain] + SKILLS_CENTERS[domain + 1]) / 2;
  return start + ((skill + 0.5) / skillCategories[domain].skills.length) * (end - start);
}

const routes = [createSkillsRoute(false), createSkillsRoute(true)];
export function skillAnchor(
  domain: number,
  skill: number,
  portrait: boolean,
): [number, number, number] {
  const route = routes[portrait ? 1 : 0];
  const t = routeParameter(skillFocusProgress(domain, skill));
  const eye = route.camera.getPoint(t);
  const forward = route.target.getPoint(t).sub(eye).normalize();
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
  const up = new Vector3().crossVectors(right, forward).normalize();
  const lateral = portrait
    ? skill % 2
      ? 0.22
      : -0.22
    : [-1.9, 1.9, -1.1, 1.65, -1.65, 1.15][skill];
  return eye
    .addScaledVector(forward, 11.5)
    .addScaledVector(right, lateral)
    .addScaledVector(up, portrait ? -0.9 : -0.5)
    .toArray() as [number, number, number];
}

export function identityAnchor(
  domain: number,
  skill: number,
  portrait: boolean,
): [number, number, number] {
  const anchor = skillAnchor(domain, skill, portrait);
  return [anchor[0], anchor[1] + 1.65, anchor[2]];
}
