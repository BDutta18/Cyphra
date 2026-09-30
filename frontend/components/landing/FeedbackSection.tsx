"use client";

import { useState } from "react";
import { Star, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { CYPHRA_CONTENT } from "@/lib/cyphra-content";

export function FeedbackSection() {
  const [activeTab, setActiveTab] = useState(0);
  const { feedback } = CYPHRA_CONTENT;
  const activeChange = feedback.changes[activeTab];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-200/60 bg-gradient-to-b from-white via-zinc-50/50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-500/20 text-xs font-mono font-medium text-amber-700 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Verified User Feedback • Level 5 Validation
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-heading">
              Shaped by <span className="text-amber-600 underline decoration-amber-400/40">79 Real Users</span> on Preprod
            </h2>
            <p className="mt-2 text-zinc-600 text-sm sm:text-base max-w-xl">
              We tested Cyphra across crypto-native founders, treasurers, and privacy advocates. Every sprint was driven by verifiable user feedback.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-6 bg-white/90 backdrop-blur-sm border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold font-mono text-zinc-950">{feedback.averageRating}</span>
                <span className="text-xs text-zinc-500 font-mono">/ 5.0</span>
                <div className="flex ml-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">Average User Rating</div>
            </div>
            <div className="w-px h-8 bg-zinc-200" />
            <div>
              <div className="text-2xl font-bold font-mono text-zinc-950">{feedback.totalRespondents}</div>
              <div className="text-[11px] text-zinc-500 font-medium">Survey Responses</div>
            </div>
            <div className="w-px h-8 bg-zinc-200" />
            <div>
              <div className="text-2xl font-bold font-mono text-amber-600">{feedback.verifiedLaunchUsers}</div>
              <div className="text-[11px] text-zinc-500 font-medium">Launch Partners</div>
            </div>
          </div>
        </div>

        {/* Feedback Cockpit / Two-Column Interactive View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Feedback Selector List */}
          <div className="lg:col-span-5 space-y-2.5">
            {feedback.changes.map((item, idx) => {
              const isSelected = idx === activeTab;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? "bg-amber-50/70 border-amber-400/70 shadow-xs"
                      : "bg-white/80 border-zinc-200/70 hover:bg-zinc-50/80 hover:border-zinc-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-zinc-500">{item.id}</span>
                      <span className="text-xs font-semibold text-zinc-900 line-clamp-1">{item.title}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                      <span>{item.user}</span>
                      <span>•</span>
                      <span className="flex text-amber-500">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        ))}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 ml-2 transition-transform duration-200 flex-shrink-0 ${
                      isSelected ? "text-amber-600 translate-x-1" : "text-zinc-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Resolution Card */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-sm border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
              <div>
                <span className="text-xs font-mono font-medium text-amber-600 uppercase tracking-wider">
                  Feedback Resolution Spec
                </span>
                <h3 className="text-lg font-bold text-zinc-950 mt-0.5">{activeChange.title}</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-mono font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Deployed
              </div>
            </div>

            <div className="space-y-4">
              {/* What We Heard */}
              <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                  What We Heard from {activeChange.user}
                </div>
                <p className="text-sm text-zinc-600 italic">
                  &ldquo;{activeChange.whatWeHeard}&rdquo;
                </p>
              </div>

              {/* What We Changed */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Production Implementation in Cyphra
                </div>
                <p className="text-sm text-zinc-800 font-medium leading-relaxed">
                  {activeChange.whatWeChanged}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Audited Period: {feedback.period}</span>
              <span className="text-zinc-900 font-semibold">{activeChange.id}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
