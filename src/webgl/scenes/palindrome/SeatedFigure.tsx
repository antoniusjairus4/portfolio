import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, type RefObject, useEffect, useMemo, useRef } from 'react';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  TubeGeometry,
  Vector3,
} from 'three';
import { ROOM_PALETTE } from './palette';
import { rangeProgress, smoothstep } from '@/components/palindrome/palindromeChoreography';

type Point = [number, number, number];
type Section = { y: number; x?: number; z: number; width: number; depth: number };

// Closed elliptical cross-sections give the silhouette a waist, rib cage,
// shoulders and jaw without a skeleton, imported model or anatomical detail.
function silhouette(sections: Section[], sides: number, facialPlanes = false) {
  const positions: number[] = [];
  const indices: number[] = [];
  sections.forEach((section, row) => {
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const front = Math.cos(angle);
      positions.push(
        (section.x ?? 0) + Math.sin(angle) * section.width,
        section.y,
        section.z + (facialPlanes ? Math.min(front, 0.91) : front) * section.depth,
      );
      if (row < sections.length - 1) {
        const a = row * sides + i;
        const b = row * sides + ((i + 1) % sides);
        indices.push(a, b, a + sides, b, b + sides, a + sides);
      }
    }
  });
  for (const end of [0, sections.length - 1]) {
    const section = sections[end];
    const center = positions.length / 3;
    positions.push(section.x ?? 0, section.y, section.z);
    for (let i = 0; i < sides; i++) {
      const a = end * sides + i;
      const b = end * sides + ((i + 1) % sides);
      indices.push(...(end === 0 ? [center, b, a] : [center, a, b]));
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function limb(points: Point[], radii: number[], flattenY = 1) {
  const curve = new CatmullRomCurve3(points.map((point) => new Vector3(...point)));
  const segments = 24;
  const sides = 12;
  const geometry = new TubeGeometry(curve, segments, 1, sides, false);
  const positions = geometry.attributes.position;
  const center = new Vector3();
  for (let ring = 0; ring <= segments; ring++) {
    const t = ring / segments;
    curve.getPoint(t, center);
    const interval = Math.min(radii.length - 2, Math.floor(t * (radii.length - 1)));
    const blend = t * (radii.length - 1) - interval;
    const radius = radii[interval] + (radii[interval + 1] - radii[interval]) * blend;
    for (let side = 0; side <= sides; side++) {
      const index = ring * (sides + 1) + side;
      positions.setXYZ(
        index,
        center.x + (positions.getX(index) - center.x) * radius,
        center.y + (positions.getY(index) - center.y) * radius * flattenY,
        center.z + (positions.getZ(index) - center.z) * radius,
      );
    }
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function clothPlanes(geometry: BufferGeometry, shadow: string, light: string) {
  const dark = new Color(shadow);
  const edge = new Color(light);
  const color = new Color();
  const normals = geometry.attributes.normal;
  const colors = new Float32Array(normals.count * 3);
  for (let i = 0; i < normals.count; i++) {
    // Tonal fabric panels preserve the Ink identity while separating the limbs.
    const facing = Math.max(0, normals.getZ(i)) * 0.65 + Math.max(0, normals.getY(i)) * 0.35;
    color.copy(dark).lerp(edge, facing);
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}

function noseProfile() {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      [
        0, 0.065, 0.112, -0.026, -0.052, 0.115, 0.026, -0.052, 0.115, 0, -0.028, 0.183, 0, -0.065,
        0.136,
      ],
      3,
    ),
  );
  geometry.setIndex([0, 1, 3, 0, 3, 2, 1, 4, 3, 3, 4, 2, 0, 2, 1, 1, 2, 4]);
  geometry.computeVertexNormals();
  return geometry;
}

export function SeatedFigure({
  headAnchorRef,
  interiorProgress,
}: {
  headAnchorRef?: RefObject<Group | null>;
  interiorProgress?: MutableRefObject<number>;
}) {
  const headMaterials = useRef<(MeshStandardMaterial | null)[]>([]);
  const headMeshes = useRef<(Mesh | null)[]>([]);
  useFrame(() => {
    if (!interiorProgress) return;
    const opening = smoothstep(rangeProgress(interiorProgress.current, 0.49, 0.74));
    headMeshes.current.forEach((mesh) => {
      if (mesh) mesh.castShadow = opening < 0.01;
    });
    headMaterials.current.forEach((material) => {
      if (!material) return;
      material.opacity = 1 - opening;
      material.depthWrite = opening < 0.01;
      material.emissiveIntensity = Math.sin(opening * Math.PI) * 0.12;
    });
  });
  const forms = useMemo(() => {
    const torso = clothPlanes(
      silhouette(
        [
          { y: 0.73, z: -0.065, width: 0.22, depth: 0.15 },
          { y: 0.83, z: -0.055, width: 0.205, depth: 0.145 },
          { y: 0.99, z: -0.025, width: 0.19, depth: 0.13 },
          { y: 1.17, z: 0.025, width: 0.225, depth: 0.15 },
          { y: 1.34, z: 0.065, width: 0.255, depth: 0.155 },
          { y: 1.415, z: 0.085, width: 0.245, depth: 0.135 },
          { y: 1.465, z: 0.095, width: 0.155, depth: 0.11 },
          { y: 1.485, z: 0.1, width: 0.09, depth: 0.09 },
        ],
        20,
      ),
      '#111111',
      '#30383B',
    );
    const pelvis = clothPlanes(
      silhouette(
        [
          { y: 0.605, z: -0.035, width: 0.2, depth: 0.16 },
          { y: 0.65, z: -0.025, width: 0.25, depth: 0.18 },
          { y: 0.73, z: -0.04, width: 0.25, depth: 0.18 },
          { y: 0.8, z: -0.055, width: 0.215, depth: 0.145 },
        ],
        16,
      ),
      '#131718',
      '#293134',
    );
    const head = silhouette(
      [
        { y: -0.205, z: 0.035, width: 0.058, depth: 0.065 },
        { y: -0.165, z: 0.015, width: 0.104, depth: 0.092 },
        { y: -0.095, z: -0.005, width: 0.138, depth: 0.116 },
        { y: 0, z: -0.018, width: 0.16, depth: 0.139 },
        { y: 0.095, z: -0.024, width: 0.154, depth: 0.143 },
        { y: 0.17, z: -0.03, width: 0.124, depth: 0.118 },
        { y: 0.215, z: -0.03, width: 0.065, depth: 0.065 },
        { y: 0.23, z: -0.03, width: 0.012, depth: 0.012 },
      ],
      20,
      true,
    );
    const neck = limb(
      [
        [0, 1.435, 0.09],
        [0, 1.535, 0.115],
        [-0.008, 1.65, 0.14],
      ],
      [0.08, 0.067, 0.074],
    );
    const arms = [
      limb(
        [
          [-0.23, 1.405, 0.09],
          [-0.305, 1.31, 0.12],
          [-0.36, 1.19, 0.2],
          [-0.365, 1.2, 0.37],
          [-0.34, 1.2, 0.54],
        ],
        [0.105, 0.093, 0.083, 0.074, 0.056],
      ),
      limb(
        [
          [0.23, 1.4, 0.09],
          [0.33, 1.32, 0.15],
          [0.39, 1.2, 0.25],
          [0.33, 1.205, 0.4],
          [0.245, 1.2, 0.55],
        ],
        [0.105, 0.093, 0.083, 0.074, 0.056],
      ),
    ].map((geometry) => clothPlanes(geometry, '#191F22', '#39464D'));
    const hands = [
      limb(
        [
          [-0.34, 1.2, 0.535],
          [-0.345, 1.19, 0.61],
          [-0.34, 1.185, 0.695],
        ],
        [0.052, 0.066, 0.014],
        0.48,
      ),
      limb(
        [
          [0.245, 1.2, 0.545],
          [0.21, 1.19, 0.62],
          [0.185, 1.185, 0.7],
        ],
        [0.052, 0.066, 0.014],
        0.48,
      ),
    ];
    const legs = [-1, 1].map((side) =>
      clothPlanes(
        limb(
          [
            [side * 0.15, 0.71, 0.01],
            [side * 0.18, 0.65, 0.24],
            [side * 0.2, 0.575, 0.43],
            [side * 0.21, 0.36, 0.44],
            [side * 0.21, 0.12, 0.43],
          ],
          [0.135, 0.127, 0.112, 0.085, 0.065],
        ),
        '#111516',
        '#2C3437',
      ),
    );
    const shoes = [-1, 1].map((side) =>
      limb(
        [
          [side * 0.21, 0.09, 0.37],
          [side * 0.21, 0.085, 0.49],
          [side * 0.21, 0.075, 0.66],
        ],
        [0.066, 0.092, 0.025],
        0.6,
      ),
    );
    return { torso, pelvis, head, neck, nose: noseProfile(), arms, hands, legs, shoes };
  }, []);

  useEffect(
    () => () => {
      for (const value of Object.values(forms)) {
        if (Array.isArray(value)) value.forEach((geometry) => geometry.dispose());
        else value.dispose();
      }
    },
    [forms],
  );

  return (
    <group>
      {[forms.pelvis, forms.torso, ...forms.arms, ...forms.legs].map((geometry) => (
        <mesh key={geometry.uuid} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.9} />
        </mesh>
      ))}
      <mesh geometry={forms.neck} castShadow receiveShadow>
        <meshStandardMaterial color="#C8BDA6" roughness={0.92} />
      </mesh>
      <group
        name="Palindrome_Head"
        ref={headAnchorRef}
        position={[-0.008, 1.8, 0.14]}
        rotation={[0.1, -0.13, -0.035]}
      >
        <mesh
          ref={(mesh) => {
            headMeshes.current[0] = mesh;
          }}
          geometry={forms.head}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            ref={(material) => {
              headMaterials.current[0] = material;
            }}
            color={ROOM_PALETTE.ceramic}
            roughness={0.9}
            transparent={!!interiorProgress}
            emissive="#9BC4C5"
            emissiveIntensity={0}
          />
        </mesh>
        <mesh
          ref={(mesh) => {
            headMeshes.current[1] = mesh;
          }}
          geometry={forms.nose}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            ref={(material) => {
              headMaterials.current[1] = material;
            }}
            color={ROOM_PALETTE.ceramic}
            roughness={0.9}
            transparent={!!interiorProgress}
            emissive="#9BC4C5"
            emissiveIntensity={0}
          />
        </mesh>
      </group>
      {forms.hands.map((geometry) => (
        <mesh key={geometry.uuid} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color="#D5C8AF" roughness={0.92} />
        </mesh>
      ))}
      {forms.shoes.map((geometry) => (
        <mesh key={geometry.uuid} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color={ROOM_PALETTE.ink} roughness={0.86} />
        </mesh>
      ))}
    </group>
  );
}
