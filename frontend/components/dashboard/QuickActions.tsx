'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Send, ArrowDownLeft, QrCode, ShieldPlus, ArrowUpRight } from 'lucide-react';

export interface QuickActionsProps {
  onOpenDeposit: () => void;
}

export function QuickActions({ onOpenDeposit }: QuickActionsProps) {
  const actions = [
    {
      label: 'Send Confidential',
      desc: 'Zero-knowledge transfer',
      href: '/send',
      icon: Send,
      highlight: true,
    },
    {
      label: 'Receive Payment',
      desc: 'Shielded QR & stealth addr',
      href: '/receive',
      icon: ArrowDownLeft,
      highlight: false,
    },
    {
      label: 'Request Payment',
      desc: 'Confidential invoice link',
      href: '/request',
      icon: QrCode,
      highlight: false,
    },
    {
      label: 'Shield Funds',
      desc: 'Deposit L1 into private note',
      onClick: onOpenDeposit,
      icon: ShieldPlus,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((act) => {
        const Icon = act.icon;
        const content = (
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            className={`p-3.5 rounded-xl border transition-colors group flex items-start justify-between cursor-pointer shadow-sm relative ${
              act.highlight
                ? 'bg-[#FFD400]/15 border-[#FFD400] hover:border-black'
                : 'bg-white border-zinc-200 hover:border-black'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  act.highlight
                    ? 'bg-[#FFD400] text-black border border-black/15 shadow-sm'
                    : 'bg-zinc-100 text-zinc-900 group-hover:bg-[#FFD400] group-hover:text-black border border-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-black transition-colors">
                  {act.label}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{act.desc}</p>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black transition-colors shrink-0" />
          </motion.div>
        );

        if (act.href) {
          return (
            <Link key={act.label} href={act.href} className="block">
              {content}
            </Link>
          );
        }

        return (
          <button key={act.label} onClick={act.onClick} className="text-left w-full block">
            {content}
          </button>
        );
      })}
    </div>
  );
}
