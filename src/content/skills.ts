export interface SkillCategory {
  key: 'programming' | 'web' | 'backend' | 'cybersecurity' | 'tools' | 'ai-tools';
  index: string;
  name: string;
  statement: string;
  skills: readonly string[];
}

export const skillCategories: readonly SkillCategory[] = [
  {
    key: 'programming',
    index: '01',
    name: 'PROGRAMMING',
    statement: 'Foundation, logic, and ordered structure.',
    skills: ['DSA', 'C++', 'C', 'Python', 'Java'],
  },
  {
    key: 'web',
    index: '02',
    name: 'WEB',
    statement: 'Surfaces, composition, and connected layers.',
    skills: ['HTML', 'CSS', 'Bootstrap', 'Tailwind CSS', 'React', 'MERN Stack'],
  },
  {
    key: 'backend',
    index: '03',
    name: 'BACKEND / DATABASE',
    statement: 'Systems, relationships, and supporting depth.',
    skills: ['Node.js', 'Express.js', 'Supabase', 'MongoDB'],
  },
  {
    key: 'cybersecurity',
    index: '04',
    name: 'CYBERSECURITY',
    statement: 'Boundaries, controlled access, and defensive structure.',
    skills: ['Cybersecurity Fundamentals', 'Network Security', 'Web Scraping'],
  },
  {
    key: 'tools',
    index: '05',
    name: 'TOOLS',
    statement: 'Infrastructure, connectors, and supporting mechanisms.',
    skills: ['Git', 'GitHub', 'Linux', 'Kali Linux', 'Ollama'],
  },
  {
    key: 'ai-tools',
    index: '06',
    name: 'AI TOOLS',
    statement: 'Augmentation, orchestration, and broader reach.',
    skills: ['Antigravity', 'Claude Code', 'Lovable', 'Learnado'],
  },
] as const;
