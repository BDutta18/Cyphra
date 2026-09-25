'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'children'> {
  variant?: 'default' | 'accent' | 'subtle' | 'gold' | 'interactive' | 'obsidian' | 'glass' | 'gradient-border';
  interactive?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        'bg-white border border-zinc-200/90 shadow-card text-zinc-900',
      accent:
        'bg-white border-2 border-[#FFD400] shadow-glow-gold/20 text-zinc-900',
      gold:
        'bg-white border border-[#FFD400] gold-glow-ring text-zinc-900',
      subtle:
        'bg-[#FAFAFA] border border-zinc-200/80 text-zinc-900',
      interactive:
        'bg-white border border-zinc-200/90 hover:border-zinc-400 hover:shadow-card-hover ' +
        'cursor-pointer transition-all duration-200 text-zinc-900',
      obsidian:
        'bg-[#09090B] border border-zinc-800 text-white shadow-fintech',
      glass:
        'glass-panel text-zinc-900 shadow-card',
      'gradient-border':
        'gradient-border-card shadow-card text-zinc-900',
    };

    const isInteractive = interactive || variant === 'interactive';

    return (
      <motion.div
        ref={ref}
        whileHover={isInteractive ? { y: -2, transition: { duration: 0.18 } } : undefined}
        whileTap={isInteractive ? { scale: 0.99 } : undefined}
        className={twMerge(
          clsx(
            'rounded-2xl p-6 transition-all duration-200',
            variants[variant],
            className
          )
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
