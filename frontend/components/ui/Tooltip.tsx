'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  term?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, term, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || (
        <span className="inline-flex items-center gap-1 text-zinc-500 hover:text-black">
          {term && <span className="underline decoration-dotted decoration-zinc-400">{term}</span>}
          <HelpCircle className="w-3 h-3 text-zinc-400 hover:text-black transition-colors" />
        </span>
      )}

      {isVisible && (
        <span
          className={`absolute z-50 w-52 p-2 rounded-lg bg-black text-white text-[11px] font-sans font-normal leading-tight shadow-xl border border-zinc-700 pointer-events-none transition-opacity duration-150 ${posClasses[position]}`}
        >
          {content}
          <span className="block w-2 h-2 bg-black border-r border-b border-zinc-700 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </span>
      )}
    </span>
  );
}
