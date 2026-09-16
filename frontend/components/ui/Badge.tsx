import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'yellow' | 'neutral' | 'green' | 'red' | 'gold' | 'emerald' | 'cyan' | 'slate';
  size?: 'sm' | 'md';
  pulseDot?: boolean;
}

export function Badge({
  className,
  variant = 'yellow',
  size = 'sm',
  pulseDot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    yellow: 'bg-[#FFD400] text-black border border-black/15 font-bold',
    gold: 'bg-[#FFD400] text-black border border-black/15 font-bold',
    neutral: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
    slate: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
    cyan: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
  };

  const dotColors = {
    yellow: 'bg-black',
    gold: 'bg-black',
    neutral: 'bg-zinc-500',
    slate: 'bg-zinc-500',
    cyan: 'bg-zinc-500',
    green: 'bg-emerald-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-md border font-mono select-none',
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {pulseDot && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={clsx(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColors[variant]
            )}
          />
          <span
            className={clsx('relative inline-flex rounded-full h-1.5 w-1.5', dotColors[variant])}
          />
        </span>
      )}
      {children}
    </span>
  );
}
