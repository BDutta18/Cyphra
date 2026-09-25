'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Send,
  ArrowDownLeft,
  QrCode,
  History,
  Settings,
} from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const mobileNav = [
    { label: 'Treasury', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Send', href: '/send', icon: Send },
    { label: 'Receive', href: '/receive', icon: ArrowDownLeft },
    { label: 'Request', href: '/request', icon: QrCode },
    { label: 'Activity', href: '/activity', icon: History },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-zinc-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
        {children}
      </main>
      <Footer />

      {/* Mobile Bottom Navigation Bar with glassmorphism */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-zinc-200/90 px-2 py-2 flex justify-around shadow-lg">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-black font-extrabold bg-[#FFD400] shadow-xs'
                  : 'text-zinc-500 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
