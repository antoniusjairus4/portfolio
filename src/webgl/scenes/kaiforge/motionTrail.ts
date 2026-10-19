import {
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Float32BufferAttribute,
  MeshBasicMaterial,
  Vector3,
} from 'three';

type PositionSampler = (progress: number, out: Vector3) => Vector3;

/** Reusable tube buffer. Taper and opacity are rebuilt from absolute samples. */
export function createMotionTrail(segments: number, radius: number, color: string) {
  const sides = 4;
  const positions = new Float32BufferAttribute(new Float32Array((segments + 1) * sides * 3), 3);
  const colors = new Float32BufferAttribute(new Float32Array((segments + 1) * sides * 4), 4);
  positions.setUsage(DynamicDrawUsage);
  colors.setUsage(DynamicDrawUsage);
  const indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j,
        b = i * sides + ((j + 1) % sides);
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  geometry.setAttribute('color', colors);
  geometry.setIndex(indices);
  geometry.setDrawRange(0, 0);
  const material = new MeshBasicMaterial({
    color,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const point = new Vector3(),
    before = new Vector3(),
    after = new Vector3();
  const tangent = new Vector3(),
    normal = new Vector3(),
    binormal = new Vector3();
  const zAxis = new Vector3(0, 0, 1),
    yAxis = new Vector3(0, 1, 0);
  return {
    geometry,
    material,
    tint(a: Color, b: Color, amount: number) {
      material.color.lerpColors(a, b, amount);
    },
    update(sample: PositionSampler, start: number, end: number, opacity: number, tail = 0) {
      material.opacity = opacity;
      if (opacity < 0.001 || end - start < 0.00001) {
        geometry.setDrawRange(0, 0);
        return;
      }
      geometry.setDrawRange(0, indices.length);
      for (let i = 0; i <= segments; i++) {
        const along = i / segments;
        const at = start + (end - start) * along;
        sample(at, point);
        sample(Math.max(start, at - 0.0001), before);
        sample(Math.min(end, at + 0.0001), after);
        tangent.subVectors(after, before).normalize();
        normal.crossVectors(tangent, Math.abs(tangent.z) < 0.9 ? zAxis : yAxis).normalize();
        binormal.crossVectors(tangent, normal).normalize();
        const fade = tail + (1 - tail) * along ** 0.8;
        const width = radius * (0.12 + 0.88 * Math.sqrt(fade));
        for (let j = 0; j < sides; j++) {
          const angle = (j / sides) * Math.PI * 2;
          const a = Math.cos(angle) * width,
            b = Math.sin(angle) * width;
          const index = i * sides + j;
          positions.setXYZ(
            index,
            point.x + normal.x * a + binormal.x * b,
            point.y + normal.y * a + binormal.y * b,
            point.z + normal.z * a + binormal.z * b,
          );
          colors.setXYZW(index, 1, 1, 1, fade);
        }
      }
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      geometry.computeBoundingSphere();
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
