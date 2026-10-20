import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  Color,
  Float32BufferAttribute,
  type Group,
  type Mesh,
  type MeshPhysicalMaterial,
  SphereGeometry,
} from 'three';
import { rangeProgress, smoothstep } from '@/components/neuroshield/neuroShieldChoreography';

type BrainAnatomyProps = {
  progress: MutableRefObject<number>;
  ending?: boolean;
  presence?: MutableRefObject<number>;
};

const LOBES = [
  { id: 'left-cerebrum', position: [-0.82, 0.15, 0.12], scale: [0.83, 0.92, 1.34], phase: 0.2 },
  { id: 'right-cerebrum', position: [0.82, 0.15, 0.12], scale: [0.83, 0.92, 1.34], phase: 1.2 },
  { id: 'left-temporal', position: [-0.82, -0.55, 0.62], scale: [0.75, 0.44, 0.77], phase: 2.1 },
  { id: 'right-temporal', position: [0.82, -0.55, 0.62], scale: [0.75, 0.44, 0.77], phase: 2.9 },
] as const;

const IVORY = new Color('#DED9C7');
const ICE = new Color('#9BC4C5');
const CYAN = new Color('#6EA7AE');
const POSTERIOR = new Color('#798DA9');
const SUPERIOR = new Color('#A4BDCF');
const AMBER = new Color('#D3A45E');
const CRIMSON = new Color('#8B1E2D');
const BLUE = new Color('#6D8FA8');

function gaussian(
  x: number,
  y: number,
  z: number,
  cx: number,
  cy: number,
  cz: number,
  spread: number,
) {
  const dx = x - cx;
  const dy = y - cy;
  const dz = z - cz;
  return Math.exp(-(dx * dx + dy * dy + dz * dz) / spread);
}

type Surface = {
  geometry: SphereGeometry;
  shade: Float32Array;
  cyan: Float32Array;
  posterior: Float32Array;
  amber: Float32Array;
  crimson: Float32Array;
};

function makeSurface(index: number, phase: number): Surface {
  const geometry = new SphereGeometry(1, 72, 52);
  const position = geometry.attributes.position;
  const count = position.count;
  const shade = new Float32Array(count);
  const cyan = new Float32Array(count);
  const posterior = new Float32Array(count);
  const amber = new Float32Array(count);
  const crimson = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const directionA = y * 15.4 + Math.sin(x * 7.2 + phase) * 2.6 + z * 5.1;
    const directionB = x * 17.1 + Math.sin(y * 9.5 + phase * 2) * 2.2 - z * 6.4;
    const sulcusA = Math.max(0, Math.sin(directionA)) ** 9;
    const sulcusB = Math.max(0, Math.sin(directionB)) ** 11;
    const broken = 0.68 + 0.32 * Math.sin(x * 8.7 + y * 11.3 + phase);
    const groove = Math.min(1, sulcusA * broken * 0.75 + sulcusB * (1 - broken * 0.35) * 0.45);
    const lowForm =
      0.018 * Math.sin(x * 6.7 + z * 3.2 + phase) + 0.015 * Math.cos(y * 7.8 - z * 5.1);
    const radius = 1 + lowForm - groove * (index < 2 ? 0.048 : 0.03);
    position.setXYZ(i, x * radius, y * radius, z * radius);
    shade[i] = 1 - groove * 0.27 + lowForm * 0.5;

    // Broad illustrative regional colour: warm anterior, cyan temporal,
    // pale blue superior surfaces and a subdued posterior violet-blue.
    cyan[i] =
      index >= 2 ? 0.68 : gaussian(x, y, z, index === 0 ? -0.55 : 0.55, -0.38, 0.12, 0.58) * 0.55;
    posterior[i] = gaussian(x, y, z, 0, 0.08, -0.82, 0.7) * 0.64;
    amber[i] = index >= 2 ? 0.06 : gaussian(x, y, z, 0, 0.25, 0.85, 0.5) * 0.12;
    if (index === 1) crimson[i] = gaussian(x, y, z, 0.25, 0.38, 0.89, 0.085) * 0.7;
    colors[i * 3] = IVORY.r * shade[i];
    colors[i * 3 + 1] = IVORY.g * shade[i];
    colors[i * 3 + 2] = IVORY.b * shade[i];
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return { geometry, shade, cyan, posterior, amber, crimson };
}

function mixChannel(base: number, target: number, weight: number) {
  return base + (target - base) * weight;
}

export function BrainAnatomy({ progress, ending = false, presence }: BrainAnatomyProps) {
  const group = useRef<Group>(null);
  const lobeMaterials = useRef<(MeshPhysicalMaterial | null)[]>([]);
  const lobeMeshes = useRef<(Mesh | null)[]>([]);
  const supportMaterials = useRef<(MeshPhysicalMaterial | null)[]>([]);
  const surfaces = useMemo(() => LOBES.map((lobe, index) => makeSurface(index, lobe.phase)), []);
  useEffect(
    () => () => {
      surfaces.forEach((surface) => surface.geometry.dispose());
    },
    [surfaces],
  );

  useFrame(() => {
    const p = progress.current;
    const chapterReveal = ending
      ? smoothstep(rangeProgress(p, 0.79, 0.95))
      : 1 - smoothstep(rangeProgress(p, 0.25, 0.47));
    const reveal = chapterReveal * (presence?.current ?? 1);
    const cyanReveal = ending ? 0.7 : 0.72 + 0.28 * smoothstep(rangeProgress(p, 0.12, 0.27));
    const posteriorReveal = ending ? 0.7 : 0.78 + 0.22 * smoothstep(rangeProgress(p, 0.18, 0.32));
    const amberReveal = ending ? 0.45 : 0.65;
    const internalReveal = ending ? 0.55 : smoothstep(rangeProgress(p, 0.25, 0.39));
    const crimsonFocus = ending
      ? 0
      : smoothstep(rangeProgress(p, 0.27, 0.34)) * (1 - smoothstep(rangeProgress(p, 0.38, 0.46)));
    const imagingTransition = ending ? 0.44 : smoothstep(rangeProgress(p, 0.35, 0.46));

    if (group.current) {
      group.current.visible = reveal > 0.005;
      group.current.rotation.y = ending
        ? -0.18 + 0.24 * smoothstep(rangeProgress(p, 0.82, 1))
        : -0.33 + 0.78 * smoothstep(rangeProgress(p, 0, 0.39));
      group.current.rotation.x = ending
        ? -0.08
        : 0.04 + 0.14 * smoothstep(rangeProgress(p, 0.12, 0.38));
      group.current.scale.setScalar(
        ending ? 1.05 : 1 + 0.13 * smoothstep(rangeProgress(p, 0, 0.34)),
      );
    }
    if (reveal <= 0.005) return;

    surfaces.forEach((surface, index) => {
      const material = lobeMaterials.current[index];
      if (!material) return;
      const unresolvedGap = ending && (index === 2 || index === 1) ? 0.33 : 1;
      const assembly = presence
        ? smoothstep(rangeProgress(presence.current, index * 0.13, 0.58 + index * 0.13))
        : 1;
      material.opacity = reveal * assembly * unresolvedGap * (1 - imagingTransition * 0.36) * 0.97;
      material.depthWrite = material.opacity > 0.88;
      if (lobeMeshes.current[index]) lobeMeshes.current[index].castShadow = material.opacity > 0.85;
      const color = surface.geometry.attributes.color;
      for (let vertex = 0; vertex < color.count; vertex++) {
        const shade = surface.shade[vertex];
        const cool = surface.cyan[vertex] * cyanReveal;
        const posterior = surface.posterior[vertex] * posteriorReveal;
        const amber = surface.amber[vertex] * amberReveal;
        const crimson = surface.crimson[vertex] * crimsonFocus;
        let r = IVORY.r;
        let g = IVORY.g;
        let b = IVORY.b;
        r = mixChannel(r, CYAN.r, cool);
        g = mixChannel(g, CYAN.g, cool);
        b = mixChannel(b, CYAN.b, cool);
        r = mixChannel(r, POSTERIOR.r, posterior);
        g = mixChannel(g, POSTERIOR.g, posterior);
        b = mixChannel(b, POSTERIOR.b, posterior);
        r = mixChannel(r, AMBER.r, amber);
        g = mixChannel(g, AMBER.g, amber);
        b = mixChannel(b, AMBER.b, amber);
        r = mixChannel(r, CRIMSON.r, crimson);
        g = mixChannel(g, CRIMSON.g, crimson);
        b = mixChannel(b, CRIMSON.b, crimson);
        r = mixChannel(r, ICE.r, imagingTransition * 0.29);
        g = mixChannel(g, ICE.g, imagingTransition * 0.29);
        b = mixChannel(b, ICE.b, imagingTransition * 0.29);
        const superior = Math.max(0, surface.geometry.attributes.position.getY(vertex)) * 0.3;
        r = mixChannel(r, SUPERIOR.r, superior);
        g = mixChannel(g, SUPERIOR.g, superior);
        b = mixChannel(b, SUPERIOR.b, superior);
        color.setXYZ(vertex, r * shade, g * shade, b * shade);
      }
      color.needsUpdate = true;
    });

    supportMaterials.current.forEach((material, index) => {
      if (!material) return;
      material.opacity = reveal * (ending ? 0.4 : 0.6 + internalReveal * 0.2);
      material.color.copy(IVORY).lerp(index === 0 ? BLUE : AMBER, index === 0 ? 0.4 : 0.16);
    });
  });

  return (
    <group ref={group} position={ending ? [0, 1.8, -30] : [0.2, 1.8, -2.2]}>
      {LOBES.map((lobe, index) => (
        <mesh
          key={lobe.id}
          ref={(mesh) => {
            lobeMeshes.current[index] = mesh;
          }}
          geometry={surfaces[index].geometry}
          position={lobe.position}
          scale={lobe.scale}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            ref={(material) => {
              lobeMaterials.current[index] = material;
            }}
            color="#ffffff"
            vertexColors
            roughness={index < 2 ? 0.62 : 0.7}
            sheen={0.16}
            sheenColor="#A2C4D0"
            sheenRoughness={0.86}
            metalness={0}
            transparent
            opacity={1}
            depthWrite
            clearcoat={0.045}
            clearcoatRoughness={0.93}
            emissive="#375F78"
            emissiveIntensity={0.11}
          />
        </mesh>
      ))}
      <mesh position={[0, -0.98, -0.53]} scale={[0.33, 0.62, 0.36]} receiveShadow>
        <sphereGeometry args={[1, 24, 18]} />
        <meshPhysicalMaterial
          ref={(material) => {
            supportMaterials.current[0] = material;
          }}
          color="#D8CCB9"
          roughness={0.86}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -0.78, -1.14]} scale={[0.73, 0.44, 0.56]} receiveShadow>
        <sphereGeometry args={[1, 24, 18]} />
        <meshPhysicalMaterial
          ref={(material) => {
            supportMaterials.current[1] = material;
          }}
          color="#D6C4A9"
          roughness={0.91}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
