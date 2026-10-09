'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import { useLenis } from '@/motion/lenis/LenisProvider';
import { executeCommand } from '@/lib/terminalCommands';
import {
  HOME_SEGMENTS,
  resolvePath,
  ROOT_FS,
  segmentsToPrompt,
} from '@/lib/terminalFs';
import {
  COLOR_PALETTE_ROW_1,
  COLOR_PALETTE_ROW_2,
  JAIRUS_BANNER_ASCII,
  KALI_DRAGON_LOGO,
} from '@/lib/terminalBanner';
import { MatrixRain } from './MatrixRain';
import LetterGlitch from '../backgrounds/LetterGlitch';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Timing constants
const INTRO_TYPE = 0.8;
const INTRO_HOLD = 0.35;
const INTRO_CUT = 0.15;
const AUTO_CHAR_MS = 70;
const AUTO_PAUSE_MS = 250;

const GLITCH_GLYPHS = '▓▒░#@%&01/\\$<>[]{}*+=~';

interface HistoryItem {
  id: string;
  path: string;
  command: string;
  output: string | string[];
  isError?: boolean;
  isAmber?: boolean;
  isGreen?: boolean;
}

export const TechnicalSkillsTerminal: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const introContainerRef = useRef<HTMLDivElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const crtLineRef = useRef<HTMLDivElement>(null);
  const terminalWindowRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lenisContext = useLenis();

  const [introDone, setIntroDone] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [booted, setBooted] = useState(false);
  const [autoSequenceDone, setAutoSequenceDone] = useState(false);
  
  // Single source of truth for CWD and OLDPWD
  const [cwdSegments, setCwdSegments] = useState<string[]>([...HOME_SEGMENTS]);
  const [oldPwdSegments, setOldPwdSegments] = useState<string[] | null>(null);

  const [inputText, setInputText] = useState('');
  const [ghostSuggestion, setGhostSuggestion] = useState('cd programming');
  const [hintText, setHintText] = useState('your turn: cd into a folder to see what is inside');
  const [failedCdCount, setFailedCdCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isDenseMatrix, setIsDenseMatrix] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [glitchTitleText, setGlitchTitleText] = useState('');

  const overscrollDeltaRef = useRef<number>(0);
  const overscrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSequenceRef = useRef<boolean>(false);

  const currentPathPrompt = segmentsToPrompt(cwdSegments);

  const focusInput = () => {
    if (autoSequenceDone) {
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  const scrollToPreviousSection = () => {
    if (lenisContext && lenisContext.lenis) {
      const ST = ScrollTrigger.getById('disc-master-pin');
      if (ST) {
        lenisContext.lenis.scrollTo(ST.start, { duration: 1.5 });
      } else {
        const discEl = document.getElementById('achievements-section');
        if (discEl) lenisContext.lenis.scrollTo(discEl, { duration: 1.5 });
      }
    } else {
      const discEl = document.getElementById('achievements-section');
      if (discEl) discEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cyberpunk Glitch Intro Animation
  useEffect(() => {
    if (!sectionRef.current) return;

    if (isReducedMotion) {
      setIntroDone(true);
      setShowTerminal(true);
      setBooted(true);
      setAutoSequenceDone(true);
      setCwdSegments([...HOME_SEGMENTS, 'skills']);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top+=10%',
        once: true,
        onEnter: () => {
          if (introDone) return;

          if (lenisContext && lenisContext.lenis) {
            lenisContext.lenis.stop();
          }

          const safetyTimer = setTimeout(() => {
            if (lenisContext && lenisContext.lenis) lenisContext.lenis.start();
          }, 3000);

          const targetStr = 'MY SKILLS';
          const totalLength = targetStr.length;
          const scrambleObj = { progress: 0 };

          const introTl = gsap.timeline({
            onComplete: () => {
              clearTimeout(safetyTimer);
              if (lenisContext && lenisContext.lenis) {
                lenisContext.lenis.start();
              }
              setIntroDone(true);
              setShowTerminal(true);

              if (crtLineRef.current && terminalWindowRef.current) {
                gsap.set(crtLineRef.current, { opacity: 1, scaleY: 0.05, scaleX: 1 });
                gsap.timeline()
                  .to(crtLineRef.current, { scaleY: 1, duration: 0.35, ease: 'power3.inOut' })
                  .set(crtLineRef.current, { opacity: 0 })
                  .fromTo(
                    terminalWindowRef.current,
                    { opacity: 0, scale: 0.98 },
                    { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }
                  )
                  .call(() => setBooted(true));
              } else {
                setBooted(true);
              }
            },
          });

          introTl.to(scrambleObj, {
            progress: 1,
            duration: INTRO_TYPE,
            ease: 'none',
            onUpdate: () => {
              const currentFixedCount = Math.floor(scrambleObj.progress * totalLength);
              let result = '';
              for (let i = 0; i < totalLength; i++) {
                if (i < currentFixedCount) {
                  result += targetStr[i];
                } else {
                  const randChar = GLITCH_GLYPHS[Math.floor(Math.random() * GLITCH_GLYPHS.length)];
                  result += randChar;
                }
              }
              setGlitchTitleText(result);
            },
          });

          introTl.to({}, { duration: INTRO_HOLD });

          introTl.call(() => {
            if (introTextRef.current) {
              gsap.to(introTextRef.current, {
                x: () => (Math.random() - 0.5) * 20,
                opacity: 0.3,
                duration: 0.05,
                repeat: 2,
                yoyo: true,
              });
            }
          });

          introTl.to(introContainerRef.current, {
            opacity: 0,
            duration: INTRO_CUT,
            ease: 'steps(3)',
          });
        },
      });
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [isReducedMotion, lenisContext]);

  // Command Execution Engine
  const runCommandInternal = (
    cmdLine: string,
    currentCwd: string[],
    currentOldPwd: string[] | null,
    options: { silent?: boolean } = {}
  ) => {
    const res = executeCommand(cmdLine, currentCwd, currentOldPwd, options);
    let nextCwd = currentCwd;
    let nextOldPwd = currentOldPwd;

    if (res.newCwdSegments) {
      nextCwd = res.newCwdSegments;
      setCwdSegments(nextCwd);
    }
    if (res.newOldPwdSegments) {
      nextOldPwd = res.newOldPwdSegments;
      setOldPwdSegments(nextOldPwd);
    }

    if (res.clear) {
      setHistory([]);
      return { res, nextCwd, nextOldPwd };
    }

    if (res.cmatrixToggle) {
      setIsDenseMatrix((prev) => !prev);
    }

    if (cmdLine.trim() === 'exit' || cmdLine.trim() === 'logout') {
      scrollToPreviousSection();
    }

    // Track failed cd count for tip hint
    if (cmdLine.trim().startsWith('cd ') && res.isError) {
      setFailedCdCount((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          setHintText('tip: press Tab to autocomplete, or run ls to see what is here');
        }
        return next;
      });
    } else if (cmdLine.trim().startsWith('cd ') && !res.isError) {
      setFailedCdCount(0);
    }

    const outputToRender = res.autoListOutput
      ? [res.autoListOutput as string]
      : res.output;

    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        path: segmentsToPrompt(currentCwd),
        command: cmdLine,
        output: outputToRender,
        isError: res.isError,
        isAmber: res.isAmber,
        isGreen: res.isGreen,
      },
    ]);

    return { res, nextCwd, nextOldPwd };
  };

  // Auto-typed intro sequence (Step 1: cd skills silent -> Step 2: ls)
  useEffect(() => {
    if (!booted || autoSequenceDone || autoSequenceRef.current) return;
    autoSequenceRef.current = true;

    let cancelSequence = false;

    const skipHandler = (e: Event) => {
      e.preventDefault();
      cancelSequence = true;
      finishAutoSequenceImmediately();
    };

    window.addEventListener('keydown', skipHandler, { once: true });
    window.addEventListener('mousedown', skipHandler, { once: true });

    const typeText = async (text: string) => {
      for (let i = 1; i <= text.length; i++) {
        if (cancelSequence) return;
        setInputText(text.slice(0, i));
        const jitter = (Math.random() - 0.5) * 25;
        await new Promise((r) => setTimeout(r, Math.max(20, AUTO_CHAR_MS + jitter)));
      }
    };

    const runAutoFlow = async () => {
      let activeCwd = [...HOME_SEGMENTS];
      let activeOldPwd: string[] | null = null;

      await new Promise((r) => setTimeout(r, 600));
      if (cancelSequence) return;

      // Step 1: cd skills (silent: true -> updates cwd to ~/skills, no auto-list)
      await typeText('cd skills');
      if (cancelSequence) return;
      await new Promise((r) => setTimeout(r, AUTO_PAUSE_MS));
      if (cancelSequence) return;
      
      const step1Result = runCommandInternal('cd skills', activeCwd, activeOldPwd, { silent: true });
      activeCwd = step1Result.nextCwd;
      activeOldPwd = step1Result.nextOldPwd;
      setInputText('');

      // Step 2: ls in ~/skills
      await new Promise((r) => setTimeout(r, 700));
      if (cancelSequence) return;
      await typeText('ls');
      if (cancelSequence) return;
      await new Promise((r) => setTimeout(r, AUTO_PAUSE_MS));
      if (cancelSequence) return;

      runCommandInternal('ls', activeCwd, activeOldPwd);
      setInputText('');

      // Handover
      await new Promise((r) => setTimeout(r, 400));
      if (cancelSequence) return;
      window.removeEventListener('keydown', skipHandler);
      window.removeEventListener('mousedown', skipHandler);
      setAutoSequenceDone(true);
      setGhostSuggestion('cd programming');
      setHintText('your turn: cd into a folder to see what is inside');
      focusInput();
    };

    const finishAutoSequenceImmediately = () => {
      window.removeEventListener('keydown', skipHandler);
      window.removeEventListener('mousedown', skipHandler);
      const skillsCwd = [...HOME_SEGMENTS, 'skills'];
      setCwdSegments(skillsCwd);
      setOldPwdSegments([...HOME_SEGMENTS]);

      const lsRes = executeCommand('ls', skillsCwd);
      setHistory([
        {
          id: 'auto-cd-skills',
          path: '~',
          command: 'cd skills',
          output: '',
        },
        {
          id: 'auto-ls-skills',
          path: '~/skills',
          command: 'ls',
          output: lsRes.output,
        },
      ]);
      setInputText('');
      setAutoSequenceDone(true);
      setGhostSuggestion('cd programming');
      setHintText('your turn: cd into a folder to see what is inside');
      focusInput();
    };

    runAutoFlow();

    return () => {
      window.removeEventListener('keydown', skipHandler);
      window.removeEventListener('mousedown', skipHandler);
    };
  }, [booted, autoSequenceDone]);

  // Pulse hint if no interaction for 8s after boot
  useEffect(() => {
    if (!booted) return;
    const timer = setTimeout(() => {
      setShowPulse(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [booted]);

  // Wheel / Overscroll event listener for history scrolling & upward exit
  useEffect(() => {
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const isAtTop = bodyEl.scrollTop <= 2;

      if (isAtTop && e.deltaY < 0) {
        overscrollDeltaRef.current += Math.abs(e.deltaY);

        if (overscrollTimerRef.current) clearTimeout(overscrollTimerRef.current);
        overscrollTimerRef.current = setTimeout(() => {
          overscrollDeltaRef.current = 0;
        }, 400);

        if (overscrollDeltaRef.current >= 300) {
          overscrollDeltaRef.current = 0;
          scrollToPreviousSection();
        }
      } else {
        overscrollDeltaRef.current = 0;
      }
    };

    bodyEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      bodyEl.removeEventListener('wheel', handleWheel);
    };
  }, [lenisContext]);

  // User Interactive Command Handler
  const handleRunCommand = (cmdToRun?: string) => {
    const rawCmd = cmdToRun !== undefined ? cmdToRun : inputText;
    const trimmed = rawCmd.trim();

    if (!trimmed) {
      if (booted) {
        setHistory((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            path: currentPathPrompt,
            command: '',
            output: '',
          },
        ]);
      }
      setInputText('');
      return;
    }

    setShowPulse(false);
    setGhostSuggestion('');
    runCommandInternal(trimmed, cwdSegments, oldPwdSegments);
    
    setCmdHistory((prev) => [...prev, rawCmd]);
    setHistoryIdx(-1);
    setInputText('');

    setTimeout(() => {
      if (bodyRef.current) {
        const isNearBottom =
          bodyRef.current.scrollHeight - bodyRef.current.scrollTop - bodyRef.current.clientHeight <= 100;
        if (isNearBottom || trimmed) {
          bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
      }
    }, 50);
  };

  // Tab Completion
  const handleTabCompletion = () => {
    if (!inputText && ghostSuggestion) {
      setInputText(ghostSuggestion);
      setGhostSuggestion('');
      return;
    }

    const { node: currNode } = resolvePath('.', cwdSegments, oldPwdSegments, ROOT_FS);
    if (!currNode || !currNode.children) return;

    const parts = inputText.trim().split(/\s+/);
    if (parts.length === 1) {
      // Command name completion
      const cmds = ['ls', 'cd', 'pwd', 'cat', 'tree', 'whoami', 'echo', 'clear', 'history', 'neofetch', 'cmatrix', 'exit', 'logout'];
      const matches = cmds.filter((c) => c.startsWith(parts[0].toLowerCase()));
      if (matches.length === 1) {
        setInputText(matches[0] + ' ');
      }
    } else if (parts.length >= 2) {
      const mainCmd = parts[0];
      const targetPrefix = parts.slice(1).join(' ').toLowerCase();

      const children = Object.values(currNode.children);
      let candidates = children;

      if (mainCmd === 'cd') {
        candidates = children.filter((c) => c.type === 'dir');
      } else if (mainCmd === 'cat') {
        candidates = children.filter((c) => c.type === 'file');
      }

      const matches = candidates.filter((c) => c.name.toLowerCase().startsWith(targetPrefix));

      if (matches.length === 1) {
        const match = matches[0];
        let formattedName = match.name;
        if (formattedName.includes(' ')) {
          formattedName = `"${formattedName}"`;
        }
        if (match.type === 'dir') {
          formattedName += '/';
        }
        setInputText(`${mainCmd} ${formattedName}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputText(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInputText('');
      } else {
        setHistoryIdx(nextIdx);
        setInputText(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'Tab' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleTabCompletion();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setHistory([]);
    }
  };

  // Context-Aware Quick Chips based on current CWD
  const getContextChips = (): string[] => {
    const { node: currNode } = resolvePath('.', cwdSegments, oldPwdSegments, ROOT_FS);
    const chips: string[] = ['ls'];

    if (currentPathPrompt !== '~') {
      chips.push('cd ..');
    }

    if (currNode && currNode.children) {
      Object.values(currNode.children).forEach((child) => {
        if (child.type === 'dir') {
          chips.push(`cd ${child.name}`);
        } else if (child.type === 'file') {
          const catName = child.name.includes(' ') ? `"${child.name}"` : child.name;
          chips.push(`cat ${catName}`);
        }
      });
    }

    chips.push('tree', 'neofetch', 'clear', 'exit');
    return chips;
  };

  const currentChips = getContextChips();

  return (
    <section
      id="technical-skills-section"
      ref={sectionRef}
      role="region"
      aria-label="Technical skills terminal"
      className="relative w-full h-[100dvh] bg-[#000] text-[#F2E9D8] select-none font-mono overflow-hidden flex flex-col"
    >
      <div className="sr-only">
        <h2>Technical Skills Terminal</h2>
        <p>Fullscreen interactive Kali Linux terminal. Type commands to view programming, web development, cybersecurity, tools, and AI skills.</p>
      </div>

      {/* Full-Page Dim Golden LetterGlitch Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <LetterGlitch
          glitchColors={['#17110C', '#4A3212', '#9A6318', '#E0A030', '#F5B031']}
          glitchSpeed={60}
          centerVignette={false}
          outerVignette={true}
          smooth={true}
          backgroundColor="#0C0907"
        />
      </div>

      <MatrixRain isDense={isDenseMatrix} />

      {/* Cyberpunk Glitch Intro Screen */}
      {!introDone && !isReducedMotion && (
        <div
          ref={introContainerRef}
          className="absolute inset-0 z-50 bg-[#000] flex flex-col items-center justify-center p-4"
        >
          <div
            ref={introTextRef}
            className="relative text-[#00ff9c] font-mono font-black tracking-widest select-none text-center"
            style={{
              fontSize: 'clamp(3rem, 12vw, 11rem)',
              textShadow:
                '0 0 8px #00ff9c, 0 0 24px #00ff9c, 0 0 60px rgba(0,255,156,0.6)',
            }}
          >
            <span
              className="absolute inset-0 text-[#00e5ff] mix-blend-screen -translate-x-1 opacity-70 pointer-events-none"
              aria-hidden="true"
            >
              {glitchTitleText || 'MY SKILLS'}
            </span>
            <span
              className="absolute inset-0 text-[#ff2bd6] mix-blend-screen translate-x-1 opacity-70 pointer-events-none"
              aria-hidden="true"
            >
              {glitchTitleText || 'MY SKILLS'}
            </span>
            {glitchTitleText || 'MY SKILLS'}
          </div>
        </div>
      )}

      {/* CRT Turn-on Expand Line */}
      <div
        ref={crtLineRef}
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-[#00ff9c] shadow-[0_0_20px_#00ff9c] z-40 opacity-0 pointer-events-none"
      />

      {/* Full-Page Terminal Container */}
      <div
        ref={terminalWindowRef}
        onClick={focusInput}
        className={`relative z-10 w-full h-[100dvh] bg-[#040806]/80 backdrop-blur-sm flex flex-col cursor-text ${
          showTerminal ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 pointer-events-none z-20 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) 1px, transparent 1px, transparent 2px)',
          }}
        />

        {/* Header Bar */}
        <div className="h-9 px-4 bg-[#11141a] border-b border-white/10 flex items-center justify-between select-none z-30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="text-xs font-mono text-white/80 font-medium tracking-wide">
            jairus@linux: <span className="text-[#00ff9c]">{currentPathPrompt}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#00ff9c] font-semibold hidden md:inline">
              zsh 5.9
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollToPreviousSection();
              }}
              title="Scroll back to previous section"
              className="text-xs font-mono text-white/70 hover:text-[#00ff9c] px-2 py-0.5 rounded border border-white/10 hover:border-[#00ff9c]/50 transition-colors flex items-center gap-1"
            >
              ↑ back
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={bodyRef}
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          className="flex-1 p-[clamp(16px,3vw,56px)] overflow-y-auto font-mono text-xs md:text-[15px] leading-relaxed space-y-4 z-30 overscroll-contain max-w-[140ch]"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Boot Output */}
          {booted && (
            <div className="space-y-4">
              <pre
                className="text-xs md:text-sm font-mono leading-none tracking-normal bg-gradient-to-b from-[#22d3ee] to-[#3b82f6] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] overflow-hidden select-none whitespace-pre"
                style={{
                  fontSize: 'clamp(10px, 1.4vw, 18px)',
                  fontVariantLigatures: 'none',
                  fontKerning: 'none',
                }}
              >
                {JAIRUS_BANNER_ASCII}
              </pre>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 py-3 border-y border-white/10">
                <div className="text-[#3b82f6] font-mono font-bold text-xs leading-none select-none flex-shrink-0">
                  {KALI_DRAGON_LOGO.map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </div>

                <div className="space-y-1 text-xs md:text-sm flex-1">
                  <p className="text-[#22d3ee] font-bold text-sm">jairus@linux</p>
                  <p className="text-white/30 border-b border-white/20 pb-1">------------------------</p>
                  <p><span className="text-[#22d3ee] font-bold">OS:</span> <span className="text-white">Kali GNU/Linux Rolling</span></p>
                  <p><span className="text-[#22d3ee] font-bold">Shell:</span> <span className="text-white">zsh 5.9</span></p>
                  <p><span className="text-[#22d3ee] font-bold">Terminal:</span> <span className="text-white">GNOME Terminal</span></p>
                  <p><span className="text-[#22d3ee] font-bold">Role:</span> <span className="text-white">Cybersecurity Student</span></p>
                  <p><span className="text-[#22d3ee] font-bold">Stack:</span> <span className="text-white">MERN, Python, C++</span></p>
                  <p><span className="text-[#22d3ee] font-bold">Skills:</span> <span className="text-white">6 categories</span></p>

                  <div className="pt-2 space-y-1">
                    <div className="flex items-center gap-1">
                      {COLOR_PALETTE_ROW_1.map((color, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      {COLOR_PALETTE_ROW_2.map((color, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>

                  <p className="text-[#ffb454] pt-2 font-mono italic">{hintText}</p>
                </div>
              </div>
            </div>
          )}

          {/* History Items */}
          {history.map((item) => (
            <div key={item.id} className="space-y-1.5 border-b border-white/[0.04] pb-2">
              <div className="text-xs md:text-[15px] font-mono">
                <div className="text-[#5b9dff] font-bold">
                  ┌──(<span className="text-[#5b9dff]">jairus㉿linux</span>)-[<span className="text-white">{item.path}</span>]
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#5b9dff]">└─$</span>
                  <span className="text-white font-medium">{item.command}</span>
                </div>
              </div>

              {item.output && (
                <div
                  className={`pl-4 text-xs md:text-[15px] ${
                    item.isError
                      ? 'text-[#ff6b6b]'
                      : item.isAmber
                      ? 'text-[#ffb454]'
                      : item.isGreen
                      ? 'text-[#00ff9c]'
                      : 'text-white/80'
                  }`}
                >
                  {Array.isArray(item.output) ? (
                    item.output.map((line, lIdx) => {
                      if (line.includes('/')) {
                        const parts = line.split(/\s{2,}/);
                        return (
                          <div key={lIdx} className="flex flex-wrap gap-3 py-0.5">
                            {parts.map((p, pIdx) => {
                              const isDir = p.endsWith('/');
                              const cleanName = p.replace(/\/$/, '');
                              const formattedCmd = isDir
                                ? `cd ${cleanName}`
                                : `cat ${cleanName.includes(' ') ? `"${cleanName}"` : cleanName}`;
                              return (
                                <span
                                  key={pIdx}
                                  onClick={() => handleRunCommand(formattedCmd)}
                                  className={`cursor-pointer hover:underline transition-colors ${
                                    isDir
                                      ? 'text-[#5b9dff] font-bold hover:text-[#00ff9c]'
                                      : 'text-white hover:text-[#00ff9c]'
                                  }`}
                                >
                                  {p}
                                </span>
                              );
                            })}
                          </div>
                        );
                      }
                      return <p key={lIdx}>{line}</p>;
                    })
                  ) : (
                    <p>{item.output}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Active Prompt Line */}
          {booted && (
            <div className="space-y-1 pt-1">
              <div className="text-[#5b9dff] font-bold text-xs md:text-[15px]">
                ┌──(<span className="text-[#5b9dff]">jairus㉿linux</span>)-[<span className="text-white">{currentPathPrompt}</span>]
              </div>

              <div className="flex items-center gap-2 relative">
                <span className="text-[#5b9dff] font-bold text-xs md:text-[15px]">└─$</span>

                <div className="flex items-center text-xs md:text-[15px] text-white font-medium">
                  <span>{inputText}</span>

                  {!inputText && ghostSuggestion && (
                    <span className="text-white/30 ml-0.5 pointer-events-none select-none">
                      {ghostSuggestion}
                    </span>
                  )}

                  <span
                    className={`w-2 h-4 bg-[#00ff9c] ml-0.5 inline-block align-middle shadow-[0_0_8px_#00ff9c] ${
                      showPulse ? 'animate-bounce' : 'animate-pulse'
                    }`}
                  />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  disabled={!autoSequenceDone}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="absolute inset-0 opacity-0 cursor-text"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="h-12 px-4 pl-16 bg-[#0c0e12] border-t border-white/10 flex items-center justify-between z-30 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {currentChips.map((chip) => (
              <button
                key={chip}
                disabled={!autoSequenceDone}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRunCommand(chip);
                }}
                className={`px-3 py-1 rounded text-xs font-mono border whitespace-nowrap transition-all duration-200 ${
                  !autoSequenceDone
                    ? 'opacity-40 border-white/5 text-white/30 cursor-not-allowed'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-[#00ff9c]/50 hover:text-[#00ff9c] hover:bg-[#00ff9c]/10'
                }`}
              >
                [ {chip} ]
              </button>
            ))}
          </div>
          <div className="text-[11px] font-mono text-white/40 hidden sm:block">
            overscroll ↑ to exit
          </div>
        </div>
      </div>
    </section>
  );
};
