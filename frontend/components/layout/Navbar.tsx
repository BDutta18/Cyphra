'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { WalletConnectButton } from '../wallet/WalletConnectButton';
import { NetworkBadge } from '../wallet/NetworkBadge';
import {
  LayoutDashboard,
  Send,
  ArrowDownLeft,
  QrCode,
  History,
  Settings,
  Activity,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
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
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95">
              <Image
                src="/logo.png"
                alt="Cyphra Logo"
                width={30}
                height={30}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-black font-mono">
                CYPHRA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Framer Motion sliding pill */}
          <nav className="hidden md:flex items-center gap-1 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none ${
                    isActive
                      ? 'text-black font-bold'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-[#FFD400] rounded-lg border border-black/15 shadow-sm -z-0"
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
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-[11px] font-mono text-zinc-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Block #{blockHeight.toLocaleString()}</span>
          </div>

          <NetworkBadge />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
