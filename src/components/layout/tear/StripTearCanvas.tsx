'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { composePageTexture } from './composePageTexture';
import { computeStripProgress, getStripCount, pseudoRandom } from './stripMath';
import { stripFragmentShader, stripVertexShader } from './stripShaders';

interface StripTearCanvasProps {
  scrollProgress: number; // Beat D progress (0.0 to 1.0)
  width: number;
  height: number;
  onWarmupComplete?: () => void;
}

export const StripTearCanvas: React.FC<StripTearCanvasProps> = ({
  scrollProgress,
  width,
  height,
  onWarmupComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const textureRef = useRef<THREE.Texture | null>(null);

  const [stripCount, setStripCount] = useState<number>(() => getStripCount(width));

  // Compute responsive strip count
  useEffect(() => {
    setStripCount(getStripCount(width));
  }, [width]);

  // Setup Three.js scene, camera, renderer & strips
  useEffect(() => {
    if (!containerRef.current || width === 0 || height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const numStrips = getStripCount(width);
    setStripCount(numStrips);

    // 1. Scene & Camera (Orthographic -1 to 1 space)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    camera.position.z = 2;
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // 3. Compose Offscreen Page Texture
    let isDisposed = false;
    materialsRef.current = [];

    composePageTexture({ width, height, dpr }).then((canvasTextureElement) => {
      if (isDisposed) return;

      const texture = new THREE.CanvasTexture(canvasTextureElement);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      textureRef.current = texture;

      // Build strip planes
      const totalWidth = aspect * 2;
      const stripWidth = totalWidth / numStrips;
      const bleedPx = 2;
      const bleedAspect = (bleedPx / width) * totalWidth;

      const rng = pseudoRandom(42);

      for (let i = 0; i < numStrips; i++) {
        // Subdivided plane geometry (32 vertical segments for smooth cylinder bend)
        const planeGeo = new THREE.PlaneGeometry(stripWidth + bleedAspect * 2, 2, 8, 32);

        // Seeded random variation per strip
        const rotZ = (rng() - 0.5) * 0.1;       // ~±3 to 6 deg Z rotation
        const driftX = (rng() - 0.5) * 0.15;    // Small X drift
        const curlRadius = 0.25 + rng() * 0.15;  // Curl radius R
        const seed = rng() * 100.0;

        const uvMinX = Math.max(0, i / numStrips - bleedPx / width);
        const uvMaxX = Math.min(1, (i + 1) / numStrips + bleedPx / width);

        const mat = new THREE.ShaderMaterial({
          vertexShader: stripVertexShader,
          fragmentShader: stripFragmentShader,
          side: THREE.DoubleSide,
          transparent: true,
          uniforms: {
            uProgress: { value: 0 },
            uCurlRadius: { value: curlRadius },
            uRotZ: { value: rotZ },
            uDriftX: { value: driftX },
            uUvMinX: { value: uvMinX },
            uUvMaxX: { value: uvMaxX },
            uAspect: { value: aspect },
            uSeed: { value: seed },
            uTexture: { value: texture },
          },
        });

        materialsRef.current.push(mat);

        const mesh = new THREE.Mesh(planeGeo, mat);
        // Position mesh X center in camera space (-aspect to aspect)
        const posX = -aspect + (i + 0.5) * stripWidth;
        mesh.position.set(posX, 0, 0);

        scene.add(mesh);
      }

      // Warmup compile & initial render
      renderer.compile(scene, camera);
      renderer.render(scene, camera);

      if (onWarmupComplete) onWarmupComplete();
    });

    return () => {
      isDisposed = true;
      if (rendererRef.current && containerRef.current) {
        if (containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, [width, height, onWarmupComplete]);

  // Update strip progress uniforms demand-based driven by scrollProgress
  useEffect(() => {
    if (!materialsRef.current || materialsRef.current.length === 0) return;

    const numStrips = materialsRef.current.length;
    for (let i = 0; i < numStrips; i++) {
      const p = computeStripProgress({
        stripIndex: i,
        totalStrips: numStrips,
        overallProgress: scrollProgress,
      });
      materialsRef.current[i].uniforms.uProgress.value = p;
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      data-strips={stripCount}
      className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-hidden"
      aria-hidden="true"
    />
  );
};
