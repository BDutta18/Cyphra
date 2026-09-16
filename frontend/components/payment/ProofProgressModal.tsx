'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { ProofGenerationStep } from '../../lib/cyphra-types';
import { ShieldCheck, Cpu, Key, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ProofProgressModalProps {
  isOpen: boolean;
  step: ProofGenerationStep | null;
  onClose: () => void;
  txHash?: string;
}

export function ProofProgressModal({ isOpen, step, onClose, txHash }: ProofProgressModalProps) {
  if (!isOpen || !step) return null;

  const isFinished = step.step === 'confirmed';

  const stepsList = [
    { key: 'initializing', label: 'Circuit & Ledger Verification', icon: Lock },
    { key: 'synthesizing_witness', label: 'Witness Synthesis (Private State)', icon: Key },
    { key: 'generating_proof', label: 'Zero-Knowledge Proof Generation', icon: Cpu },
    { key: 'balancing_tx', label: '1AM Wallet DUST Balancing', icon: ShieldCheck },
    { key: 'broadcasting', label: 'Network Relay & Confirmation', icon: ArrowRight },
  ];

  const getStepStatus = (index: number) => {
    const currentProgress = step.progress;
    const threshold = (index + 1) * 20;
    if (currentProgress >= threshold) return 'done';
    if (currentProgress >= threshold - 20) return 'active';
    return 'pending';
  };

  return (
    <Modal isOpen={isOpen} onClose={isFinished ? onClose : () => {}} title="Zero-Knowledge Proving Pipeline">
      <div className="space-y-5 text-zinc-900">
        {/* Progress Bar with Framer Motion spring */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-2">
            <span className="text-black font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFD400] animate-pulse" />
              {step.message}
            </span>
            <span className="text-zinc-600 font-bold tabular-nums">{step.progress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
            <motion.div
              className="h-full bg-[#FFD400] rounded-full border-r border-black/20"
              initial={{ width: 0 }}
              animate={{ width: `${step.progress}%` }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Cryptographic Steps List */}
        <div className="space-y-2 pt-1">
          {stepsList.map((item, idx) => {
            const status = getStepStatus(idx);
            const Icon = item.icon;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition-colors ${
                  status === 'done'
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-800'
                    : status === 'active'
                    ? 'bg-[#FFD400]/20 border-black text-black font-bold shadow-xs'
                    : 'bg-zinc-50/50 border-zinc-200 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : status === 'active'
                        ? 'bg-[#FFD400] text-black font-bold border border-black/20'
                        : 'bg-zinc-200 text-zinc-500'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                {status === 'done' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </motion.div>
                )}
                {status === 'active' && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {isFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-black text-sm">Settlement Verified On Midnight</h4>
            <p className="text-xs text-zinc-600 font-sans">
              Zero-knowledge proof generated and accepted by Midnight consensus. Notes committed privately via 1AM.
            </p>
            {txHash && (
              <div className="p-2 rounded bg-white border border-zinc-200 font-mono text-[11px] text-zinc-800 break-all text-left shadow-xs">
                <span className="text-zinc-500 block mb-0.5 font-bold">TX HASH:</span>
                {txHash}
              </div>
            )}
            <Button variant="primary" size="md" className="w-full mt-2 font-bold" onClick={onClose}>
              Done
            </Button>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
