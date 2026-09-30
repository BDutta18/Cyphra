"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { AnimatedPrism } from "../canvas/AnimatedPrism";
import { MacbookTerminal } from "../terminal/MacbookTerminal";
import { useMidnightWallet } from "@/hooks/useMidnightWallet";

const words = ["settle", "shield", "invoice", "audit"];

const marqueeStats = [
  { value: "<840ms", label: "Client Groth16 proving" },
  { value: "$0.00", label: "Public ledger leakage" },
  { value: "100%", label: "Private browser witnesses" },
  { value: "Compact 0.31.1", label: "Native ZKIR circuits" },
  { value: "Midnight", label: "Preprod consensus live" },
  { value: "1AM v4", label: "Secure key connector" },
  { value: "Curve25519", label: "ECDH memo encryption" },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const { connectDemo } = useMidnightWallet();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-12 bg-white text-black font-sans">
      {/* 3D Wireframe ASCII Prism in upper-right corner (Black Color) */}
      <div className="absolute right-[-4%] sm:right-[-2%] top-10 sm:top-14 w-[480px] h-[480px] lg:w-[660px] lg:h-[660px] opacity-45 pointer-events-none">
        <AnimatedPrism />
      </div>

      {/* Subtle crisp architectural grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-black/[0.06]"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-black/[0.06]"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-12">
        {/* Eyebrow */}
        <div
          className={`mb-5 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-zinc-600 font-semibold">
            <span className="w-8 h-px bg-black/40" />
            Zero-Knowledge Settlement Protocol
          </span>
        </div>

        {/* Main Headline (Clean & Compact) */}
        <div className="mb-6 max-w-4xl">
          <h1
            className={`text-2xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-black leading-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <span>The layer to </span>
            <span className="inline-block text-black">
              <span key={wordIndex} className="inline-flex text-black">
                {words[wordIndex].split("").map((char, i) => (
                  <span
                    key={`${wordIndex}-${i}`}
                    className="inline-block animate-char-in"
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </span>{" "}
            <span className="text-zinc-400 font-bold">in Zero-Knowledge.</span>
          </h1>
        </div>

        {/* Description + CTAs (Minimal & Clean) */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-end mb-12">
          <p
            className={`text-lg sm:text-xl text-zinc-600 leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Private zero-knowledge invoices and payments on Midnight Preprod in under a second. Zero wallet address or balance leaks.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-3.5 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-black hover:bg-zinc-800 text-white px-8 h-12 text-sm font-semibold rounded-full transition-transform hover:-translate-y-0.5 group shadow-sm"
            >
              Start Transacting
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 text-[#FFD400]" />
            </Link>

            <button
              type="button"
              onClick={() => connectDemo("preprod")}
              className="inline-flex items-center justify-center h-12 px-6 text-sm font-semibold rounded-full border border-black/15 hover:bg-zinc-50 text-black transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              Try Sandbox (1,500 NIGHT)
            </button>
          </div>
        </div>

        {/* Interactive MacBook Terminal Demonstration */}
        <div
          className={`transition-all duration-1000 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="mb-3.5 flex items-center justify-start text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-800 bg-amber-50/80 border border-amber-300/60 px-3.5 py-1.5 rounded-full inline-flex items-center gap-2 font-medium shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Client Prover Simulator
            </span>
          </div>
          <MacbookTerminal />
        </div>
      </div>

      {/* Marquee Ticker (Minimal, High-Impact) */}
      <div
        className={`w-full mt-8 border-y border-black/[0.08] py-4 bg-zinc-50/60 backdrop-blur-sm transition-all duration-700 delay-500 overflow-hidden ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex gap-16 marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16 shrink-0 items-center">
              {marqueeStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="font-heading text-xl text-black font-extrabold">
                    {stat.value}
                  </span>
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400] ml-6" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
