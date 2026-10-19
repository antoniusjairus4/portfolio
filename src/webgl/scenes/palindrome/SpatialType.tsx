import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { CanvasTexture, SRGBColorSpace, type Mesh, type MeshBasicMaterial } from 'three';

/** Locally rasterized lettering with a transparent background, never a UI panel. */
export function SpatialType({
  text,
  height = 0.224,
  color = '#111111',
  materialRef,
}: {
  text: string;
  height?: number;
  color?: string;
  materialRef?: (material: MeshBasicMaterial | null) => void;
}) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context || !material.current || !mesh.current) return;
    context.font = '600 60px sans-serif';
    canvas.width = Math.ceil(context.measureText(text).width + 24);
    canvas.height = 96;
    context.font = '600 60px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.fillText(text, canvas.width / 2, 49);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    material.current.map = texture;
    material.current.needsUpdate = true;
    mesh.current.scale.set((canvas.width / canvas.height) * height, height, 1);
    mesh.current.visible = true;
    invalidate();
    return () => {
      texture.dispose();
    };
  }, [text, height, invalidate]);
  return (
    <mesh ref={mesh} visible={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={(node) => {
          material.current = node;
          materialRef?.(node);
        }}
        color={color}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
