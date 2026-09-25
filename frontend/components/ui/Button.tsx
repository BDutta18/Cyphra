'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'cyber' | 'gold';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'group relative inline-flex items-center justify-center font-medium rounded-xl ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]/60 ' +
      'disabled:opacity-40 disabled:cursor-not-allowed select-none transition-all duration-150 overflow-hidden';

    const variants = {
      primary:
        'bg-[#FFD400] text-black font-extrabold hover:bg-[#E5BE00] ' +
        'border border-black/15 shadow-fintech hover:shadow-card active:scale-[0.97]',
      secondary:
        'bg-white text-zinc-950 font-bold hover:bg-zinc-50 hover:text-black ' +
        'border border-zinc-200 shadow-fintech hover:border-zinc-300 active:scale-[0.97]',
      outline:
        'bg-transparent border border-zinc-200 text-zinc-800 font-semibold ' +
        'hover:border-black hover:bg-zinc-50/80 active:scale-[0.97]',
      ghost:
        'bg-transparent text-zinc-600 font-semibold hover:text-black hover:bg-zinc-100 active:scale-[0.97]',
      danger:
        'bg-red-50 text-red-700 font-semibold border border-red-200 hover:bg-red-100 active:scale-[0.97]',
      cyber:
        'bg-[#09090B] text-white font-bold border border-zinc-700/80 ' +
        'hover:border-[#FFD400] hover:text-[#FFD400] shadow-fintech hover:shadow-glow-gold active:scale-[0.97]',
      gold:
        'bg-[#FFD400] text-black font-extrabold border border-black/15 ' +
        'shadow-glow-gold hover:bg-[#E5BE00] hover:shadow-glow-gold-lg active:scale-[0.97]',
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-[11px] gap-1 rounded-lg',
      sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
      md: 'px-4 py-2 text-sm gap-2 rounded-xl',
      lg: 'px-6 py-2.5 text-base gap-2.5 rounded-xl',
    };

    const showShimmer = (variant === 'primary' || variant === 'gold') && !disabled && !isLoading;

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
        whileHover={disabled || isLoading ? undefined : { y: -1 }}
        transition={{ type: 'spring', stiffness: 480, damping: 30 }}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {/* Shimmer sweep on primary/gold buttons — CSS-driven, works on hover */}
        {showShimmer && <span className="shimmer-sweep" aria-hidden="true" />}

        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
