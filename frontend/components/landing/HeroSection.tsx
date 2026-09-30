'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Lock, Blocks, ExternalLink } from 'lucide-react';
import { AnimatedSphere } from '../canvas/AnimatedSphere';
import { MacbookTerminal } from '../terminal/MacbookTerminal';
import { CYPHRA_CONTENT } from '../../lib/cyphra-content';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const words = CYPHRA_CONTENT.hero.rotatingWords;
  const { connectDemo } = useMidnightWallet();

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 sm:pt-32 pb-16 bg-white text-zinc-950 font-sans">
      {/* Animated 3D ASCII Sphere in upper-right corner */}
      <div className="absolute right-[-10%] sm:right-[-5%] top-12 sm:top-16 w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] opacity-25 pointer-events-none">
        <AnimatedSphere />
      </div>

      {/* Subtle architectural circuit grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 circuit-grid" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
        {/* Eyebrow & Live Network Badge */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono font-semibold text-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase">{CYPHRA_CONTENT.contract.network}</span>
          </div>
          <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
            Contract: {CYPHRA_CONTENT.contract.address.slice(0, 16)}...
          </span>
        </div>

        {/* Main Headline */}
        <div className="mb-6 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 leading-[1.04]">
            <span>{CYPHRA_CONTENT.hero.headlinePrefix}</span>{' '}
            <span className="relative inline-block">
              <span key={wordIndex} className="inline-flex text-zinc-950 underline decoration-[#FFD400] decoration-wavy decoration-2">
                {words[wordIndex]}
              </span>
            </span>
            <span className="block mt-1 sm:mt-2 text-zinc-500 font-bold text-3xl sm:text-5xl lg:text-6xl">
              on Midnight Network.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-zinc-600 max-w-2xl leading-relaxed font-sans">
            {CYPHRA_CONTENT.hero.blockquote}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FFD400] hover:bg-[#E5BE00] text-black font-extrabold text-sm border border-black/15 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>Launch Confidential DApp</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>

          <button
            type="button"
            onClick={() => connectDemo('preprod')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-900 font-bold text-sm border border-zinc-300 shadow-2xs transition-all hover:border-black cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Instant Preprod Sandbox (1,500 NIGHT)</span>
          </button>

          <a
            href={CYPHRA_CONTENT.urls.preprodExplorer}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-mono font-semibold text-zinc-600 hover:text-black transition-colors"
          >
            <span>Midnight Explorer</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>

        {/* Floating Short Tags Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
          {CYPHRA_CONTENT.hero.shortFloatingTags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-semibold text-zinc-700"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]" />
              {tag}
            </span>
          ))}
        </div>

        {/* Interactive Terminal Showcase */}
        <div className="mt-4 max-w-4xl">
          <MacbookTerminal />
        </div>
      </div>
    </section>
  );
}
