import {
  Book,
  CeramicJar as Jar,
  HouseholdObjects,
  RoundedSolid,
  ShelfBowl,
} from './HouseholdObjects';
import { ContactPatch, DomesticSurfaces, Surface } from './Surfaces';

export const ROOM_PALETTE = {
  ink: '#111111',
  parchment: '#F2E8D5',
  crimson: '#8B1E2D',
  plaster: '#41413B',
  floor: '#8D8371',
  timber: '#645B4C',
  ceramic: '#CDC2AC',
  charcoal: '#292925',
};

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

function SeatedPresence() {
  // Deliberately one quiet carved form: no face, fingers, or anatomical rig.
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
      <mesh position={[0, 1.06, 0.01]} rotation={[0.14, 0, -0.07]} castShadow>
        <cylinderGeometry args={[0.23, 0.32, 0.89, 12]} />
        <meshStandardMaterial color="#484840" roughness={1} />
      </mesh>
      <mesh position={[-0.04, 1.72, 0.08]} scale={[0.85, 1.1, 0.9]} castShadow>
        <sphereGeometry args={[0.22, 20, 16]} />
        <meshStandardMaterial color={ROOM_PALETTE.ceramic} roughness={1} />
      </mesh>
      <mesh position={[-0.29, 1.13, 0.17]} rotation={[0, 0, -0.85]} castShadow>
        <capsuleGeometry args={[0.085, 0.45, 4, 10]} />
        <meshStandardMaterial color="#484840" roughness={1} />
      </mesh>
      {[-0.16, 0.16].map((x) => (
        <group key={x}>
          <Block
            position={[x, 0.63, 0.25]}
            size={[0.22, 0.22, 0.51]}
            color={ROOM_PALETTE.charcoal}
          />
          <Block
            position={[x, 0.31, 0.44]}
            size={[0.17, 0.52, 0.18]}
            color={ROOM_PALETTE.charcoal}
          />
          <Block position={[x, 0.065, 0.52]} size={[0.2, 0.13, 0.34]} color={ROOM_PALETTE.ink} />
        </group>
      ))}
    </group>
  );
}

export function DomesticRoom({ portrait }: { portrait: boolean }) {
  return (
    <DomesticSurfaces>
      <group scale={[portrait ? 0.76 : 1, 1, 1]}>
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
          color="#A69B86"
          finish="plaster"
        />
        <Block position={[0, 0.12, -2.68]} size={[8.3, 0.24, 0.07]} color={ROOM_PALETTE.timber} />
        {/* Quiet floor joints and a small woven mat establish human scale. */}
        {[-3, -1.5, 0, 1.5, 3].map((x) => (
          <Block key={x} position={[x, 0.001, -0.1]} size={[0.008, 0.002, 7.2]} color="#766D5E" />
        ))}
        <Block
          position={[-0.8, 0.012, -0.15]}
          size={[4.7, 0.02, 2.7]}
          color="#7B7465"
          finish="fabric"
        />
        {[-1.36, 1.06].map((z) => (
          <Block key={z} position={[-0.8, 0.023, z]} size={[4.48, 0.003, 0.035]} color="#A69B86" />
        ))}
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
        />
        <Jar position={[-3.13, 1.76, -2.4]} height={0.24} />

        <SeatedPresence />
        <group position={[-1.02, 0, -0.35]}>
          <RoundedSolid
            position={[0, 1.07, 0]}
            size={[3.8, 0.14, 1.65]}
            color={ROOM_PALETTE.timber}
            radius={0.025}
          />
          <ContactPatch position={[0, 0.025, 0]} size={[4.5, 2.5]} opacity={0.12} />
          <Block position={[0, 0.9, 0]} size={[3.45, 0.22, 1.36]} color="#514A3E" />
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
        <HouseholdObjects />
        <group position={[2.1, 0, -2.3]}>
          {[-0.86, 0.86].map((x) => (
            <Block
              key={x}
              position={[x, 1.34, 0]}
              size={[0.075, 2.68, 0.47]}
              color={ROOM_PALETTE.timber}
            />
          ))}
          {[0.18, 0.99, 1.8, 2.61].map((y) => (
            <Block
              key={y}
              position={[0, y, 0]}
              size={[1.85, 0.075, 0.54]}
              color={ROOM_PALETTE.timber}
            />
          ))}
          <RoundedSolid
            position={[0.2, 0.48, 0]}
            size={[0.96, 0.52, 0.42]}
            color="#A69B86"
            radius={0.025}
            finish="fabric"
          />
          <RoundedSolid
            position={[0.2, 0.745, 0]}
            size={[0.98, 0.035, 0.44]}
            color="#8D8371"
            radius={0.012}
            finish="fabric"
          />
          <Block
            position={[0.2, 0.66, 0.217]}
            size={[0.21, 0.035, 0.012]}
            color={ROOM_PALETTE.charcoal}
          />
          <Jar position={[-0.49, 1.03, 0]} height={0.38} />
          <Jar position={[-0.08, 1.03, 0]} height={0.29} />
          {[0.28, 0.41, 0.55].map((x, index) => (
            <Book
              key={x}
              position={[x, 1.84, 0]}
              height={0.39 + index * 0.035}
              color={index === 1 ? ROOM_PALETTE.ceramic : ROOM_PALETTE.charcoal}
            />
          ))}
          <group position={[-0.43, 1.84, 0]}>
            <ShelfBowl />
          </group>
        </group>
      </group>
    </DomesticSurfaces>
  );
}
