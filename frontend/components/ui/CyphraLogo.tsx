'use client';

import React from 'react';
import Link from 'next/link';

export interface CyphraLogoProps {
  variant?: 'mark' | 'full' | 'compact' | 'badge' | 'wordmark';
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
  const uid = React.useId().replace(/:/g, '');

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
          id={`gold-${uid}`}
          x1="18" y1="12" x2="108" y2="76"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="30%" stopColor="#FFD400" />
          <stop offset="80%" stopColor="#E6A800" />
          <stop offset="100%" stopColor="#B37D00" />
        </linearGradient>

        {/* Lower Platinum-Silver Ribbon Gradient */}
        <linearGradient
          id={`silver-${uid}`}
          x1="10" y1="68" x2="108" y2="108"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#F0F0F2" />
          <stop offset="70%" stopColor="#D1D1D6" />
          <stop offset="100%" stopColor="#8E8E99" />
        </linearGradient>

        {/* Inner Fold Depth Shadow */}
        <linearGradient
          id={`fold-${uid}`}
          x1="18" y1="38" x2="52" y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#09090B" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#18181B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#27272A" stopOpacity="0" />
        </linearGradient>

        {/* Central ZK Star Core Glow */}
        <radialGradient
          id={`glow-${uid}`}
          cx="60" cy="58" r="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFE866" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FFD400" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFD400" stopOpacity="0" />
        </radialGradient>

        {/* Ambient + drop shadow filter */}
        <filter id={`shadow-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#FFD400" floodOpacity="0.07" />
          <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000000" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter={`url(#shadow-${uid})`}>
        {/* Core obsidian cavity — the interior void of the C */}
        <circle cx="60" cy="58" r="31" fill="#09090B" />

        {/* Lower platinum-silver ribbon loop (bottom curl of the C) */}
        <path
          d="M 27 63 C 24 80, 37 100, 62 106 C 84 110, 104 97, 109 82
             C 104 85, 89 89, 76 87 C 53 83, 41 70, 37 55 Z"
          fill={`url(#silver-${uid})`}
        />

        {/* Upper cyber-gold ribbon sweep (top arc of the C) */}
        <path
          d="M 105 35 C 97 14, 76 6, 53 8 C 27 11, 11 35, 13 63
             C 15 80, 27 94, 37 100 C 28 85, 27 68, 31 52
             C 37 33, 52 22, 70 22 C 87 22, 99 31, 105 35 Z"
          fill={`url(#gold-${uid})`}
        />

        {/* 3D fold overlap shadow for ribbon depth */}
        <path
          d="M 13 63 C 15 74, 21 84, 30 92 C 25 81, 25 67, 29 57
             C 23 57, 17 59, 13 63 Z"
          fill={`url(#fold-${uid})`}
        />

        {/* Ambient core glow aura around the ZK star */}
        <circle cx="60" cy="58" r="19" fill={`url(#glow-${uid})`} />

        {/* Central 4-pointed zero-knowledge star */}
        <path
          d="M 60 39 Q 61 49 60 58 Q 70 57 80 58
             Q 70 59 60 58 Q 61 67 60 77
             Q 59 67 60 58 Q 50 59 40 58
             Q 50 57 60 58 Q 59 49 60 39 Z"
          fill="#FFD400"
        />

        {/* Hot-white centre spark */}
        <circle cx="60" cy="58" r="2.5" fill="#FFFFFF" />
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
    xs: { markSize: 20, fontSize: 'text-xs',   subSize: 'text-[8px]',  gap: 'gap-1.5' },
    sm: { markSize: 26, fontSize: 'text-sm',   subSize: 'text-[9px]',  gap: 'gap-2'   },
    md: { markSize: 34, fontSize: 'text-base', subSize: 'text-[10px]', gap: 'gap-2.5' },
    lg: { markSize: 42, fontSize: 'text-xl',   subSize: 'text-xs',     gap: 'gap-3'   },
    xl: { markSize: 56, fontSize: 'text-2xl',  subSize: 'text-xs',     gap: 'gap-3.5' },
  };

  const { markSize, fontSize, subSize, gap } = sizeMap[size];

  // Theme-aware text colours
  const textPrimary =
    theme === 'dark' ? 'text-white' : theme === 'light' ? 'text-zinc-950' : 'text-zinc-950';
  const textMuted =
    theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500';

  const content = (
    <div className={`inline-flex items-center ${gap} ${className} group cursor-pointer select-none`}>
      {/* Brand Icon Mark — scales subtly on hover */}
      <div className="transition-transform duration-200 ease-out group-hover:scale-[1.06] active:scale-95">
        <CyphraLogoMark size={markSize} />
      </div>

      {/* Typography Lockup */}
      {variant !== 'mark' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider font-sans ${fontSize} ${textPrimary}`}
              style={{ letterSpacing: '0.08em' }}
            >
              CYPHRA
            </span>

            {/* ZK live pill — only on full + badge variants */}
            {showBadge && (variant === 'full' || variant === 'badge') && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200 group-hover:border-[#FFD400]/70 group-hover:bg-[#FFD400]/10 transition-all duration-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ZK
              </span>
            )}
          </div>

          {/* Subtitle — shown on full + compact */}
          {(variant === 'full' || variant === 'compact') && (
            <span
              className={`font-mono font-semibold tracking-widest mt-0.5 uppercase ${subSize} ${textMuted}`}
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
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
