'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { type PerspectiveCamera, Vector2, Vector3 } from 'three';
import { getCategoryOpacity, getSkillRecognition } from '@/components/skills/skillsChoreography';
import { getSkillLabel, skillLabelId } from '@/components/skills/skillsLabels';
import { createSkillsRoute, routeParameter, skillAnchor } from '@/components/skills/skillsSpatial';
import { skillCategories } from '@/content/skills';
import type { ChapterProgressController } from '@/experience/chapterProgress';
import { SkillIdentitySystem } from './skills/SkillIdentitySystem';
import { SkillsArchitecture } from './skills/SkillsArchitecture';
import { SkillsEnvironment } from './skills/SkillsEnvironment';
import { SkillsLighting } from './skills/SkillsLighting';
import { SkillsMaterialProvider } from './skills/SkillsMaterials';

interface SkillsSceneProps {
  controller: ChapterProgressController;
  portrait: boolean;
  finePointer: boolean;
}

export function SkillsScene({ controller, portrait, finePointer }: SkillsSceneProps) {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const perspective = camera as PerspectiveCamera;
    const previous = perspective.far;
    perspective.far = 180;
    perspective.updateProjectionMatrix();
    return () => {
      perspective.far = previous;
      perspective.updateProjectionMatrix();
    };
  }, [camera]);
  const route = useMemo(() => createSkillsRoute(portrait), [portrait]);
  const pointer = useRef(new Vector2());
  const target = useMemo(() => new Vector3(), []);
  const projection = useMemo(() => new Vector3(), []);
  const inscriptions = useMemo(
    () =>
      skillCategories.flatMap((category, domain) =>
        category.skills.map((_, skill) => ({
          id: skillLabelId(domain, skill),
          domain,
          skill,
          count: category.skills.length,
          anchor: new Vector3(...skillAnchor(domain, skill, portrait)),
        })),
      ),
    [portrait],
  );

  useEffect(() => {
    // The shared canvas doesn't capture events. Listen passively only while this
    // scene owns it; no orbit controls, scroll capture or idle animation loop.
    if (!finePointer || portrait || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      pointer.current.set(
        Math.max(-1, Math.min(1, (event.clientX / window.innerWidth) * 2 - 1)),
        Math.max(-1, Math.min(1, 1 - (event.clientY / window.innerHeight) * 2)),
      );
      invalidate();
    };
    const reset = () => {
      pointer.current.set(0, 0);
      invalidate();
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      pointer.current.set(0, 0);
    };
  }, [finePointer, portrait, invalidate]);

  useEffect(
    () => () => {
      for (const inscription of inscriptions) {
        const element = getSkillLabel(inscription.id);
        if (element) element.style.opacity = '0';
      }
    },
    [inscriptions],
  );

  useFrame(() => {
    const progress = controller.progress.current;
    const parameter = routeParameter(progress);
    const perspective = camera as PerspectiveCamera;
    const fov = portrait ? 58 : 52;
    if (perspective.fov !== fov) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }
    route.camera.getPoint(parameter, camera.position);
    route.target.getPoint(parameter, target);
    const agency = !portrait && finePointer ? 1 : 0;
    camera.position.x += pointer.current.x * 0.12 * agency;
    camera.position.y += pointer.current.y * 0.07 * agency;
    target.x += pointer.current.x * 0.25 * agency;
    target.y += pointer.current.y * 0.12 * agency;
    camera.up.set(0, 1, 0);
    camera.lookAt(target);
    camera.updateMatrixWorld();

    // DOM text shares immutable world anchors and the same authored camera.
    // No independent parallax and no React state updates on rendered frames.
    for (const inscription of inscriptions) {
      const element = getSkillLabel(inscription.id);
      if (!element) continue;
      projection.copy(inscription.anchor).project(camera);
      const domainOpacity = getCategoryOpacity(progress, inscription.domain);
      const inFrame =
        projection.z > -1 &&
        projection.z < 1 &&
        Math.abs(projection.x) < 0.96 &&
        Math.abs(projection.y) < 0.94;
      const recognition = getSkillRecognition(
        progress,
        inscription.domain,
        inscription.skill,
        inscription.count,
      );
      const opacity = inFrame ? domainOpacity * recognition : 0;
      element.style.setProperty('--skill-focus', recognition.toFixed(3));
      element.style.opacity = opacity.toFixed(3);
      if (opacity < 0.002) {
        element.style.transform = '';
        continue;
      }
      const x = (projection.x * 0.5 + 0.5) * size.width;
      const y = (-projection.y * 0.5 + 0.5) * size.height;
      const distance = camera.position.distanceTo(inscription.anchor);
      const scale = Math.max(
        portrait ? 0.86 : 0.8,
        Math.min(1.12, (portrait ? 14 : 12) / distance),
      );
      element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
    }
  }, -2);

  return (
    <>
      <color attach="background" args={['#718994']} />
      <fog attach="fog" args={['#718994', 26, 158]} />
      <SkillsEnvironment portrait={portrait} />
      <SkillsLighting controller={controller} portrait={portrait} />
      <SkillsMaterialProvider>
        <SkillsArchitecture portrait={portrait} controller={controller} />
        <SkillIdentitySystem portrait={portrait} controller={controller} />
      </SkillsMaterialProvider>
    </>
  );
}
