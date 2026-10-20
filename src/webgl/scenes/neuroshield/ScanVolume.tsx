import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  type Group,
  type LineBasicMaterial,
  type MeshBasicMaterial,
  PlaneGeometry,
  type PointLight,
  ShaderMaterial,
  Vector3,
} from 'three';
import { rangeProgress, smoothstep } from '@/components/neuroshield/neuroShieldChoreography';
import { SpatialType } from '../palindrome/SpatialType';

export const SCAN_BACKGROUND = '#172E43';
const ramp = (p: number, a: number, b: number) => smoothstep(rangeProgress(p, a, b));

// Illustrative sections, not measurements or findings. Each section changes its
// cranial outline, tissue contours and ventricular profile with slice depth.
export function makeScanMaterial(index: number, color: string) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: {
      uSlice: { value: index },
      uTint: { value: new Color(color) },
      uFocus: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uSlice, uFocus, uOpacity;
      uniform vec3 uTint;
      void main(){
        vec2 q=(vUv-.5)*2.;
        float section=.65+.28*sin(.3+uSlice*.23);
        q.x/=section;
        q.y/=.87+.08*cos(uSlice*.37);
        float angle=atan(q.y,q.x);
        float r=length(q);
        float boundary=.8+.035*cos(angle*3.+uSlice*.3)+.018*sin(angle*7.);
        float tissue=1.-smoothstep(boundary-.025,boundary,r);
        float cortex=exp(-pow((r-boundary+.045)*39.,2.));
        float fissure=exp(-pow(q.x*38.,2.))*(1.-smoothstep(.4,.74,abs(q.y)));
        vec2 vent=vec2(abs(q.x)-.105,q.y+.03+.04*sin(uSlice));
        float ventricles=1.-smoothstep(.06,.105,length(vent*vec2(1.1,.55)));
        float folds=.5+.5*sin(r*61.+sin(angle*11.+uSlice)*2.3+sin(q.y*19.)*1.7+uSlice*.63);
        float tissueTone=(.29+folds*.21+cortex*.36)*(1.-ventricles*.84)*(1.-fissure*.64);
        float grain=fract(sin(dot(floor(vUv*420.),vec2(12.9898,78.233))+uSlice*5.)*43758.5453)-.5;
        float frame=(1.-smoothstep(.97,.99,max(abs(q.x*section),abs(q.y))));
        vec3 anatomy=mix(uTint,vec3(.79,.85,.83),.28+uFocus*.31);
        vec3 col=anatomy*(tissueTone+grain*.025)*(.65+uFocus*.65);
        float alpha=(tissue*(.34+tissueTone*.49)+frame*.025)*uOpacity;
        gl_FragColor=vec4(col,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

function registrationMarks() {
  const points: number[] = [];
  for (const x of [-1.85, 1.85])
    for (const y of [-1.62, 1.62]) {
      points.push(
        x,
        y - Math.sign(y) * 0.18,
        0.01,
        x,
        y,
        0.01,
        x,
        y,
        0.01,
        x - Math.sign(x) * 0.18,
        y,
        0.01,
      );
    }
  for (let i = -3; i <= 3; i++) points.push(-1.89, i * 0.37, 0.01, -1.84, i * 0.37, 0.01);
  return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(points, 3));
}

export function ScanVolume({
  progress,
  scale,
}: {
  progress: MutableRefObject<number>;
  scale: MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const root = useRef<Group>(null);
  const films = useRef<(Group | null)[]>([]);
  const marks = useRef<(LineBasicMaterial | null)[]>([]);
  const labels = useRef<(MeshBasicMaterial | null)[]>([]);
  const glow = useRef<PointLight>(null);
  const geometry = useMemo(() => new PlaneGeometry(3.8, 3.4), []);
  const corners = useMemo(registrationMarks, []);
  const materials = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) =>
        makeScanMaterial(i, i % 3 === 0 ? '#9DC8D3' : i % 3 === 1 ? '#599DAF' : '#6386AD'),
      ),
    [],
  );
  const localCamera = useMemo(() => new Vector3(), []);
  useEffect(
    () => () => {
      geometry.dispose();
      corners.dispose();
      materials.forEach((m) => m.dispose());
    },
    [geometry, corners, materials],
  );
  useFrame(() => {
    if (!root.current) return;
    root.current.updateWorldMatrix(true, false);
    root.current.worldToLocal(localCamera.copy(camera.position));
    const p = progress.current;
    const presence = ramp(p, 0.27, 0.39) * (1 - ramp(p, 0.76, 0.94));
    let strongest = 0,
      focusedZ = 0;
    materials.forEach((material, i) => {
      const group = films.current[i];
      if (!group) return;
      const leave = ramp(p, 0.73, 0.91);
      const z = 17.6 - i * 0.7;
      group.position.set(
        Math.sin(i * 0.9) * 0.1 + (i % 2 === 0 ? -1 : 1) * leave * 3.4,
        Math.cos(i * 0.8) * 0.08,
        z,
      );
      group.rotation.set(leave * 0.12, (i % 2 === 0 ? 1 : -1) * (0.045 + leave * 0.92), 0);
      const distance = localCamera.z - z;
      const focus = Math.exp(-(((distance - 1.8) / 1.6) ** 2));
      const crossing = ramp(Math.abs(distance), 0.06, 0.55);
      const alpha = presence * crossing * (0.25 + focus * 0.72);
      material.uniforms.uOpacity.value = alpha;
      material.uniforms.uFocus.value = focus;
      group.visible = alpha > 0.001;
      if (marks.current[i]) marks.current[i]!.opacity = alpha * 0.38;
      if (labels.current[i]) labels.current[i]!.opacity = alpha * 0.65;
      if (focus > strongest) {
        strongest = focus;
        focusedZ = z;
      }
    });
    if (glow.current) {
      glow.current.position.set(0.65, 0.35, focusedZ + 0.7);
      glow.current.intensity = strongest * presence * 2.2 * scale.current ** 2;
      glow.current.distance = 6 * scale.current;
    }
  });
  return (
    <group ref={root} position={[0.2, 1.8, -2.2]} name="NS_IllustrativeScanVolume">
      {materials.map((material, i) => (
        <group
          key={material.uuid}
          ref={(node) => {
            films.current[i] = node;
          }}
        >
          <mesh geometry={geometry} material={material} />
          <lineSegments geometry={corners}>
            <lineBasicMaterial
              ref={(m) => {
                marks.current[i] = m;
              }}
              color="#DCE7DD"
              transparent
              opacity={0}
              depthWrite={false}
            />
          </lineSegments>
          <group position={[-0.92, -1.76, 0]}>
            <SpatialType
              text={`AXIAL / ${String(i + 1).padStart(2, '0')} · ILLUSTRATIVE`}
              height={0.095}
              color="#BFD5DC"
              materialRef={(m) => {
                labels.current[i] = m;
              }}
            />
          </group>
        </group>
      ))}
      <pointLight ref={glow} color="#9DCAD8" intensity={0} decay={2} />
    </group>
  );
}

export function ReconstructionContours({ progress }: { progress: MutableRefObject<number> }) {
  const groups = useRef<(Group | null)[]>([]);
  const materials = useRef<(LineBasicMaterial | null)[]>([]);
  const contours = useMemo(
    () =>
      Array.from({ length: 9 }, (_, slice) => {
        const points: number[] = [];
        const size = Math.sqrt(Math.max(0.12, 1 - ((slice - 4) / 5.2) ** 2));
        for (const side of [-1, 1])
          for (let i = 0; i < 96; i++) {
            for (const step of [i, i + 1]) {
              const a = (step / 96) * Math.PI * 2;
              const fold = 1 + 0.025 * Math.sin(a * 13 + slice * 0.7);
              points.push(
                side * 0.72 + Math.cos(a) * 0.78 * size * fold,
                Math.sin(a) * 0.94 * size * fold,
                0,
              );
            }
          }
        return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(points, 3));
      }),
    [],
  );
  useEffect(() => () => contours.forEach((g) => g.dispose()), [contours]);
  useFrame(() => {
    const p = progress.current;
    contours.forEach((_, i) => {
      const reveal = ramp(p, 0.65 + i * 0.009, 0.76 + i * 0.009) * (1 - ramp(p, 0.89, 0.985));
      if (groups.current[i])
        groups.current[i]!.position.z = (i - 4) * (0.54 - 0.3 * ramp(p, 0.74, 0.94));
      if (materials.current[i]) materials.current[i]!.opacity = reveal * 0.62;
    });
  });
  return (
    <group position={[0.2, 1.8, -2.2]} rotation={[0.04, -0.33, 0]}>
      {contours.map((geometry, i) => (
        <group
          key={geometry.uuid}
          ref={(g) => {
            groups.current[i] = g;
          }}
        >
          <lineSegments geometry={geometry}>
            <lineBasicMaterial
              ref={(m) => {
                materials.current[i] = m;
              }}
              color={i % 3 === 0 ? '#D7E3D9' : '#84B7CB'}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}
