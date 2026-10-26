'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Color, type ShaderMaterial } from 'three';
import type { ChapterProgressController } from '@/experience/chapterProgress';

// The field and contour treatment come from the supplied React Bits FluxLines shader.
// World-space UVs keep the animation attached to the 3D floor as the camera travels.
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uWorldWidth;
uniform float uOpacity;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * 3.14159265 - 3.14159265 / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}

void main() {
  vec2 world = vec2((vUv.x - 0.5) * uWorldWidth, (vUv.y - 0.5) * 172.0);
  vec2 p = world * 4.35;
  vec2 dir = vec2(0.0, -1.0);
  vec2 perp = vec2(1.0, 0.0);
  float travel = uTime * 18.0;
  float distort1 = vn(p + perp * travel, 60.0, 10.0) * 42.0;
  float distort2 = vn(p - perp * travel, 120.0, 15.0) * 78.0;
  float peaks = dbn(p + distort1 + dir * travel * 0.5, 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * travel * 0.5, 40.0, 0.0);
  float field = smin(peaks, peaks2, 0.1);

  float gap = abs(field - 0.4);
  float core = 1.0 - smoothstep(0.018, 0.055, gap);
  float rim = 1.0 - smoothstep(0.045, 0.13, gap);
  float shimmer = vn(p + dir * travel * 0.5, 60.0, 12.0);
  float energy = (core * 0.82 + rim * 0.28) * (0.8 + 0.2 * shimmer);
  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 tint = mix(uColorA, uColorB, smoothstep(0.1, 0.72, h));
  tint = mix(tint, uColorC, smoothstep(0.58, 0.95, h) * 0.36);
  float distanceFade = 1.0 - 0.72 * smoothstep(0.64, 1.0, vUv.y);
  float alpha = clamp(energy * uOpacity * distanceFade, 0.0, 0.68);
  gl_FragColor = vec4(tint, alpha);
}`;

export function CapabilityFluxFloor({
  controller,
  portrait,
  geometry,
}: {
  controller: ChapterProgressController;
  portrait: boolean;
  geometry: import('three').PlaneGeometry;
}) {
  const materialRef = useRef<ShaderMaterial>(null);
  const { invalidate } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWorldWidth: { value: portrait ? 30 : 66 },
      uOpacity: { value: portrait ? 0.48 : 0.56 },
      uColorA: { value: new Color('#8b3048') },
      uColorB: { value: new Color('#b04d64') },
      uColorC: { value: new Color('#8ca5ad') },
    }),
    [portrait],
  );

  useFrame((_, delta) => {
    if (controller.progress.current < 0.28 || !materialRef.current) return;
    materialRef.current.uniforms.uTime.value += Math.min(delta, 0.05);
    invalidate();
  });

  return (
    <mesh
      name="capability-flux-lines-floor"
      position={[0, -2.705, -62]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      renderOrder={2}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
}
