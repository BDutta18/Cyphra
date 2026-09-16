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
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Send', href: '/send', icon: Send },
    { label: 'Receive', href: '/receive', icon: ArrowDownLeft },
    { label: 'Request', href: '/request', icon: QrCode },
    { label: 'Activity', href: '/activity', icon: History },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-zinc-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-14 md:mb-0">
        {children}
      </main>
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 px-1 py-1.5 flex justify-around shadow-md">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-md text-[10px] transition-colors ${
                isActive ? 'text-black font-bold bg-brand-yellow/30' : 'text-zinc-500 hover:text-black'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
