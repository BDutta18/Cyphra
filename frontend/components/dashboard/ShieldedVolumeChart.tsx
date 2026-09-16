'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Activity } from 'lucide-react';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface DataPoint {
  day: string;
  volume: number;
  proofs: number;
}

const mockData: DataPoint[] = [
  { day: 'Mon', volume: 14200, proofs: 48 },
  { day: 'Tue', volume: 22800, proofs: 72 },
  { day: 'Wed', volume: 18450, proofs: 61 },
  { day: 'Thu', volume: 31200, proofs: 104 },
  { day: 'Fri', volume: 42900, proofs: 139 },
  { day: 'Sat', volume: 38700, proofs: 118 },
  { day: 'Sun', volume: 54120, proofs: 172 },
];

export function ShieldedVolumeChart() {
  const [activeIdx, setActiveIdx] = useState<number>(mockData.length - 1);
  const activeData = mockData[activeIdx];

  // SVG coordinate calculations
  const width = 500;
  const height = 140;
  const padding = 20;

  const maxVal = Math.max(...mockData.map((d) => d.volume));
  const minVal = Math.min(...mockData.map((d) => d.volume)) * 0.8;

  const points = mockData.map((d, i) => {
    const x = padding + (i / (mockData.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.volume - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-500">
            <Activity className="w-3.5 h-3.5 text-black" />
            Shielded Settlement Volume (7D)
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-black font-mono">
              <AnimatedCounter value={activeData.volume} prefix="$" decimals={0} />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              +{((activeData.volume / 12000) * 8).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono text-zinc-500 block">ZK Proofs Verified</span>
          <span className="text-base font-black text-black font-mono">
            {activeData.proofs} Proofs
          </span>
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
            transition={{ duration: 1.2, ease: 'easeOut' }}
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
          {mockData.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`hover:text-black transition-colors ${
                activeIdx === i ? 'text-black font-bold' : ''
              }`}
            >
              {d.day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
