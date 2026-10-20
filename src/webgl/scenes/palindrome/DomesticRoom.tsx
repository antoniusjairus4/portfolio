import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, type ReactNode, type RefObject, useRef } from 'react';
import type { Group } from 'three';
import {
  Book,
  HouseholdObjects,
  CeramicJar as Jar,
  RoundedSolid,
  ShelfBowl,
} from './HouseholdObjects';
import { ROOM_PALETTE } from './palette';
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
  finish?: 'wood' | 'plaster' | 'paper' | 'fabric' | 'ceramic' | 'metal';
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <Surface color={color} finish={finish} />
    </mesh>
  );
}

function SeatedPresence({
  headAnchorRef,
  interiorProgress,
}: {
  headAnchorRef?: RefObject<Group | null>;
  interiorProgress?: MutableRefObject<number>;
}) {
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
      <SeatedFigure headAnchorRef={headAnchorRef} interiorProgress={interiorProgress} />
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

export function DomesticRoom({
  portrait,
  transitionProgress,
  bridgeShell = true,
  bridgeDesk = true,
  bridgeBall = true,
  headAnchorRef,
  interiorProgress,
}: {
  portrait: boolean;
  transitionProgress?: MutableRefObject<number>;
  bridgeShell?: boolean;
  bridgeDesk?: boolean;
  bridgeBall?: boolean;
  headAnchorRef?: RefObject<Group | null>;
  interiorProgress?: MutableRefObject<number>;
}) {
  return (
    <DomesticSurfaces>
      <group scale={[portrait ? 0.76 : 1, 1, 1]}>
        {bridgeShell && (
          <>
            <Block
              position={[0, -0.09, -0.1]}
              size={[9, 0.18, 7.4]}
              color={ROOM_PALETTE.floor}
              finish="plaster"
            />
            <Block
              position={[0, 2.65, -2.8]}
              size={[9, 5.3, 0.18]}
              color={ROOM_PALETTE.plaster}
              finish="plaster"
            />
            <Block
              position={[-4.15, 2.65, -0.45]}
              size={[0.16, 5.3, 4.6]}
              color={ROOM_PALETTE.parchment}
              finish="plaster"
            />
            <Block
              position={[0, 0.12, -2.68]}
              size={[8.3, 0.24, 0.07]}
              color={ROOM_PALETTE.timber}
            />
          </>
        )}
        <BridgeReveal progress={transitionProgress} start={0.51} end={0.79}>
          {/* Quiet floor joints and a small woven mat establish human scale. */}
          {[-3, -1.5, 0, 1.5, 3].map((x) => (
            <Block key={x} position={[x, 0.001, -0.1]} size={[0.008, 0.002, 7.2]} color="#766D5E" />
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
          {/* A recessed domestic window, not an emissive screen. */}
          <Block
            position={[-2.75, 2.64, -2.64]}
            size={[1.34, 1.85, 0.14]}
            color={ROOM_PALETTE.timber}
          />
          <Block
            position={[-2.75, 2.65, -2.55]}
            size={[1.19, 1.69, 0.025]}
            color={ROOM_PALETTE.parchment}
            finish="plaster"
          />
          <Block
            position={[-2.75, 2.65, -2.52]}
            size={[0.045, 1.69, 0.04]}
            color={ROOM_PALETTE.timber}
          />
          <Block
            position={[-2.75, 2.52, -2.52]}
            size={[1.19, 0.045, 0.04]}
            color={ROOM_PALETTE.timber}
          />
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
          <SeatedPresence headAnchorRef={headAnchorRef} interiorProgress={interiorProgress} />
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
              anchor={[0.56, 1.14, -0.91]}
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
