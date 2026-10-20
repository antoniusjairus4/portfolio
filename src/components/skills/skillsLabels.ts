// The DOM chapter stays independent of Three.js and the WebGL resource lifecycle.
// The active shared scene projects these elements without React updates per frame.
const labels = new Map<string, HTMLElement>();
export const skillLabelId = (domain: number, skill: number) => `${domain}:${skill}`;

export function bindSkillLabel(id: string, element: HTMLElement | null) {
  if (element) labels.set(id, element);
  else labels.delete(id);
}

export function getSkillLabel(id: string) {
  return labels.get(id);
}
