'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import { executeCommand } from '@/lib/terminalCommands';
import {
  JAIRUS_BANNER_ASCII,
  KALI_DRAGON_LOGO,
  TAGLINE_BOTTOM,
  TAGLINE_TEXT,
  TAGLINE_TOP,
} from '@/lib/terminalBanner';
import { MatrixRain } from './MatrixRain';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const windowRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [booted, setBooted] = useState(false);
  const [currentPath, setCurrentPath] = useState('~');
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isDenseMatrix, setIsDenseMatrix] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Auto-focus input on section click
  const focusInput = () => {
    inputRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    } catch {}
  }, []);

  // Entrance reveal & boot trigger when section scrolls into view
  useEffect(() => {
    if (!sectionRef.current || !windowRef.current) return;

    const ctx = gsap.context(() => {
      // Entrance animation: window rises and fades in smoothly
      gsap.fromTo(
        windowRef.current,
        { y: 40, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            onEnter: () => setBooted(true),
          },
        }
      );
    }, sectionRef);

    // Refresh ScrollTrigger
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  // Pulse hint if no interaction for 8s after boot
  useEffect(() => {
    if (!booted) return;
    const timer = setTimeout(() => {
      setShowPulse(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [booted]);

  // Execute typed or clicked command
  const handleRunCommand = (cmdToRun?: string) => {
    const rawCmd = cmdToRun !== undefined ? cmdToRun : inputText;
    const trimmed = rawCmd.trim();

    if (!trimmed) {
      if (booted) {
        setHistory((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            path: currentPath,
            command: '',
            output: '',
          },
        ]);
      }
      setInputText('');
      return;
    }

    setShowPulse(false);
    const result = executeCommand(trimmed, currentPath);

    if (result.clear) {
      setHistory([]);
      setInputText('');
      return;
    }

    if (result.cmatrixToggle) {
      setIsDenseMatrix((prev) => !prev);
    }

    if (result.newPath) {
      setCurrentPath(result.newPath);
    }

    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        path: currentPath,
        command: rawCmd,
        output: result.output,
        isError: result.isError,
        isAmber: result.isAmber,
        isGreen: result.isGreen,
      },
    ]);

    setCmdHistory((prev) => [...prev, rawCmd]);
    setHistoryIdx(-1);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }
    }, 50);
  };

  // Keyboard navigation & Shortcuts
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
      if (!inputText && !booted) return;
      if (!inputText) {
        e.preventDefault();
        setInputText('ls');
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setHistory([]);
    }
  };

  const QUICK_CHIPS = ['help', 'ls', 'cd skills', 'tree', 'neofetch'];

  return (
    <section
      id="technical-skills-section"
      ref={sectionRef}
      role="region"
      aria-label="Technical skills terminal"
      className="relative w-full min-h-screen bg-[#0C0907] text-[#F2E9D8] select-none font-mono py-16 px-4 md:px-8 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Accessible Screen-Reader Summary */}
      <div className="sr-only">
        <h2>Technical Skills</h2>
        <p>Interactive Kali Linux Terminal containing programming, web development, backend, cybersecurity, tools, and AI tools skills.</p>
      </div>

      {/* Matrix Rain Backdrop */}
      <MatrixRain isDense={isDenseMatrix} />

      {/* Kali Linux Style Terminal Window */}
      <div
        ref={windowRef}
        onClick={focusInput}
        className="relative z-10 w-[92vw] max-w-[1100px] h-[70vh] min-h-[520px] max-h-[720px] rounded-xl overflow-hidden border border-white/10 bg-[#080a0c]/90 backdrop-blur-md shadow-[0_0_40px_rgba(0,255,156,0.08)] flex flex-col cursor-text"
      >
        {/* Scanline Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
          }}
        />

        {/* Terminal Window Header Bar */}
        <div className="h-10 px-4 bg-[#11141a] border-b border-white/10 flex items-center justify-between select-none z-30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="text-xs font-mono text-white/70 tracking-wide font-medium">
            jairus@linux: {currentPath}
          </div>
          <div className="text-xs font-mono text-[#00ff9c]/70 font-semibold hidden md:block">
            zsh 5.9
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={bodyRef}
          className="flex-1 p-4 md:p-6 overflow-y-auto font-mono text-xs md:text-sm leading-relaxed space-y-4 scrollbar-none z-30"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Boot Sequence Output */}
          {booted && (
            <div className="space-y-3">
              {/* Figlet ASCII Banner */}
              <pre className="text-xs md:text-sm font-bold bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] bg-clip-text text-transparent leading-tight overflow-x-auto">
                {JAIRUS_BANNER_ASCII}
              </pre>

              {/* Boxed Tagline */}
              <div className="text-[10px] md:text-xs font-mono font-bold tracking-tighter overflow-x-auto whitespace-pre">
                <p className="text-[#a3e635]">{TAGLINE_TOP}</p>
                <p className="text-[#fb923c]">
                  {TAGLINE_TEXT.slice(0, 48)}
                  <span className="text-[#e879f9]">{TAGLINE_TEXT.slice(48)}</span>
                </p>
                <p className="text-[#fb923c]">{TAGLINE_BOTTOM}</p>
              </div>

              {/* Neofetch Summary Block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-2 border-y border-white/5">
                {/* Left: Dragon Logo */}
                <div className="md:col-span-4 text-[#3b82f6] font-bold text-xs leading-tight">
                  {KALI_DRAGON_LOGO.map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </div>

                {/* Right: Info Lines */}
                <div className="md:col-span-8 space-y-0.5 text-xs">
                  <p className="text-[#22d3ee] font-bold">jairus@linux</p>
                  <p className="text-white/30">------------</p>
                  <p><span className="text-[#22d3ee]">OS:</span> <span className="text-white">Kali GNU/Linux Rolling</span></p>
                  <p><span className="text-[#22d3ee]">Shell:</span> <span className="text-white">zsh 5.9</span></p>
                  <p><span className="text-[#22d3ee]">Terminal:</span> <span className="text-white">GNOME Terminal</span></p>
                  <p><span className="text-[#22d3ee]">Role:</span> <span className="text-white">Cybersecurity Student</span></p>
                  <p><span className="text-[#22d3ee]">Stack:</span> <span className="text-white">MERN, Python, C++</span></p>
                  <p><span className="text-[#22d3ee]">Skills:</span> <span className="text-white">6 categories</span></p>
                  <p className="text-[#ffb454] pt-1">Hint: type 'help' to get started</p>
                </div>
              </div>
            </div>
          )}

          {/* Executed History Lines */}
          {history.map((item) => (
            <div key={item.id} className="space-y-1">
              {/* Frozen Prompt Header */}
              <div className="text-xs md:text-sm font-mono">
                <div className="text-[#5b9dff] font-bold">
                  ┌──(<span className="text-[#5b9dff]">jairus㉿linux</span>)-[<span className="text-white">{item.path}</span>]
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#5b9dff]">└─$</span>
                  <span className="text-white font-medium">{item.command}</span>
                </div>
              </div>

              {/* Output Content */}
              {item.output && (
                <div
                  className={`pl-4 text-xs md:text-sm ${
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
                    item.output.map((line, lIdx) => <p key={lIdx}>{line}</p>)
                  ) : (
                    <p>{item.output}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Active Live Prompt Line */}
          {booted && (
            <div className="space-y-1">
              <div className="text-[#5b9dff] font-bold text-xs md:text-sm">
                ┌──(<span className="text-[#5b9dff]">jairus㉿linux</span>)-[<span className="text-white">{currentPath}</span>]
              </div>

              <div className="flex items-center gap-2 relative">
                <span className="text-[#5b9dff] font-bold text-xs md:text-sm">└─$</span>

                {/* Visible Rendered Typed Text & Caret */}
                <div className="flex items-center text-xs md:text-sm text-white font-medium">
                  <span>{inputText}</span>

                  {/* Ghost Suggestion Hint */}
                  {!inputText && (
                    <span className="text-white/30 ml-0.5 pointer-events-none select-none">
                      ls
                    </span>
                  )}

                  {/* Blinking Caret */}
                  <span
                    className={`w-2 h-4 bg-[#00ff9c] ml-0.5 inline-block align-middle ${
                      showPulse ? 'animate-bounce shadow-[0_0_8px_#00ff9c]' : 'animate-pulse'
                    }`}
                  />
                </div>

                {/* Visually Hidden Real Input for Native Touch/Keyboard */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="absolute inset-0 opacity-0 cursor-text"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Command Action Chips for Touch / Quick Access */}
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={chip}
            onClick={() => handleRunCommand(chip)}
            className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all duration-200 ${
              idx === 1 && showPulse
                ? 'border-[#00ff9c] text-[#00ff9c] shadow-[0_0_12px_#00ff9c] scale-105'
                : 'border-white/10 bg-white/5 text-white/70 hover:border-[#00ff9c]/50 hover:text-[#00ff9c] hover:bg-[#00ff9c]/10'
            }`}
          >
            [ {chip} ]
          </button>
        ))}
      </div>
    </section>
  );
};
