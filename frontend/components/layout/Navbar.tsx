'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { CyphraLogo } from '../ui/CyphraLogo';
import { WalletConnectButton } from '../wallet/WalletConnectButton';
import { NetworkBadge } from '../wallet/NetworkBadge';
import {
  LayoutDashboard,
  Send,
  ArrowDownLeft,
  QrCode,
  History,
  Settings,
  BookOpen,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';

export function Navbar() {
  const pathname = usePathname();
  const { isSyncing, syncProgress } = useMidnightWallet();
  const [blockHeight, setBlockHeight] = useState(248192);

  // Live simulated Midnight block ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Send', href: '/send', icon: Send },
    { label: 'Receive', href: '/receive', icon: ArrowDownLeft },
    { label: 'Request', href: '/request', icon: QrCode },
    { label: 'Activity', href: '/activity', icon: History },
    { label: 'Docs', href: '/docs', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      {/* Top subtle golden brand hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#FFD400] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-7">
          <CyphraLogo variant="full" size="md" href="/" />

          {/* Desktop Navigation Links with Framer Motion sliding pill */}
          <nav className="hidden md:flex items-center gap-1 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                    isActive
                      ? 'text-black'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100/70'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 bg-[#FFD400] rounded-lg border border-black/10 shadow-xs -z-0"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Live Midnight Network Sync Info */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-mono text-zinc-600 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-zinc-700">Block #{blockHeight.toLocaleString()}</span>
          </div>

          {isSyncing && (
            <div
              title="1AM Wallet is synchronizing blocks with Midnight Preprod. Cyphra will reconnect automatically when done."
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-[11px] font-mono text-amber-900 shadow-xs animate-pulse"
            >
              <RotateCw className="w-3 h-3 animate-spin text-amber-700" />
              <span className="hidden sm:inline font-bold">
                Syncing{syncProgress > 0 ? ` ${syncProgress}%` : '…'}
              </span>
            </div>
          )}

          <NetworkBadge />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
