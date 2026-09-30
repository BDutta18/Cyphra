"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight, ArrowRight } from "lucide-react";
import { useMidnightWallet } from "@/hooks/useMidnightWallet";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Privacy", href: "#privacy" },
  { name: "Docs", href: "#docs" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, account } = useMidnightWallet();
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
            ? "bg-white/70 backdrop-blur-2xl border border-black/[0.08] shadow-md max-w-[1240px]"
            : "bg-white/60 backdrop-blur-xl border border-black/[0.05] shadow-xs max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Top Left: ONLY Logo and Name Cyphra (Nothing Else) */}
          <Link href="/" className="flex items-center gap-2.5 group select-none" aria-label="Cyphra">
            <img
              src="/logo-transparent.png"
              alt="Cyphra"
              className={`transition-all duration-300 object-contain ${
                isScrolled ? "w-7 h-7" : "w-8 h-8"
              }`}
            />
            <span
              className={`font-heading font-extrabold tracking-tight text-black transition-all duration-300 ${
                isScrolled ? "text-xl" : "text-2xl"
              }`}
            >
              Cyphra
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-zinc-600 hover:text-black transition-colors duration-200 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD400] transition-all duration-300 group-hover:w-full rounded-full" />
              </a>
            ))}
          </div>

          {/* Desktop Top Right: GitHub ↗ and Launch App */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com/BDutta18/Cyphra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-600 hover:text-black flex items-center gap-1 transition-colors"
            >
              GitHub
              <ArrowUpRight size={14} />
            </a>

            <Link
              href="/dashboard"
              className={`bg-black hover:bg-zinc-800 text-white rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 ${
                isScrolled ? "px-5 h-9 text-xs" : "px-6 h-10 text-sm"
              }`}
            >
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Dashboard"}</span>
                </>
              ) : (
                <>
                  <span>Launch App</span>
                  <ArrowRight size={14} className="text-[#FFD400]" />
                </>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/dashboard"
              className="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-full"
            >
              Launch
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-black rounded-full transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-black/[0.06] px-6 py-5 bg-white/95 backdrop-blur-2xl rounded-b-3xl space-y-4">
            <div className="flex flex-col space-y-3 text-sm font-medium">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-zinc-600 hover:text-black py-1 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="https://github.com/BDutta18/Cyphra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-black py-1 flex items-center gap-1 transition-colors"
              >
                GitHub
                <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="pt-3 border-t border-zinc-100">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-black text-white rounded-full py-2.5 text-center text-sm font-medium block"
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
