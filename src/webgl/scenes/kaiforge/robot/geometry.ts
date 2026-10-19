import {
  BoxGeometry,
  type BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Shape,
  TorusGeometry,
  Vector2,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { RobotMaterialKey } from './materials';
import { FOREARM_LENGTH, GRIP_TO_BLADE, UPPER_LENGTH } from './pose';

export type RobotPart = Partial<Record<RobotMaterialKey, BufferGeometry>>;
type Point = [number, number];
const plate = (points: Point[], depth: number, bevel = 0.008) => {
  const shape = new Shape(points.map(([x, y]) => new Vector2(x, y)));
  return new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 32,
  }).translate(0, 0, -depth / 2);
};
const disk = (radius: number, depth: number, segments = 48) =>
  new CylinderGeometry(radius, radius, depth, segments).rotateX(Math.PI / 2);

class Part {
  private parts = new Map<RobotMaterialKey, BufferGeometry[]>();
  add(material: RobotMaterialKey, geometry: BufferGeometry, x = 0, y = 0, z = 0) {
    geometry.translate(x, y, z);
    const list = this.parts.get(material) ?? [];
    list.push(geometry);
    this.parts.set(material, list);
    return this;
  }
  finish(): RobotPart {
    const output: RobotPart = {};
    for (const [material, pieces] of this.parts) {
      const flat = pieces.map((geometry) => (geometry.index ? geometry.toNonIndexed() : geometry));
      output[material] = mergeGeometries(flat);
      for (const geometry of new Set([...pieces, ...flat])) geometry.dispose();
    }
    return output;
  }
}

/** Stepped journal, inset end caps and a narrow warm gasket; all details merged by material. */
function journal(radius: number, depth: number) {
  const part = new Part();
  const profile = [
    [0, -depth / 2],
    [radius * 0.82, -depth / 2],
    [radius * 0.96, -depth / 2 + 0.018],
    [radius, -depth / 2 + 0.035],
    [radius, depth / 2 - 0.035],
    [radius * 0.96, depth / 2 - 0.018],
    [radius * 0.82, depth / 2],
    [0, depth / 2],
  ];
  part.add(
    'shell',
    new LatheGeometry(
      profile.map(([r, y]) => new Vector2(r, y)),
      48,
    ).rotateX(Math.PI / 2),
  );
  for (const side of [-1, 1]) {
    const z = side * (depth / 2 + 0.004);
    part.add('recess', disk(radius * 0.79, 0.009), 0, 0, z);
    part.add('bearing', disk(radius * 0.59, 0.014), 0, 0, z + side * 0.007);
    part.add('separator', new TorusGeometry(radius * 0.68, 0.005, 6, 48), 0, 0, z + side * 0.007);
    part.add('recess', disk(radius * 0.16, 0.016, 6), 0, 0, z + side * 0.018);
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI / 4 + (i * Math.PI) / 2;
      part.add(
        'recess',
        disk(0.009, 0.006, 6),
        Math.cos(angle) * radius * 0.43,
        Math.sin(angle) * radius * 0.43,
        z + side * 0.017,
      );
    }
  }
  return part.finish();
}

export function createRobotGeometry() {
  const base = new Part();
  // Low chamfered footprint and an offset, tapering cast pedestal; no humanoid torso.
  base.add(
    'shell',
    plate(
      [
        [-0.31, -0.22],
        [0.24, -0.22],
        [0.32, -0.14],
        [0.32, 0.14],
        [0.24, 0.22],
        [-0.31, 0.22],
        [-0.36, 0.14],
        [-0.36, -0.14],
      ],
      0.07,
      0.016,
    ).rotateX(-Math.PI / 2),
    0,
    0.055,
  );
  base.add('recess', new BoxGeometry(0.56, 0.025, 0.35), -0.02, 0.015);
  base.add(
    'shell',
    plate(
      [
        [-0.22, 0.12],
        [0.18, 0.12],
        [0.13, 0.53],
        [0.05, 0.64],
        [-0.12, 0.6],
        [-0.2, 0.4],
      ],
      0.29,
      0.025,
    ),
  );
  base.add(
    'recess',
    plate(
      [
        [-0.15, 0.18],
        [0.11, 0.18],
        [0.07, 0.49],
        [-0.1, 0.45],
      ],
      0.004,
      0.005,
    ),
    0,
    0,
    0.174,
  );
  base.add('bearing', new CylinderGeometry(0.174, 0.19, 0.065, 48), 0, 0.595);
  base.add('separator', new CylinderGeometry(0.177, 0.177, 0.009, 48), 0, 0.624);

  const upper = new Part();
  const armOutline: Point[] = [
    [0.06, -0.09],
    [UPPER_LENGTH - 0.08, -0.065],
    [UPPER_LENGTH + 0.015, -0.01],
    [UPPER_LENGTH - 0.065, 0.09],
    [0.18, 0.135],
    [0.025, 0.07],
  ];
  for (const side of [-1, 1]) {
    upper.add('shell', plate(armOutline, 0.042, 0.014), 0, 0, side * 0.087);
    upper.add(
      'recess',
      plate(
        [
          [0.18, -0.045],
          [0.52, -0.025],
          [0.56, 0.035],
          [0.19, 0.08],
        ],
        0.004,
        0.006,
      ),
      0,
      0,
      side * 0.124,
    );
  }
  upper.add('bearing', new BoxGeometry(0.055, 0.105, 0.13), 0.19, 0.015);
  upper.add('bearing', new BoxGeometry(0.045, 0.08, 0.13), 0.51, 0.01);

  const forearm = new Part();
  forearm.add(
    'shell',
    plate(
      [
        [0.03, -0.095],
        [FOREARM_LENGTH - 0.06, -0.05],
        [FOREARM_LENGTH + 0.008, -0.018],
        [FOREARM_LENGTH + 0.008, 0.035],
        [0.12, 0.12],
        [0.015, 0.06],
      ],
      0.13,
      0.018,
    ),
  );
  for (const side of [-1, 1]) {
    forearm.add(
      'recess',
      plate(
        [
          [0.17, -0.045],
          [0.52, -0.017],
          [0.56, 0.025],
          [0.17, 0.073],
        ],
        0.004,
        0.005,
      ),
      0,
      0,
      side * 0.087,
    );
    forearm.add('separator', new BoxGeometry(0.012, 0.1, 0.005), 0.13, 0.015, side * 0.089);
  }

  const paddle = new Part();
  const outline = new Shape();
  outline.absellipse(0, GRIP_TO_BLADE, 0.0775, 0.0825, 0, Math.PI * 2, false, 0);
  const blade = (depth: number) =>
    new ExtrudeGeometry(outline, {
      depth,
      bevelEnabled: false,
      curveSegments: 48,
      steps: 1,
    }).translate(0, 0, -depth / 2);
  paddle.add('separator', blade(0.008));
  paddle.add('rubber', blade(0.001).scale(0.98, 1, 1), 0, 0, 0.0045);
  paddle.add('rubber', blade(0.001).scale(0.98, 1, 1), 0, 0, -0.0045);
  paddle.add(
    'bearing',
    plate(
      [
        [-0.018, -0.03],
        [0.018, -0.03],
        [0.013, 0.09],
        [-0.013, 0.09],
      ],
      0.018,
      0.004,
    ),
  );
  paddle.add(
    'recess',
    plate(
      [
        [-0.036, -0.035],
        [0.036, -0.035],
        [0.031, 0.026],
        [-0.031, 0.026],
      ],
      0.068,
      0.008,
    ),
    0,
    0,
    -0.017,
  );
  paddle.add('bearing', disk(0.021, 0.008, 32), 0, 0, 0.03);

  const parts = {
    base: base.finish(),
    shoulder: journal(0.176, 0.285),
    upper: upper.finish(),
    elbow: journal(0.135, 0.245),
    forearm: forearm.finish(),
    wrist: journal(0.067, 0.155),
    paddle: paddle.finish(),
  };
  return {
    parts,
    dispose() {
      for (const part of Object.values(parts))
        for (const geometry of Object.values(part)) geometry.dispose();
    },
  };
}
