'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
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
} from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const mobileNav = [
    { label: 'Treasury', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Send',     href: '/send',      icon: Send             },
    { label: 'Receive',  href: '/receive',   icon: ArrowDownLeft    },
    { label: 'Request',  href: '/request',   icon: QrCode           },
    { label: 'Activity', href: '/activity',  icon: History          },
    { label: 'Settings', href: '/settings',  icon: Settings         },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-zinc-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
        {children}
      </main>

      <Footer />

      {/* ── Mobile Bottom Navigation Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-zinc-200/90 px-1 pb-[env(safe-area-inset-bottom,0px)] flex justify-around">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center py-2 px-3 rounded-xl text-[10px] font-medium transition-all"
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
                  className="absolute inset-0 rounded-xl bg-[#FFD400]/15 border border-[#FFD400]/30"
                />
              )}

              <span className={`relative z-10 flex flex-col items-center gap-0.5 ${isActive ? 'text-black font-extrabold' : 'text-zinc-500 hover:text-black'}`}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
