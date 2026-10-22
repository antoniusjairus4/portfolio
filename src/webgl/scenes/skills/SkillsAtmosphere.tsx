'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  DodecahedronGeometry,
  type Group,
  type InstancedMesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PointsMaterial,
  ShaderMaterial,
  SphereGeometry,
} from 'three';
import { SKILLS_REGIONS } from '@/components/skills/skillsSpatial';

const SKY_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vec3 horizon = vec3(0.085, 0.188, 0.245);
    vec3 middle = vec3(0.028, 0.086, 0.135);
    vec3 zenith = vec3(0.008, 0.026, 0.052);
    float height = smoothstep(0.08, 0.9, vUv.y);
    vec3 color = mix(horizon, middle, smoothstep(0.02, 0.38, height));
    color = mix(color, zenith, smoothstep(0.38, 1.0, height));
    float horizonHaze = exp(-pow((vUv.y - 0.45) * 7.0, 2.0));
    color += vec3(0.026, 0.038, 0.042) * horizonHaze;
    gl_FragColor = vec4(color, 1.0);
  }
`;

type StarTier = 'dim' | 'medium' | 'bright';

type Cloud = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  rotation: number;
  layer: number;
  speed: number;
};

type Instance = {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
};

function seeded(index: number) {
  return Math.abs(Math.sin(index * 91.173 + 17.31) * 43758.5453) % 1;
}

function createStars(count: number, tier: StarTier) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new Color();
  const seedOffset = tier === 'bright' ? 601 : tier === 'medium' ? 307 : 11;
  for (let index = 0; index < count; index++) {
    const azimuth = seeded(index * 4 + seedOffset) * Math.PI * 2;
    const elevation = 0.04 + seeded(index * 4 + seedOffset + 6) ** 1.45 * 0.78;
    const radius = 102 + seeded(index * 4 + 29) * 24;
    positions[index * 3] = Math.cos(azimuth) * Math.cos(elevation) * radius;
    positions[index * 3 + 1] = Math.sin(elevation) * radius - 5;
    positions[index * 3 + 2] = Math.sin(azimuth) * Math.cos(elevation) * radius;
    const warmth = seeded(index * 4 + 43);
    const value =
      tier === 'bright'
        ? 0.84 + warmth * 0.13
        : tier === 'medium'
          ? 0.58 + warmth * 0.2
          : 0.38 + warmth * 0.28;
    color.setRGB(value * (0.87 + warmth * 0.13), value * 0.93, value);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return geometry;
}

function setInstances(mesh: InstancedMesh | null, instances: Instance[]) {
  if (!mesh) return;
  const transform = new Object3D();
  instances.forEach((instance, index) => {
    transform.position.set(...instance.position);
    transform.scale.set(...instance.scale);
    transform.rotation.set(...instance.rotation);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

export function SkillsAtmosphere({
  portrait,
  reducedMotion,
}: {
  portrait: boolean;
  reducedMotion: boolean;
}) {
  const sky = useRef<Group>(null);
  const cloudMeshes = useRef<(Group | null)[]>([]);
  const resources = useMemo(() => {
    const skyGeometry = new SphereGeometry(145, portrait ? 18 : 28, portrait ? 10 : 16);
    const skyMaterial = new ShaderMaterial({
      vertexShader: SKY_VERTEX,
      fragmentShader: SKY_FRAGMENT,
      side: BackSide,
      depthWrite: false,
      fog: false,
    });
    const dimStars = createStars(portrait ? 220 : 620, 'dim');
    const mediumStars = createStars(portrait ? 75 : 190, 'medium');
    const brightStars = createStars(portrait ? 14 : 34, 'bright');
    const starMaterials = [
      new PointsMaterial({
        size: portrait ? 0.2 : 0.24,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.86,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
      new PointsMaterial({
        size: portrait ? 0.31 : 0.36,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
      new PointsMaterial({
        size: portrait ? 0.44 : 0.52,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.94,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    ];
    const cloudGeometry = new SphereGeometry(1, portrait ? 8 : 12, portrait ? 5 : 7);
    const cloudMaterials = [
      ['#152c3b', 0.42],
      ['#2b4656', 0.48],
      ['#3b464e', 0.44],
    ].map(
      ([color, opacity]) =>
        new MeshBasicMaterial({
          color: color as string,
          transparent: true,
          opacity: opacity as number,
          depthWrite: false,
          fog: true,
          toneMapped: false,
        }),
    );
    const clouds: Cloud[] = [
      { x: -17, y: 8.4, z: -12, width: 34, height: 7.6, rotation: -0.08, layer: 0, speed: 0.075 },
      { x: 18, y: 7.3, z: -34, width: 16, height: 3.8, rotation: 0.1, layer: 1, speed: 0.105 },
      { x: -8, y: 8.6, z: -55, width: 18, height: 4.2, rotation: 0.035, layer: 0, speed: 0.065 },
      { x: 22, y: 6.8, z: -76, width: 14, height: 3.2, rotation: -0.12, layer: 2, speed: 0.13 },
      { x: -23, y: 8.2, z: -97, width: 17, height: 3.8, rotation: 0.08, layer: 1, speed: 0.095 },
      { x: 7, y: 9.1, z: -118, width: 36, height: 7.8, rotation: -0.025, layer: 0, speed: 0.06 },
      { x: -17, y: 7.1, z: -139, width: 15, height: 3.4, rotation: 0.13, layer: 2, speed: 0.12 },
      { x: 20, y: 8.2, z: -158, width: 18, height: 4, rotation: -0.09, layer: 1, speed: 0.085 },
    ].filter((_, index) => !portrait || index % 2 === 0);
    const ridgeGeometry = new DodecahedronGeometry(1, 0);
    const ridgeMaterial = new MeshStandardMaterial({
      color: '#132a31',
      roughness: 1,
      emissive: '#0a1c23',
      emissiveIntensity: 0.34,
    });
    const ridges: Instance[] = SKILLS_REGIONS.flatMap((region, domain) =>
      [-1, 1].map((side, index) => ({
        position: [
          region.x + side * (portrait ? 13 : 19 + index * 2.5),
          region.y - 1.5,
          region.z - 10 - index * 8,
        ],
        scale: [portrait ? 7 : 10.5, 3.2 + (domain % 2) * 0.7, 9 + index * 2],
        rotation: [0, domain * 0.54 + index * 0.7, 0],
      })),
    );
    const treeLineGeometry = new ConeGeometry(1, 1, 5);
    const treeLineMaterial = new MeshStandardMaterial({
      color: '#10251f',
      roughness: 1,
      emissive: '#081713',
      emissiveIntensity: 0.24,
    });
    const treeLine: Instance[] = SKILLS_REGIONS.flatMap((region, domain) =>
      [-1, 1].flatMap((side) =>
        Array.from({ length: portrait ? 2 : 4 }, (_, index) => ({
          position: [
            region.x + side * (portrait ? 9.5 + index * 1.5 : 12.5 + index * 2.1),
            region.y + 0.35 + (index % 2) * 0.3,
            region.z - 7 - index * 4.2,
          ],
          scale: [1.2 + (index % 2) * 0.4, 4 + (domain % 3) * 0.4, 1.2],
          rotation: [0, index * 0.31, 0],
        })),
      ),
    );
    const lightGeometry = new SphereGeometry(1, 6, 4);
    const lightMaterial = new MeshBasicMaterial({
      color: '#dba15f',
      transparent: true,
      opacity: 0.88,
      toneMapped: false,
      fog: true,
    });
    const distantLights: Instance[] = SKILLS_REGIONS.flatMap((region) =>
      Array.from({ length: portrait ? 2 : 4 }, (_, index) => {
        const side = index % 2 ? -1 : 1;
        const size = index % 3 === 0 ? 0.1 : 0.075;
        return {
          position: [
            region.x + side * (portrait ? 8.5 : 12 + index * 1.7),
            region.y + 0.18 + (index % 3) * 0.15,
            region.z - 8 - index * 3.8,
          ],
          scale: [size, size, size * 0.8],
          rotation: [0, 0, 0],
        };
      }),
    );
    return {
      skyGeometry,
      skyMaterial,
      dimStars,
      mediumStars,
      brightStars,
      starMaterials,
      cloudGeometry,
      cloudMaterials,
      clouds,
      ridgeGeometry,
      ridgeMaterial,
      ridges,
      treeLineGeometry,
      treeLineMaterial,
      treeLine,
      lightGeometry,
      lightMaterial,
      distantLights,
    };
  }, [portrait]);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(invalidate, 80);
    return () => window.clearInterval(timer);
  }, [invalidate, reducedMotion]);

  useEffect(
    () => () => {
      resources.skyGeometry.dispose();
      resources.skyMaterial.dispose();
      resources.dimStars.dispose();
      resources.mediumStars.dispose();
      resources.brightStars.dispose();
      resources.starMaterials.forEach((material) => {
        material.dispose();
      });
      resources.cloudGeometry.dispose();
      resources.cloudMaterials.forEach((material) => {
        material.dispose();
      });
      resources.ridgeGeometry.dispose();
      resources.ridgeMaterial.dispose();
      resources.treeLineGeometry.dispose();
      resources.treeLineMaterial.dispose();
      resources.lightGeometry.dispose();
      resources.lightMaterial.dispose();
    },
    [resources],
  );

  useFrame((state) => {
    if (sky.current) sky.current.position.set(state.camera.position.x, 0, state.camera.position.z);
    const time = reducedMotion ? 0 : state.clock.elapsedTime;
    resources.clouds.forEach((cloud, index) => {
      const mesh = cloudMeshes.current[index];
      if (!mesh) return;
      const span = 88;
      const moved = cloud.x + time * cloud.speed;
      mesh.position.x = ((((moved + span / 2) % span) + span) % span) - span / 2;
    });
  });

  return (
    <group name="skills-night-atmosphere">
      <group ref={sky} name="skills-sky-field">
        <mesh
          name="skills-night-sky"
          geometry={resources.skyGeometry}
          material={resources.skyMaterial}
          renderOrder={-100}
        />
        <points
          name="skills-stars-dim"
          geometry={resources.dimStars}
          material={resources.starMaterials[0]}
          renderOrder={-90}
        />
        <points
          name="skills-stars-medium"
          geometry={resources.mediumStars}
          material={resources.starMaterials[1]}
          renderOrder={-89}
        />
        <points
          name="skills-stars-bright"
          geometry={resources.brightStars}
          material={resources.starMaterials[2]}
          renderOrder={-88}
        />
      </group>
      <group name="skills-moving-clouds">
        {resources.clouds.map((cloud, index) => (
          <group
            key={`cloud-${cloud.z}-${cloud.layer}`}
            ref={(group) => {
              cloudMeshes.current[index] = group;
            }}
            name={`skills-cloud-${index}`}
            position={[cloud.x, cloud.y, cloud.z]}
            rotation={[0, 0, cloud.rotation]}
          >
            {[
              [-0.34, -0.08, 0.27, 0.2, 0.8],
              [-0.16, 0.08, 0.3, 0.26, 1.25],
              [0.04, 0.14, 0.35, 0.3, 0.95],
              [0.25, 0.06, 0.29, 0.24, 1.15],
              [0.4, -0.1, 0.22, 0.17, 0.85],
              [0.05, -0.12, 0.42, 0.16, 1.4],
            ].map(([x, y, width, height, depth], lobe) => (
              <mesh
                key={`${cloud.z}-lobe-${x}-${y}`}
                geometry={resources.cloudGeometry}
                material={resources.cloudMaterials[cloud.layer]}
                position={[x * cloud.width, y * cloud.height, -lobe * 0.07]}
                scale={[width * cloud.width, height * cloud.height, depth]}
                renderOrder={-20 + cloud.layer}
              />
            ))}
          </group>
        ))}
      </group>
      <instancedMesh
        name="skills-distant-ridges"
        ref={(mesh) => setInstances(mesh, resources.ridges)}
        args={[resources.ridgeGeometry, resources.ridgeMaterial, resources.ridges.length]}
      />
      <instancedMesh
        name="skills-distant-tree-line"
        ref={(mesh) => setInstances(mesh, resources.treeLine)}
        args={[resources.treeLineGeometry, resources.treeLineMaterial, resources.treeLine.length]}
      />
      <instancedMesh
        name="skills-distant-warm-lights"
        ref={(mesh) => setInstances(mesh, resources.distantLights)}
        args={[resources.lightGeometry, resources.lightMaterial, resources.distantLights.length]}
      />
    </group>
  );
}
