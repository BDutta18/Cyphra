"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useMidnightWallet } from "@/hooks/useMidnightWallet";
import { CYPHRA_CONTENT } from "@/lib/cyphra-content";

const navLinks = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "Architecture", href: "#architecture" },
  { name: "Privacy Model", href: "#privacy-model" },
  { name: "Docs", href: "#docs" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, account, openConnectModal } = useMidnightWallet();
  const address = account?.shieldedAddress || account?.unshieldedAddress;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 rounded-full ${
          isScrolled || isMobileMenuOpen
            ? "bg-white/90 backdrop-blur-xl border border-zinc-200/90 shadow-md max-w-[1280px]"
            : "bg-white/95 backdrop-blur-xl border border-zinc-200/80 shadow-xs max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center group py-2" aria-label="Cyphra Home">
            <div className="flex items-center gap-3">
              <div className="h-10 sm:h-11 px-2.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-center shrink-0 group-hover:border-[#FFD400] transition-colors">
                <img
                  src="/logo-transparent.png"
                  alt="Cyphra Logo"
                  className={`transition-all duration-500 object-contain ${
                    isScrolled ? "h-7" : "h-8"
                  }`}
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
                  Confidential Settlement Protocol
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links: How It Works, Architecture, Privacy Model, Docs */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-mono font-medium text-zinc-600 hover:text-zinc-950 transition-colors duration-200 relative group uppercase tracking-wider"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD400] transition-all duration-300 group-hover:w-full rounded-full" />
              </a>
            ))}
          </div>

          {/* Desktop Top Right: GitHub ↗ and Launch App */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://github.com/BDutta18/Cyphra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-zinc-100 uppercase tracking-wider"
            >
              GitHub
              <ArrowUpRight size={13} />
            </a>

            {isConnected ? (
              <Link
                href="/dashboard"
                className={`bg-zinc-950 hover:bg-zinc-800 text-white rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center gap-2 cursor-pointer ${
                  isScrolled ? "px-4 h-9" : "px-5 h-10"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Treasury"}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openConnectModal}
                  className={`bg-[#FFD400] hover:bg-[#E5BE00] text-black border border-black/15 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    isScrolled ? "px-4 h-9" : "px-5 h-10"
                  }`}
                >
                  <ShieldCheck size={14} className="text-zinc-900" />
                  <span>Connect Wallet</span>
                </button>
                <Link
                  href="/dashboard"
                  className={`bg-zinc-950 hover:bg-zinc-800 text-white rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    isScrolled ? "px-4 h-9" : "px-5 h-10"
                  }`}
                >
                  <span>Launch App</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/dashboard"
              className="bg-[#FFD400] text-black text-[11px] font-mono font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
            >
              Launch
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200/80 px-6 py-5 bg-white/95 backdrop-blur-xl rounded-b-3xl space-y-4">
            <div className="flex flex-col space-y-3 font-mono text-xs uppercase tracking-wider">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-zinc-600 hover:text-zinc-950 py-1 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="https://github.com/BDutta18/Cyphra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-zinc-950 py-1 flex items-center gap-1 transition-colors"
              >
                GitHub
                <ArrowUpRight size={13} />
              </a>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-zinc-950 text-white rounded-full py-2.5 text-center font-mono text-xs font-semibold uppercase tracking-wider"
              >
                Launch Cyphra App
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
