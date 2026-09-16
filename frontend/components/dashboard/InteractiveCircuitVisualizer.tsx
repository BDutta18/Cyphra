'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, ArrowRight, Lock, Key, Check, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export function InteractiveCircuitVisualizer() {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [proofState, setProofState] = useState<'idle' | 'witness' | 'proving' | 'verified'>('idle');
  const [nullifierHash, setNullifierHash] = useState('0x8f4b...392d');
  const [noteCommitment, setNoteCommitment] = useState('0x3c91...a78e');

  const triggerSimulation = () => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    setProofState('witness');

    setTimeout(() => {
      setProofState('proving');
    }, 900);

    setTimeout(() => {
      setProofState('verified');
      setIsSynthesizing(false);
      setNullifierHash('0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...null');
      setNoteCommitment('0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...cmmt');
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FFD400]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
              Midnight Compact ZK Engine
            </span>
          </div>
          <h3 className="text-base font-black text-black tracking-tight mt-0.5">
            Zero-Knowledge Witness Synthesis & Verification
          </h3>
        </div>

        <Button
          size="sm"
          onClick={triggerSimulation}
          disabled={isSynthesizing}
          className="bg-black text-white hover:bg-zinc-800 border-none font-mono text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
          {isSynthesizing ? 'Synthesizing...' : 'Simulate Circuit'}
        </Button>
      </div>

      {/* Interactive Circuit Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 relative">
        {/* Step 1: Private Inputs (Shielded) */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-zinc-600 uppercase">
                1. Private Witness
              </span>
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-white border border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500">Spend Key:</span>
                <span className="text-black font-semibold">●●●●●●●● (ZK)</span>
              </div>
              <div className="p-2 rounded bg-white border border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500">Amount & Asset:</span>
                <span className="text-black font-semibold">Confidential</span>
              </div>
              <div className="p-2 rounded bg-white border border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500">Blinding Nonce:</span>
                <span className="text-zinc-700">r_seed_0x7b...</span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-zinc-500">
            *Never leaves client browser
          </div>
        </div>

        {/* Step 2: Prover Circuit (Compact on Midnight) */}
        <div className="p-4 rounded-xl bg-white border-2 border-black flex flex-col justify-between relative shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-black uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-black" />
                2. Compact Prover
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#FFD400] text-black text-[10px] font-mono font-bold">
                BLS12-381
              </span>
            </div>

            {/* Visualizer Status */}
            <div className="my-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center relative">
                {proofState === 'idle' && <Cpu className="w-5 h-5 text-black" />}
                {proofState === 'witness' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-[#FFD400] border-t-black rounded-full"
                  />
                )}
                {proofState === 'proving' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-6 h-6 rounded-full bg-[#FFD400]"
                  />
                )}
                {proofState === 'verified' && (
                  <Check className="w-6 h-6 text-black stroke-[3]" />
                )}
              </div>
              <p className="mt-2 text-xs font-mono font-bold text-black capitalize">
                {proofState === 'idle' && 'Ready for Witness'}
                {proofState === 'witness' && 'Extracting Witness Constraints...'}
                {proofState === 'proving' && 'Generating zkSNARK Proof...'}
                {proofState === 'verified' && 'Circuit Satisfied & Validated!'}
              </p>
            </div>
          </div>

          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="bg-[#FFD400] h-full"
              initial={{ width: '0%' }}
              animate={{
                width:
                  proofState === 'idle'
                    ? '0%'
                    : proofState === 'witness'
                    ? '50%'
                    : proofState === 'proving'
                    ? '85%'
                    : '100%',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step 3: Public State Output (On-Chain) */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-zinc-600 uppercase">
                3. Public Settlement
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-white border border-zinc-200">
                <span className="text-zinc-500 block text-[10px]">Note Commitment:</span>
                <span className="text-black font-semibold break-all">{noteCommitment}</span>
              </div>
              <div className="p-2 rounded bg-white border border-zinc-200">
                <span className="text-zinc-500 block text-[10px]">Spent Nullifier:</span>
                <span className="text-black font-semibold break-all">{nullifierHash}</span>
              </div>
              <div className="p-2 rounded bg-white border border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500">Double-Spend Check:</span>
                <span className="text-emerald-600 font-bold">Passed</span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono text-zinc-500">
            *Only commitments published to Midnight ledger
          </div>
        </div>
      </div>

      {/* Bottom Cryptographic Guarantee Footer */}
      <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between text-xs text-zinc-500 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Prover Time: ~1.4s (Off-chain WASM prover)
        </span>
        <span>Security: Zero Knowledge + Perfect Soundness</span>
      </div>
    </div>
  );
}
