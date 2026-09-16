'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
      'relative inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD400]/50 disabled:opacity-40 disabled:cursor-not-allowed select-none transition-colors overflow-hidden';

    const variants = {
      primary:
        'bg-[#FFD400] text-black font-bold hover:bg-[#E5BE00] border border-black/15 shadow-sm active:shadow-inner',
      secondary:
        'bg-white text-zinc-950 hover:bg-zinc-100 hover:text-black border border-zinc-300 shadow-sm active:bg-zinc-200',
      outline:
        'bg-transparent border border-zinc-300 text-zinc-900 hover:border-black hover:bg-zinc-50 active:bg-zinc-100',
      ghost:
        'bg-transparent text-zinc-600 hover:text-black hover:bg-zinc-100 active:bg-zinc-200',
      danger:
        'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:bg-red-200',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-2.5 text-base gap-2.5',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        whileHover={disabled || isLoading ? undefined : { y: -1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {/* Subtle hover shine sweep for primary yellow button */}
        {variant === 'primary' && !disabled && !isLoading && (
          <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        )}

        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
