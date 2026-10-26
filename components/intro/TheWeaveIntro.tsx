'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface TheWeaveIntroProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export const TheWeaveIntro: React.FC<TheWeaveIntroProps> = ({ onComplete, forcePlay = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);
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
    }, 450);
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
    setStage(1);

    // Stage progression pipeline (~2.8s total)
    const t1 = setTimeout(() => setStage(2), 650);  // Connections form
    const t2 = setTimeout(() => setStage(3), 1350); // The Weave converges
    const t3 = setTimeout(() => setStage(4), 2100); // Brand & Tagline reveal
    const t4 = setTimeout(() => handleFinish(), 2850); // Workspace reveal

    // Allow Esc key to skip immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forcePlay, handleFinish, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="MindWeave Brand Introduction"
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F0] overflow-hidden select-none
        transition-opacity duration-500 ease-out
        ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* Accessible Skip Button */}
      <button
        onClick={handleFinish}
        className="absolute top-5 right-6 z-20 px-3 py-1.5 rounded-full text-xs font-mono text-ink/60 hover:text-ink bg-cream-200/80 hover:bg-cream-300 border border-ink/10 transition-all focus:outline-none focus:ring-2 focus:ring-royal/40"
        aria-label="Skip Introduction Animation"
      >
        Skip <span className="opacity-50 text-[10px] ml-1">[Esc]</span>
      </button>

      {/* Background Micro Dot Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(37, 37, 37, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Composition Canvas */}
      <div className="relative w-full max-w-lg h-96 flex flex-col items-center justify-center p-6">
        
        {/* Dynamic SVG Weave Graph Layer */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 500 380"
        >
          <defs>
            <linearGradient id="royalToTangerine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#315FE9" />
              <stop offset="100%" stopColor="#E97942" />
            </linearGradient>
            <linearGradient id="tangerineGlow" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E97942" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FAF7F0" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Stage 2 & 3: Weaving Connection Trajectories */}
          {stage >= 2 && (
            <g className="transition-opacity duration-700 ease-in-out">
              {/* Left-to-center weave trajectory (Royal Blue) */}
              <path
                d="M 90 140 C 180 70, 210 240, 250 170"
                fill="none"
                stroke="#315FE9"
                strokeWidth={stage >= 3 ? "2.5" : "1.8"}
                strokeDasharray={stage === 2 ? "300" : "none"}
                strokeDashoffset={stage === 2 ? "0" : undefined}
                className="transition-all duration-700"
                style={{
                  strokeDasharray: stage === 2 ? 300 : undefined,
                  animation: stage === 2 ? 'drawWeave 0.75s ease-out forwards' : undefined,
                }}
              />

              {/* Right-to-center weave trajectory (Burnt Tangerine) */}
              <path
                d="M 410 140 C 320 70, 290 240, 250 170"
                fill="none"
                stroke="#E97942"
                strokeWidth={stage >= 3 ? "2.5" : "1.8"}
                className="transition-all duration-700"
                style={{
                  strokeDasharray: stage === 2 ? 300 : undefined,
                  animation: stage === 2 ? 'drawWeave 0.75s ease-out forwards' : undefined,
                }}
              />

              {/* Central orbital resonance loops */}
              <ellipse
                cx="250"
                cy="170"
                rx={stage >= 3 ? "95" : "75"}
                ry={stage >= 3 ? "35" : "28"}
                transform="rotate(-18 250 170)"
                fill="none"
                stroke="url(#royalToTangerine)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                className={`transition-all duration-700 ${stage >= 3 ? 'opacity-80' : 'opacity-40'}`}
              />
            </g>
          )}

          {/* Stage 1: Floating Epistemic Nodes */}
          <g className={`transition-opacity duration-500 ${stage >= 3 ? 'opacity-30' : 'opacity-100'}`}>
            {/* Left Node: Distributed Systems */}
            <circle cx="90" cy="140" r="5" fill="#315FE9" className="animate-pulse" />
            <text x="75" y="125" fontSize="10" fontFamily="monospace" fill="#252525" opacity="0.65" textAnchor="end">
              Structural Graph
            </text>

            {/* Right Node: Cognitive Models */}
            <circle cx="410" cy="140" r="5" fill="#E97942" className="animate-pulse" />
            <text x="425" y="125" fontSize="10" fontFamily="monospace" fill="#252525" opacity="0.65">
              Latent Synthesis
            </text>

            {/* Top Node: Epistemic Hypothesis */}
            <circle cx="250" cy="80" r="4" fill="#252525" opacity="0.4" />
            <text x="250" y="68" fontSize="9" fontFamily="monospace" fill="#252525" opacity="0.5" textAnchor="middle">
              Hypothesis Space
            </text>

            {/* Bottom Node: Empirical Evidence */}
            <circle cx="250" cy="260" r="4" fill="#315FE9" opacity="0.5" />
            <text x="250" y="278" fontSize="9" fontFamily="monospace" fill="#252525" opacity="0.5" textAnchor="middle">
              Empirical Telemetry
            </text>
          </g>
        </svg>

        {/* Central Emblem & Brand Identity (Stages 3 & 4) */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {/* Logo Mark Container */}
          <div 
            className={`
              relative w-28 h-28 rounded-2xl p-1.5 transition-all duration-700 ease-out
              ${stage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-3'}
            `}
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 rounded-2xl bg-royal/10 blur-xl scale-125 pointer-events-none" />

            <div className="relative w-full h-full rounded-xl bg-[#FAF7F0] border border-ink/10 shadow-[0_8px_30px_rgba(37,37,37,0.08)] flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="MindWeave Emblem"
                className="w-full h-full object-contain p-1 transform transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Typography Reveal (Stage 4) */}
          <div
            className={`
              mt-5 flex flex-col items-center transition-all duration-600 ease-out
              ${stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
            `}
          >
            <div className="flex items-center space-x-1.5">
              <span className="text-2xl font-bold tracking-tight text-ink font-sans">
                Mind<span className="text-royal">Weave</span>
              </span>
            </div>

            <p className="mt-1 text-xs font-mono tracking-wide text-ink/70">
              Weaving Knowledge Into Discovery
            </p>

            {/* Stage indicator pill */}
            <div className="mt-3 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-royal" />
              <span className="text-[10px] font-mono text-ink/50 uppercase tracking-wider">
                Autonomous Epistemic Engine
              </span>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes drawWeave {
          0% {
            stroke-dashoffset: 300;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};
