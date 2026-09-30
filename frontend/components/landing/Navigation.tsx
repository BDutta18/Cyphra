'use client';

import React from 'react';
import Link from 'next/link';
import { CyphraLogo } from '../ui/CyphraLogo';
import { WalletConnectButton } from '../wallet/WalletConnectButton';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';

export interface NavigationProps {
  onEnterDashboard?: () => void;
}

export function Navigation({ onEnterDashboard }: NavigationProps) {
  return (
    <header className="w-full max-w-[1400px] mx-auto p-2 sm:p-4 fixed top-0 left-0 right-0 z-50">
      <nav className="bg-white/90 backdrop-blur-xl rounded-full p-[6px] pl-4 pr-2 flex items-center justify-between shadow-sm border border-zinc-200/80">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-10 sm:h-11 px-2.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-center shrink-0 group-hover:border-[#FFD400] transition-colors">
              <img
                src="/logo-transparent.png"
                alt="Cyphra Logo"
                className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-zinc-950 tracking-wider font-sans leading-none">
                  CYPHRA
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFD400] text-black uppercase tracking-wider border border-black/10">
                  Preprod
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium hidden sm:block">
                Confidential Settlement Layer
              </span>
            </div>
          </Link>
        </div>

        {/* Center Pill Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/80 shadow-2xs text-zinc-700">
          <a href="#how-it-works" className="px-3 py-1 rounded-full hover:text-black hover:bg-white transition-all">
            How It Works
          </a>
          <a href="#privacy-model" className="px-3 py-1 rounded-full hover:text-black hover:bg-white transition-all">
            Privacy Model
          </a>
          <a href="#circuits" className="px-3 py-1 rounded-full hover:text-black hover:bg-white transition-all">
            Compact Circuits
          </a>
          <a href="#feedback" className="px-3 py-1 rounded-full hover:text-black hover:bg-white transition-all">
            User Validation (79)
          </a>
        </div>

        {/* Right Action: Launch DApp / Connect Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold transition-all border border-zinc-200"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
          </Link>

          <WalletConnectButton />
        </div>
      </nav>
    </header>
  );
}
