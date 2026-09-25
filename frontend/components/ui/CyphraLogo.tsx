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
  return (
    <img
      src="/logo-transparent.png"
      width={size}
      height={size}
      alt="Cyphra"
      className={`shrink-0 select-none object-contain ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="eager"
    />
  );
}

export function CyphraLogo({
  variant = 'full',
  size = 'md',
  className = '',
  href,
  theme = 'auto',
}: CyphraLogoProps) {
  const sizeMap = {
    xs: { markSize: 20, fontSize: 'text-xs',   gap: 'gap-1.5' },
    sm: { markSize: 26, fontSize: 'text-sm',   gap: 'gap-2'   },
    md: { markSize: 34, fontSize: 'text-lg',   gap: 'gap-2.5' },
    lg: { markSize: 42, fontSize: 'text-xl',   gap: 'gap-3'   },
    xl: { markSize: 56, fontSize: 'text-2xl',  gap: 'gap-3.5' },
  };

  const { markSize, fontSize, gap } = sizeMap[size];

  // Theme-aware text colours
  const textPrimary =
    theme === 'dark' ? 'text-white' : 'text-zinc-950';

  const content = (
    <div className={`inline-flex items-center ${gap} ${className} group cursor-pointer select-none`}>
      {/* Brand Icon Mark — scales subtly on hover */}
      <div className="transition-transform duration-200 ease-out group-hover:scale-[1.06] active:scale-95">
        <CyphraLogoMark size={markSize} />
      </div>

      {/* Typography Lockup — only the brand name */}
      {variant !== 'mark' && (
        <span
          className={`font-black tracking-wider font-sans leading-none ${fontSize} ${textPrimary}`}
          style={{ letterSpacing: '0.08em' }}
        >
          CYPHRA
        </span>
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
