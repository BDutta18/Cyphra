'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Send,
  ArrowDownLeft,
  QrCode,
  History,
  Settings,
  BookOpen,
  Cpu,
  ShieldCheck,
  Blocks,
  Sparkles,
} from 'lucide-react';
import { CyphraLogoMark } from '../ui/CyphraLogo';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [blockHeight, setBlockHeight] = useState(248192);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Treasury', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Send Shielded', href: '/send', icon: Send, highlight: true },
    { label: 'Receive Shielded', href: '/receive', icon: ArrowDownLeft },
    { label: 'Request Invoice', href: '/request', icon: QrCode, highlight: true },
    { label: 'Activity & Audit', href: '/activity', icon: History },
    { label: 'ZK Docs', href: '/docs', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-zinc-900 selection:bg-[#FFD400] selection:text-black">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace: Sidebar + Content */}
      <div className="w-full max-w-[1440px] mx-auto flex-1 flex px-3 sm:px-6 lg:px-8 py-5 gap-6">
        {/* Desktop Sidebar (Cyphra Luxury Navigation Architecture) */}
        <aside className="w-64 bg-white/95 backdrop-blur-xl border border-zinc-200/80 rounded-3xl hidden lg:flex flex-col justify-between p-4 shrink-0 shadow-xs self-start sticky top-20">
          <div className="space-y-2">
            <div className="px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-600">
              Protocol Modules
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFD400]' : 'text-zinc-400'}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.highlight && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400] shadow-xs" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Info Card */}
          <div className="bg-gradient-to-br from-white to-amber-50/30 border border-zinc-200/80 rounded-2xl p-3.5 space-y-2 text-xs mt-6">
            <div className="flex items-center justify-between font-medium">
              <span className="text-zinc-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> ZK Engine
              </span>
              <span className="text-zinc-950 font-mono font-bold text-[10px] bg-white px-2 py-0.5 rounded-full border border-zinc-200 shadow-2xs">
                Compact 0.31.1
              </span>
            </div>

            <div className="text-[11px] text-zinc-500 space-y-1 pt-1.5 border-t border-zinc-100 font-mono">
              <div className="flex items-center justify-between">
                <span>Active Ledger:</span>
                <span className="font-semibold text-zinc-800 uppercase">Preprod</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span className="flex items-center gap-1 text-zinc-500 font-normal">
                  <Blocks className="w-3.5 h-3.5" /> Block:
                </span>
                <span>#{blockHeight.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Footer Ticker (Cyphra Status Ticker) */}
      <footer className="bg-white/95 backdrop-blur-md border-t border-zinc-200/80 py-2.5 px-4 sm:px-6 text-xs text-zinc-600 font-mono">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              <CyphraLogoMark size={16} />
              <span className="font-bold text-zinc-950">CYPHRA PROTOCOL</span>
            </div>
            <span className="text-zinc-300">•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              BLOCK #{blockHeight.toLocaleString()}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <span>NIGHT:</span>
              <span className="text-zinc-900 font-bold">Shielded UTXO</span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">ZK Proof</span>
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <span>DUST:</span>
              <span className="text-zinc-900 font-bold">Bandwidth</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">Ready</span>
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <span>Prover:</span>
              <span className="text-zinc-900 font-bold">Local WASM</span>
              <span className="text-[10px] text-zinc-700 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">~840ms</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-700 font-medium">Midnight Preprod Consensus Operational</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-zinc-200/90 px-1 pb-[env(safe-area-inset-bottom,0px)] flex justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center py-2 px-2.5 rounded-xl text-[10px] font-medium transition-all"
            >
              {/* Gold active pip above the icon */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    key="pip"
                    layoutId="mobile-nav-pip"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#FFD400]"
                  />
                )}
              </AnimatePresence>

              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-bg"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-[#FFD400]/20 border border-[#FFD400]/40"
                />
              )}

              <span className={`relative z-10 flex flex-col items-center gap-0.5 ${isActive ? 'text-black font-extrabold' : 'text-zinc-600 hover:text-black'}`}>
                <Icon className="w-4 h-4" />
                <span>{item.label.split(' ')[0]}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
