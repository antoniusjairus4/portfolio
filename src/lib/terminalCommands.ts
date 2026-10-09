import {
  FsNode,
  HOME_SEGMENTS,
  resolvePath,
  ROOT_FS,
  segmentsToAbsolute,
  segmentsToPrompt,
} from './terminalFs';

export interface CommandResult {
  output: string | string[];
  newCwdSegments?: string[];
  newOldPwdSegments?: string[];
  isError?: boolean;
  isAmber?: boolean;
  isGreen?: boolean;
  clear?: boolean;
  cmatrixToggle?: boolean;
  autoListOutput?: string | string[];
}

export function parseCommandLine(cmdLine: string): { mainCmd: string; args: string[]; rawInput: string } {
  const trimmed = cmdLine.trim();
  if (!trimmed) return { mainCmd: '', args: [], rawInput: '' };

  const regex = /(?:[^\s"'\\]|\\.|"[^"]*"|'[^']*')+/g;
  const matches = trimmed.match(regex) || [trimmed];
  
  const mainCmd = matches[0];
  const args = matches.slice(1).map(arg => {
    if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
      return arg.slice(1, -1);
    }
    return arg.replace(/\\ /g, ' ');
  });

  return { mainCmd, args, rawInput: trimmed };
}

export function executeCommand(
  cmdLine: string,
  cwdSegments: string[],
  oldPwdSegments: string[] | null = null,
  options: { silent?: boolean } = {}
): CommandResult {
  const { mainCmd, args, rawInput } = parseCommandLine(cmdLine);
  if (!mainCmd) return { output: '' };

  if (mainCmd === 'clear') {
    return { output: '', clear: true };
  }

  if (mainCmd === 'whoami') {
    return { output: 'jairus' };
  }

  if (mainCmd === 'pwd') {
    return { output: segmentsToAbsolute(cwdSegments) };
  }

  if (mainCmd === 'echo') {
    return { output: args.join(' ') };
  }

  if (mainCmd === 'exit' || mainCmd === 'logout') {
    return { output: 'logout' };
  }

  if (mainCmd === 'cmatrix') {
    return { output: 'cmatrix mode toggled', cmatrixToggle: true };
  }

  if (mainCmd === 'cd') {
    const targetArg = args[0] || '~';
    const { node, segments } = resolvePath(targetArg, cwdSegments, oldPwdSegments, ROOT_FS);

    if (!node) {
      return { output: `zsh: cd: no such file or directory: ${targetArg}`, isError: true };
    }
    if (node.type !== 'dir') {
      return { output: `zsh: cd: not a directory: ${targetArg}`, isError: true };
    }

    const result: CommandResult = {
      output: '',
      newCwdSegments: segments,
      newOldPwdSegments: [...cwdSegments],
    };

    // Auto-list contents after cd if enabled and not silent
    if (!options.silent && node.children) {
      const items = Object.values(node.children).map(child =>
        child.type === 'dir' ? `${child.name}/` : child.name
      );
      result.autoListOutput = items.join('   ');
    }

    return result;
  }

  if (mainCmd === 'ls') {
    const isLong = args.includes('-l') || args.includes('-la');
    const isAll = args.includes('-a') || args.includes('-la');

    const pathArg = args.find((a) => !a.startsWith('-')) || '.';
    const { node } = resolvePath(pathArg, cwdSegments, oldPwdSegments, ROOT_FS);

    if (!node) {
      return { output: `ls: cannot access '${pathArg}': No such file or directory`, isError: true };
    }

    if (node.type === 'file') {
      if (isLong) {
        return { output: `-rw-r--r-- 1 jairus jairus 1024 Oct 09 12:00 ${node.name}` };
      }
      return { output: node.name };
    }

    if (!node.children) return { output: '' };

    const childKeys = Object.keys(node.children);
    let allEntries: { name: string; isDir: boolean }[] = [];

    if (isAll) {
      allEntries.push({ name: '.', isDir: true });
      allEntries.push({ name: '..', isDir: true });
    }

    childKeys.forEach((k) => {
      const child = node.children![k];
      allEntries.push({ name: child.name, isDir: child.type === 'dir' });
    });

    if (isLong) {
      const lines = allEntries.map((e) => {
        const typeChar = e.isDir ? 'd' : '-';
        const nameStr = e.isDir ? `${e.name}/` : e.name;
        return `${typeChar}rwxr-xr-x 2 jairus jairus 4096 Oct 09 12:00 ${nameStr}`;
      });
      return { output: lines };
    }

    const items = allEntries.map((e) => (e.isDir ? `${e.name}/` : e.name));
    return { output: items.join('   ') };
  }

  if (mainCmd === 'cat') {
    const targetArg = args.join(' ');
    if (!targetArg) return { output: 'cat: missing file operand', isError: true };

    const { node } = resolvePath(targetArg, cwdSegments, oldPwdSegments, ROOT_FS);

    if (!node) {
      return { output: `cat: ${targetArg}: No such file or directory`, isError: true };
    }
    if (node.type === 'dir') {
      return { output: `cat: ${targetArg}: Is a directory`, isError: true };
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
    const pathArg = args.find((a) => !a.startsWith('-')) || '.';
    const { node, segments } = resolvePath(pathArg, cwdSegments, oldPwdSegments, ROOT_FS);

    if (!node) {
      return { output: `tree: ${pathArg}: No such file or directory`, isError: true };
    }

    const rootLabel = segmentsToPrompt(segments);
    const lines: string[] = [rootLabel];

    const buildTree = (dirNode: FsNode, prefix: string) => {
      if (!dirNode.children) return;
      const keys = Object.keys(dirNode.children);
      keys.forEach((k, idx) => {
        const isLast = idx === keys.length - 1;
        const child = dirNode.children![k];
        const connector = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        if (child.type === 'dir') {
          lines.push(`${prefix}${connector}${child.name}/`);
          buildTree(child, prefix + childPrefix);
        } else {
          lines.push(`${prefix}${connector}${child.name}`);
        }
      });
    };

    if (node.type === 'dir') {
      buildTree(node, '');
    } else {
      lines.push(`└── ${node.name}`);
    }

    return { output: lines };
  }

  return { output: `zsh: command not found: ${mainCmd}`, isError: true };
}
