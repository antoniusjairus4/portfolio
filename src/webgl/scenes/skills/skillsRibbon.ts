import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3 } from 'three';

// Four broad faces share normals along the sweep but retain crisp slab edges.
// The entire architectural gesture is a single closed, low-resolution mesh.
export function createSkillsRibbon(
  points: readonly (readonly number[])[],
  width: number,
  thickness: number,
  segments = 32,
  offset = 0,
) {
  const curve = new CatmullRomCurve3(
    points.map((p) => new Vector3(p[0], p[1], p[2])),
    false,
    'catmullrom',
    0.35,
  );
  const vertices: number[] = [];
  const indices: number[] = [];
  const up = new Vector3(0, 1, 0);
  const right = new Vector3();
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  for (let i = 0; i <= segments; i++) {
    const point = curve.getPoint(i / segments);
    right.crossVectors(curve.getTangent(i / segments), up).normalize();
    point.addScaledVector(right, offset);
    for (let face = 0; face < 4; face++)
      for (const c of [face, (face + 1) % 4]) {
        const [x, y] = corners[c];
        const corner = point.clone().addScaledVector(right, (x * width) / 2);
        vertices.push(corner.x, corner.y + (y * thickness) / 2, corner.z);
      }
    if (i < segments)
      for (let face = 0; face < 4; face++) {
        const a = i * 8 + face * 2;
        indices.push(a, a + 8, a + 1, a + 1, a + 8, a + 9);
      }
  }
  // End caps use separate vertices so they don't soften the long faces.
  for (const end of [0, segments]) {
    const base = vertices.length / 3;
    for (let c = 0; c < 4; c++) {
      const i = (end * 8 + c * 2) * 3;
      vertices.push(vertices[i], vertices[i + 1], vertices[i + 2]);
    }
    if (end === 0) indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    else indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}
