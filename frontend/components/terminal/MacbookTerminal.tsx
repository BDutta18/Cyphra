'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Play, RotateCcw, Copy, Check, Sparkles, Shield, Cpu } from 'lucide-react';
import { CYPHRA_CONTENT } from '../../lib/cyphra-content';

interface TerminalStep {
  cmd: string;
  output: { text: string; color?: string }[];
  delayAfter?: number;
}

const DEMO_STEPS: TerminalStep[] = [
  {
    cmd: 'cyphra deposit --amount 1500 --token NIGHT --network preprod',
    output: [
      { text: '⚡ Initializing 1AM local witness synthesizer...', color: 'text-amber-500' },
      { text: '  Deriving Poseidon note commitment: 0x46c771c7b3a0a4e7...881f', color: 'text-zinc-600' },
      { text: '✓ Groth16 proof generated in 312ms. L1 tokens shielded into private state note.', color: 'text-emerald-600 font-bold' },
      { text: '  State Update: totalShieldedDeposits.increment(1) [On-Chain Verified]', color: 'text-zinc-700' },
    ],
    delayAfter: 1600,
  },
  {
    cmd: 'cyphra send --to mn_addr_preprod1... --amount 250 --token NIGHT',
    output: [
      { text: '🔒 Formulating zero-knowledge value conservation constraint:', color: 'text-amber-500' },
      { text: '  Circuit Check: input_val == output_val + change_val [PASSED]', color: 'text-emerald-600' },
      { text: '  Nullifier Check: spendKey knowledge proven without disclosure [PASSED]', color: 'text-emerald-600' },
      { text: '✓ 1AM Wallet WASM proof verified on Midnight Preprod (TX: 0x9ddd7f1b...416e)', color: 'text-emerald-600 font-bold' },
      { text: '  Privacy Guarantee: 0 sender identity, 0 recipient address, 0 amount exposed.', color: 'text-zinc-800 font-semibold' },
    ],
    delayAfter: 1800,
  },
  {
    cmd: 'cyphra invoice create --amount 500 --memo "Security Audit Service" --expiry 24h',
    output: [
      { text: '📋 Registering immutable payment request on Midnight ledger...', color: 'text-amber-500' },
      { text: '  Invoice ID: 0x8a92f0c7... | Terms Binding: Deterministic Hash Commitment', color: 'text-zinc-600' },
      { text: '✓ Payment URI Generated: cyphra:pay?req=0x8a92f0c7&amount=500&token=NIGHT', color: 'text-emerald-600 font-bold' },
    ],
    delayAfter: 1500,
  },
  {
    cmd: 'cyphra audit grant --scope "FY2026_TAX_REPORTING" --expiry 30d',
    output: [
      { text: '🛡️ Synthesizing cryptographically scoped auditor viewing key...', color: 'text-amber-500' },
      { text: '  Permissions: Read-only ledger state decryption (Spend Authority: EXEMPT)', color: 'text-zinc-600' },
      { text: '✓ Viewing Key 0x3f1a published for authorized auditor. Zero spend risk.', color: 'text-emerald-600 font-bold' },
    ],
    delayAfter: 3200,
  },
];

export function MacbookTerminal() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [history, setHistory] = useState<{ cmd: string; output: { text: string; color?: string }[] }[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [copied, setCopied] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const currentStep = DEMO_STEPS[currentStepIndex];

  // Auto-typing effect
  useEffect(() => {
    if (!isAutoPlay) return;

    if (typedChars < currentStep.cmd.length) {
      const timeout = setTimeout(() => {
        setTypedChars((prev) => prev + 1);
      }, Math.floor(Math.random() * 15) + 20);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      const delay = currentStep.delayAfter || 1500;
      const timeout = setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          { cmd: currentStep.cmd, output: currentStep.output },
        ]);
        setTypedChars(0);
        setIsTyping(true);

        if (currentStepIndex + 1 < DEMO_STEPS.length) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          // Loop back
          setTimeout(() => {
            setHistory([]);
            setCurrentStepIndex(0);
          }, 2400);
        }
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [typedChars, isTyping, currentStepIndex, isAutoPlay, currentStep]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history, typedChars]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentStep.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setHistory([]);
    setCurrentStepIndex(0);
    setTypedChars(0);
    setIsTyping(true);
  };

  return (
    <div className="w-full rounded-3xl bg-white border border-zinc-200/90 shadow-xl overflow-hidden font-mono text-xs">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/90 border-b border-zinc-200/80">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          <span className="text-[11px] font-sans font-semibold text-zinc-500 ml-2">
            cyphra-wasm-prover v0.31.1 (Midnight Preprod)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-200/70 transition-colors"
            title={isAutoPlay ? 'Pause Terminal' : 'Play Terminal'}
          >
            <Play className={`w-3.5 h-3.5 ${isAutoPlay ? 'text-emerald-600' : 'text-zinc-400'}`} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-200/70 transition-colors"
            title="Reset Terminal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-200/70 transition-colors"
            title="Copy Command"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={terminalBodyRef}
        className="p-4 sm:p-5 bg-white text-zinc-900 space-y-3 min-h-[260px] max-h-[340px] overflow-y-auto font-mono text-[11px] sm:text-xs leading-relaxed"
      >
        {/* Header Notice */}
        <div className="pb-2 border-b border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-sans">
          <span>Target Contract: {CYPHRA_CONTENT.contract.address.slice(0, 16)}...</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            WASM Client Active
          </span>
        </div>

        {/* History */}
        {history.map((step, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-800 font-semibold">
              <span className="text-[#FFD400] font-bold select-none">$</span>
              <span>{step.cmd}</span>
            </div>
            <div className="pl-4 space-y-1 text-zinc-600">
              {step.output.map((out, outIdx) => (
                <div key={outIdx} className={out.color || 'text-zinc-600'}>
                  {out.text}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Active Command Line */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-900 font-bold">
            <span className="text-[#FFD400] font-bold select-none">$</span>
            <span>{currentStep.cmd.substring(0, typedChars)}</span>
            {isTyping && <span className="inline-block w-2 h-4 bg-[#FFD400] animate-pulse" />}
          </div>
          {!isTyping && (
            <div className="pl-4 space-y-1 text-zinc-600 animate-fadeIn">
              {currentStep.output.map((out, outIdx) => (
                <div key={outIdx} className={out.color || 'text-zinc-600'}>
                  {out.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between text-[10px] text-zinc-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Local Prover: ProofStation (~840ms Groth16)</span>
        </div>
        <span className="font-mono text-zinc-600 font-bold">0x00 Memory Leakage</span>
      </div>
    </div>
  );
}
