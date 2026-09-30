'use client';

import React, { useState } from 'react';
import { EyeOff, Eye, ShieldCheck, Lock } from 'lucide-react';
import { CYPHRA_CONTENT } from '../../lib/cyphra-content';

export function PrivacyModelSection() {
  const [activeTab, setActiveTab] = useState<'private' | 'public' | 'proves'>('private');
  const { whatStaysPrivate, whatIsPublic, whatUserProves } = CYPHRA_CONTENT.privacyModel;

  const currentCards =
    activeTab === 'private'
      ? whatStaysPrivate
      : activeTab === 'public'
      ? whatIsPublic
      : whatUserProves;

  return (
    <section id="privacy-model" className="py-20 lg:py-28 bg-white border-t border-zinc-200/80 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold mb-3">
              <span className="w-6 h-px bg-[#FFD400]" />
              <span>Midnight Dual-Ledger Privacy</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight leading-[1.06]">
              Cryptographic boundary.
              <br />
              <span className="text-zinc-500 font-bold">Zero mempool exposure.</span>
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-full border border-zinc-200 bg-zinc-50 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('private')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'private'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5 text-[#FFD400]" />
              <span>What Stays Private</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('public')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'public'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>What Is Public</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('proves')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'proves'
                  ? 'bg-[#FFD400] text-black font-extrabold shadow-xs border border-black/10'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>What You Prove</span>
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentCards.map((card, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-zinc-50/80 hover:bg-white border border-zinc-200/90 hover:border-zinc-300 shadow-2xs hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center mb-3">
                  {activeTab === 'private' ? (
                    <Lock className="w-4 h-4 text-zinc-900" />
                  ) : activeTab === 'public' ? (
                    <Eye className="w-4 h-4 text-zinc-700" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <h3 className="font-sans font-bold text-base text-zinc-950 mb-2 leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Field #{idx + 1}</span>
                <span className="font-bold uppercase text-zinc-600">
                  {activeTab === 'private' ? 'Encrypted' : activeTab === 'public' ? 'Ledger Public' : 'SNARK Proved'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
