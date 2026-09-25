'use client';

import React from 'react';
import Link from 'next/link';

export interface CyphraLogoProps {
  variant?: 'mark' | 'full' | 'compact' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  href?: string;
  theme?: 'dark' | 'light' | 'auto';
  showBadge?: boolean;
}

export function CyphraLogoMark({
  size = 32,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Cyphra Brand Mark"
    >
      <defs>
        {/* Upper Gold Ribbon Gradient */}
        <linearGradient
          id={`goldRibbon-${uniqueId}`}
          x1="18"
          y1="12"
          x2="108"
          y2="76"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="35%" stopColor="#FFD400" />
          <stop offset="85%" stopColor="#E6A800" />
          <stop offset="100%" stopColor="#B37D00" />
        </linearGradient>

        {/* Lower Platinum-Silver Ribbon Gradient */}
        <linearGradient
          id={`silverRibbon-${uniqueId}`}
          x1="10"
          y1="70"
          x2="105"
          y2="105"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F4F4F5" />
          <stop offset="75%" stopColor="#D4D4D8" />
          <stop offset="100%" stopColor="#71717A" />
        </linearGradient>

        {/* Inner Fold Shadow for 3D depth */}
        <linearGradient
          id={`foldShadow-${uniqueId}`}
          x1="22"
          y1="40"
          x2="55"
          y2="70"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#09090B" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#18181B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#27272A" stopOpacity="0" />
        </linearGradient>

        {/* Central ZK Spark Core Glow */}
        <radialGradient
          id={`coreGlow-${uniqueId}`}
          cx="60"
          cy="58"
          r="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFE033" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#FFD400" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFD400" stopOpacity="0" />
        </radialGradient>

        {/* Soft Ambient Shadow */}
        <filter id={`ambientGlow-${uniqueId}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Main Vector Geometry of Cyphra Ribbon C */}
      <g filter={`url(#ambientGlow-${uniqueId})`}>
        {/* Core Midnight Cavity Disc */}
        <circle cx="60" cy="58" r="30" fill="#09090B" />

        {/* Lower Platinum Ribbon Loop */}
        <path
          d="M 28 62 C 26 78, 38 98, 62 104 C 82 108, 102 96, 108 82 C 103 84, 88 88, 76 86 C 54 82, 42 70, 38 56 Z"
          fill={`url(#silverRibbon-${uniqueId})`}
        />

        {/* Upper Cyber Gold Ribbon Sweep */}
        <path
          d="M 104 36 C 96 16, 76 8, 54 10 C 28 12, 12 36, 14 62 C 16 78, 28 92, 38 98 C 30 84, 28 68, 32 52 C 38 34, 52 24, 70 24 C 86 24, 98 32, 104 36 Z"
          fill={`url(#goldRibbon-${uniqueId})`}
        />

        {/* 3D Depth Overlap Fold */}
        <path
          d="M 14 62 C 16 72, 22 82, 30 90 C 26 80, 26 68, 30 58 C 24 58, 18 60, 14 62 Z"
          fill={`url(#foldShadow-${uniqueId})`}
        />

        {/* Central Core Glow Aura */}
        <circle cx="60" cy="58" r="18" fill={`url(#coreGlow-${uniqueId})`} />

        {/* Central Zero-Knowledge 4-Pointed Star / Flare */}
        <path
          d="M 60 41 Q 60 58 43 58 Q 60 58 60 75 Q 60 58 77 58 Q 60 58 60 41 Z"
          fill="#FFD400"
        />
        {/* Inner Hot Center of the Spark */}
        <circle cx="60" cy="58" r="2.2" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function CyphraLogo({
  variant = 'full',
  size = 'md',
  className = '',
  href,
  theme = 'auto',
  showBadge = true,
}: CyphraLogoProps) {
  const sizeMap = {
    xs: { markSize: 20, fontSize: 'text-xs', subSize: 'text-[8px]', gap: 'gap-1.5' },
    sm: { markSize: 26, fontSize: 'text-sm', subSize: 'text-[9px]', gap: 'gap-2' },
    md: { markSize: 34, fontSize: 'text-base', subSize: 'text-[10px]', gap: 'gap-2.5' },
    lg: { markSize: 42, fontSize: 'text-xl', subSize: 'text-xs', gap: 'gap-3' },
    xl: { markSize: 56, fontSize: 'text-2xl', subSize: 'text-xs', gap: 'gap-3.5' },
  };

  const { markSize, fontSize, subSize, gap } = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center ${gap} ${className} group cursor-pointer select-none`}>
      {/* Brand Icon Mark */}
      <div className="transition-transform duration-200 group-hover:scale-105 active:scale-95">
        <CyphraLogoMark size={markSize} />
      </div>

      {/* Typography / Lockup */}
      {variant !== 'mark' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider text-black font-sans ${fontSize}`}
              style={{ letterSpacing: '0.08em' }}
            >
              CYPHRA
            </span>

            {showBadge && (variant === 'full' || variant === 'badge') && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200 group-hover:border-[#FFD400]/60 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ZK
              </span>
            )}
          </div>

          {(variant === 'full' || variant === 'compact') && (
            <span
              className={`font-mono font-semibold text-zinc-500 tracking-widest mt-0.5 uppercase ${subSize}`}
              style={{ letterSpacing: '0.12em' }}
            >
              Midnight Confidential
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
