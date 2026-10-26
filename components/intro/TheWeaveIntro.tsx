'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface TheWeaveIntroProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const TheWeaveIntro: React.FC<TheWeaveIntroProps> = ({ onComplete, forcePlay = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<'name' | 'weave' | 'logo' | 'exit'>('name');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

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
    }, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Canvas VFX: Floating Epistemic Constellation Network
  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#315FE9', '#E97942', '#252525', '#315FE9'];
    const particleCount = Math.min(55, Math.floor((width * height) / 20000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections between nearby constellation nodes
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 37, 37, ${0.14 * (1 - dist / 135)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw drifting particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);

  // Main Intro Sequencing & Timer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion && !forcePlay) {
        setIsVisible(false);
        onComplete?.();
        return;
      }

      try {
        const hasSeen = sessionStorage.getItem('mindweave_intro_seen');
        if (hasSeen && !forcePlay) {
          setIsVisible(false);
          onComplete?.();
          return;
        }
      } catch {
        // ignore
      }
    }

    setIsVisible(true);
    setPhase('name');
    setProgress(0);

    const startTime = Date.now();
    const totalDuration = 4200; // 4.2s total rich cinematic duration

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setProgress(pct);
    }, 40);

    // Sequence 1 -> 2: Name -> The Weave at 1.5s
    const tWeave = setTimeout(() => {
      setPhase('weave');
    }, 1500);

    // Sequence 2 -> 3: The Weave -> 3D Logo at 2.8s
    const tLogo = setTimeout(() => {
      setPhase('logo');
    }, 2800);

    // Sequence 3 -> 4: Exit & Push-Through into Workspace at 4.2s
    const tExit = setTimeout(() => {
      setPhase('exit');
      handleFinish();
    }, totalDuration);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(tWeave);
      clearTimeout(tLogo);
      clearTimeout(tExit);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forcePlay, handleFinish, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="MindWeave Cinematic Tapestry Entrance"
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F0] overflow-hidden select-none
        transition-all duration-700 ease-out
        ${isFadingOut ? 'opacity-0 scale-105 pointer-events-none filter blur-md' : 'opacity-100 scale-100 filter-none'}
      `}
    >
      {/* Dynamic Background Canvas VFX */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0" 
      />

      {/* Atmospheric Ambient Lighting Blooms */}
      <div className="absolute -top-36 -left-36 w-[420px] h-[420px] rounded-full bg-royal/12 blur-3xl pointer-events-none animate-pulse-glow" />
      <div 
        className="absolute -bottom-36 -right-36 w-[420px] h-[420px] rounded-full bg-tangerine/14 blur-3xl pointer-events-none animate-pulse-glow" 
        style={{ animationDelay: '1.8s' }}
      />

      {/* Subtle Dot Grid Canvas Backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(37, 37, 37, 0.14) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Sleek Cinematic Skip Button with Progress Ring */}
      <button
        onClick={handleFinish}
        className="absolute top-6 right-8 z-30 group flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FCFAF5]/90 backdrop-blur-md border border-ink/15 shadow-card hover:border-royal/50 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-royal/40"
        aria-label="Skip Cinematic Intro"
      >
        <span className="text-xs font-mono text-ink-secondary group-hover:text-ink font-medium">
          Skip
        </span>
        <ArrowRight className="w-3 h-3 text-royal group-hover:translate-x-0.5 transition-transform" />
        <span className="text-[10px] font-mono text-ink-muted">[Esc]</span>

        {/* Circular Progress Meter */}
        <div className="relative w-4 h-4 ml-1">
          <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 20 20">
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="rgba(37, 37, 37, 0.12)"
              strokeWidth="2"
            />
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="#315FE9"
              strokeWidth="2"
              strokeDasharray={50.2}
              strokeDashoffset={50.2 - (50.2 * progress) / 100}
              className="transition-all duration-100"
            />
          </svg>
        </div>
      </button>

      {/* Central Cinematic Arena */}
      <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center justify-center text-center">

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 1: CINEMATIC NAME ANIMATION (0s - 1.5s)
           ══════════════════════════════════════════════════════════════════ */}
        <div
          className={`
            flex flex-col items-center justify-center transition-all duration-600 ease-out
            ${phase === 'name' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-8 pointer-events-none absolute'}
          `}
        >
          {/* Luminous Technology Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-royal/20 text-royal text-xs font-mono shadow-xs mb-5 animate-name-reveal">
            <Sparkles className="w-3.5 h-3.5 text-tangerine animate-pulse" />
            <span className="tracking-wider uppercase text-[11px] font-semibold">
              Autonomous Epistemic Discovery Engine
            </span>
          </div>

          {/* Staggered Cinematic Typography */}
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight font-sans text-ink leading-none flex items-center justify-center">
            {/* Mind with Specular Shimmer */}
            <span className="inline-block tracking-tight text-ink relative">
              Mind
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent bg-clip-text text-transparent animate-shimmer pointer-events-none" />
            </span>

            {/* Weave in radiant Royal Blue with star spark */}
            <span className="inline-block relative text-royal ml-0.5 drop-shadow-[0_4px_16px_rgba(49,95,233,0.35)]">
              Weave
              {/* Luminous Star Spark over letter 'i' */}
              <span 
                className="absolute -top-3.5 left-[18%] w-4 h-4 text-tangerine pointer-events-none animate-pulse-glow"
                style={{ filter: 'drop-shadow(0 0 6px #E97942)' }}
              >
                ✦
              </span>
            </span>
          </h1>

          {/* Luminous Laser Energy Weave Beam */}
          <div className="relative w-64 h-1 my-5 overflow-visible flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-royal to-transparent rounded-full opacity-90 blur-[0.5px]" />
            <div className="absolute inset-x-8 top-0 h-0.5 bg-gradient-to-r from-royal via-tangerine to-royal rounded-full shadow-[0_0_8px_#315FE9]" />
            <span className="w-2 h-2 rounded-full bg-royal absolute -left-1 shadow-[0_0_8px_#315FE9] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-tangerine absolute -right-1 shadow-[0_0_8px_#E97942] animate-ping" />
          </div>

          <p className="text-base sm:text-lg font-mono text-ink/80 tracking-wide font-medium mt-1">
            Weaving Knowledge Into Discovery.
          </p>

          <div className="mt-8 flex items-center space-x-2 text-[11px] font-mono text-ink-muted">
            <span className="w-2 h-2 rounded-full bg-royal animate-pulse" />
            <span>Harmonizing Semantic Topology...</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 2: THE "WEAVE" TAPESTRY ANIMATION (1.5s - 2.8s)
           ══════════════════════════════════════════════════════════════════ */}
        <div
          className={`
            w-full flex flex-col items-center justify-center transition-all duration-600 ease-out
            ${phase === 'weave' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'}
          `}
        >
          {/* Weave Headline */}
          <div className="text-[11px] font-mono tracking-widest text-royal uppercase font-semibold mb-2 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-royal animate-ping" />
            <span>Weaving Discrete Domains Into Synthesis</span>
            <span className="w-1.5 h-1.5 rounded-full bg-tangerine animate-ping" />
          </div>

          {/* SVG Dynamic Weaving Loom Canvas */}
          <div className="relative w-full max-w-xl h-64 flex items-center justify-center">
            <svg 
              viewBox="0 0 600 240" 
              className="w-full h-full overflow-visible"
              style={{ filter: 'drop-shadow(0 0 12px rgba(49, 95, 233, 0.25))' }}
            >
              <defs>
                <linearGradient id="blueRibbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#315FE9" stopOpacity="0.1" />
                  <stop offset="30%" stopColor="#315FE9" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#2563EB" stopOpacity="1" />
                  <stop offset="100%" stopColor="#315FE9" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="tangerineRibbonGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#E97942" stopOpacity="0.1" />
                  <stop offset="30%" stopColor="#E97942" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#EA580C" stopOpacity="1" />
                  <stop offset="100%" stopColor="#E97942" stopOpacity="0.3" />
                </linearGradient>

                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Harmonic Weave Waves */}
              <path
                d="M 40 120 C 120 40, 200 200, 300 120 C 400 40, 480 200, 560 120"
                fill="none"
                stroke="url(#blueRibbonGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 800,
                  animation: 'weaveDraw 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />

              <path
                d="M 40 120 C 120 200, 200 40, 300 120 C 400 200, 480 40, 560 120"
                fill="none"
                stroke="url(#tangerineRibbonGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 800,
                  animation: 'weaveDraw 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />

              {/* Core Interlocking "M" Shape Trajectory Paths */}
              {/* Left Peak of M (Royal Blue) */}
              <path
                d="M 180 180 C 180 80, 240 60, 300 140"
                fill="none"
                stroke="#315FE9"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#glowFilter)"
                style={{
                  strokeDasharray: 400,
                  animation: 'weaveDraw 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />

              {/* Right Peak of M (Burnt Tangerine) */}
              <path
                d="M 420 180 C 420 80, 360 60, 300 140"
                fill="none"
                stroke="#E97942"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#glowFilter)"
                style={{
                  strokeDasharray: 400,
                  animation: 'weaveDraw 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />

              {/* Traveling Luminous Photons on the Weave */}
              <circle r="4" fill="#FFFFFF" filter="drop-shadow(0 0 6px #315FE9)">
                <animateMotion
                  path="M 40 120 C 120 40, 200 200, 300 120 C 400 40, 480 200, 560 120"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle r="4" fill="#FFFFFF" filter="drop-shadow(0 0 6px #E97942)">
                <animateMotion
                  path="M 560 120 C 480 40, 400 200, 300 120 C 200 40, 120 200, 40 120"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Central Convergence Spark Nexus */}
              <circle cx="300" cy="140" r="7" fill="#FFFFFF" filter="drop-shadow(0 0 10px #FFFFFF)" className="animate-ping" />
              <circle cx="300" cy="140" r="4" fill="#315FE9" />
            </svg>
          </div>

          <p className="text-xs font-mono text-ink/70 mt-2">
            Interlocking Hypotheses & Autonomous Analogies...
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 3: THE OFFICIAL 3D LOGO & ORBITAL EMBLEM (2.8s - 4.2s)
           ══════════════════════════════════════════════════════════════════ */}
        <div
          className={`
            flex flex-col items-center justify-center transition-all duration-700 ease-out
            ${phase === 'logo' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8 pointer-events-none absolute'}
          `}
        >
          {/* 3D VFX Arena */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            
            {/* Outer Orbit: Burnt Tangerine Planetary Trail */}
            <div 
              className="absolute inset-0 rounded-full border border-dashed border-tangerine/60"
              style={{
                transform: 'rotateX(62deg) rotateY(18deg)',
                animation: 'orbitSpin 7s linear infinite',
              }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-tangerine absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_12px_#E97942]" />
            </div>

            {/* Inner Orbit: Royal Blue Energetic Stream */}
            <div 
              className="absolute inset-4 rounded-full border border-royal/50"
              style={{
                transform: 'rotateX(58deg) rotateY(-22deg)',
                animation: 'orbitSpin 4.5s linear infinite reverse',
              }}
            >
              <div className="w-3 h-3 rounded-full bg-royal absolute -bottom-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_12px_#315FE9]" />
            </div>

            {/* Radiant Ambient Core Halo */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-royal/20 via-tangerine/15 to-royal/25 blur-2xl scale-125 pointer-events-none animate-pulse-glow" />

            {/* Official 3D Weaving Logo Emblem */}
            <div className="relative w-36 h-36 rounded-2xl bg-[#FCFAF5] border border-ink/15 shadow-[0_16px_48px_rgba(37,37,37,0.14)] p-2.5 flex items-center justify-center overflow-hidden animate-card-float">
              {/* Shimmer Light Glint Bar */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none -skew-x-12"
                style={{ animation: 'shimmerSweep 2.5s ease-in-out infinite' }}
              />
              <img
                src="/logo.png"
                alt="MindWeave Official 3D Emblem"
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>
          </div>

          {/* Resolved Name Wordmark Under Logo */}
          <div className="mt-6 flex items-center space-x-2">
            <span className="text-2xl font-bold font-sans tracking-tight text-ink">
              Mind<span className="text-royal">Weave</span>
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-royal-subtle text-royal border border-royal/20 font-semibold">
              Live Studio
            </span>
          </div>

          <p className="mt-1.5 text-xs font-mono text-ink/70">
            Synthesizing Knowledge Cosmos...
          </p>
        </div>

      </div>

      <style jsx>{`
        @keyframes shimmerSweep {
          0% {
            transform: translateX(-150%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
      `}</style>
    </div>
  );
};
