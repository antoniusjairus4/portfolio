import type { AssetLifecycleManager } from './AssetLifecycleManager';
import type { ProjectSceneKey } from '@/experience/ProjectExperienceProvider';

export interface AssetChapterSignal {
  progress: number;
  top: number;
  bottom: number;
}

export type AssetChapterSignals = Partial<Record<ProjectSceneKey, AssetChapterSignal>>;

export interface AssetCoordinationInput {
  eligible: boolean;
  criticalReady: boolean;
  viewportHeight: number;
  chapters: AssetChapterSignals;
}

/** Coarse lifecycle decisions only. This is called by the existing scene-selection RAF. */
export function coordinateProductionAssets(
  manager: AssetLifecycleManager,
  { eligible, criticalReady, viewportHeight, chapters }: AssetCoordinationInput,
) {
  if (!eligible || !criticalReady) return;
  const vh = Math.max(1, viewportHeight);
  const kf = chapters.kaiforge;
  const pal = chapters.palindrome;
  const ns = chapters.neuroshield;
  const skills = chapters.skills;

  if (skills && skills.bottom <= vh * 0.25) {
    manager.disposeAll();
    return;
  }

  if (!pal || pal.progress < 0.12) {
    void manager.requestOwner('kaiforge');
    if (kf && kf.top <= vh * 2) void manager.prepareOwner('kaiforge');
  }

  if ((kf && kf.progress >= 0.18) || (pal && pal.top <= vh * 6)) {
    void manager.requestOwner('palindrome');
  }
  if ((kf && kf.progress >= 0.7) || (pal && pal.top <= vh * 2)) {
    void manager.prepareOwner('palindrome');
  }

  if ((pal && pal.progress >= 0.2) || (ns && ns.top <= vh * 6)) {
    void manager.requestOwner('neuroshield');
  }
  if ((pal && pal.progress >= 0.7) || (ns && ns.top <= vh * 2)) {
    void manager.prepareOwner('neuroshield');
  }

  if ((ns && ns.progress >= 0.2) || (skills && skills.top <= vh * 6)) {
    void manager.requestOwner('skills');
  }
  if ((ns && ns.progress >= 0.7) || (skills && skills.top <= vh * 2)) {
    void manager.prepareOwner('skills');
  }

  if (pal && pal.progress >= 0.12) manager.disposeOwner('kaiforge');
  if (ns && ns.progress >= 0.12) manager.disposeOwner('palindrome');
  if (skills && skills.progress >= 0.12) manager.disposeOwner('neuroshield');
}
