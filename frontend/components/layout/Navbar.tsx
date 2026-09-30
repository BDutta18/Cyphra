'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Menu,
  X,
} from 'lucide-react';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';

export function Navbar() {
  const pathname = usePathname();
  const { isSyncing, syncProgress } = useMidnightWallet();
  const [blockHeight, setBlockHeight] = useState(248192);
  const [blockFlash, setBlockFlash] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Live Midnight block ticker — increments every ~12 s with a flash indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
      setBlockFlash(true);
      setTimeout(() => setBlockFlash(false), 600);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Send',      href: '/send',      icon: Send             },
    { label: 'Receive',   href: '/receive',   icon: ArrowDownLeft    },
    { label: 'Request',   href: '/request',   icon: QrCode           },
    { label: 'Activity',  href: '/activity',  icon: History          },
    { label: 'Docs',      href: '/docs',      icon: BookOpen         },
    { label: 'Settings',  href: '/settings',  icon: Settings         },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/92 backdrop-blur-md">
      {/* Cyber-gold hairline — brand identity stripe */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#FFD400] to-transparent opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ── Brand Lockup + Desktop Nav ── */}
        <div className="flex items-center gap-7">
          {/* Logo with DApp name displayed on all screens */}
          <div className="hidden sm:block">
            <CyphraLogo variant="full" size="md" href="/" />
          </div>
          <div className="sm:hidden">
            <CyphraLogo variant="full" size="sm" href="/" />
          </div>

          {/* Desktop Center: Clean Breadcrumb / Active Module Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/80 shadow-2xs font-mono">
            <span className="text-zinc-400">/</span>
            <span className="text-zinc-950 font-bold capitalize">
              {navItems.find((n) => n.href === pathname)?.label || 'Treasury'}
            </span>
          </div>

          {/* Medium Screen Navigation Links (when sidebar is hidden on md) */}
          <nav className="hidden md:flex lg:hidden items-center gap-0.5 relative" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors select-none ${
                    isActive
                      ? 'text-black'
                      : 'text-zinc-500 hover:text-black hover:bg-zinc-100/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      transition={{ type: 'spring', stiffness: 440, damping: 34 }}
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

        {/* ── Right Controls ── */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Live Block Height Ticker */}
          <div
            className={`hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-mono text-zinc-600 shadow-xs transition-all duration-300 ${
              blockFlash ? 'border-[#FFD400]/60 bg-[#FFD400]/5' : ''
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className={`font-semibold tabular-nums transition-colors duration-300 ${blockFlash ? 'text-black' : 'text-zinc-700'}`}>
              Block #{blockHeight.toLocaleString()}
            </span>
          </div>

          {/* Wallet Sync Indicator */}
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

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl text-zinc-700 hover:text-black hover:bg-zinc-100 border border-zinc-200/90 active:scale-95 transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-black" />
            ) : (
              <Menu className="w-5 h-5 text-zinc-800" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-b border-zinc-200 bg-white/98 backdrop-blur-xl shadow-lg"
          >
            <div className="px-4 py-3 space-y-3">
              <nav className="grid grid-cols-1 gap-1" aria-label="Mobile navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all select-none ${
                        isActive
                          ? 'bg-[#FFD400] text-black font-bold shadow-xs'
                          : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Status and Network Info Bar for Mobile */}
              <div className="pt-2.5 border-t border-zinc-200/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Block #{blockHeight.toLocaleString()}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FFD400]/20 border border-[#FFD400]/60 text-zinc-900 font-bold text-[10px] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Preprod Live</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
