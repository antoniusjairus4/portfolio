import { FsNode, VIRTUAL_FS } from './terminalFs';

export interface CommandResult {
  output: string | string[];
  newPath?: string;
  isError?: boolean;
  isAmber?: boolean;
  isGreen?: boolean;
  clear?: boolean;
  cmatrixToggle?: boolean;
}

export function resolvePathNode(currentPath: string, targetPath: string): { node: FsNode | null; pathStr: string } {
  let parts = currentPath.split('/').filter(Boolean);
  
  if (targetPath.startsWith('~')) {
    parts = [];
    targetPath = targetPath.slice(1);
  } else if (targetPath.startsWith('/')) {
    parts = [];
  }

  const targetParts = targetPath.split('/').filter(Boolean);

  for (const part of targetParts) {
    if (part === '.') continue;
    if (part === '..') {
      parts.pop();
    } else {
      parts.push(part);
    }
  }

  let curr: FsNode = { name: '~', type: 'dir', children: VIRTUAL_FS };
  for (const p of parts) {
    if (curr.type === 'dir' && curr.children && curr.children[p]) {
      curr = curr.children[p];
    } else {
      // Case insensitive fallback
      let found: FsNode | null = null;
      if (curr.type === 'dir' && curr.children) {
        const key = Object.keys(curr.children).find(k => k.toLowerCase() === p.toLowerCase());
        if (key) found = curr.children[key];
      }
      if (found) {
        curr = found;
      } else {
        return { node: null, pathStr: `~/${parts.join('/')}` };
      }
    }
  }

  const normalizedPathStr = parts.length === 0 ? '~' : `~/${parts.join('/')}`;
  return { node: curr, pathStr: normalizedPathStr };
}

export function executeCommand(cmdLine: string, currentPath: string): CommandResult {
  const trimmed = cmdLine.trim();
  if (!trimmed) return { output: '' };

  const parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [trimmed];
  const mainCmd = parts[0];
  const args = parts.slice(1).map(a => a.replace(/^"|"$/g, ''));

  if (mainCmd === 'clear') {
    return { output: '', clear: true };
  }

  if (mainCmd === 'help') {
    return {
      output: [
        'Available commands:',
        '  help              - Display this list of commands',
        '  ls [-la]          - List files & directories in current path',
        '  cd <dir>          - Change directory (e.g. cd skills/programming)',
        '  pwd               - Print working directory',
        '  whoami            - Display current user',
        '  cat <file>        - View contents of a file or skill item',
        '  tree              - Print the complete skills directory tree',
        '  skills            - List all categories and skills overview',
        '  neofetch          - Render Kali Linux system summary',
        '  cmatrix           - Toggle digital rain matrix intensity',
        '  clear             - Clear terminal screen (or Ctrl+L)',
        '  history           - Display executed command history',
        '  echo <text>       - Print text to terminal',
        '  exit / logout     - Exit terminal and scroll back up',
        '  sudo open skills  - Gain privileged access to skills tree',
      ],
    };
  }

  if (mainCmd === 'whoami') {
    return { output: 'jairus' };
  }

  if (mainCmd === 'pwd') {
    return { output: currentPath };
  }

  if (mainCmd === 'echo') {
    return { output: args.join(' ') };
  }

  if (mainCmd === 'exit' || mainCmd === 'logout') {
    return { output: 'logout' };
  }

  if (trimmed === 'sudo open skills') {
    const treeRes = executeCommand('tree', '~');
    return {
      output: [
        '[sudo] password for jairus: ********',
        'Authenticating...  [ OK ]',
        'Opening skills...',
        'Access granted.',
        ...(Array.isArray(treeRes.output) ? treeRes.output : [treeRes.output]),
      ],
      isAmber: true,
    };
  }

  if (mainCmd === 'cmatrix') {
    return { output: 'cmatrix mode toggled', cmatrixToggle: true };
  }

  if (mainCmd === 'cd') {
    const target = args[0] || '~';
    const { node, pathStr } = resolvePathNode(currentPath, target);
    if (!node) {
      return { output: `zsh: cd: no such file or directory: ${target}`, isError: true };
    }
    if (node.type !== 'dir') {
      return { output: `zsh: cd: not a directory: ${target}`, isError: true };
    }
    return { output: '', newPath: pathStr };
  }

  if (mainCmd === 'ls') {
    const rawTarget = (args || []).find((a) => !a.startsWith('-')) || '.';
    const { node } = resolvePathNode(currentPath, rawTarget);
    if (!node) {
      return { output: `ls: cannot access '${rawTarget}': No such file or directory`, isError: true };
    }
    if (node.type === 'file') {
      return { output: node.name };
    }
    if (!node.children) return { output: '' };
    
    const items = Object.values(node.children).map(child =>
      child.type === 'dir' ? `${child.name}/` : child.name
    );
    return { output: items.join('   ') };
  }

  if (mainCmd === 'cat') {
    const target = (args || []).join(' ');
    if (!target) return { output: 'cat: missing file operand', isError: true };

    const { node } = resolvePathNode(currentPath, target);
    if (!node) {
      return { output: `cat: ${target}: No such file or directory`, isError: true };
    }
    if (node.type === 'dir') {
      return { output: `cat: ${target}: Is a directory`, isError: true };
    }
    return {
      output: [
        `┌──[ ${node.name} ]─────────────────────────────────┐`,
        `│ Category : ${(node.category || 'General').padEnd(38)} │`,
        `│ Info     : ${(node.description || 'Skill item').padEnd(38)} │`,
        `└───────────────────────────────────────────────────┘`,
      ],
      isGreen: true,
    };
  }

  if (mainCmd === 'tree') {
    const lines: string[] = ['~/skills'];
    const skillsDir = VIRTUAL_FS.skills.children;
    if (skillsDir) {
      const categories = Object.keys(skillsDir);
      categories.forEach((catKey, cIdx) => {
        const isLastCat = cIdx === categories.length - 1;
        const catPrefix = isLastCat ? '└── ' : '├── ';
        const childPrefix = isLastCat ? '    ' : '│   ';
        lines.push(`${catPrefix}${catKey}/`);

        const files = skillsDir[catKey].children;
        if (files) {
          const fileKeys = Object.keys(files);
          fileKeys.forEach((fKey, fIdx) => {
            const isLastFile = fIdx === fileKeys.length - 1;
            const filePrefix = isLastFile ? '└── ' : '├── ';
            lines.push(`${childPrefix}${filePrefix}${fKey}`);
          });
        }
      });
    }
    return { output: lines };
  }

  if (mainCmd === 'skills') {
    const lines: string[] = [];
    const skillsDir = VIRTUAL_FS.skills.children;
    if (skillsDir) {
      Object.keys(skillsDir).forEach(catKey => {
        const files = skillsDir[catKey].children;
        const fileNames = files ? Object.keys(files).join(', ') : '';
        lines.push(`${catKey.padEnd(20)} : ${fileNames}`);
      });
    }
    return { output: lines };
  }

  return { output: `zsh: command not found: ${mainCmd}`, isError: true };
}
