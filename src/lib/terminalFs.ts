export interface FsNode {
  name: string;
  type: 'dir' | 'file';
  children?: Record<string, FsNode>;
  description?: string;
  category?: string;
}

export const ROOT_FS: FsNode = {
  name: '',
  type: 'dir',
  children: {
    home: {
      name: 'home',
      type: 'dir',
      children: {
        jairus: {
          name: 'jairus',
          type: 'dir',
          children: {
            'README.md': {
              name: 'README.md',
              type: 'file',
              description: 'Welcome to my skills terminal. Try: ls, cd skills, tree',
            },
            skills: {
              name: 'skills',
              type: 'dir',
              children: {
                programming: {
                  name: 'programming',
                  type: 'dir',
                  children: {
                    DSA: { name: 'DSA', type: 'file', category: 'programming', description: 'Data Structures & Algorithms in C++ and Python.' },
                    'C++': { name: 'C++', type: 'file', category: 'programming', description: 'High performance system & algorithmic programming.' },
                    C: { name: 'C', type: 'file', category: 'programming', description: 'Low-level systems memory management & fundamentals.' },
                    Python: { name: 'Python', type: 'file', category: 'programming', description: 'Scripting, backend logic, and automated workflows.' },
                    Java: { name: 'Java', type: 'file', category: 'programming', description: 'Object-oriented application development.' },
                  },
                },
                'web-development': {
                  name: 'web-development',
                  type: 'dir',
                  children: {
                    HTML: { name: 'HTML', type: 'file', category: 'web-development', description: 'Semantic modern web layout & markup.' },
                    CSS: { name: 'CSS', type: 'file', category: 'web-development', description: 'Responsive layouts, keyframe animations, glassmorphism.' },
                    Bootstrap: { name: 'Bootstrap', type: 'file', category: 'web-development', description: 'Rapid responsive UI component framing.' },
                    'Tailwind CSS': { name: 'Tailwind CSS', type: 'file', category: 'web-development', description: 'Utility-first modern web design system.' },
                    React: { name: 'React', type: 'file', category: 'web-development', description: 'Modern reactive web application architectures.' },
                    'MERN Stack': { name: 'MERN Stack', type: 'file', category: 'web-development', description: 'Fullstack MongoDB, Express, React, Node applications.' },
                  },
                },
                'backend-database': {
                  name: 'backend-database',
                  type: 'dir',
                  children: {
                    'Node.js': { name: 'Node.js', type: 'file', category: 'backend-database', description: 'Asynchronous event-driven server runtime.' },
                    'Express.js': { name: 'Express.js', type: 'file', category: 'backend-database', description: 'RESTful API & web microservice frameworks.' },
                    Supabase: { name: 'Supabase', type: 'file', category: 'backend-database', description: 'Postgres BaaS with real-time subscriptions & Auth.' },
                    MongoDB: { name: 'MongoDB', type: 'file', category: 'backend-database', description: 'NoSQL document-oriented schema databases.' },
                  },
                },
                cybersecurity: {
                  name: 'cybersecurity',
                  type: 'dir',
                  children: {
                    'Cybersecurity Fundamentals': { name: 'Cybersecurity Fundamentals', type: 'file', category: 'cybersecurity', description: 'Core offensive & defensive security principles.' },
                    'Network Security': { name: 'Network Security', type: 'file', category: 'cybersecurity', description: 'Packet analysis, firewall configuration, protocols.' },
                    'Web Scraping': { name: 'Web Scraping', type: 'file', category: 'cybersecurity', description: 'Automated data extraction and reconnaissance.' },
                  },
                },
                tools: {
                  name: 'tools',
                  type: 'dir',
                  children: {
                    Git: { name: 'Git', type: 'file', category: 'tools', description: 'Distributed version control & branch management.' },
                    GitHub: { name: 'GitHub', type: 'file', category: 'tools', description: 'Collaborative code hosting, Actions CI/CD workflows.' },
                    Linux: { name: 'Linux', type: 'file', category: 'tools', description: 'POSIX terminal administration, bash scripting.' },
                    'Kali Linux': { name: 'Kali Linux', type: 'file', category: 'tools', description: 'Penetration testing & security auditing distro.' },
                    Ollama: { name: 'Ollama', type: 'file', category: 'tools', description: 'Local LLM execution & model fine-tuning interface.' },
                  },
                },
                'ai-tools': {
                  name: 'ai-tools',
                  type: 'dir',
                  children: {
                    Antigravity: { name: 'Antigravity', type: 'file', category: 'ai-tools', description: 'Advanced AI agentic coding workspace.' },
                    'Claude Code': { name: 'Claude Code', type: 'file', category: 'ai-tools', description: 'Terminal-based AI engineering assistant.' },
                    Lovable: { name: 'Lovable', type: 'file', category: 'ai-tools', description: 'Generative fullstack web builder.' },
                    Learnado: { name: 'Learnado', type: 'file', category: 'ai-tools', description: 'AI-assisted learning & knowledge synthesis platform.' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const HOME_SEGMENTS = ['home', 'jairus'];

export function segmentsToPrompt(segments: string[]): string {
  const fullPath = '/' + segments.join('/');
  if (fullPath === '/home/jairus') return '~';
  if (fullPath.startsWith('/home/jairus/')) {
    return '~/' + fullPath.slice('/home/jairus/'.length);
  }
  return fullPath;
}

export function segmentsToAbsolute(segments: string[]): string {
  return '/' + segments.join('/');
}

export function resolvePath(
  input: string,
  cwdSegments: string[],
  oldPwdSegments: string[] | null = null,
  rootFs: FsNode = ROOT_FS
): { node: FsNode | null; segments: string[] } {
  let target = input.trim();
  if (!target) {
    return resolvePath('~', cwdSegments, oldPwdSegments, rootFs);
  }

  if (target === '-') {
    if (!oldPwdSegments) {
      return { node: null, segments: cwdSegments };
    }
    return resolvePath(segmentsToAbsolute(oldPwdSegments), cwdSegments, oldPwdSegments, rootFs);
  }

  let baseSegments: string[] = [];

  if (target.startsWith('~')) {
    baseSegments = [...HOME_SEGMENTS];
    target = target.slice(1);
    if (target.startsWith('/')) target = target.slice(1);
  } else if (target.startsWith('/')) {
    baseSegments = [];
    target = target.slice(1);
  } else {
    baseSegments = [...cwdSegments];
  }

  const parts = target.split('/').filter(Boolean);

  let currentSegments = [...baseSegments];
  let currNode: FsNode = rootFs;

  // Navigate to baseSegments first
  for (const seg of currentSegments) {
    if (currNode.type === 'dir' && currNode.children && currNode.children[seg]) {
      currNode = currNode.children[seg];
    } else {
      return { node: null, segments: [] };
    }
  }

  // Navigate remaining input parts
  for (const part of parts) {
    // Unescape escaped spaces like Network\ Security -> Network Security
    const unescaped = part.replace(/\\ /g, ' ').replace(/^"|"$/g, '').replace(/^'|'$/g, '');

    if (unescaped === '.') {
      continue;
    } else if (unescaped === '..') {
      if (currentSegments.length > 0) {
        currentSegments.pop();
        // Recalculate currNode from root
        currNode = rootFs;
        for (const s of currentSegments) {
          if (currNode.children && currNode.children[s]) {
            currNode = currNode.children[s];
          }
        }
      }
    } else {
      if (currNode.type === 'dir' && currNode.children && currNode.children[unescaped]) {
        currNode = currNode.children[unescaped];
        currentSegments.push(unescaped);
      } else {
        return { node: null, segments: [] };
      }
    }
  }

  return { node: currNode, segments: currentSegments };
}
