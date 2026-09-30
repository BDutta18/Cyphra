'use client';

import React, { useState } from 'react';
import { CYPHRA_CONTENT } from '../../lib/cyphra-content';
import { ArrowRight, Code, Zap, Clock, ShieldCheck } from 'lucide-react';

export function HowItWorksSection() {
  const [selectedStep, setSelectedStep] = useState(0);
  const steps = CYPHRA_CONTENT.howItWorks;
  const activeStep = steps[selectedStep];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#FAFAFC] border-t border-zinc-200/80 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold mb-3">
            <span className="w-6 h-px bg-[#FFD400]" />
            <span>Zero-Knowledge Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight leading-[1.08]">
            How Cyphra settles payments without leaking balances.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 font-sans">
            Witnesses are synthesized client-side in the 1AM Wallet. Only succinct Groth16 mathematical proofs touch the public consensus ledger.
          </p>
        </div>

        {/* Interactive Step Navigator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {steps.map((step, idx) => {
            const isSelected = selectedStep === idx;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setSelectedStep(idx)}
                className={`p-5 rounded-3xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#FFD400] shadow-md ring-2 ring-[#FFD400]/40'
                    : 'bg-white/80 border-zinc-200/80 hover:bg-white hover:border-zinc-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-zinc-400">
                    Step {step.number}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                      isSelected
                        ? 'bg-[#FFD400] text-black border border-black/10'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {step.badge}
                  </span>
                </div>
                <h3 className="font-sans font-bold text-sm sm:text-base text-zinc-950 mb-1 leading-snug">
                  {step.title}
                </h3>
                <span className="text-xs text-zinc-500 font-mono block">
                  {step.latency}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Step Deep Dive Cockpit */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 cols: Description & Formula */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD400]/20 border border-[#FFD400]/50 text-xs font-mono font-bold text-zinc-900">
                <span>Phase {activeStep.number}: {activeStep.badge}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-sans">
                {activeStep.title}
              </h3>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans">
                {activeStep.description}
              </p>

              {/* Mathematical Cryptographic Formula */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 font-mono text-xs sm:text-sm text-zinc-800 space-y-1">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400 block">
                  Cryptographic Relation
                </span>
                <div className="font-mono text-zinc-900 font-bold overflow-x-auto py-1">
                  <code>{activeStep.formula}</code>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  Latency: <strong className="text-zinc-800">{activeStep.latency}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Compact 0.31.1 Verifiable</span>
                </span>
              </div>
            </div>

            {/* Right 6 cols: Code Execution Snippet */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-zinc-200/90 bg-zinc-950 text-zinc-100 overflow-hidden shadow-md font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-[#FFD400]" />
                    <span>Client Prover Executable</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">Verified Compact</span>
                </div>
                <pre className="p-4 sm:p-5 text-emerald-400 font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto whitespace-pre">
                  {activeStep.codeSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
