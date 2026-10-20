export const neuroShieldContent = {
  eyebrow: 'ONGOING RESEARCH · SIX-PERSON TEAM',
  name: 'NEUROSHIELD',
  description:
    "An ongoing machine-learning research project exploring patterns in Alzheimer's-related imaging data.",
  role: 'Antonius contributes by training machine-learning models with ADNI datasets and producing experimental results, graphs, and evidence for team analysis.',
  disclosure:
    'This work is experimental research. It is not a clinical diagnostic tool, medical device, or replacement for professional medical judgment.',
  destination: 'https://antoniusjairus4.github.io/neuro-shield/',
  workPdf: '/research/neuroshield/Alzheimers_Detection_Research_Report%20(2).pdf',
} as const;

export const neuroShieldBeats = [
  {
    key: 'observation',
    index: '01',
    label: 'Observation',
    headline: ['EVIDENCE', 'EXISTS.'],
    detail: 'Selected observations enter view before their meaning is established.',
  },
  {
    key: 'hypothesis',
    index: '02',
    label: 'Hypothesis',
    headline: ['WHAT IF THESE', 'ARE RELATED?'],
    detail: 'Several plausible relationships emerge. None is presented as established truth.',
  },
  {
    key: 'experiment',
    index: '03',
    label: 'Experiment',
    headline: ['TEST THE', 'RELATIONSHIP.'],
    detail: 'Abstract runs compare paths; some continue while others terminate.',
  },
  {
    key: 'evidence',
    index: '04',
    label: 'Evidence',
    headline: ['MORE DATA.', 'MORE CONTEXT.'],
    detail: 'Supporting and competing observations make the structure richer, not final.',
  },
  {
    key: 'uncertainty',
    index: '05',
    label: 'Uncertainty',
    headline: ['INFORMED.', 'UNFINISHED.'],
    detail: 'The research space becomes precise while gaps and alternative paths remain visible.',
  },
] as const;
