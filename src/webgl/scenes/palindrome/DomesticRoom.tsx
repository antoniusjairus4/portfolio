import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, type ReactNode, useEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  type Group,
  Object3D,
  type SpotLight,
} from 'three';
import { FinancialMemoryWall } from './FinancialMemoryWall';
import { GardenWindow } from './GardenWindow';
import {
  Book,
  HouseholdObjects,
  CeramicJar as Jar,
  RoundedSolid,
  ShelfBowl,
} from './HouseholdObjects';
import { LeftWallGallery } from './LeftWallGallery';
import { ROOM_PALETTE } from './palette';
import {
  BACK_WALL_BOXES,
  HEADER_BOX,
  HEADER_SEAL_BOX,
  RIGHT_WALL_BOXES,
  RIGHT_WALL_FRONT_BOXES,
  SIDE_WALL_BOXES,
} from './roomLayout';
import { SeatedFigure } from './SeatedFigure';
import { ContactPatch, DomesticSurfaces, Surface } from './Surfaces';

export { ROOM_PALETTE } from './palette';

type Point = [number, number, number];

function Block({
  position,
  size,
  color,
  finish = 'wood',
}: {
  position: Point;
  size: Point;
  color: string;
  finish?: 'wood' | 'plaster' | 'paper' | 'fabric' | 'ceramic' | 'metal' | 'stone';
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <Surface color={color} finish={finish} />
    </mesh>
  );
}

function GradientWall({
  position,
  size,
  color,
  side,
}: {
  position: Point;
  size: Point;
  color: string;
  side: 'back' | 'left' | 'right';
}) {
  const geometry = useMemo(() => {
    const wall = new BoxGeometry(...size);
    const vertices = wall.getAttribute('position');
    const colors = new Float32Array(vertices.count * 3);
    for (let i = 0; i < vertices.count; i++) {
      const y = Math.max(0, Math.min(1, (position[1] + vertices.getY(i)) / 5.35));
      const horizontal =
        side === 'back'
          ? (position[0] + vertices.getX(i) + 4.5) / 9
          : (position[2] + vertices.getZ(i) + 2.8) / 10;
      const center = Math.max(0, 1 - Math.abs(horizontal - 0.5) * 2);
      const tone = 0.8 + y * 0.16 + center * 0.055;
      const tint = new Color().setRGB(
        tone * (side === 'left' ? 1.025 : side === 'right' ? 0.985 : 1),
        tone,
        tone * (side === 'left' ? 0.985 : side === 'right' ? 1.015 : 1),
      );
      tint.toArray(colors, i * 3);
    }
    wall.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return wall;
  }, [position, size, side]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh position={position} geometry={geometry} castShadow receiveShadow>
      <Surface color={color} finish="plaster" vertexColors />
    </mesh>
  );
}

function SeatedPresence() {
  // The approved chair and seated anchor stay fixed; only the human is refined.
  return (
    <group position={[0.45, 0, -1.28]} rotation={[0, -0.18, 0]}>
      <Block position={[0, 0.56, 0]} size={[0.65, 0.09, 0.62]} color={ROOM_PALETTE.timber} />
      <Block position={[0, 1.02, -0.28]} size={[0.64, 0.83, 0.07]} color={ROOM_PALETTE.timber} />
      {[-0.25, 0.25].flatMap((x) =>
        [-0.23, 0.23].map((z) => (
          <Block
            key={`${x}:${z}`}
            position={[x, 0.26, z]}
            size={[0.055, 0.52, 0.055]}
            color={ROOM_PALETTE.ink}
          />
        )),
      )}
      <SeatedFigure />
    </group>
  );
}

function BridgeReveal({
  progress,
  start,
  end,
  anchor = [0, 0, 0],
  children,
}: {
  progress?: MutableRefObject<number>;
  start: number;
  end: number;
  anchor?: Point;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!progress || !group.current) return;
    const t = Math.min(1, Math.max(0, (progress.current - start) / (end - start)));
    const reveal = t * t * (3 - 2 * t);
    group.current.scale.setScalar(Math.max(0.001, reveal));
    group.current.visible = reveal > 0.002;
  });
  return (
    <group ref={group} position={anchor} scale={progress ? 0.001 : 1} visible={!progress}>
      <group position={[-anchor[0], -anchor[1], -anchor[2]]}>{children}</group>
    </group>
  );
}

function CeilingWash({ transitionProgress }: { transitionProgress?: MutableRefObject<number> }) {
  const light = useRef<SpotLight>(null);
  const target = useMemo(() => {
    const object = new Object3D();
    object.position.set(0, 5.25, -1.2);
    return object;
  }, []);
  useFrame(() => {
    if (!light.current || !transitionProgress) return;
    const t = Math.min(1, Math.max(0, (transitionProgress.current - 0.72) / 0.2));
    light.current.intensity = 7 * t * t * (3 - 2 * t);
  });
  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={light}
        position={[0, 3.05, 0.2]}
        target={target}
        color="#e8e4d8"
        intensity={transitionProgress ? 0 : 7}
        angle={1.15}
        penumbra={1}
        distance={9}
        decay={2}
      />
    </>
  );
}

function InteriorLighting({
  transitionProgress,
}: {
  transitionProgress?: MutableRefObject<number>;
}) {
  const left = useRef<SpotLight>(null);
  const right = useRef<SpotLight>(null);
  const desk = useRef<SpotLight>(null);
  const targets = useMemo(() => {
    const points: Point[] = [
      [-4.2, 2.85, -0.1],
      [4.2, 2.75, -0.1],
      [-0.65, 1.45, -0.45],
    ];
    return points.map(([x, y, z]) => {
      const target = new Object3D();
      target.position.set(x, y, z);
      return target;
    });
  }, []);
  useFrame(() => {
    if (!transitionProgress) return;
    const t = Math.min(1, Math.max(0, (transitionProgress.current - 0.64) / 0.31));
    const reveal = t * t * (3 - 2 * t);
    if (left.current) left.current.intensity = 1.65 * reveal;
    if (right.current) right.current.intensity = 1.45 * reveal;
    if (desk.current) desk.current.intensity = 2.15 * reveal;
  });
  return (
    <>
      {targets.map((target) => (
        <primitive key={target.uuid} object={target} />
      ))}
      <spotLight
        ref={left}
        position={[-3.25, 4.35, 0.5]}
        target={targets[0]}
        color="#E8D8C2"
        intensity={transitionProgress ? 0 : 1.65}
        angle={0.78}
        penumbra={1}
        distance={4.5}
        decay={2}
      />
      <spotLight
        ref={right}
        position={[3.25, 4.35, 0.5]}
        target={targets[1]}
        color="#DCCFBD"
        intensity={transitionProgress ? 0 : 1.45}
        angle={0.78}
        penumbra={1}
        distance={4.5}
        decay={2}
      />
      <spotLight
        ref={desk}
        position={[-0.8, 4.15, 0.35]}
        target={targets[2]}
        color="#F0E2CC"
        intensity={transitionProgress ? 0 : 2.15}
        angle={1.05}
        penumbra={1}
        distance={5.5}
        decay={2}
      />
    </>
  );
}

export function DomesticRoom({
  portrait,
  transitionProgress,
  bridgeShell = true,
  bridgeDesk = true,
  bridgeBall = true,
}: {
  portrait: boolean;
  transitionProgress?: MutableRefObject<number>;
  bridgeShell?: boolean;
  bridgeDesk?: boolean;
  bridgeBall?: boolean;
}) {
  return (
    <DomesticSurfaces>
      <group scale={[portrait ? 0.76 : 1, 1, 1]}>
        <CeilingWash transitionProgress={transitionProgress} />
        <InteriorLighting transitionProgress={transitionProgress} />
        {bridgeShell && (
          <>
            <Block
              position={[0, -0.09, -0.1]}
              size={[9, 0.18, 7.4]}
              color={ROOM_PALETTE.floor}
              finish="stone"
            />
            {BACK_WALL_BOXES.map(([position, size]) => (
              <GradientWall
                key={position.join(':')}
                position={position}
                size={size}
                color={ROOM_PALETTE.plaster}
                side="back"
              />
            ))}
            {[SIDE_WALL_BOXES[0]].map(([position, size]) => (
              <GradientWall
                key={position[0]}
                position={position}
                size={size}
                color={ROOM_PALETTE.sideWall}
                side="left"
              />
            ))}
            {RIGHT_WALL_BOXES.map(([position, size], index) => (
              <GradientWall
                key={position.join(':')}
                position={position}
                size={size}
                color={
                  index < RIGHT_WALL_FRONT_BOXES.length
                    ? ROOM_PALETTE.sideWall
                    : ROOM_PALETTE.charcoal
                }
                side="right"
              />
            ))}
            <Block
              position={HEADER_BOX[0]}
              size={HEADER_BOX[1]}
              color={ROOM_PALETTE.sideWall}
              finish="plaster"
            />
            <Block
              position={HEADER_SEAL_BOX[0]}
              size={HEADER_SEAL_BOX[1]}
              color={ROOM_PALETTE.plaster}
              finish="plaster"
            />
            <Block
              position={[0, 0.12, -2.68]}
              size={[8.3, 0.24, 0.07]}
              color={ROOM_PALETTE.timber}
            />
          </>
        )}
        {!bridgeShell && (
          <BridgeReveal
            progress={transitionProgress}
            start={0.72}
            end={0.92}
            anchor={HEADER_BOX[0]}
          >
            <Block
              position={HEADER_BOX[0]}
              size={HEADER_BOX[1]}
              color={ROOM_PALETTE.sideWall}
              finish="plaster"
            />
            <Block
              position={HEADER_SEAL_BOX[0]}
              size={HEADER_SEAL_BOX[1]}
              color={ROOM_PALETTE.plaster}
              finish="plaster"
            />
          </BridgeReveal>
        )}
        <BridgeReveal
          progress={transitionProgress}
          start={0.72}
          end={0.92}
          anchor={[-4.34, 2.85, -0.1]}
        >
          <LeftWallGallery />
        </BridgeReveal>
        <BridgeReveal
          progress={transitionProgress}
          start={0.82}
          end={0.97}
          anchor={[4.42, 2.75, -0.1]}
        >
          <FinancialMemoryWall />
        </BridgeReveal>
        <BridgeReveal progress={transitionProgress} start={0.51} end={0.79}>
          {/* Quiet floor joints and a small woven mat establish human scale. */}
          {[-3, -1.5, 0, 1.5, 3].map((x) => (
            <Block key={x} position={[x, 0.001, -0.1]} size={[0.008, 0.002, 7.2]} color="#918D85" />
          ))}
          <Block
            position={[-0.8, 0.012, -0.15]}
            size={[4.7, 0.02, 2.7]}
            color={ROOM_PALETTE.rug}
            finish="fabric"
          />
          {[-1.36, 1.06].map((z) => (
            <Block
              key={z}
              position={[-0.8, 0.023, z]}
              size={[4.48, 0.003, 0.035]}
              color="#A69B86"
            />
          ))}
        </BridgeReveal>
        <BridgeReveal
          progress={transitionProgress}
          start={0.58}
          end={0.81}
          anchor={[-2.75, 2.65, -2.55]}
        >
          <GardenWindow transitionProgress={transitionProgress} />
          {[-3.385, -2.115].map((x) => (
            <Block
              key={x}
              position={[x, 2.65, -2.63]}
              size={[0.07, 1.85, 0.15]}
              color={ROOM_PALETTE.timber}
            />
          ))}
          {[1.77, 3.53].map((y) => (
            <Block
              key={y}
              position={[-2.75, y, -2.63]}
              size={[1.34, 0.09, 0.15]}
              color={ROOM_PALETTE.timber}
            />
          ))}
          {/* One unglazed casement swings outward and leaves the garden in view. */}
          <group position={[-3.35, 2.65, -2.55]} rotation={[0, 0.82, 0]}>
            {[0.025, 0.585].map((x) => (
              <Block
                key={x}
                position={[x, 0, 0]}
                size={[0.045, 1.62, 0.055]}
                color={ROOM_PALETTE.timber}
              />
            ))}
            {[-0.79, 0.79].map((y) => (
              <Block
                key={y}
                position={[0.305, y, 0]}
                size={[0.61, 0.045, 0.055]}
                color={ROOM_PALETTE.timber}
              />
            ))}
            <Block
              position={[0.54, -0.03, 0.055]}
              size={[0.025, 0.12, 0.04]}
              color={ROOM_PALETTE.ceramic}
              finish="metal"
            />
          </group>
          <Block
            position={[-2.75, 1.71, -2.46]}
            size={[1.51, 0.09, 0.38]}
            color={ROOM_PALETTE.ceramic}
            finish="ceramic"
          />
          <Jar position={[-3.13, 1.76, -2.4]} height={0.24} />
        </BridgeReveal>

        <BridgeReveal
          progress={transitionProgress}
          start={0.76}
          end={0.97}
          anchor={[0.45, 1, -1.28]}
        >
          <SeatedPresence />
        </BridgeReveal>
        {bridgeDesk && (
          <group position={[-1.02, 0, -0.35]}>
            <RoundedSolid
              position={[0, 1.07, 0]}
              size={[3.8, 0.14, 1.65]}
              color={ROOM_PALETTE.timber}
              radius={0.025}
            />
            <ContactPatch position={[0, 0.025, 0]} size={[4.5, 2.5]} opacity={0.12} />
            <Block position={[0, 0.9, 0]} size={[3.45, 0.22, 1.36]} color="#24201C" />
            {[-1.62, 1.62].flatMap((x) =>
              [-0.63, 0.63].map((z) => (
                <Block
                  key={`${x}:${z}`}
                  position={[x, 0.5, z]}
                  size={[0.095, 1, 0.095]}
                  color={ROOM_PALETTE.charcoal}
                />
              )),
            )}
          </group>
        )}
        {bridgeBall && (
          <mesh position={[-1.18, 1.16, -0.1]} castShadow>
            <sphereGeometry args={[0.02, 16, 12]} />
            <Surface color={ROOM_PALETTE.ceramic} finish="ceramic" />
          </mesh>
        )}
        {transitionProgress ? (
          <>
            <BridgeReveal
              progress={transitionProgress}
              start={0.67}
              end={0.84}
              anchor={[0.7, 1.14, -1]}
            >
              <HouseholdObjects kind="lamp" />
            </BridgeReveal>
            <BridgeReveal
              progress={transitionProgress}
              start={0.76}
              end={0.96}
              anchor={[-0.7, 1.14, -0.35]}
            >
              <HouseholdObjects kind="daily" />
            </BridgeReveal>
          </>
        ) : (
          <HouseholdObjects />
        )}
        <BridgeReveal
          progress={transitionProgress}
          start={0.64}
          end={0.87}
          anchor={[2.1, 1.34, -2.3]}
        >
          <group position={[2.1, 0, -2.3]}>
            {[-0.86, 0.86].map((x) => (
              <Block
                key={x}
                position={[x, 1.34, 0]}
                size={[0.075, 2.68, 0.47]}
                color={ROOM_PALETTE.ink}
              />
            ))}
            {[0.18, 0.99, 1.8, 2.61].map((y) => (
              <Block key={y} position={[0, y, 0]} size={[1.85, 0.075, 0.54]} color="#554435" />
            ))}
            <RoundedSolid
              position={[0.2, 0.48, 0]}
              size={[0.96, 0.52, 0.42]}
              color={ROOM_PALETTE.storage}
              radius={0.025}
              finish="fabric"
            />
            <RoundedSolid
              position={[0.2, 0.745, 0]}
              size={[0.98, 0.035, 0.44]}
              color={ROOM_PALETTE.forest}
              radius={0.012}
              finish="fabric"
            />
            <Block
              position={[0.2, 0.66, 0.217]}
              size={[0.21, 0.035, 0.012]}
              color={ROOM_PALETTE.charcoal}
            />
            <Jar position={[-0.49, 1.03, 0]} height={0.38} color={ROOM_PALETTE.sage} />
            <Jar position={[-0.08, 1.03, 0]} height={0.29} color={ROOM_PALETTE.parchment} />
            {[0.28, 0.41, 0.55].map((x, index) => (
              <Book
                key={x}
                position={[x, 1.84, 0]}
                height={0.39 + index * 0.035}
                color={[ROOM_PALETTE.dustyBlue, ROOM_PALETTE.forest, ROOM_PALETTE.ochre][index]}
              />
            ))}
            <group position={[-0.43, 1.84, 0]}>
              <ShelfBowl />
            </group>
          </group>
        </BridgeReveal>
      </group>
    </DomesticSurfaces>
  );
}
