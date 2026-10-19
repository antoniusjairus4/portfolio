import { useEffect, useMemo } from 'react';
import { Object3D, Shape, Vector2 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { SpatialType } from './SpatialType';
import { ContactPatch, Surface } from './Surfaces';
import { DOMESTIC_SOURCES } from './sources';

type Point = readonly [number, number, number];
type Finish = 'wood' | 'paper' | 'ceramic' | 'metal' | 'fabric' | 'plaster';

export function RoundedSolid({
  position = [0, 0, 0],
  size,
  color,
  radius = 0.015,
  finish = 'wood',
}: {
  position?: Point;
  size: Point;
  color: string;
  radius?: number;
  finish?: Finish;
}) {
  const [w, h, d] = size;
  const geometry = useMemo(() => new RoundedBoxGeometry(w, h, d, 2, radius), [w, h, d, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh position={[...position]} geometry={geometry} castShadow receiveShadow>
      <Surface color={color} finish={finish} />
    </mesh>
  );
}

function Vessel({ profile, color = '#E4D7BF' }: { profile: [number, number][]; color?: string }) {
  const points = useMemo(() => profile.map(([r, y]) => new Vector2(r, y)), [profile]);
  return (
    <mesh castShadow receiveShadow>
      <latheGeometry args={[points, 32]} />
      <Surface color={color} finish="ceramic" />
    </mesh>
  );
}

const CUP: [number, number][] = [
  [0, 0.006],
  [0.1, 0.006],
  [0.116, 0.025],
  [0.137, 0.24],
  [0.137, 0.262],
  [0.124, 0.27],
  [0.115, 0.255],
  [0.102, 0.045],
  [0, 0.045],
];
const BOWL: [number, number][] = [
  [0, 0.008],
  [0.11, 0.008],
  [0.13, 0.026],
  [0.23, 0.12],
  [0.255, 0.16],
  [0.25, 0.174],
  [0.233, 0.16],
  [0.205, 0.115],
  [0.09, 0.044],
  [0, 0.044],
];
const PLATE: [number, number][] = [
  [0, 0.004],
  [0.12, 0.004],
  [0.13, 0.014],
  [0.205, 0.029],
  [0.207, 0.038],
  [0.18, 0.043],
  [0.115, 0.023],
  [0, 0.023],
];

export function CeramicJar({ position, height = 0.32 }: { position: Point; height?: number }) {
  const profile = useMemo<[number, number][]>(
    () => [
      [0, 0.005],
      [0.115, 0.005],
      [0.145, 0.035],
      [0.147, height * 0.72],
      [0.125, height * 0.88],
      [0.12, height],
      [0.104, height],
      [0.105, height * 0.86],
      [0.12, 0.04],
      [0, 0.04],
    ],
    [height],
  );
  return (
    <group position={[...position]}>
      <Vessel profile={profile} color="#D9D2BB" />
      <mesh position={[0, height + 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.132, 0.136, 0.034, 32]} />
        <Surface color="#645B4C" />
      </mesh>
      <mesh position={[0, height + 0.036, 0]} castShadow>
        <sphereGeometry args={[0.029, 12, 8]} />
        <Surface color="#645B4C" />
      </mesh>
      <ContactPatch position={[0, 0.002, 0]} size={[0.42, 0.42]} opacity={0.2} />
    </group>
  );
}

function GroceryBag() {
  return (
    <group position={[...DOMESTIC_SOURCES.bag]}>
      <RoundedSolid
        position={[0, 0.32, 0]}
        size={[0.62, 0.64, 0.43]}
        color="#AF8960"
        radius={0.027}
        finish="paper"
      />
      <RoundedSolid
        position={[0, 0.643, 0]}
        size={[0.56, 0.01, 0.36]}
        color="#493725"
        finish="paper"
      />
      {[-0.215, 0.215].map((z) => (
        <group key={z}>
          <RoundedSolid
            position={[0, 0.64, z]}
            size={[0.63, 0.065, 0.022]}
            color="#C4A47C"
            radius={0.007}
            finish="paper"
          />
          <mesh position={[0, 0.67, z]}>
            <torusGeometry args={[0.145, 0.012, 6, 24, Math.PI]} />
            <Surface color="#856646" finish="paper" />
          </mesh>
        </group>
      ))}
      {[-0.302, 0.302].map((x) => (
        <RoundedSolid
          key={x}
          position={[x, 0.32, 0.02]}
          size={[0.008, 0.52, 0.045]}
          color="#856646"
          radius={0.002}
          finish="paper"
        />
      ))}
      <ContactPatch position={[0, 0.002, 0]} size={[0.88, 0.65]} opacity={0.25} />
    </group>
  );
}

function MilkCarton() {
  const gable = useMemo(
    () => new Shape().moveTo(-0.145, 0).lineTo(0, 0.14).lineTo(0.145, 0).closePath(),
    [],
  );
  return (
    <group position={[...DOMESTIC_SOURCES.milk]}>
      <RoundedSolid
        position={[0, 0.23, 0]}
        size={[0.29, 0.46, 0.29]}
        color="#F2E8D5"
        radius={0.008}
        finish="paper"
      />
      <mesh position={[0, 0.46, -0.14]} castShadow>
        <extrudeGeometry args={[gable, { depth: 0.28, bevelEnabled: false }]} />
        <Surface color="#E4D7BF" finish="paper" />
      </mesh>
      <RoundedSolid
        position={[0, 0.6, 0]}
        size={[0.026, 0.03, 0.29]}
        color="#F2E8D5"
        radius={0.003}
        finish="paper"
      />
      <mesh position={[0.078, 0.53, 0.035]} rotation={[0, 0, -0.78]} castShadow>
        <cylinderGeometry args={[0.037, 0.037, 0.021, 20]} />
        <Surface color="#F2E8D5" finish="ceramic" />
      </mesh>
      <RoundedSolid
        position={[0, 0.07, 0.148]}
        size={[0.265, 0.033, 0.003]}
        color="#8B1E2D"
        radius={0.001}
        finish="paper"
      />
      <ContactPatch position={[0, 0.002, 0]} size={[0.43, 0.43]} opacity={0.2} />
    </group>
  );
}

function CoffeeCup() {
  return (
    <group position={[...DOMESTIC_SOURCES.coffee]}>
      <Vessel profile={PLATE} />
      <group position={[0, 0.024, 0]}>
        <Vessel profile={CUP} color="#F2E8D5" />
        <mesh position={[0.145, 0.145, 0]} castShadow>
          <torusGeometry args={[0.082, 0.023, 10, 24]} />
          <Surface color="#F2E8D5" finish="ceramic" />
        </mesh>
        <mesh position={[0, 0.239, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.116, 32]} />
          <meshStandardMaterial color="#29241E" roughness={0.56} />
        </mesh>
      </group>
      <ContactPatch position={[0, 0.002, 0]} size={[0.55, 0.55]} opacity={0.2} />
    </group>
  );
}

function PaperSlip({ previous = false }: { previous?: boolean }) {
  const w = previous ? 0.65 : 1.08;
  const d = previous ? 0.47 : 0.77;
  return (
    <group position={[...(previous ? DOMESTIC_SOURCES.previousReceipt : DOMESTIC_SOURCES.receipt)]}>
      <RoundedSolid
        size={[w, 0.008, d]}
        color={previous ? '#E4D6BB' : '#F2E8D5'}
        radius={0.003}
        finish="paper"
      />
      <group position={[0, 0.007, -d * 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <SpatialType
          text={previous ? 'LAST WEEK' : 'EVERYDAY SHOP'}
          height={previous ? 0.048 : 0.063}
        />
      </group>
      {[0, 1, 2, 3].map((i) => (
        <RoundedSolid
          key={i}
          position={[-w * 0.1, 0.006, -d * 0.05 + i * d * 0.105]}
          size={[w * (i === 3 ? 0.42 : 0.64), 0.001, 0.005]}
          color="#8D8371"
          radius={0}
          finish="paper"
        />
      ))}
      <ContactPatch position={[0, -0.008, 0]} size={[w + 0.12, d + 0.1]} opacity={0.12} />
    </group>
  );
}

export function Book({
  position,
  width = 0.11,
  height = 0.4,
  color = '#292925',
}: {
  position: Point;
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <group position={[...position]}>
      <RoundedSolid
        position={[0, height / 2, 0]}
        size={[width, height, 0.31]}
        color={color}
        radius={0.007}
        finish="fabric"
      />
      <RoundedSolid
        position={[0.008, height / 2, 0.012]}
        size={[width - 0.018, height - 0.026, 0.3]}
        color="#CDC2AC"
        radius={0.003}
        finish="paper"
      />
      <RoundedSolid
        position={[0, height / 2, 0.166]}
        size={[width, height, 0.018]}
        color={color}
        radius={0.005}
        finish="fabric"
      />
      {[0.12, 0.16].map((y) => (
        <RoundedSolid
          key={y}
          position={[0, y, 0.177]}
          size={[width * 0.58, 0.007, 0.002]}
          color="#A69B86"
          radius={0}
          finish="paper"
        />
      ))}
    </group>
  );
}

function Notebook() {
  return (
    <group position={[...DOMESTIC_SOURCES.notebook]} rotation={[0, -0.13, 0]}>
      <RoundedSolid
        position={[0, 0.027, 0]}
        size={[0.57, 0.054, 0.62]}
        color="#111111"
        radius={0.018}
        finish="fabric"
      />
      <RoundedSolid
        position={[0.012, 0.025, 0]}
        size={[0.54, 0.028, 0.59]}
        color="#E8DDC7"
        radius={0.008}
        finish="paper"
      />
      <RoundedSolid
        position={[0, 0.05, 0]}
        size={[0.57, 0.01, 0.62]}
        color="#111111"
        radius={0.004}
        finish="fabric"
      />
      <RoundedSolid
        position={[0.18, 0.057, 0]}
        size={[0.023, 0.004, 0.62]}
        color="#8B1E2D"
        radius={0.001}
        finish="fabric"
      />
      <mesh position={[-0.18, 0.07, 0]} rotation={[Math.PI / 2, 0, -0.12]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.4, 8]} />
        <Surface color="#A69B86" />
      </mesh>
      <ContactPatch position={[0, 0.002, 0]} size={[0.75, 0.8]} />
    </group>
  );
}

function TableLamp() {
  const target = useMemo(() => {
    const object = new Object3D();
    object.position.set(-0.42, 0.02, 0.5);
    return object;
  }, []);
  return (
    <group position={[0.56, 1.14, -0.91]}>
      <mesh position={[0, 0.025, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.05, 32]} />
        <Surface color="#414735" finish="metal" />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.021, 0.7, 16]} />
        <Surface color="#998466" finish="metal" />
      </mesh>
      <mesh position={[0, 0.76, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.25, 0.28, 32, 1, true]} />
        <meshStandardMaterial color="#F2E8D5" roughness={0.92} side={2} />
      </mesh>
      <mesh position={[0, 0.68, 0]}>
        <sphereGeometry args={[0.045, 12, 8]} />
        <meshStandardMaterial
          color="#F2E8D5"
          emissive="#F2E8D5"
          emissiveIntensity={0.5}
          roughness={1}
        />
      </mesh>
      <primitive object={target} />
      <spotLight
        position={[0, 0.65, 0]}
        target={target}
        color="#F2E8D5"
        intensity={5.4}
        angle={0.9}
        penumbra={1}
        distance={3.5}
        decay={2}
      />
      <ContactPatch position={[0, 0.002, 0]} size={[0.55, 0.55]} />
    </group>
  );
}

export function ShelfBowl() {
  return <Vessel profile={BOWL} color="#BDBDA7" />;
}

export function HouseholdObjects() {
  return (
    <group>
      <GroceryBag />
      <MilkCarton />
      <CoffeeCup />
      <PaperSlip />
      <PaperSlip previous />
      <Notebook />
      <TableLamp />
      <group position={[-1.11, 1.14, -0.74]}>
        <RoundedSolid
          position={[0, 0.1, 0]}
          size={[0.47, 0.2, 0.24]}
          color="#B4A58A"
          radius={0.075}
          finish="paper"
        />
        <RoundedSolid
          position={[0, 0.11, 0]}
          size={[0.15, 0.21, 0.25]}
          color="#CDC2AC"
          radius={0.025}
          finish="paper"
        />
        <ContactPatch position={[0, 0.002, 0]} size={[0.65, 0.4]} />
      </group>
      <group position={[1.65, 2.65, -2.3]}>
        <RoundedSolid
          position={[0, 0.17, 0]}
          size={[0.23, 0.34, 0.21]}
          color="#8F9072"
          radius={0.009}
          finish="paper"
        />
        <RoundedSolid
          position={[0, 0.27, 0.109]}
          size={[0.18, 0.06, 0.004]}
          color="#CDC2AC"
          radius={0.002}
          finish="paper"
        />
      </group>
    </group>
  );
}
