'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export interface PrivacyScoreMeterProps {
  shieldedNight: string;
  unshieldedNight: string;
}

export function PrivacyScoreMeter({
  shieldedNight,
  unshieldedNight,
}: PrivacyScoreMeterProps) {
  const sNum = parseFloat(shieldedNight.replace(/,/g, '')) || 0;
  const uNum = parseFloat(unshieldedNight.replace(/,/g, '')) || 0;
  const total = sNum + uNum;

  const score = total > 0 ? Math.min(100, Math.round((sNum / total) * 100)) : 100;

  return (
    <Card className="flex flex-col justify-between bg-white border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-black" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-bold">Privacy Status</h3>
        </div>
        <span
          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${
            score >= 80
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : score >= 50
              ? 'bg-[#FFD400] text-black border-black/20'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              score >= 80 ? 'bg-emerald-500 animate-pulse' : score >= 50 ? 'bg-black' : 'bg-red-500'
            }`}
          />
          {score >= 80 ? 'Shielded 100%' : score >= 50 ? 'Partially Exposed' : 'Exposed L1'}
        </span>
      </div>

      <div className="py-4">
        <div className="flex items-center justify-between mb-2 text-xs font-mono">
          <span className="text-zinc-600">Shielded Ratio</span>
          <span className="font-bold text-black tabular-nums">{score}%</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200 flex">
          <motion.div
            className="h-full bg-[#FFD400]"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <motion.div
            className="h-full bg-zinc-300"
            initial={{ width: 0 }}
            animate={{ width: `${100 - score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2.5">
        {score === 100 ? (
          <>
            <Lock className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <span className="text-[11px] text-zinc-700 leading-relaxed font-sans">
              100% of holdings are committed into zero-knowledge notes. No public transactions or balances are visible on-chain.
            </span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[11px] text-zinc-700 leading-relaxed font-sans">
              You have {unshieldedNight} unshielded NIGHT. Move them to private notes via 1AM Wallet to prevent wallet clustering.
            </span>
          </>
        )}
      </div>
    </Card>
  );
}
