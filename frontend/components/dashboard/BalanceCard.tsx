'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Eye, EyeOff, Shield, ArrowDownToLine, RefreshCw } from 'lucide-react';

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

  const handleRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const parsedNight = parseFloat(shieldedNight.replace(/,/g, '')) || 0;
  const estimatedUSD = (parsedNight * 1.85).toFixed(2);

  return (
    <Card variant="default" className="relative overflow-hidden bg-white border-zinc-200 shadow-sm">
      {/* Top micro-glow accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD400] via-black to-[#FFD400]" />

      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
                Confidential Shielded Vault
              </h2>
              <Tooltip content="Funds held in zero-knowledge note commitments on Midnight Preprod. Invisible to block explorers." />
            </div>
            <p className="text-[11px] text-emerald-700 font-mono flex items-center gap-1.5 mt-0.5 font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>1AM Protected Note Commitments</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="p-1.5 text-zinc-500 hover:text-black rounded-md hover:bg-zinc-100 transition-colors active:scale-95"
              title="Refresh Balances"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="p-1.5 text-zinc-500 hover:text-black rounded-md hover:bg-zinc-100 transition-colors active:scale-95"
            title={showAmounts ? 'Hide amounts' : 'Show amounts'}
          >
            {showAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="py-6">
        <AnimatePresence mode="wait">
          {showAmounts ? (
            <motion.div
              key="shown"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-black text-black tracking-tight font-mono tabular-nums">
                  {shieldedNight}
                </span>
                <span className="text-lg font-extrabold text-black bg-[#FFD400] px-2.5 py-0.5 rounded font-mono border border-black/15 shadow-xs">
                  NIGHT
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-1.5">
                ≈ ${estimatedUSD} USD
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
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-black text-zinc-400 tracking-tight font-mono">
                  ••••••••
                </span>
                <span className="text-lg font-extrabold text-black bg-[#FFD400] px-2.5 py-0.5 rounded font-mono border border-black/15">
                  NIGHT
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-1.5">
                Protected by Zero-Knowledge Proof
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-zinc-200">
        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono block font-medium">Shielded DUST (Gas)</span>
            <Tooltip content="Midnight gas token used by 1AM Wallet to balance and submit zero-knowledge transactions." />
          </div>
          <span className="text-sm font-bold text-black font-mono mt-0.5 block tabular-nums">
            {showAmounts ? `${shieldedDust} DUST` : '••••'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono block font-medium">tCYPHRA (Confidential)</span>
            <Tooltip content="Cyphra confidential stable asset transferred with complete value shielding." />
          </div>
          <span className="text-sm font-bold text-black font-mono mt-0.5 block tabular-nums">
            {showAmounts ? `${shieldedtCyphra} tCYPHRA` : '••••'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors col-span-2 sm:col-span-1 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-500 font-mono block font-medium">Unshielded L1</span>
              <Tooltip content="Public on-chain tokens in your Midnight address before being shielded into private notes." />
            </div>
            <span className="text-sm font-bold text-zinc-700 font-mono mt-0.5 block tabular-nums">
              {showAmounts ? `${unshieldedNight} NIGHT` : '••••'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDeposit}
            className="text-xs py-1 px-2.5 h-7 border-zinc-300 hover:border-black bg-white"
          >
            <ArrowDownToLine className="w-3 h-3 mr-1" /> Shield
          </Button>
        </div>
      </div>
    </Card>
  );
}
