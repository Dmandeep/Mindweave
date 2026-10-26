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
  const [phase, setPhase] = useState<'name' | 'logo' | 'exit'>('name');
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
    const particleCount = Math.min(50, Math.floor((width * height) / 22000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
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

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 37, 37, ${0.12 * (1 - dist / 130)})`;
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
    const totalDuration = 3800; // 3.8s total cinematic duration

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setProgress(pct);
    }, 40);

    // Sequence step 1: Name reveal -> Step 2: Transition to Logo at 1.8s
    const tLogo = setTimeout(() => {
      setPhase('logo');
    }, 1800);

    // Sequence step 2: Logo showcase -> Step 3: Dissolve to Main Page at 3.8s
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
      clearTimeout(tLogo);
      clearTimeout(tExit);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forcePlay, handleFinish, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="MindWeave Signature Cinematic Entrance"
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F0] overflow-hidden select-none
        transition-all duration-700 ease-out
        ${isFadingOut ? 'opacity-0 scale-105 pointer-events-none filter blur-sm' : 'opacity-100 scale-100 filter-none'}
      `}
    >
      {/* Dynamic Background Canvas VFX */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0" 
      />

      {/* Atmospheric Radial Light Blooms (Cinematic Lighting) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-royal/10 blur-3xl pointer-events-none animate-pulse-glow" />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-tangerine/12 blur-3xl pointer-events-none animate-pulse-glow" 
        style={{ animationDelay: '1.5s' }}
      />

      {/* Subtle Dot Grid Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(37, 37, 37, 0.14) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Sleek Cinematic Skip Button with Radial Progress Ring */}
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

      {/* Central Cinematic Stage */}
      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center justify-center text-center">

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 1: CINEMATIC NAME ANIMATION
           ══════════════════════════════════════════════════════════════════ */}
        <div
          className={`
            flex flex-col items-center justify-center transition-all duration-700 ease-out
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

          {/* Staggered Letter-by-Letter Cinematic Title */}
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight font-sans text-ink leading-none flex items-center justify-center">
            {/* Mind with metallic reflection */}
            <span className="inline-block tracking-tight text-ink relative">
              Mind
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent bg-clip-text text-transparent animate-shimmer pointer-events-none" />
            </span>

            {/* Weave in radiant Royal Blue with star flare */}
            <span className="inline-block relative text-royal ml-0.5 drop-shadow-[0_4px_16px_rgba(49,95,233,0.30)]">
              Weave
              {/* Luminous Star Flare over letter 'i' */}
              <span 
                className="absolute -top-3.5 left-[18%] w-4 h-4 text-tangerine pointer-events-none animate-pulse-glow"
                style={{ filter: 'drop-shadow(0 0 6px #E97942)' }}
              >
                ✦
              </span>
            </span>
          </h1>

          {/* Luminous Laser Energy Weave Line */}
          <div className="relative w-64 h-1 my-5 overflow-visible flex items-center justify-center">
            {/* Energy Core Beam */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-royal to-transparent rounded-full opacity-90 blur-[0.5px]" />
            <div className="absolute inset-x-8 top-0 h-0.5 bg-gradient-to-r from-royal via-tangerine to-royal rounded-full shadow-[0_0_8px_#315FE9]" />
            {/* Pulsing focal nodes */}
            <span className="w-2 h-2 rounded-full bg-royal absolute -left-1 shadow-[0_0_8px_#315FE9] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-tangerine absolute -right-1 shadow-[0_0_8px_#E97942] animate-ping" />
          </div>

          {/* Tagline with cinematic character tracking */}
          <p className="text-base sm:text-lg font-mono text-ink/80 tracking-wide font-medium mt-1">
            Weaving Knowledge Into Discovery.
          </p>

          {/* Ambient Frequency Telegraph */}
          <div className="mt-8 flex items-center space-x-2 text-[11px] font-mono text-ink-muted">
            <span className="w-2 h-2 rounded-full bg-royal animate-pulse" />
            <span>Establishing Semantic Graph Topology...</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 2: CINEMATIC LOGO ANIMATION WITH 3D ORBITAL VFX
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
            Synthesizing Autonomous Knowledge Space...
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
