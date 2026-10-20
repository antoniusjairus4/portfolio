import { useEffect, useMemo } from 'react';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rangeProgress, smoothstep } from '@/components/palindrome/palindromeChoreography';

export const HUMAN_SKIN = '#BDA18B';
type Point = [number, number, number];

function ellipsoid(position: Point, scale: Point) {
  const geometry = new SphereGeometry(1, 24, 16);
  geometry.scale(...scale);
  geometry.translate(...position);
  return geometry;
}

function stroke(points: Point[], radius: number) {
  return new TubeGeometry(
    new CatmullRomCurve3(points.map((point) => new Vector3(...point))),
    20,
    radius,
    6,
    false,
  );
}

function surface(rows: number, sides: number, point: (t: number, angle: number) => Point) {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let side = 0; side <= sides; side++) {
      positions.push(...point(row / rows, (side / sides) * Math.PI * 2));
      if (row < rows && side < sides) {
        const a = row * (sides + 1) + side;
        indices.push(a, a + 1, a + sides + 1, a + 1, a + sides + 2, a + sides + 1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function face() {
  const outline = new CatmullRomCurve3([
    new Vector3(0.008, -0.207, 0.018),
    new Vector3(0.065, -0.188, 0.068),
    new Vector3(0.103, -0.15, 0.092),
    new Vector3(0.13, -0.09, 0.115),
    new Vector3(0.151, -0.025, 0.139),
    new Vector3(0.153, 0.055, 0.142),
    new Vector3(0.143, 0.125, 0.136),
    new Vector3(0.11, 0.19, 0.104),
    new Vector3(0.055, 0.224, 0.052),
    new Vector3(0.001, 0.235, 0.001),
  ]);
  const sample = new Vector3();
  return surface(48, 64, (t, angle) => {
    outline.getPoint(t, sample);
    const x = Math.sin(angle) * sample.x;
    const y = sample.y;
    const forward = Math.cos(angle);
    const center = -0.022 + 0.046 * (1 - smoothstep(rangeProgress(y, -0.19, -0.07)));
    let z = center + sample.z * forward;
    if (forward > 0) {
      const sockets = Math.exp(
        -(((Math.abs(x) - 0.061) / 0.028) ** 2 + ((y - 0.035) / 0.023) ** 2),
      );
      const cheek = Math.exp(-(((Math.abs(x) - 0.083) / 0.042) ** 2 + ((y + 0.039) / 0.037) ** 2));
      const brow = Math.exp(-(((Math.abs(x) - 0.061) / 0.038) ** 2 + ((y - 0.065) / 0.018) ** 2));
      const muzzle = Math.exp(-((x / 0.058) ** 2 + ((y + 0.105) / 0.033) ** 2));
      z += (-0.012 * sockets + 0.008 * cheek + 0.005 * brow + 0.008 * muzzle) * forward;
    }
    return [x, y, z];
  });
}

function hairPoint(t: number, angle: number, lift = 0): Point {
  const front = Math.cos(angle);
  const limit = 1.75 - 0.57 * Math.max(0, front) + 0.39 * Math.max(0, -front);
  const polar = 0.006 + t * limit;
  const texture = 0.002 * Math.sin(angle * 16 + polar * 7) * Math.sin(polar);
  return [
    Math.sin(angle) * Math.sin(polar) * (0.163 + texture + lift),
    0.043 + Math.cos(polar) * (0.207 + texture + lift),
    -0.024 + Math.cos(angle) * Math.sin(polar) * (0.153 + texture + lift),
  ];
}

function buildFeatures() {
  const skin = [face()];
  // Rounded bridge, tip and alar wings replace the old pointed wedge.
  skin.push(
    ellipsoid([0, -0.002, 0.123], [0.017, 0.057, 0.024]),
    ellipsoid([0, -0.043, 0.145], [0.023, 0.021, 0.023]),
    ellipsoid([-0.021, -0.051, 0.128], [0.013, 0.012, 0.018]),
    ellipsoid([0.021, -0.051, 0.128], [0.013, 0.012, 0.018]),
  );
  const whites: BufferGeometry[] = [];
  const iris: BufferGeometry[] = [];
  const dark: BufferGeometry[] = [];
  const lip: BufferGeometry[] = [];
  const crease: BufferGeometry[] = [];
  const hair = [surface(30, 64, (t, angle) => hairPoint(1 - t, angle))];
  const hairDetail: BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    const eyeX = side * 0.061;
    whites.push(ellipsoid([eyeX, 0.035, 0.103], [0.027, 0.0105, 0.016]));
    iris.push(ellipsoid([eyeX, 0.034, 0.118], [0.0072, 0.008, 0.002]));
    dark.push(ellipsoid([eyeX, 0.034, 0.12], [0.0034, 0.0046, 0.001]));
    skin.push(
      stroke(
        [
          [eyeX - 0.027, 0.034, 0.098],
          [eyeX - 0.014, 0.043, 0.114],
          [eyeX, 0.045, 0.117],
          [eyeX + 0.014, 0.042, 0.114],
          [eyeX + 0.027, 0.034, 0.098],
        ],
        0.0038,
      ),
      stroke(
        [
          [eyeX - 0.027, 0.034, 0.098],
          [eyeX, 0.026, 0.115],
          [eyeX + 0.027, 0.034, 0.098],
        ],
        0.003,
      ),
      ellipsoid([side * 0.151, -0.018, -0.019], [0.025, 0.051, 0.022]),
      ellipsoid([side * 0.153, -0.055, -0.008], [0.017, 0.019, 0.018]),
    );
    crease.push(ellipsoid([side * 0.161, -0.018, 0.001], [0.011, 0.029, 0.006]));
    skin.push(
      stroke(
        [
          [side * 0.153, -0.048, 0.01],
          [side * 0.169, -0.027, 0.014],
          [side * 0.17, 0.004, 0.011],
          [side * 0.158, 0.022, 0.004],
          [side * 0.145, 0.009, 0.008],
        ],
        0.004,
      ),
    );
    hair.push(
      stroke(
        [
          [eyeX - 0.028, 0.065, 0.105],
          [eyeX - 0.009, 0.071, 0.113],
          [eyeX + 0.012, 0.07, 0.111],
          [eyeX + 0.027, 0.064, 0.102],
        ],
        0.004,
      ),
    );
    crease.push(ellipsoid([side * 0.017, -0.061, 0.139], [0.0065, 0.0028, 0.003]));
  }
  lip.push(
    stroke(
      [
        [-0.039, -0.105, 0.105],
        [-0.018, -0.1, 0.119],
        [0, -0.104, 0.122],
        [0.018, -0.1, 0.119],
        [0.039, -0.105, 0.105],
      ],
      0.0035,
    ),
    stroke(
      [
        [-0.036, -0.109, 0.106],
        [0, -0.115, 0.121],
        [0.036, -0.109, 0.106],
      ],
      0.005,
    ),
  );
  crease.push(
    stroke(
      [
        [-0.035, -0.107, 0.109],
        [0, -0.108, 0.125],
        [0.035, -0.107, 0.109],
      ],
      0.0017,
    ),
  );
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    hairDetail.push(
      stroke(
        Array.from({ length: 7 }, (_, j) =>
          hairPoint(0.22 + (j / 6) * 0.73, angle + 0.15 * (1 - j / 6), 0.001),
        ),
        0.0011,
      ),
    );
  }
  const collections = [
    { parts: skin, color: HUMAN_SKIN, roughness: 0.85 },
    { parts: whites, color: '#D5CFC0', roughness: 0.65 },
    { parts: iris, color: '#54483B', roughness: 0.67 },
    { parts: dark, color: '#191817', roughness: 0.63 },
    { parts: hair, color: '#292522', roughness: 0.96 },
    { parts: hairDetail, color: '#443B32', roughness: 0.95 },
    { parts: lip, color: '#A47F70', roughness: 0.9 },
    { parts: crease, color: '#886B5C', roughness: 0.95 },
  ];
  return collections.map(({ parts, color, roughness }) => {
    parts.forEach((geometry) => geometry.deleteAttribute('uv'));
    const geometry = mergeGeometries(parts);
    parts.forEach((part) => part.dispose());
    if (!geometry) throw new Error('Unable to build human facial features');
    return {
      geometry,
      material: new MeshStandardMaterial({
        color,
        roughness,
        emissive: '#9BC4C5',
        emissiveIntensity: 0,
      }),
    };
  });
}

export function HumanHead() {
  const features = useMemo(buildFeatures, []);
  useEffect(
    () => () =>
      features.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      }),
    [features],
  );
  return (
    <group name="Palindrome_Head" position={[-0.008, 1.8, 0.14]} rotation={[0.1, -0.13, -0.035]}>
      {features.map(({ geometry, material }) => (
        <mesh
          key={geometry.uuid}
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}
