"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { AnimatedSphere } from "../canvas/AnimatedSphere";

export function CtaSection() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section className="py-20 lg:py-28 overflow-hidden bg-white border-t border-zinc-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          onMouseMove={handleMouseMove}
          className="relative border border-zinc-200/90 rounded-3xl p-8 lg:p-14 overflow-hidden bg-gradient-to-br from-white via-zinc-50/60 to-amber-50/30 shadow-sm"
        >
          {/* Subtle amber mouse spotlight */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(251,191,36,0.35), transparent 50%)`,
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-500/20 text-xs font-mono font-medium text-amber-700 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Midnight Preprod Confidential Settlement
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 font-heading mb-4 leading-tight">
                Ready to transact in <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-zinc-800 to-amber-600">
                  Zero-Knowledge?
                </span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-8">
                Generate private Groth16 proofs client-side in under a second. Eliminate wallet address leaks and trade front-running with mathematical finality.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-white px-7 h-12 text-xs font-mono font-semibold uppercase tracking-wider rounded-xl transition-all hover:-translate-y-0.5 group shadow-sm"
                >
                  Launch Cyphra
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 text-amber-400" />
                </Link>

                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-800 px-6 h-12 text-xs font-mono font-semibold uppercase tracking-wider rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <BookOpen className="w-4 h-4 mr-2 text-zinc-500" />
                  Documentation
                </Link>
              </div>
            </div>

            {/* Right Wireframe ASCII Geometry */}
            <div className="w-[260px] h-[260px] lg:w-[320px] lg:h-[320px] shrink-0 opacity-90 pointer-events-none">
              <AnimatedSphere />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
