import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  type Group,
  type LineBasicMaterial,
  type MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
} from 'three';
import { makeScanMaterial } from './ScanVolume';

// Orthogonal imaging sections occupy a volume. The center remains open for the
// brain and evidence; side, overhead and distant films supply real parallax.
const FILMS = [
  { at: [-4.5, 2.1, 3.5], turn: [0, 0.58, 0], size: [4.4, 6.4], tint: '#527D9E' },
  { at: [4.7, 2, -0.6], turn: [0, -0.72, 0], size: [4.7, 6.6], tint: '#78B9C5' },
  { at: [-4.1, 1.5, -7], turn: [0, 0.38, 0.04], size: [4, 5.6], tint: '#719DB9' },
  { at: [4.6, 2.4, -11], turn: [0, -0.47, 0], size: [4.8, 6], tint: '#53959F' },
  { at: [-4.6, 2, -17], turn: [0, 0.62, 0], size: [4.2, 6.2], tint: '#739CAE' },
  { at: [4.4, 2.8, -23], turn: [0, -0.4, -0.04], size: [5, 6.5], tint: '#9FA9BB' },
  { at: [-4.2, 1.2, -30], turn: [0, 0.31, 0], size: [4.4, 6], tint: '#8EBABD' },
  { at: [1, -1.2, -5], turn: [-Math.PI / 2, 0, 0.16], size: [9, 8], tint: '#547E9A' },
  { at: [-0.7, 5.8, -14], turn: [Math.PI / 2, 0, -0.12], size: [10, 12], tint: '#72A9B9' },
  { at: [0, -1.4, -25], turn: [-Math.PI / 2, 0, -0.14], size: [10, 10], tint: '#687E9D' },
] as const;

function depthPanel(index: number) {
  const geometry = new PlaneGeometry(36, 23, 12, 10);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const navy = new Color(index % 2 === 0 ? '#203A54' : '#192F49');
  const pale = new Color(index % 2 === 0 ? '#416A80' : '#3E596F');
  const color = new Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i),
      y = position.getY(i);
    const region = Math.exp(-((x - (index % 2 === 0 ? -9 : 8)) ** 2 / 22 + (y - 2) ** 2 / 38));
    color.copy(navy).lerp(pale, region * 0.8);
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}

export function AnatomicalEnvironment({
  progress,
  presence,
}: {
  progress: MutableRefObject<number>;
  presence?: MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const root = useRef<Group>(null);
  const localCamera = useMemo(() => new Vector3(), []);
  const filmPositions = useMemo(() => FILMS.map((film) => new Vector3(...film.at)), []);
  const filmColors = useMemo(() => FILMS.map((film) => new Color(film.tint)), []);
  const evidenceColor = useMemo(() => new Color('#C7D7D0'), []);
  const sheet = useMemo(() => new PlaneGeometry(1, 1), []);
  const materials = useMemo(() => FILMS.map((film, i) => makeScanMaterial(i + 2, film.tint)), []);
  const backdrops = useMemo(() => [depthPanel(0), depthPanel(1), depthPanel(2)], []);
  const backs = useRef<(MeshBasicMaterial | null)[]>([]);
  const edges = useRef<(LineBasicMaterial | null)[]>([]);
  const volume = useMemo(() => {
    const solid = new BoxGeometry(1, 1, 1);
    const edges = new EdgesGeometry(solid);
    solid.dispose();
    return edges;
  }, []);
  useEffect(
    () => () => {
      sheet.dispose();
      volume.dispose();
      materials.forEach((m) => m.dispose());
      backdrops.forEach((g) => g.dispose());
    },
    [sheet, volume, materials, backdrops],
  );
  useFrame(() => {
    const visibility = presence?.current ?? 1;
    if (root.current) {
      root.current.updateWorldMatrix(true, false);
      root.current.worldToLocal(localCamera.copy(camera.position));
    }
    materials.forEach((material, i) => {
      const distance = localCamera.distanceTo(filmPositions[i]);
      const focus = Math.exp(-((distance - 5) ** 2) / 26);
      const evidence = Math.max(0, 1 - Math.abs(progress.current - 0.75) / 0.15);
      material.uniforms.uTint.value
        .copy(filmColors[i])
        .lerp(evidenceColor, i === 5 || i === 6 ? evidence * 0.38 : 0);
      material.uniforms.uFocus.value = focus * 0.72;
      material.uniforms.uOpacity.value = visibility * (0.3 + focus * 0.34) * (i >= 7 ? 0.55 : 1);
    });
    backs.current.forEach((m, i) => {
      if (m) m.opacity = visibility * (i === 2 ? 1 : 0.72);
    });
    edges.current.forEach((m, i) => {
      if (m)
        m.opacity = visibility * (0.08 + 0.07 * Math.exp(-((localCamera.z + 6 + i * 6) ** 2) / 65));
    });
  });
  return (
    <group ref={root} name="NS_MedicalImagingChamber">
      {backdrops.map((geometry, i) => (
        <mesh
          key={geometry.uuid}
          geometry={geometry}
          position={[i === 1 ? 2 : 0, 1.7, -35 - i * 8]}
          rotation={[0, i === 1 ? -0.12 : 0.08, 0]}
        >
          <meshBasicMaterial
            ref={(m) => {
              backs.current[i] = m;
            }}
            vertexColors
            transparent
            depthWrite={false}
            side={DoubleSide}
            fog={false}
          />
        </mesh>
      ))}
      {FILMS.map((film, i) => (
        <mesh
          key={i}
          geometry={sheet}
          material={materials[i]}
          position={film.at}
          rotation={film.turn}
          scale={[...film.size, 1]}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <group
          key={i}
          position={[i % 2 === 0 ? -4.8 : 4.9, 2, -6 - i * 6]}
          rotation={[0, i % 2 === 0 ? 0.16 : -0.18, 0]}
        >
          <lineSegments geometry={volume} scale={[1.5, 6.2, 4.5]}>
            <lineBasicMaterial
              ref={(m) => {
                edges.current[i] = m;
              }}
              color={i === 4 ? '#8D8BAA' : '#75ADBC'}
              transparent
              opacity={0}
              depthWrite={false}
              fog={false}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}
