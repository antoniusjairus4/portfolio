import { useFrame } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import {
  CatmullRomCurve3,
  CylinderGeometry,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  type InstancedMesh,
  type MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { scanCursor, scanPath, scanRamp, spineReveal } from './scanJourney';

// A deliberately simplified editorial spine, not a patient reconstruction.
// Vertebral bodies, posterior arches and short processes give the column a
// readable silhouette. The camera travels beside it, never through the bones.
function vertebra() {
  const body = new CylinderGeometry(0.32, 0.35, 0.24, 16, 1);
  body.rotateX(Math.PI / 2);
  body.scale(1, 0.72, 1);
  body.translate(0, 0.23, 0);
  const arch = new TorusGeometry(0.25, 0.065, 6, 18, Math.PI * 1.6);
  arch.rotateZ(Math.PI * 0.7);
  arch.scale(1, 1.18, 0.8);
  arch.translate(0, -0.12, 0);
  const process = new CylinderGeometry(0.035, 0.075, 0.31, 6);
  process.translate(0, -0.49, 0);
  const left = new CylinderGeometry(0.045, 0.065, 0.28, 6);
  left.rotateZ(Math.PI / 2 + 0.2);
  left.translate(-0.34, -0.07, 0);
  const right = left.clone();
  right.rotateY(Math.PI);
  const parts = [body, arch, process, left, right];
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!geometry) throw new Error('Unable to build spinal passage geometry');
  return geometry;
}

export function SpinalPassage({
  progress,
  portrait,
}: {
  progress: MutableRefObject<number>;
  portrait: boolean;
}) {
  const count = portrait ? 12 : 16;
  const column = useRef<InstancedMesh>(null);
  const cordMaterial = useRef<MeshBasicMaterial>(null);
  const resources = useMemo(() => {
    const geometry = vertebra();
    const focus = new InstancedBufferAttribute(new Float32Array(count), 1);
    focus.setUsage(DynamicDrawUsage);
    geometry.setAttribute('aFocus', focus);
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uPresence: { value: 0 } },
      vertexShader: `
        attribute float aFocus;
        varying vec3 vNormal;
        varying float vFocus;
        void main() {
          vFocus=aFocus;
          vNormal=normalize(mat3(instanceMatrix)*normal);
          gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);
        }`,
      fragmentShader: `
        uniform float uPresence;
        varying vec3 vNormal;
        varying float vFocus;
        void main() {
          float key=max(0.,dot(normalize(vNormal),normalize(vec3(-.6,.8,1.))));
          vec3 shade=mix(vec3(.09,.16,.19),vec3(.72,.73,.64),key*.8+.12);
          float alpha=uPresence*vFocus;
          if(alpha<.005) discard;
          gl_FragColor=vec4(shade*(.65+vFocus*.45),alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const points = Array.from({ length: 36 }, (_, i) => {
      const point = scanPath(0.22 + (i / 35) * 0.6, 1, new Vector3());
      point.x += portrait ? 0.6 : 0.83;
      point.y -= 0.1;
      return point;
    });
    const cord = new TubeGeometry(new CatmullRomCurve3(points), 64, 0.045, 6, false);
    return { geometry, material, focus, cord };
  }, [count, portrait]);
  const scratch = useMemo(
    () => ({
      object: new Object3D(),
      next: new Vector3(),
      normal: new Vector3(),
      axis: new Vector3(0, 0, 1),
    }),
    [],
  );
  useEffect(() => {
    column.current?.instanceMatrix.setUsage(DynamicDrawUsage);
    return () => {
      resources.geometry.dispose();
      resources.material.dispose();
      resources.cord.dispose();
    };
  }, [resources]);
  useFrame(() => {
    if (!column.current) return;
    const p = progress.current;
    const cursor = scanCursor(p);
    const presence = spineReveal(p) * (1 - scanRamp(p, 0.79, 0.88));
    column.current.visible = presence > 0.001;
    resources.material.uniforms.uPresence.value = presence;
    for (let i = 0; i < count; i++) {
      const t = 0.22 + (i / (count - 1)) * 0.6;
      const object = scratch.object;
      scanPath(t, 1, object.position);
      scanPath(t + 0.004, 1, scratch.next);
      scratch.normal.copy(object.position).sub(scratch.next).normalize();
      object.quaternion.setFromUnitVectors(scratch.axis, scratch.normal);
      object.position.x += portrait ? 0.6 : 0.83;
      const size = 0.82 + 0.3 * scanRamp(t, 0.22, 0.75);
      object.scale.set(size, size, size * 2.2);
      object.updateMatrix();
      column.current.setMatrixAt(i, object.matrix);
      const ahead = scanRamp(t - cursor, -0.04, 0.015);
      const distance = Math.max(0, t - cursor - 0.04);
      const focus = Math.exp(-distance * 7);
      resources.focus.setX(i, ahead * (0.12 + focus * 0.88));
    }
    resources.focus.needsUpdate = true;
    column.current.instanceMatrix.needsUpdate = true;
    if (cordMaterial.current) cordMaterial.current.opacity = presence * 0.24;
  });
  return (
    <>
      <instancedMesh
        ref={column}
        args={[resources.geometry, resources.material, count]}
        frustumCulled={false}
        name="NS_IllustrativeSpinalColumn"
      />
      <mesh geometry={resources.cord}>
        <meshBasicMaterial
          ref={cordMaterial}
          color="#78999D"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
