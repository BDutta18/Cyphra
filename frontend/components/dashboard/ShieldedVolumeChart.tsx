'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import { TransactionActivity } from '../../lib/cyphra-types';

export interface ShieldedVolumeChartProps {
  activities?: TransactionActivity[];
}

interface EpochMetric {
  label: string;
  volume: number;
  proofs: number;
}

export function ShieldedVolumeChart({ activities = [] }: ShieldedVolumeChartProps) {
  // Aggregate real activities into the last 7 calendar days
  const chartData: EpochMetric[] = useMemo(() => {
    const days: EpochMetric[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + dayMs;

      const dayActs = activities.filter(
        (a) => a.timestamp >= startOfDay && a.timestamp < endOfDay
      );

      const dayVolume = dayActs.reduce((sum, act) => {
        const val = parseFloat(act.amount.replace(/,/g, '')) || 0;
        return sum + val;
      }, 0);

      const dayProofs = dayActs.filter((a) => a.proofVerified).length;

      days.push({
        label: dayName,
        volume: Math.round(dayVolume * 100) / 100,
        proofs: dayProofs,
      });
    }

    return days;
  }, [activities]);

  const [activeIdx, setActiveIdx] = useState<number>(chartData.length - 1);
  const activeData = chartData[activeIdx] || chartData[chartData.length - 1];

  const totalVolume7D = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.volume, 0);
  }, [chartData]);

  const totalProofs7D = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.proofs, 0);
  }, [chartData]);

  // SVG coordinate calculations
  const width = 500;
  const height = 140;
  const padding = 20;

  const maxVal = Math.max(...chartData.map((d) => d.volume), 10);
  const minVal = 0;

  const points = chartData.map((d, i) => {
    const x = padding + (i / Math.max(chartData.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - ((d.volume - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const hasActivity = totalVolume7D > 0 || totalProofs7D > 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-500">
            <Activity className="w-3.5 h-3.5 text-black" />
            Shielded Settlement Volume (7-Day Rolling Epoch)
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-black font-mono tabular-nums">
              {activeData.volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NIGHT
            </span>
            <span className="text-xs font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
              {activeData.label} Epoch
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 block">ZK Proofs Verified</span>
            <span className="text-base font-black text-black font-mono">
              {activeData.proofs} Proofs ({totalProofs7D} Total)
            </span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="mt-4 relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="yellowAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD400" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFD400" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background area fill */}
          <path d={areaD} fill="url(#yellowAreaGradient)" />

          {/* Animated line stroke */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Interactive data points */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setActiveIdx(i)}
            >
              {/* Invisible larger hover hit area */}
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

              {/* Point circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={activeIdx === i ? 5 : 3.5}
                fill={activeIdx === i ? '#FFD400' : '#FFFFFF'}
                stroke="#000000"
                strokeWidth="2"
                className="transition-all duration-150"
              />
            </g>
          ))}
        </svg>

        {/* Day labels */}
        <div className="flex justify-between px-2 pt-2 border-t border-zinc-100 text-[11px] font-mono text-zinc-500">
          {chartData.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`hover:text-black transition-colors ${
                activeIdx === i ? 'text-black font-bold' : ''
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {!hasActivity && (
        <div className="mt-3 py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
          <span>Telemetry active. Execute a confidential transfer or shield funds to populate live settlement curves.</span>
        </div>
      )}
    </div>
  );
}
