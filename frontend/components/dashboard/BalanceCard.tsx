'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Eye, EyeOff, Shield, ArrowDownToLine, RefreshCw, Sparkles, Lock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export interface BalanceCardProps {
  shieldedNight: string;
  shieldedDust: string;
  shieldedtCyphra: string;
  unshieldedNight: string;
  onOpenDeposit: () => void;
  onRefresh?: () => void;
}

export function BalanceCard({
  shieldedNight,
  shieldedDust,
  shieldedtCyphra,
  unshieldedNight,
  onOpenDeposit,
  onRefresh,
}: BalanceCardProps) {
  const [showAmounts, setShowAmounts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<'NIGHT' | 'DUST' | 'tCYPHRA'>('NIGHT');

  const handleRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const parsedNight = parseFloat(shieldedNight.replace(/,/g, '')) || 0;
  const parsedDust = parseFloat(shieldedDust.replace(/,/g, '')) || 0;
  const parsedCyphra = parseFloat(shieldedtCyphra.replace(/,/g, '')) || 0;

  const currentDisplayAmount =
    selectedAsset === 'NIGHT'
      ? shieldedNight
      : selectedAsset === 'DUST'
      ? shieldedDust
      : shieldedtCyphra;

  const estimatedUSD =
    selectedAsset === 'NIGHT'
      ? (parsedNight * 1.85).toFixed(2)
      : selectedAsset === 'DUST'
      ? (parsedDust * 0.12).toFixed(2)
      : (parsedCyphra * 1.0).toFixed(2);

  return (
    <Card variant="default" className="relative overflow-hidden bg-white border-zinc-200/90 shadow-card">
      {/* Top micro-glow accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFD400] via-black to-[#FFD400]" />

      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
                Confidential Shielded Vault
              </h2>
              <Tooltip content="Cryptographically shielded using Compact 0.31.1 note commitments on Midnight Preprod. Account balances are undetectable on block explorers." />
            </div>
            <p className="text-[11px] text-emerald-700 font-mono flex items-center gap-1.5 mt-0.5 font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>1AM Protected Zero-Knowledge Commitments</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="p-1.5 text-zinc-500 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors active:scale-95"
              title="Refresh Balances"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="p-1.5 text-zinc-500 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors active:scale-95"
            title={showAmounts ? 'Hide amounts' : 'Show amounts'}
          >
            {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Asset Display & Tabs */}
      <div className="py-6">
        <div className="flex items-center gap-2 mb-4">
          {(['NIGHT', 'DUST', 'tCYPHRA'] as const).map((asset) => (
            <button
              key={asset}
              type="button"
              onClick={() => setSelectedAsset(asset)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedAsset === asset
                  ? 'bg-black text-[#FFD400] shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200/80'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {showAmounts ? (
            <motion.div
              key={`shown-${selectedAsset}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-black tracking-tight font-mono tabular-nums">
                  {currentDisplayAmount}
                </span>
                <span className="text-base font-black text-black bg-[#FFD400] px-2.5 py-0.5 rounded-lg font-mono border border-black/15 shadow-xs">
                  {selectedAsset}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-1.5 flex items-center gap-1.5">
                <span>≈ ${estimatedUSD} USD</span>
                <span className="text-zinc-300">•</span>
                <span className="text-emerald-700 font-semibold">100% Shielded</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="hidden"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-zinc-400 tracking-tight font-mono">
                  ••••••••
                </span>
                <span className="text-base font-black text-black bg-[#FFD400] px-2.5 py-0.5 rounded-lg font-mono border border-black/15">
                  {selectedAsset}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Shielded by Midnight Zero-Knowledge Commitments
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Asset Sub-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-zinc-100">
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono block font-semibold">Shielded DUST (Gas)</span>
            <Tooltip content="Midnight gas token used by 1AM Wallet to balance and submit zero-knowledge transactions." />
          </div>
          <span className="text-sm font-extrabold text-black font-mono mt-1 block tabular-nums">
            {showAmounts ? `${shieldedDust} DUST` : '••••'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono block font-semibold">tCYPHRA (Confidential)</span>
            <Tooltip content="Cyphra confidential stable asset transferred with complete value shielding." />
          </div>
          <span className="text-sm font-extrabold text-black font-mono mt-1 block tabular-nums">
            {showAmounts ? `${shieldedtCyphra} tCYPHRA` : '••••'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-500 font-mono block font-semibold">Unshielded L1</span>
              <Tooltip content="Public on-chain tokens in your Midnight address before being shielded into private notes." />
            </div>
            <span className="text-sm font-extrabold text-zinc-700 font-mono mt-1 block tabular-nums">
              {showAmounts ? `${unshieldedNight} NIGHT` : '••••'}
            </span>
          </div>
          <Button
            variant="cyber"
            size="xs"
            onClick={onOpenDeposit}
            className="text-[11px] py-1 px-2.5 h-7 shadow-xs"
          >
            <ArrowDownToLine className="w-3 h-3 mr-1 text-[#FFD400]" /> Shield
          </Button>
        </div>
      </div>
    </Card>
  );
}
