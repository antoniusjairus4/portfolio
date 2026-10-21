import type { RefObject } from 'react';
import type { Vector2 } from 'three';

export type SkillsPointerState = RefObject<{
  active: boolean;
  ndc: Vector2;
}>;
