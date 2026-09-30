"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Lock, Blocks, ExternalLink } from "lucide-react";
import { AnimatedSphere } from "../canvas/AnimatedSphere";
import { MacbookTerminal } from "../terminal/MacbookTerminal";
import { CYPHRA_CONTENT } from "../../lib/cyphra-content";
import { useMidnightWallet } from "../../hooks/useMidnightWallet";

const SHORT_FLOATING_TEXT = [
  "100% Client-Side Proving",
  "$0.00 Balance Leakage",
  "Compact 0.31.1 ZK-SNARKs",
  "Double-Spend Guard",
  "Selective Audit Disclosures",
  "1AM Wallet Ready",
];

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
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 sm:pt-36 pb-12 bg-white text-zinc-950 font-sans">
      {/* Animated 3D ASCII Sphere in upper-right corner */}
      <div className="absolute right-[-10%] sm:right-[-5%] top-12 sm:top-16 w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] opacity-25 pointer-events-none">
        <AnimatedSphere />
      </div>

      {/* Subtle architectural circuit grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 circuit-grid" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
        {/* Eyebrow with gold accent line (TradeXchain Architecture) */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-amber-600 font-semibold">
            <span className="w-8 h-px bg-[#FFD400]" />
            Zero-Knowledge Settlement Protocol
          </span>
        </div>

        {/* Main Headline */}
        <div className="mb-6 max-w-5xl">
          <h1 className="text-[clamp(2.5rem,7vw,6.5rem)] font-black tracking-tight text-zinc-950 font-heading leading-[0.95]">
            <span className="block">The confidential layer to</span>
            <span className="block mt-2">
              <span className="relative inline-block">
                <span key={wordIndex} className="inline-flex text-zinc-950 underline decoration-[#FFD400] decoration-wavy decoration-3">
                  {words[wordIndex]}
                </span>
              </span>{" "}
              <span className="text-zinc-500 font-bold">in Zero-Knowledge.</span>
            </span>
          </h1>
        </div>

        {/* Tagline with border-l-2 accent line (TradeXchain Style) */}
        <div className="mb-8 max-w-3xl">
          <p className="border-l-2 border-[#FFD400] pl-5 text-base sm:text-lg text-zinc-600 leading-relaxed font-sans">
            {CYPHRA_CONTENT.hero.blockquote}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:-translate-y-0.5 group cursor-pointer"
          >
            <span>Launch Cyphra</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 text-[#FFD400]" />
          </Link>

          <button
            type="button"
            onClick={() => connectDemo("preprod")}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#FFD400] hover:bg-[#E5BE00] text-black font-mono text-xs font-bold uppercase tracking-wider border border-black/15 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Launch Instant Sandbox (1,500 NIGHT)</span>
          </button>

          <a
            href="https://github.com/BDutta18/Cyphra"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-4 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-mono text-xs font-semibold uppercase tracking-wider border border-zinc-200 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>
        </div>

        {/* Floating Short Tags Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
          {CYPHRA_CONTENT.hero.shortFloatingTags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200/80 text-xs font-mono font-medium text-zinc-700"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]" />
              {tag}
            </span>
          ))}
        </div>

        {/* Interactive MacBook Terminal in Crisp White & Dark Accents */}
        <div className="w-full max-w-4xl mx-auto mt-6">
          <div className="mb-3.5 flex items-center justify-start text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-800 bg-amber-50/80 border border-amber-300/60 px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 font-medium shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              On-Chain Settlement Simulator
            </span>
          </div>
          <MacbookTerminal />
        </div>
      </div>

      {/* Short Floating Marquee Ticker (TradeXchain Style in Transparent/White & Yellow) */}
      <div className="w-full mt-12 border-y border-zinc-200/80 py-3.5 bg-zinc-50/80 text-zinc-950 overflow-hidden">
        <div className="flex gap-12 marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-12 shrink-0 items-center">
              {SHORT_FLOATING_TEXT.map((text, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="font-heading text-xs sm:text-sm text-zinc-950 font-bold uppercase tracking-wider">
                    {text}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#FFD400] ml-6" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
