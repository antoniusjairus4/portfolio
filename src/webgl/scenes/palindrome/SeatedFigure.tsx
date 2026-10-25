import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  type Group,
  TubeGeometry,
  Vector3,
} from 'three';
import { HUMAN_SKIN, HumanHead } from './HumanHead';
import { ROOM_PALETTE } from './palette';

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

export function SeatedFigure() {
  const upperBody = useRef<Group>(null);
  const forms = useMemo(() => {
    const torso = clothPlanes(
      silhouette(
        [
          { y: 0.73, x: 0.005, z: -0.065, width: 0.22, depth: 0.15 },
          { y: 0.83, x: 0.012, z: -0.055, width: 0.205, depth: 0.145 },
          { y: 0.99, x: 0.015, z: -0.025, width: 0.19, depth: 0.13 },
          { y: 1.17, x: 0.006, z: 0.025, width: 0.225, depth: 0.15 },
          { y: 1.34, x: -0.012, z: 0.065, width: 0.255, depth: 0.155 },
          { y: 1.415, x: -0.018, z: 0.085, width: 0.245, depth: 0.135 },
          { y: 1.465, x: -0.01, z: 0.095, width: 0.155, depth: 0.11 },
          { y: 1.485, x: -0.008, z: 0.1, width: 0.09, depth: 0.09 },
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
    const neck = limb(
      [
        [-0.008, 1.435, 0.09],
        [-0.012, 1.535, 0.115],
        [-0.018, 1.65, 0.14],
      ],
      [0.08, 0.067, 0.074],
    );
    const arms = [
      limb(
        [
          [-0.24, 1.405, 0.09],
          [-0.305, 1.315, 0.125],
          [-0.355, 1.2, 0.205],
          [-0.35, 1.19, 0.37],
          [-0.34, 1.195, 0.535],
        ],
        [0.112, 0.101, 0.084, 0.071, 0.053],
      ),
      limb(
        [
          [0.23, 1.385, 0.095],
          [0.315, 1.28, 0.155],
          [0.375, 1.19, 0.26],
          [0.315, 1.195, 0.405],
          [0.24, 1.205, 0.545],
        ],
        [0.108, 0.098, 0.082, 0.07, 0.052],
      ),
    ].map((geometry) => clothPlanes(geometry, '#191F22', '#39464D'));
    const hands = [
      limb(
        [
          [-0.34, 1.2, 0.535],
          [-0.35, 1.185, 0.6],
          [-0.345, 1.175, 0.66],
        ],
        [0.049, 0.06, 0.035],
        0.5,
      ),
      limb(
        [
          [0.245, 1.2, 0.545],
          [0.215, 1.19, 0.6],
          [0.195, 1.18, 0.65],
        ],
        [0.048, 0.06, 0.036],
        0.5,
      ),
    ];
    const fingers = [
      ...[-0.39, -0.365, -0.34, -0.315].map((x, index) =>
        limb(
          [
            [x, 1.175, 0.65],
            [x + (index - 1.5) * 0.004, 1.168, 0.705],
            [x + (index - 1.5) * 0.007, 1.162, 0.75 - Math.abs(index - 1.5) * 0.01],
          ],
          [0.011, 0.01, 0.0035],
          0.78,
        ),
      ),
      ...[0.155, 0.18, 0.205, 0.23].map((x, index) =>
        limb(
          [
            [x, 1.18, 0.64],
            [x + (index - 1.5) * 0.004, 1.171, 0.69],
            [x + (index - 1.5) * 0.006, 1.163, 0.735 - Math.abs(index - 1.5) * 0.012],
          ],
          [0.011, 0.01, 0.0035],
          0.78,
        ),
      ),
      limb(
        [
          [-0.295, 1.182, 0.595],
          [-0.26, 1.175, 0.62],
          [-0.245, 1.165, 0.66],
        ],
        [0.019, 0.017, 0.004],
        0.8,
      ),
      limb(
        [
          [0.155, 1.188, 0.575],
          [0.125, 1.178, 0.6],
          [0.11, 1.168, 0.635],
        ],
        [0.019, 0.017, 0.004],
        0.8,
      ),
    ];
    const clothFolds = [
      limb(
        [
          [-0.265, 1.375, 0.185],
          [-0.29, 1.335, 0.215],
          [-0.315, 1.31, 0.23],
        ],
        [0.003, 0.005, 0.002],
      ),
      limb(
        [
          [0.26, 1.35, 0.18],
          [0.295, 1.31, 0.21],
          [0.315, 1.29, 0.225],
        ],
        [0.003, 0.005, 0.002],
      ),
      limb(
        [
          [-0.36, 1.205, 0.295],
          [-0.355, 1.195, 0.325],
          [-0.35, 1.2, 0.35],
        ],
        [0.002, 0.004, 0.002],
      ),
      limb(
        [
          [0.365, 1.205, 0.3],
          [0.345, 1.195, 0.33],
          [0.325, 1.2, 0.36],
        ],
        [0.002, 0.004, 0.002],
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
    return { torso, pelvis, neck, arms, hands, fingers, clothFolds, legs, shoes };
  }, []);

  useFrame(({ clock }) => {
    if (!upperBody.current) return;
    upperBody.current.scale.y = 1 + Math.sin(clock.elapsedTime * 1.05) * 0.006;
    upperBody.current.rotation.z = -0.006 + Math.sin(clock.elapsedTime * 0.42) * 0.004;
  });

  useEffect(
    () => () => {
      for (const value of Object.values(forms)) {
        if (Array.isArray(value))
          value.forEach((geometry) => {
            geometry.dispose();
          });
        else value.dispose();
      }
    },
    [forms],
  );

  return (
    <group>
      {[forms.pelvis, ...forms.legs].map((geometry) => (
        <mesh key={geometry.uuid} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.9} />
        </mesh>
      ))}
      <group ref={upperBody} position={[0, 1.12, 0]}>
        <group position={[0, -1.12, 0]}>
          {[forms.torso, ...forms.arms].map((geometry) => (
            <mesh key={geometry.uuid} geometry={geometry} castShadow receiveShadow>
              <meshStandardMaterial vertexColors roughness={0.9} />
            </mesh>
          ))}
          {forms.clothFolds.map((geometry) => (
            <mesh key={geometry.uuid} geometry={geometry} receiveShadow>
              <meshStandardMaterial color="#435054" roughness={1} />
            </mesh>
          ))}
          <mesh geometry={forms.neck} castShadow receiveShadow>
            <meshStandardMaterial color="#AD8D79" roughness={0.92} />
          </mesh>
          <HumanHead />
          {[...forms.hands, ...forms.fingers].map((geometry) => (
            <mesh key={geometry.uuid} geometry={geometry} castShadow receiveShadow>
              <meshStandardMaterial color={HUMAN_SKIN} roughness={0.92} />
            </mesh>
          ))}
        </group>
      </group>
      {forms.shoes.map((geometry) => (
        <mesh key={geometry.uuid} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color={ROOM_PALETTE.ink} roughness={0.86} />
        </mesh>
      ))}
    </group>
  );
}
