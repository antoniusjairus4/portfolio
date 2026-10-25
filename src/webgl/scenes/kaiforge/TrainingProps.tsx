import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  CylinderGeometry,
  type Group,
  type InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
} from 'three';
import { type Box, boxes, mergeOwned } from './geometry';
import { useKaiForgeMaterials } from './Materials';

const BASKET_POSITIONS = [
  [-3.65, 0, -1.85],
  [3.5, 0, -1.9],
] as const;
const PICKER_POSITION = [3.05, 0, 0.7] as const;

const BALL_OFFSETS = Array.from({ length: 2 * 9 * 7 }, (_, index) => {
  const layer = Math.floor(index / 63);
  const slot = index % 63;
  const column = slot % 9;
  const row = Math.floor(slot / 9);
  return [
    (column - 4) * 0.068 + (layer ? 0.025 : 0) + Math.sin(index * 5.7) * 0.004,
    0.9875 + layer * 0.043,
    (row - 3) * 0.068 + (layer ? 0.016 : 0) + Math.cos(index * 3.9) * 0.004,
  ] as const;
});

function makeCartFrame() {
  const parts: Box[] = [];
  for (const x of [-0.32, 0.32]) {
    for (const z of [-0.22, 0.22]) {
      parts.push([
        [x, 0.5, z],
        [0.025, 0.88, 0.025],
      ]);
    }
  }
  for (const z of [-0.26, 0.26]) {
    parts.push([
      [0, 1.075, z],
      [0.74, 0.014, 0.014],
    ]);
    for (let i = -3; i <= 3; i++) {
      parts.push([
        [i * 0.09, 1.065, z],
        [0.009, 0.2, 0.009],
      ]);
    }
  }
  for (const x of [-0.37, 0.37]) {
    parts.push([
      [x, 1.075, 0],
      [0.014, 0.014, 0.54],
    ]);
    for (let i = -2; i <= 2; i++) {
      parts.push([
        [x, 1.065, i * 0.09],
        [0.009, 0.2, 0.009],
      ]);
    }
  }
  parts.push([
    [0, 0.28, -0.22],
    [0.66, 0.018, 0.018],
  ]);
  parts.push([
    [0, 0.28, 0.22],
    [0.66, 0.018, 0.018],
  ]);
  return boxes(parts);
}

function makeCartRim() {
  return boxes([
    [
      [0, 1.175, -0.265],
      [0.77, 0.025, 0.025],
    ],
    [
      [0, 1.175, 0.265],
      [0.77, 0.025, 0.025],
    ],
    [
      [-0.385, 1.175, 0],
      [0.025, 0.025, 0.55],
    ],
    [
      [0.385, 1.175, 0],
      [0.025, 0.025, 0.55],
    ],
  ]);
}

function makeCartWheels() {
  return mergeOwned(
    [-0.32, 0.32].flatMap((x) =>
      [-0.22, 0.22].map((z) =>
        new CylinderGeometry(0.064, 0.064, 0.035, 10).rotateX(Math.PI / 2).translate(x, 0.065, z),
      ),
    ),
  );
}

function makePickerCage() {
  return mergeOwned(
    Array.from({ length: 12 }, (_, index) => {
      const angle = (index * Math.PI * 2) / 12;
      return new CylinderGeometry(0.007, 0.007, 0.3, 6).translate(
        Math.cos(angle) * 0.165,
        0.205,
        Math.sin(angle) * 0.165,
      );
    }),
  );
}

function BasketCart({
  frame,
  rim,
  wheels,
  pan,
  ball,
  metal,
  edge,
  dark,
  rubber,
}: {
  frame: ReturnType<typeof makeCartFrame>;
  rim: ReturnType<typeof makeCartRim>;
  wheels: ReturnType<typeof makeCartWheels>;
  pan: BoxGeometry;
  ball: SphereGeometry;
  metal: MeshStandardMaterial;
  edge: MeshStandardMaterial;
  dark: MeshStandardMaterial;
  rubber: MeshStandardMaterial;
}) {
  const { ball: ballMaterial } = useKaiForgeMaterials();
  const balls = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!balls.current) return;
    const instance = new Object3D();
    BALL_OFFSETS.forEach(([x, y, z], index) => {
      instance.position.set(x, y, z);
      instance.updateMatrix();
      balls.current?.setMatrixAt(index, instance.matrix);
    });
    balls.current.instanceMatrix.needsUpdate = true;
    balls.current.computeBoundingSphere();
  }, []);

  return (
    <group name="KF_MultiballBasket">
      <mesh geometry={frame} material={metal} castShadow receiveShadow />
      <mesh geometry={rim} material={edge} castShadow />
      <mesh geometry={pan} material={dark} position={[0, 0.955, 0]} receiveShadow />
      <mesh geometry={wheels} material={rubber} castShadow />
      <instancedMesh ref={balls} args={[ball, ballMaterial, BALL_OFFSETS.length]} />
    </group>
  );
}

function BallPicker({
  cage,
  ball,
  metal,
  edge,
  dark,
}: {
  cage: ReturnType<typeof makePickerCage>;
  ball: SphereGeometry;
  metal: MeshStandardMaterial;
  edge: MeshStandardMaterial;
  dark: MeshStandardMaterial;
}) {
  const { ball: ballMaterial } = useKaiForgeMaterials();
  return (
    <group name="KF_BallPicker">
      <mesh material={dark} position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.05, 16]} />
      </mesh>
      <mesh geometry={cage} material={metal} castShadow />
      {[0.06, 0.36].map((y) => (
        <mesh key={y} material={edge} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.17, 0.012, 6, 20]} />
        </mesh>
      ))}
      {[
        [-0.05, 0.105, 0],
        [0.055, 0.105, 0.045],
        [0, 0.146, -0.04],
      ].map(([x, y, z]) => (
        <mesh key={`${x}:${y}:${z}`} geometry={ball} material={ballMaterial} position={[x, y, z]} />
      ))}
      <mesh material={metal} position={[0, 0.98, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.021, 1.24, 10]} />
      </mesh>
      <mesh material={edge} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.09, 10]} />
      </mesh>
      <mesh material={dark} position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.034, 0.034, 0.34, 10]} />
      </mesh>
      <mesh material={edge} position={[0, 1.56, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.065, 10]} />
      </mesh>
    </group>
  );
}

function ease(a: number, b: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function TrainingProps({ bridgeProgress }: { bridgeProgress?: MutableRefObject<number> }) {
  const groups = useRef<(Group | null)[]>([]);
  const { frame, rim, wheels, pan, cage, ball, metal, edge, dark, rubber } = useMemo(
    () => ({
      frame: makeCartFrame(),
      rim: makeCartRim(),
      wheels: makeCartWheels(),
      pan: new BoxGeometry(0.72, 0.025, 0.5),
      cage: makePickerCage(),
      ball: new SphereGeometry(0.02, 8, 6),
      metal: new MeshStandardMaterial({ color: '#363631', metalness: 0.52, roughness: 0.64 }),
      edge: new MeshStandardMaterial({ color: '#a49a82', metalness: 0.52, roughness: 0.5 }),
      dark: new MeshStandardMaterial({ color: '#252723', metalness: 0.22, roughness: 0.82 }),
      rubber: new MeshStandardMaterial({ color: '#171817', roughness: 0.94 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      frame.dispose();
      rim.dispose();
      wheels.dispose();
      pan.dispose();
      cage.dispose();
      ball.dispose();
      metal.dispose();
      edge.dispose();
      dark.dispose();
      rubber.dispose();
    },
    [frame, rim, wheels, pan, cage, ball, metal, edge, dark, rubber],
  );
  useFrame(() => {
    if (!bridgeProgress) return;
    const remaining = 1 - ease(0.18, 0.54, bridgeProgress.current);
    groups.current.forEach((group) => {
      if (!group) return;
      group.scale.setScalar(Math.max(0.001, remaining));
      group.visible = remaining > 0.001;
    });
  });

  return (
    <group name="KF_TrainingProps">
      {BASKET_POSITIONS.map((position, index) => (
        <group
          key={position[0]}
          ref={(node) => {
            groups.current[index] = node;
          }}
          position={[...position]}
          rotation={[0, index === 0 ? -0.12 : 0.16, 0]}
        >
          <BasketCart
            frame={frame}
            rim={rim}
            wheels={wheels}
            pan={pan}
            ball={ball}
            metal={metal}
            edge={edge}
            dark={dark}
            rubber={rubber}
          />
        </group>
      ))}
      <group
        ref={(node) => {
          groups.current[2] = node;
        }}
        position={[...PICKER_POSITION]}
      >
        <BallPicker cage={cage} ball={ball} metal={metal} edge={edge} dark={dark} />
      </group>
    </group>
  );
}
