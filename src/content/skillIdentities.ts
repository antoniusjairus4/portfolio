export type IdentityTreatment = 'inlay' | 'junction' | 'stamp' | 'opening' | 'fins' | 'projection';
export interface SkillIdentity {
  id: string;
  color: string;
  treatment: IdentityTreatment;
}

// Atlas order is kept identical to scripts/build-skills-marks.mjs and skillCategories.
// Learnado intentionally keeps the user's wording; its mark is Leonardo.ai.
export const skillIdentities: readonly (readonly SkillIdentity[])[] = [
  [
    { id: 'dsa', color: '#d8c9ab', treatment: 'opening' },
    { id: 'cpp', color: '#6095c1', treatment: 'inlay' },
    { id: 'c', color: '#7b96b8', treatment: 'inlay' },
    { id: 'python', color: '#c7ad57', treatment: 'projection' },
    { id: 'java', color: '#bb6a43', treatment: 'stamp' },
  ],
  [
    { id: 'html', color: '#d47c55', treatment: 'stamp' },
    { id: 'css', color: '#688db6', treatment: 'projection' },
    { id: 'bootstrap', color: '#9c83b9', treatment: 'inlay' },
    { id: 'tailwind', color: '#72b3bb', treatment: 'fins' },
    { id: 'react', color: '#91c6cf', treatment: 'junction' },
    { id: 'mern', color: '#91b6a0', treatment: 'opening' },
  ],
  [
    { id: 'node', color: '#82a46e', treatment: 'junction' },
    { id: 'express', color: '#f2e8d5', treatment: 'inlay' },
    { id: 'supabase', color: '#86bea3', treatment: 'junction' },
    { id: 'mongodb', color: '#82a975', treatment: 'stamp' },
  ],
  [
    { id: 'fundamentals', color: '#8B1E2D', treatment: 'inlay' },
    { id: 'network', color: '#8B1E2D', treatment: 'opening' },
    { id: 'scraping', color: '#c5b99c', treatment: 'fins' },
  ],
  [
    { id: 'git', color: '#c4775e', treatment: 'junction' },
    { id: 'github', color: '#f2e8d5', treatment: 'opening' },
    { id: 'linux', color: '#c7b177', treatment: 'stamp' },
    { id: 'kali', color: '#93b3c5', treatment: 'projection' },
    { id: 'ollama', color: '#e1d8c7', treatment: 'inlay' },
  ],
  [
    { id: 'antigravity', color: '#94b5c8', treatment: 'opening' },
    { id: 'claude', color: '#c98c70', treatment: 'inlay' },
    { id: 'lovable', color: '#c39b9a', treatment: 'junction' },
    { id: 'leonardo', color: '#b7a5c7', treatment: 'projection' },
  ],
];
