'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DoubleSide,
  type Group,
  Line as ThreeLine,
  LineBasicMaterial,
  type Material,
  MathUtils,
  type Mesh,
  type MeshBasicMaterial,
  MeshStandardMaterial,
  type Object3D,
  type PerspectiveCamera,
  type PointLight,
  type ShaderMaterial,
  type SpotLight,
  Vector3,
} from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';

const MODEL_ROOT = '/models/achievements';

type MaterialTreatment = 'original' | 'ivory' | 'charcoal' | 'fabric' | 'metal' | 'speaker';

const MODEL_COLORS: Record<Exclude<MaterialTreatment, 'original'>, string> = {
  ivory: '#ddd2bd',
  charcoal: '#171513',
  fabric: '#101011',
  metal: '#777269',
  speaker: '#111214',
};

function smooth(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function panelProgress(panel: string, portrait: boolean) {
  const element = document.querySelector<HTMLElement>(`[data-achievement-panel="${panel}"]`);
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  const viewport = window.innerHeight;
  const start = portrait ? viewport * 0.4 : 0;
  return Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, rect.height - viewport + start)));
}

function panelArrival(panel: string, portrait: boolean) {
  const element = document.querySelector<HTMLElement>(`[data-achievement-panel="${panel}"]`);
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  const viewport = window.innerHeight;
  const stickyTop = portrait ? viewport * 0.4 : 0;
  const travel = Math.max(1, viewport - stickyTop);
  return smooth((viewport - rect.top) / travel);
}

function entrancePresence(progress: number) {
  return smooth(progress / 0.14);
}

function setGroupPresence(group: Group | null, amount: number, scale: number) {
  if (!group) return;
  group.visible = amount > 0.002;
  group.scale.setScalar(Math.max(0.001, scale * (0.82 + amount * 0.18)));
}

function LoadedModel({
  url,
  treatment = 'original',
}: {
  url: string;
  treatment?: MaterialTreatment;
}) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => {
    const next = scene.clone(true);
    next.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const source = mesh.material;
      const materialWasArray = Array.isArray(source);
      const materials: Material[] = materialWasArray ? source : [source];
      const clonedMaterials = materials.map((source) => {
        const material = source.clone();
        if (material instanceof MeshStandardMaterial) {
          if (treatment !== 'original') material.color = new Color(MODEL_COLORS[treatment]);
          if (treatment === 'fabric') {
            material.roughness = 0.88;
            material.metalness = 0;
          } else if (treatment === 'metal') {
            material.roughness = 0.28;
            material.metalness = 0.72;
          } else if (treatment === 'speaker') {
            material.roughness = 0.7;
            material.metalness = 0.16;
          } else {
            material.roughness = MathUtils.clamp(material.roughness, 0.32, 0.72);
            material.metalness = MathUtils.clamp(material.metalness, 0.04, 0.48);
          }
        }
        return material;
      });
      mesh.material = materialWasArray ? clonedMaterials : clonedMaterials[0];
    });
    return next;
  }, [scene, treatment]);

  useEffect(
    () => () => {
      clone.traverse((child: Object3D) => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          material.dispose();
        });
      });
    },
    [clone],
  );

  return <primitive object={clone} />;
}

function ChessBoard() {
  const squares = useMemo(
    () =>
      Array.from({ length: 64 }, (_, index) => ({
        key: index,
        x: ((index % 8) - 3.5) * 0.45,
        z: (Math.floor(index / 8) - 3.5) * 0.45,
        light: (index + Math.floor(index / 8)) % 2 === 0,
      })),
    [],
  );
  return (
    <group>
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <boxGeometry args={[3.85, 0.22, 3.85]} />
        <meshStandardMaterial color="#30271f" roughness={0.42} metalness={0.12} />
      </mesh>
      {squares.map((square) => (
        <mesh key={square.key} receiveShadow position={[square.x, 0.01, square.z]}>
          <boxGeometry args={[0.45, 0.04, 0.45]} />
          <meshStandardMaterial
            color={square.light ? '#d8cdb8' : '#171513'}
            roughness={square.light ? 0.52 : 0.38}
            metalness={square.light ? 0.04 : 0.16}
          />
        </mesh>
      ))}
    </group>
  );
}

function TableTennisBackdrop({ materialRef }: { materialRef: RefObject<ShaderMaterial | null> }) {
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  return (
    <mesh position={[0, 0, -5.1]} renderOrder={-101} frustumCulled={false}>
      <planeGeometry args={[32, 22]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthTest
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uOpacity;
          uniform float uTime;
          varying vec2 vUv;

          void main() {
            // Multi-colored athletic palette referenced from globals.css:
            // --color-base: #0c0907
            // --hero-crimson: #8b1e2d
            // --color-ember: #e8481f
            // --color-gold: #e0a93b
            // --v-accent (kaiforge athletic blue): #0ea5e9
            // --color-blue (cobalt): #4f6bff
            vec3 colorBase = vec3(0.047, 0.035, 0.027);
            vec3 colorCrimson = vec3(0.545, 0.118, 0.176);
            vec3 colorEmber = vec3(0.910, 0.282, 0.122);
            vec3 colorGold = vec3(0.878, 0.663, 0.231);
            vec3 colorBlue = vec3(0.055, 0.647, 0.914);
            vec3 colorCobalt = vec3(0.310, 0.420, 1.000);

            float t = uTime * 0.35;
            vec2 p1 = vec2(0.20 + sin(t * 0.8) * 0.04, 0.78 + cos(t * 0.7) * 0.03);
            vec2 p2 = vec2(0.80 + cos(t * 0.6) * 0.04, 0.74 + sin(t * 0.9) * 0.03);
            vec2 p3 = vec2(0.50 + sin(t * 0.5) * 0.03, 0.44 + cos(t * 0.8) * 0.04);
            vec2 p4 = vec2(0.76 + cos(t * 0.7) * 0.04, 0.22 + sin(t * 0.6) * 0.03);

            vec3 color = colorBase;

            // 1. Crimson / Ember (top-left behind TABLE & trajectory arc)
            float d1 = distance(vUv, p1);
            float w1 = smoothstep(0.75, 0.0, d1);
            vec3 c1 = mix(colorCrimson, colorEmber, smoothstep(0.45, 0.0, d1));
            color = mix(color, c1, w1 * 0.82);

            // 2. Championship Gold (top-right behind TENNIS & ball)
            float d2 = distance(vUv, p2);
            float w2 = smoothstep(0.70, 0.0, d2);
            color = mix(color, colorGold, w2 * 0.65);

            // 3. Electric Athletic Blue (around center table)
            float d3 = distance(vUv, p3);
            float w3 = smoothstep(0.60, 0.0, d3);
            vec3 c3 = mix(colorBlue, colorCobalt, smoothstep(0.35, 0.0, d3));
            color = mix(color, c3, w3 * 0.58);

            // 4. Gold / Ember accent (bottom-right behind 2X STATE CHAMPION)
            float d4 = distance(vUv, p4);
            float w4 = smoothstep(0.62, 0.0, d4);
            color = mix(color, colorGold, w4 * 0.52);

            // Edge vignette to preserve typographic readability
            float dEdge = distance(vUv, vec2(0.5, 0.5));
            float edgeMask = smoothstep(0.78, 0.30, dEdge);
            color = mix(colorBase, color, clamp(edgeMask + 0.32, 0.0, 1.0));

            gl_FragColor = vec4(color, uOpacity);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}

function TableTennisBallTrajectory({ active }: { active: boolean }) {
  const ballRef = useRef<Mesh>(null);
  const glowLightRef = useRef<PointLight>(null);
  const trailGroupRef = useRef<Group>(null);
  const ripple1Ref = useRef<Mesh>(null);
  const ripple2Ref = useRef<Mesh>(null);

  // Pre-calculate trajectory curve geometry:
  // Serve/bounce (P1) -> cross net (P2) -> second bounce (P3) -> exit (P4)
  const { lineObject } = useMemo(() => {
    const samplePoints: Vector3[] = [];
    const count = 90;
    const x0 = -0.42, x1 = -0.22, x3 = 0.32, x4 = 0.62;
    const z0 = 2.2, z1 = 0.82, z3 = -0.76, z4 = -1.95;

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      let x = 0, y = 0, z = 0;
      if (t <= 0.28) {
        const s = t / 0.28;
        x = x0 + (x1 - x0) * s;
        z = z0 + (z1 - z0) * s;
        y = 0.772 + (1.45 - 0.772) * (1 - s) ** 1.8;
      } else if (t <= 0.72) {
        const s = (t - 0.28) / 0.44;
        x = x1 + (x3 - x1) * s;
        z = z1 + (z3 - z1) * s;
        y = 0.772 + 4.0 * (1.14 - 0.772) * s * (1.0 - s);
      } else {
        const s = (t - 0.72) / 0.28;
        x = x3 + (x4 - x3) * s;
        z = z3 + (z4 - z3) * s;
        y = 0.772 + (1.24 - 0.772) * (1 - (1 - s) ** 2);
      }
      samplePoints.push(new Vector3(x, y, z));
    }
    const geom = new BufferGeometry().setFromPoints(samplePoints);
    const mat = new LineBasicMaterial({
      color: '#f5eee2',
      transparent: true,
      opacity: 0.45,
    });
    const lineObj = new ThreeLine(geom, mat);
    return { lineObject: lineObj };
  }, []);

  const getTrajectoryPoint = useCallback((t: number) => {
    const clampedT = ((t % 1) + 1) % 1;
    const x0 = -0.42, x1 = -0.22, x3 = 0.32, x4 = 0.62;
    const z0 = 2.2, z1 = 0.82, z3 = -0.76, z4 = -1.95;
    let x = 0, y = 0, z = 0;
    if (clampedT <= 0.28) {
      const s = clampedT / 0.28;
      x = x0 + (x1 - x0) * s;
      z = z0 + (z1 - z0) * s;
      y = 0.772 + (1.45 - 0.772) * (1 - s) ** 1.8;
    } else if (clampedT <= 0.72) {
      const s = (clampedT - 0.28) / 0.44;
      x = x1 + (x3 - x1) * s;
      z = z1 + (z3 - z1) * s;
      y = 0.772 + 4.0 * (1.14 - 0.772) * s * (1.0 - s);
    } else {
      const s = (clampedT - 0.72) / 0.28;
      x = x3 + (x4 - x3) * s;
      z = z3 + (z4 - z3) * s;
      y = 0.772 + (1.24 - 0.772) * (1 - (1 - s) ** 2);
    }
    return { x, y, z, t: clampedT };
  }, []);

  useFrame((state) => {
    if (!active) return;
    const time = state.clock.getElapsedTime();
    // Continuous rally cycle every ~2.3 seconds
    const cycle = (time * 0.44) % 1;
    const pos = getTrajectoryPoint(cycle);

    if (ballRef.current) {
      ballRef.current.position.set(pos.x, pos.y, pos.z);
      ballRef.current.rotation.x = time * 14;
      ballRef.current.rotation.z = time * 9;
    }
    if (glowLightRef.current) {
      glowLightRef.current.position.set(pos.x, pos.y + 0.06, pos.z);
    }

    // Contact ripple at bounce 1 (near court at t = 0.28)
    if (ripple1Ref.current) {
      const diff1 = cycle - 0.28;
      if (diff1 >= 0 && diff1 < 0.16) {
        const s1 = diff1 / 0.16;
        ripple1Ref.current.visible = true;
        ripple1Ref.current.scale.set(1 + s1 * 2.4, 1 + s1 * 2.4, 1);
        (ripple1Ref.current.material as MeshBasicMaterial).opacity = (1 - s1) * 0.65;
      } else {
        ripple1Ref.current.visible = false;
      }
    }

    // Contact ripple at bounce 2 (far court at t = 0.72)
    if (ripple2Ref.current) {
      const diff2 = cycle - 0.72;
      if (diff2 >= 0 && diff2 < 0.16) {
        const s2 = diff2 / 0.16;
        ripple2Ref.current.visible = true;
        ripple2Ref.current.scale.set(1 + s2 * 2.4, 1 + s2 * 2.4, 1);
        (ripple2Ref.current.material as MeshBasicMaterial).opacity = (1 - s2) * 0.65;
      } else {
        ripple2Ref.current.visible = false;
      }
    }

    // Update motion trail ghosts behind the ball
    if (trailGroupRef.current) {
      const trailLength = trailGroupRef.current.children.length;
      trailGroupRef.current.children.forEach((ghost, idx) => {
        const lag = (idx + 1) * 0.014;
        const ghostPos = getTrajectoryPoint(cycle - lag);
        ghost.position.set(ghostPos.x, ghostPos.y, ghostPos.z);
        const fade = 1 - (idx + 1) / (trailLength + 1);
        const mat = (ghost as Mesh).material as MeshBasicMaterial;
        mat.opacity = fade * 0.44;
      });
    }
  });

  return (
    <group visible={active}>
      {/* Precision Trajectory Guide Line */}
      <primitive object={lineObject} />

      {/* Ping-Pong Ball (ITTF 40mm proportion) */}
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.038, 32, 32]} />
        <meshStandardMaterial
          color="#fffaf2"
          emissive="#e0a93b"
          emissiveIntensity={0.32}
          roughness={0.24}
          metalness={0.04}
        />
      </mesh>

      {/* Subtle Ball Glow casting light on table */}
      <pointLight ref={glowLightRef} color="#ffe8b8" intensity={1.8} distance={1.4} decay={2} />

      {/* Motion Trail Ghosts */}
      <group ref={trailGroupRef}>
        {[0.032, 0.026, 0.02, 0.015, 0.01].map((radius) => (
          <mesh key={radius}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial color="#ffd88a" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Table Contact Impact Rings on tabletop surface */}
      <mesh
        ref={ripple1Ref}
        position={[-0.22, 0.765, 0.82]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <ringGeometry args={[0.02, 0.09, 32]} />
        <meshBasicMaterial color="#f2dfbd" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      <mesh
        ref={ripple2Ref}
        position={[0.32, 0.765, -0.76]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <ringGeometry args={[0.02, 0.09, 32]} />
        <meshBasicMaterial color="#f2dfbd" transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SoftRadialFloor({ materialRef }: { materialRef: RefObject<ShaderMaterial | null> }) {
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 1 },
      uColor: { value: new Color('#0a0807') },
    }),
    [],
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.88, 0]} renderOrder={-100}>
      <planeGeometry args={[26, 26]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uOpacity;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - vec2(0.5)) * 2.0;
            // Smooth radial Gaussian falloff to zero at edges (no rectangular seams)
            float radialAlpha = smoothstep(1.0, 0.05, d) * exp(-d * d * 1.5);
            gl_FragColor = vec4(uColor, radialAlpha * uOpacity * 0.72);
          }
        `}
      />
    </mesh>
  );
}

function KarateBackdrop({ materialRef }: { materialRef: RefObject<ShaderMaterial | null> }) {
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uTopLeft: { value: new Color('#E0D4C1') },
      uCenter: { value: new Color('#CBBBA3') },
      uBottomRight: { value: new Color('#A58F73') },
    }),
    [],
  );

  return (
    <mesh position={[0, 0, -5]} renderOrder={-100} frustumCulled={false}>
      <planeGeometry args={[30, 20]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthTest
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uOpacity;
          uniform vec3 uTopLeft;
          uniform vec3 uCenter;
          uniform vec3 uBottomRight;
          varying vec2 vUv;

          void main() {
            float diagonal = clamp((vUv.x + (1.0 - vUv.y)) * 0.5, 0.0, 1.0);
            vec3 gradient = mix(uTopLeft, uBottomRight, smoothstep(0.0, 1.0, diagonal));
            float centerWeight = 1.0 - smoothstep(0.0, 0.72, distance(vUv, vec2(0.5)));
            gradient = mix(gradient, uCenter, centerWeight * 0.68);
            gl_FragColor = vec4(gradient, uOpacity);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}

function SpeakingSpotlightAtmosphere() {
  const dustPositions = useMemo(() => {
    const count = 72;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const progress = (index + 0.5) / count;
      const angle = index * 2.399963;
      const radius = (0.12 + progress * 0.82) * (0.38 + ((index * 17) % 31) / 50);
      positions[index * 3] = -0.42 + Math.cos(angle) * radius;
      positions[index * 3 + 1] = 0.38 + progress * 5.2;
      positions[index * 3 + 2] = 0.3 + Math.sin(angle) * radius * 0.56;
    }
    return positions;
  }, []);

  return (
    <group>
      <mesh position={[-0.42, 3.05, 0.28]} rotation={[0, 0, -0.035]} renderOrder={-3}>
        <coneGeometry args={[1.48, 6.3, 48, 1, true]} />
        <meshBasicMaterial
          color="#ead5ad"
          transparent
          opacity={0.052}
          depthWrite={false}
          blending={AdditiveBlending}
          side={DoubleSide}
        />
      </mesh>

      <points position={[0, 0, 0.04]} renderOrder={2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#f1dfbd"
          size={0.024}
          sizeAttenuation
          transparent
          opacity={0.34}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>

      <mesh position={[-0.42, 0.045, 0.35]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <circleGeometry args={[1.72, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            void main() {
              vec2 p = (vUv - vec2(0.5)) * 2.0;
              float distanceFromCenter = length(vec2(p.x * 0.82, p.y));
              float pool = smoothstep(1.0, 0.0, distanceFromCenter);
              pool = pow(pool, 2.2);
              gl_FragColor = vec4(vec3(0.93, 0.82, 0.64), pool * 0.22);
            }
          `}
        />
      </mesh>
    </group>
  );
}

export function AchievementsScene({
  controller,
  portrait,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
}) {
  const { camera, invalidate } = useThree();
  const table = useRef<Group>(null);
  const belt = useRef<Group>(null);
  const chess = useRef<Group>(null);
  const speaking = useRef<Group>(null);
  const tableLight = useRef<SpotLight>(null);
  const beltLight = useRef<SpotLight>(null);
  const beltRimLight = useRef<SpotLight>(null);
  const chessLight = useRef<SpotLight>(null);
  const speakingLight = useRef<SpotLight>(null);
  const speakingRimLight = useRef<SpotLight>(null);
  const tableBackdrop = useRef<ShaderMaterial>(null);
  const karateBackdrop = useRef<ShaderMaterial>(null);
  const floorMaterial = useRef<ShaderMaterial>(null);

  useEffect(() => {
    const perspective = camera as PerspectiveCamera;
    const previous = {
      fov: perspective.fov,
      near: perspective.near,
      far: perspective.far,
      position: perspective.position.clone(),
    };
    perspective.fov = portrait ? 49 : 40;
    perspective.near = 0.1;
    perspective.far = 45;
    perspective.position.set(0, portrait ? 0.7 : 1.25, portrait ? 9.4 : 9.8);
    perspective.lookAt(0, portrait ? -1.05 : -0.35, 0);
    perspective.updateProjectionMatrix();
    invalidate();
    return () => {
      perspective.fov = previous.fov;
      perspective.near = previous.near;
      perspective.far = previous.far;
      perspective.position.copy(previous.position);
      perspective.updateProjectionMatrix();
    };
  }, [camera, invalidate, portrait]);

  useFrame((state) => {
    void controller.progress.current;
    const tableProgress = panelProgress('table-tennis', portrait);
    const chessProgress = panelProgress('chess', portrait);
    const speakingProgress = panelProgress('public-speaking', portrait);
    const tableEntrance = entrancePresence(tableProgress);
    const beltEntrance = panelArrival('karate', portrait);
    const chessEntrance = panelArrival('chess', portrait);
    const speakingEntrance = panelArrival('public-speaking', portrait);
    const finaleEntrance = panelArrival('finale', portrait);

    // Crossfade subjects only when the incoming panel has begun to establish
    // itself. Previously every subject faded on its own local timeline, which
    // left an empty black interval before the next sticky panel arrived.
    const tablePresence = tableEntrance * (1 - beltEntrance);
    const beltPresence = beltEntrance * (1 - chessEntrance);
    const chessPresence = chessEntrance * (1 - speakingEntrance);
    const speakingPresence = speakingEntrance * (1 - finaleEntrance);
    // The achievements renderer is physically clipped to the narrative pane.
    // Positions below are authored inside that local viewport so each model
    // can share the editorial grid without entering the image archive.
    const centerX = 0;

    setGroupPresence(table.current, tablePresence, portrait ? 1.35 : 1.74);
    if (table.current) {
      table.current.position.set(-0.08, portrait ? -2.05 : -1.78, 0.92);
      table.current.rotation.set(0.24, -0.57, -0.035);
    }

    setGroupPresence(belt.current, 0, 0);
    if (belt.current) {
      belt.current.visible = false;
    }

    setGroupPresence(chess.current, chessPresence, portrait ? 0.78 : 1.08);
    if (chess.current) {
      const lift = smooth(chessProgress / 0.5);
      chess.current.position.set(
        centerX + (portrait ? 0.35 : 1.05),
        (portrait ? -2.45 : -1.76) - (1 - lift) * 0.8,
        -0.2,
      );
      chess.current.rotation.set(0.02, -0.28 + chessProgress * 0.08, 0);
    }

    setGroupPresence(speaking.current, speakingPresence, portrait ? 0.74 : 1.03);
    if (speaking.current) {
      const lift = smooth(speakingProgress / 0.44);
      speaking.current.position.set(
        centerX + (portrait ? 0.28 : 0.92),
        (portrait ? -2.1 : -1.48) - (1 - lift) * 1.25,
        0.08,
      );
      speaking.current.rotation.set(0, -0.2 + speakingProgress * 0.06, 0);
    }

    if (tableLight.current) tableLight.current.intensity = tablePresence * 62;
    if (beltLight.current) beltLight.current.intensity = 0;
    if (beltRimLight.current) beltRimLight.current.intensity = 0;
    if (chessLight.current) chessLight.current.intensity = chessPresence * 58;
    if (speakingLight.current) speakingLight.current.intensity = speakingPresence * 68;
    if (speakingRimLight.current) speakingRimLight.current.intensity = speakingPresence * 32;
    if (tableBackdrop.current) {
      tableBackdrop.current.uniforms.uOpacity.value = tablePresence;
      tableBackdrop.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (karateBackdrop.current) karateBackdrop.current.uniforms.uOpacity.value = 0;
    if (floorMaterial.current) {
      floorMaterial.current.uniforms.uOpacity.value =
        (1 - beltPresence) * (tablePresence > 0.01 ? 0.85 : 1.0);
    }
  });

  return (
    <>
      <TableTennisBackdrop materialRef={tableBackdrop} />
      <KarateBackdrop materialRef={karateBackdrop} />
      <fog attach="fog" args={['#0b0908', 8, 24]} />
      <ambientLight color="#8d8477" intensity={0.42} />
      <hemisphereLight args={['#b9c6cb', '#120e0b', 0.72]} />
      <directionalLight
        position={[-5, 8, 7]}
        color="#f2dfbd"
        intensity={1.8}
        castShadow={!portrait}
      />
      <spotLight
        ref={tableLight}
        position={[-3.2, 5.2, 5.0]}
        color="#f8e8cd"
        distance={16}
        angle={0.65}
        penumbra={0.78}
        decay={2}
      />
      <spotLight
        ref={beltLight}
        position={[-2.4, 4.5, 4.2]}
        color="#ede4d5"
        distance={14}
        angle={0.62}
        penumbra={0.82}
        decay={2}
      />
      <spotLight
        ref={beltRimLight}
        position={[2.8, 2.2, 3.2]}
        color="#d2c4ae"
        distance={12}
        angle={0.55}
        penumbra={0.85}
        decay={2}
      />
      <spotLight
        ref={chessLight}
        position={[2.2, 5.6, 4.2]}
        color="#eee2cc"
        distance={14}
        angle={0.56}
        penumbra={0.76}
        decay={2}
      />
      <spotLight
        ref={speakingLight}
        position={[0.25, 6.8, 3.2]}
        color="#ead5ad"
        distance={17}
        angle={0.4}
        penumbra={0.82}
        decay={2}
      />
      <spotLight
        ref={speakingRimLight}
        position={[-1.8, 4.2, -2.2]}
        color="#f1dfbd"
        distance={11}
        angle={0.48}
        penumbra={0.88}
        decay={2}
      />

      <group ref={table} visible={false}>
        {/* Soft Contact Ambient Occlusion Shadow directly grounded under table legs */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <planeGeometry args={[2.5, 3.8]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec2 vUv;
              void main() {
                vec2 p = (vUv - vec2(0.5)) * 2.0;
                float d = length(vec2(p.x * 1.25, p.y * 0.8));
                float shadow = exp(-d * d * 2.6) * 0.78 + smoothstep(0.9, 0.0, d) * 0.22;
                gl_FragColor = vec4(vec3(0.015, 0.012, 0.01), shadow * 0.88);
              }
            `}
          />
        </mesh>
        <LoadedModel url={`${MODEL_ROOT}/table-tennis.glb`} />
        <TableTennisBallTrajectory
          active={entrancePresence(panelProgress('table-tennis', portrait)) > 0.01}
        />
      </group>

      <group ref={belt} visible={false}>
        {/* Soft contact depth shadow behind the belt onto the warm beige wall */}
        <mesh position={[0.02, -0.35, -0.25]} rotation={[0, 0, -0.05]}>
          <planeGeometry args={[4.2, 3.2]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec2 vUv;
              void main() {
                vec2 p = (vUv - vec2(0.5)) * 2.0;
                float d = length(vec2(p.x * 0.88, p.y * 1.25));
                float shadow = exp(-d * d * 3.4) * 0.48 + smoothstep(0.85, 0.0, d) * 0.16;
                gl_FragColor = vec4(vec3(0.04, 0.035, 0.03), shadow * 0.72);
              }
            `}
          />
        </mesh>
        <LoadedModel url={`${MODEL_ROOT}/karate-black-belt.glb`} treatment="fabric" />
      </group>

      <group ref={chess} visible={false}>
        <ChessBoard />
        <group position={[-1.2, 0.1, -0.4]} scale={14.5} rotation={[0, 0.35, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/chess-knight.glb`} treatment="ivory" />
        </group>
        <group position={[0.18, 0.1, 0.35]} scale={22} rotation={[0, -0.22, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/chess-queen.glb`} treatment="charcoal" />
        </group>
        <group position={[1.3, 0.1, -0.64]} scale={15.5} rotation={[0, -0.38, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/chess-king.glb`} treatment="ivory" />
        </group>
      </group>

      <group ref={speaking} visible={false}>
        <SpeakingSpotlightAtmosphere />
        <group position={[0, -0.15, 0]} scale={0.92}>
          <LoadedModel url={`${MODEL_ROOT}/stage-platform.glb`} treatment="charcoal" />
        </group>
        <group position={[-0.55, 0.18, 0.42]} scale={1.52} rotation={[0, -0.24, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/stage-microphone.glb`} treatment="metal" />
        </group>
        <group position={[1.6, 0.04, -0.2]} scale={1.4} rotation={[0, -0.34, 0]}>
          <LoadedModel url={`${MODEL_ROOT}/line-array-speaker.glb`} treatment="speaker" />
        </group>
      </group>

      <SoftRadialFloor materialRef={floorMaterial} />
    </>
  );
}
