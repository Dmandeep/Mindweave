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
    }, 1000);
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
    const particleCount = Math.min(65, Math.floor((width * height) / 18000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.45 + 0.25,
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

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 37, 37, ${0.12 * (1 - dist / 140)})`;
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

  // Main Intro Sequencing & Timer — Luxurious, Unhurried 8.4s Total Pacing
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
    const totalDuration = 8400; // 8.4s cinematic unhurried experience

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setProgress(pct);
    }, 40);

    // Sequence 1 -> 2: Name -> The Weave Tapestry at 2.8s
    const tWeave = setTimeout(() => {
      setPhase('weave');
    }, 2800);

    // Sequence 2 -> 3: The Weave -> 3D Logo at 5.6s
    const tLogo = setTimeout(() => {
      setPhase('logo');
    }, 5600);

    // Sequence 3 -> 4: Exit & Silky 1000ms Push-Through into Workspace at 8.0s
    const tExit = setTimeout(() => {
      setPhase('exit');
      handleFinish();
    }, 8000);

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
        transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isFadingOut ? 'opacity-0 scale-105 pointer-events-none filter blur-xl' : 'opacity-100 scale-100 filter-none'}
      `}
    >
      {/* Dynamic Background Canvas VFX */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0" 
      />

      {/* Atmospheric Ambient Lighting Blooms */}
      <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-royal/15 blur-3xl pointer-events-none animate-pulse-glow" />
      <div 
        className="absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full bg-tangerine/15 blur-3xl pointer-events-none animate-pulse-glow" 
        style={{ animationDelay: '2s' }}
      />

      {/* Subtle Dot Grid Canvas Backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(37, 37, 37, 0.14) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Sleek Cinematic Skip Button with Radial Gauge */}
      <button
        onClick={handleFinish}
        className="absolute top-6 right-8 z-30 group flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#FCFAF5]/95 backdrop-blur-md border border-ink/15 shadow-card hover:border-royal/50 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-royal/40"
        aria-label="Skip Cinematic Intro"
      >
        <span className="text-xs font-mono text-ink-secondary group-hover:text-ink font-medium">
          Skip
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-royal group-hover:translate-x-0.5 transition-transform" />
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
              className="transition-all duration-100 ease-linear"
            />
          </svg>
        </div>
      </button>

      {/* Central Cinematic Stage Arena */}
      <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center justify-center text-center">

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 1: CINEMATIC NAME ANIMATION (0s - 2.8s)
           ══════════════════════════════════════════════════════════════════ */}
        <div
          className={`
            w-full flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${phase === 'name' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-8 pointer-events-none absolute'}
          `}
        >
          {/* Luminous Technology Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-royal/25 text-royal text-xs font-mono shadow-xs mb-6 animate-name-reveal">
            <Sparkles className="w-3.5 h-3.5 text-tangerine animate-pulse" />
            <span className="tracking-widest uppercase text-[11px] font-bold">
              Autonomous Epistemic Discovery Engine
            </span>
          </div>

          {/* Staggered Grand Typography */}
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight font-sans text-ink leading-none flex items-center justify-center select-none">
            {/* Mind with Continuous Specular Shimmer */}
            <span className="inline-block tracking-tight text-ink relative">
              Mind
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent bg-clip-text text-transparent animate-shimmer pointer-events-none" />
            </span>

            {/* Weave in Radiant Royal Blue with Star Spark */}
            <span className="inline-block relative text-royal ml-1 drop-shadow-[0_4px_20px_rgba(49,95,233,0.35)]">
              Weave
              {/* Luminous Star Spark over letter 'i' */}
              <span 
                className="absolute -top-4 left-[20%] w-4 h-4 text-tangerine pointer-events-none animate-pulse-glow"
                style={{ filter: 'drop-shadow(0 0 8px #E97942)' }}
              >
                ✦
              </span>
            </span>
          </h1>

          {/* Luminous Laser Energy Weave Beam */}
          <div className="relative w-72 h-1.5 my-6 overflow-visible flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-royal to-transparent rounded-full opacity-90 blur-[0.5px]" />
            <div className="absolute inset-x-8 top-0 h-1 bg-gradient-to-r from-royal via-tangerine to-royal rounded-full shadow-[0_0_12px_#315FE9]" />
            <span className="w-2.5 h-2.5 rounded-full bg-royal absolute -left-1 shadow-[0_0_10px_#315FE9] animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-tangerine absolute -right-1 shadow-[0_0_10px_#E97942] animate-ping" />
          </div>

          <p className="text-lg sm:text-xl font-mono text-ink/80 tracking-wide font-medium mt-1">
            Weaving Knowledge Into Discovery.
          </p>

          <div className="mt-8 flex items-center space-x-2.5 text-xs font-mono text-ink-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-royal animate-ping" />
            <span>Harmonizing Epistemic Topologies...</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 2: THE "WEAVE" TAPESTRY ANIMATION (2.8s - 5.6s)
           ══════════════════════════════════════════════════════════════════ */}
        <div
          className={`
            w-full flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${phase === 'weave' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 pointer-events-none absolute'}
          `}
        >
          {/* Weave Headline */}
          <div className="text-xs font-mono tracking-widest text-royal uppercase font-bold mb-3 flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-royal animate-ping" />
            <span>Interlocking Discrete Domains Into Synthesis</span>
            <span className="w-2 h-2 rounded-full bg-tangerine animate-ping" />
          </div>

          {/* SVG Dynamic Weaving Loom Canvas */}
          <div className="relative w-full max-w-xl h-64 flex items-center justify-center">
            <svg 
              viewBox="0 0 600 240" 
              className="w-full h-full overflow-visible"
              style={{ filter: 'drop-shadow(0 0 16px rgba(49, 95, 233, 0.28))' }}
            >
              <defs>
                <linearGradient id="blueRibbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#315FE9" stopOpacity="0.1" />
                  <stop offset="25%" stopColor="#315FE9" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#2563EB" stopOpacity="1" />
                  <stop offset="100%" stopColor="#315FE9" stopOpacity="0.25" />
                </linearGradient>

                <linearGradient id="tangerineRibbonGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#E97942" stopOpacity="0.1" />
                  <stop offset="25%" stopColor="#E97942" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#EA580C" stopOpacity="1" />
                  <stop offset="100%" stopColor="#E97942" stopOpacity="0.25" />
                </linearGradient>

                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Harmonic Weave Waves */}
              <path
                id="harmonicPathA"
                d="M 30 120 C 120 30, 200 210, 300 120 C 400 30, 480 210, 570 120"
                fill="none"
                stroke="url(#blueRibbonGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 900,
                  animation: 'weaveDraw 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />

              <path
                id="harmonicPathB"
                d="M 30 120 C 120 210, 200 30, 300 120 C 400 210, 480 30, 570 120"
                fill="none"
                stroke="url(#tangerineRibbonGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 900,
                  animation: 'weaveDraw 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />

              {/* Core Interlocking "M" Shape Trajectory Paths */}
              {/* Left Peak of M (Royal Blue) */}
              <path
                d="M 180 180 C 180 70, 240 50, 300 140"
                fill="none"
                stroke="#315FE9"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#glowFilter)"
                style={{
                  strokeDasharray: 450,
                  animation: 'weaveDraw 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />

              {/* Right Peak of M (Burnt Tangerine) */}
              <path
                d="M 420 180 C 420 70, 360 50, 300 140"
                fill="none"
                stroke="#E97942"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#glowFilter)"
                style={{
                  strokeDasharray: 450,
                  animation: 'weaveDraw 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />

              {/* Traveling Luminous Photons on the Weave */}
              <circle r="4.5" fill="#FFFFFF" filter="drop-shadow(0 0 8px #315FE9)">
                <animateMotion
                  path="M 30 120 C 120 30, 200 210, 300 120 C 400 30, 480 210, 570 120"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle r="4.5" fill="#FFFFFF" filter="drop-shadow(0 0 8px #E97942)">
                <animateMotion
                  path="M 570 120 C 480 30, 400 210, 300 120 C 200 30, 120 210, 30 120"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Central Convergence Spark Nexus */}
              <circle cx="300" cy="140" r="9" fill="#FFFFFF" filter="drop-shadow(0 0 12px #FFFFFF)" className="animate-ping" />
              <circle cx="300" cy="140" r="5" fill="#315FE9" />
            </svg>
          </div>

          <p className="text-xs font-mono text-ink/80 mt-2 font-medium">
            Bridging Structural Gaps & Latent Analogies...
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 3: THE OFFICIAL 3D LOGO & ORBITAL EMBLEM (5.6s - 8.0s)
           ══════════════════════════════════════════════════════════════════ */}
        <div
          className={`
            w-full flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${phase === 'logo' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8 pointer-events-none absolute'}
          `}
        >
          {/* 3D VFX Arena */}
          <div className="relative w-60 h-60 flex items-center justify-center">
            
            {/* Outer Orbit: Burnt Tangerine Planetary Trail */}
            <div 
              className="absolute inset-0 rounded-full border border-dashed border-tangerine/60"
              style={{
                transform: 'rotateX(62deg) rotateY(18deg)',
                animation: 'orbitSpin 8s linear infinite',
              }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-tangerine absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_14px_#E97942]" />
            </div>

            {/* Inner Orbit: Royal Blue Energetic Stream */}
            <div 
              className="absolute inset-4 rounded-full border border-royal/50"
              style={{
                transform: 'rotateX(58deg) rotateY(-22deg)',
                animation: 'orbitSpin 5.5s linear infinite reverse',
              }}
            >
              <div className="w-3 h-3 rounded-full bg-royal absolute -bottom-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_14px_#315FE9]" />
            </div>

            {/* Radiant Ambient Core Halo */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-royal/20 via-tangerine/15 to-royal/25 blur-2xl scale-125 pointer-events-none animate-pulse-glow" />

            {/* Official 3D Weaving Logo Emblem */}
            <div className="relative w-36 h-36 rounded-2xl bg-[#FCFAF5] border border-ink/15 shadow-[0_18px_50px_rgba(37,37,37,0.16)] p-2.5 flex items-center justify-center overflow-hidden animate-card-float">
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

          <p className="mt-1.5 text-xs font-mono text-ink/80 font-medium">
            Entering the Knowledge Cosmos...
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
