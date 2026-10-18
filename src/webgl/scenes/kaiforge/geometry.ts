import { BoxGeometry, type BufferGeometry, CylinderGeometry, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export type XYZ = [number, number, number];
export type Box = [XYZ, XYZ];
export function boxes(parts: Box[]) {
  return mergeOwned(
    parts.map(([position, size]) => new BoxGeometry(...size).translate(...position)),
  );
}
export function mergeOwned(parts: BufferGeometry[]) {
  const result = mergeGeometries(parts);
  for (const part of parts) part.dispose();
  return result;
}
export function limb(a: XYZ, b: XYZ, radius: number) {
  const start = new Vector3(...a),
    end = new Vector3(...b);
  const direction = end.clone().sub(start);
  return new CylinderGeometry(radius * 0.85, radius, direction.length(), 8)
    .applyQuaternion(
      new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize()),
    )
    .translate(...start.add(end).multiplyScalar(0.5).toArray());
}
