'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface TheWeaveIntroProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export const TheWeaveIntro: React.FC<TheWeaveIntroProps> = ({ onComplete, forcePlay = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<'name' | 'logo' | 'exit'>('name');
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleFinish = useCallback(() => {
    setIsFadingOut(true);
    try {
      sessionStorage.setItem('mindweave_intro_seen', 'true');
    } catch {
      // Ignore storage restrictions
    }
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion && !forcePlay) {
        setIsVisible(false);
        onComplete?.();
        return;
      }

      // Check if already seen in this session
      try {
        const hasSeen = sessionStorage.getItem('mindweave_intro_seen');
        if (hasSeen && !forcePlay) {
          setIsVisible(false);
          onComplete?.();
          return;
        }
      } catch {
        // Continue
      }
    }

    setIsVisible(true);
    setPhase('name'); // Step 1: Name Intro Animation

    // Step 1 -> Step 2: Transition from Name intro to Logo animation after 1.5s
    const tLogo = setTimeout(() => {
      setPhase('logo');
    }, 1500);

    // Step 2 -> Step 3: Transition to Open Main Page after 3.2s total
    const tOpen = setTimeout(() => {
      setPhase('exit');
      handleFinish();
    }, 3200);

    // Keyboard shortcut [Esc] to skip instantly
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(tLogo);
      clearTimeout(tOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forcePlay, handleFinish, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="MindWeave Signature Entrance"
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F0] overflow-hidden select-none
        transition-all duration-500 ease-out
        ${isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}
      `}
    >
      {/* Background Micro Dot Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(37, 37, 37, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Accessible Skip Button */}
      <button
        onClick={handleFinish}
        className="absolute top-6 right-7 z-30 px-3.5 py-1.5 rounded-full text-xs font-mono text-ink/60 hover:text-ink bg-[#FCFAF5] hover:bg-[#F3EDE0] border border-ink/15 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-royal/40 flex items-center space-x-1.5"
        aria-label="Skip to main page"
      >
        <span>Skip</span>
        <ArrowRight className="w-3 h-3 text-royal" />
        <span className="opacity-40 text-[10px]">[Esc]</span>
      </button>

      {/* Main Composition Arena */}
      <div className="relative w-full max-w-xl h-[420px] flex flex-col items-center justify-center p-6 text-center">

        {/* ══════════════════════════════════════════════════════════════════
            1ST: THE NAME INTRO ANIMATION
           ══════════════════════════════════════════════════════════════════ */}
        {phase === 'name' && (
          <div className="flex flex-col items-center justify-center animate-name-reveal">
            {/* Epistemic Sub-badge */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-royal-subtle border border-royal/20 text-royal text-xs font-mono mb-4 shadow-xs">
              <Sparkles className="w-3 h-3 text-tangerine animate-pulse" />
              <span>Autonomous Discovery Platform</span>
            </div>

            {/* Cinematic Name Wordmark */}
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight font-sans text-ink leading-none">
              <span>Mind</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal via-[#264EC8] to-royal drop-shadow-sm">
                Weave
              </span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-tangerine ml-1.5 animate-pulse" />
            </h1>

            {/* Glowing Weaving Underline */}
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-royal to-transparent mt-4 mb-3 rounded-full opacity-80" />

            {/* Tagline */}
            <p className="text-sm font-mono tracking-wide text-ink/70">
              Weaving Knowledge Into Discovery.
            </p>

            <div className="mt-8 flex items-center space-x-2 text-[11px] font-mono text-ink/40">
              <span className="w-2 h-2 rounded-full bg-royal animate-ping" />
              <span>Initializing Epistemic Space...</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            2ND: THE LOGO ANIMATION
           ══════════════════════════════════════════════════════════════════ */}
        {phase === 'logo' && (
          <div className="flex flex-col items-center justify-center animate-logo-float-in">
            {/* Dynamic Orbital SVG Halo */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              
              {/* Outer Orbit Ring (Burnt Tangerine) */}
              <div 
                className="absolute inset-0 rounded-full border border-dashed border-tangerine/50"
                style={{ animation: 'orbitSpin 10s linear infinite' }}
              >
                <div className="w-3 h-3 rounded-full bg-tangerine absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_8px_#E97942]" />
              </div>

              {/* Inner Orbit Ring (Royal Blue) */}
              <div 
                className="absolute inset-3 rounded-full border border-royal/40"
                style={{ animation: 'orbitSpin 6s linear infinite reverse' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-royal absolute -bottom-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_8px_#315FE9]" />
              </div>

              {/* Central Glowing Backdrop */}
              <div className="absolute inset-6 rounded-3xl bg-gradient-to-tr from-royal/15 via-tangerine/10 to-royal/20 blur-xl scale-125 pointer-events-none" />

              {/* Official 3D Weaving Logo Asset */}
              <div className="relative w-32 h-32 rounded-2xl bg-[#FCFAF5] border border-ink/12 shadow-[0_12px_36px_rgba(37,37,37,0.12)] p-2 flex items-center justify-center overflow-hidden transform hover:scale-105 transition-transform duration-500">
                <img
                  src="/logo.png"
                  alt="MindWeave Official Emblem"
                  className="w-full h-full object-contain filter drop-shadow-md animate-card-float"
                />
              </div>
            </div>

            {/* Resolved Brand Badge */}
            <div className="mt-5 flex items-center space-x-2">
              <span className="text-xl font-bold font-sans tracking-tight text-ink">
                Mind<span className="text-royal">Weave</span>
              </span>
              <span className="text-xs font-mono text-ink-muted">v1.0</span>
            </div>

            <p className="mt-1 text-xs font-mono text-ink/60">
              Launching Interactive Research Canvas...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
