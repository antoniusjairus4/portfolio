import { SRGBColorSpace, Texture, type WebGLRenderer } from 'three';
import type { ProductionAssetDriver } from './types';

type PreparedImage = ImageBitmap;
export type NeuroImage = Texture;

export const neuroImageDriver: ProductionAssetDriver<
  PreparedImage,
  NeuroImage,
  { gl: WebGLRenderer }
> = {
  async prepare(bytes) {
    return createImageBitmap(new Blob([bytes]), {
      colorSpaceConversion: 'default',
      imageOrientation: 'none',
    });
  },
  makeResident(bitmap, { gl }) {
    const texture = new Texture(bitmap);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    gl.initTexture(texture);
    return texture;
  },
  disposePrepared(bitmap) {
    bitmap.close();
  },
  disposeResident(texture) {
    const bitmap = texture.image;
    texture.dispose();
    if (bitmap instanceof ImageBitmap) bitmap.close();
  },
};
