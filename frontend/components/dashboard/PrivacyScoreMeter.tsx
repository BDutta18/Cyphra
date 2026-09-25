'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface PrivacyScoreMeterProps {
  shieldedNight: string;
  unshieldedNight: string;
}

export function PrivacyScoreMeter({
  shieldedNight,
  unshieldedNight,
}: PrivacyScoreMeterProps) {
  const sNum  = parseFloat(shieldedNight.replace(/,/g, ''))   || 0;
  const uNum  = parseFloat(unshieldedNight.replace(/,/g, '')) || 0;
  const total = sNum + uNum;

  const score = total > 0 ? Math.min(100, Math.round((sNum / total) * 100)) : 100;

  // ── Radial gauge maths ──
  // Semi-circle arc: radius = 42, cx = cy = 52
  // Full semi arc = π * r = ~132 px circumference for 180° sweep
  const R   = 42;
  const CX  = 52;
  const CY  = 54;
  const circumference = Math.PI * R; // half-circle stroke dash
  const dashFill      = (score / 100) * circumference;

  const gaugeColor =
    score >= 80 ? '#10B981'  // emerald
    : score >= 50 ? '#FFD400' // gold
    : '#EF4444';               // red

  const statusLabel =
    score >= 80 ? 'Optimal' : score >= 50 ? 'Partially Shielded' : 'Exposed L1';

  const statusClasses =
    score >= 80
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : score >= 50
      ? 'bg-[#FFD400]/20 text-black border-[#FFD400]'
      : 'bg-red-50 text-red-800 border-red-200';

  const dotColor =
    score >= 80 ? 'bg-emerald-500 animate-pulse' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <Card className="flex flex-col justify-between bg-white border border-zinc-200/90 shadow-card h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-bold">
            Privacy Health
          </h3>
        </div>
        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shadow-xs ${statusClasses}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          {statusLabel}
        </span>
      </div>

      {/* ── Radial Gauge ── */}
      <div className="py-4 flex flex-col items-center">
        <div className="relative">
          <svg
            width="104"
            height="60"
            viewBox="0 0 104 60"
            fill="none"
            aria-label={`Privacy score: ${score}%`}
          >
            {/* Track arc */}
            <path
              d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
              fill="none"
              stroke="#E4E4E7"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Fill arc */}
            <motion.path
              d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
              fill="none"
              stroke={gaugeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - dashFill }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
            />
            {/* Score label */}
            <text
              x={CX}
              y={CY - 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono font-black"
              fontSize="18"
              fontWeight="900"
              fill="#09090B"
            >
              {score}%
            </text>
            {/* "SCORE" label below number */}
            <text
              x={CX}
              y={CY + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fontWeight="700"
              fill="#A1A1AA"
              letterSpacing="1.5"
            >
              PRIVACY
            </text>
          </svg>
        </div>

        {/* Linear bar — secondary detail */}
        <div className="w-full mt-1">
          <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
            <span className="text-zinc-600 font-medium">Shielded Note Ratio</span>
            <span className="font-extrabold text-black tabular-nums">{score}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/80 flex shadow-inner">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${gaugeColor}, ${gaugeColor}CC)` }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* ── Cryptographic Protection Indicators ── */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-500">
        {[
          { label: 'AMOUNTS', value: 'Hidden'  },
          { label: 'SENDER',  value: 'Masked'  },
          { label: 'GRAPH',   value: 'Unlinked'},
        ].map(({ label, value }) => (
          <div key={label} className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
            <span className="text-zinc-400 block text-[9px] font-bold">{label}</span>
            <span className="font-bold text-black flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Recommendation Panel ── */}
      <div className="mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2.5">
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
