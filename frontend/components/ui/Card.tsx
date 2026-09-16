'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'children'> {
  variant?: 'default' | 'accent' | 'subtle' | 'gold' | 'interactive';
  interactive?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-zinc-200 shadow-sm',
      accent: 'bg-white border-2 border-[#FFD400] shadow-sm',
      gold: 'bg-white border border-[#FFD400] shadow-sm',
      subtle: 'bg-[#FAFAFA] border border-zinc-200/80',
      interactive:
        'bg-white border border-zinc-200 hover:border-black hover:shadow-md cursor-pointer transition-colors',
    };

    const isInteractive = interactive || variant === 'interactive';

    return (
      <motion.div
        ref={ref}
        whileHover={isInteractive ? { y: -2, transition: { duration: 0.2 } } : undefined}
        whileTap={isInteractive ? { scale: 0.99 } : undefined}
        className={twMerge(
          clsx(
            'rounded-xl p-6 text-zinc-900 transition-colors',
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
