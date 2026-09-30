"use client";

import Link from "next/link";
import { ExternalLink, Github, Twitter } from "lucide-react";
import { CYPHRA_CONTENT } from "@/lib/cyphra-content";

export function FooterSection() {
  const { contract } = CYPHRA_CONTENT;

  return (
    <footer className="relative border-t border-black/[0.06] bg-white pt-16 pb-12 overflow-hidden font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-black/[0.05]">
          {/* Brand Info: ONLY Logo and Name Cyphra */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo-transparent.png"
                alt="Cyphra"
                className="w-7 h-7 object-contain"
              />
              <span className="font-heading font-extrabold text-xl text-black tracking-tight">
                Cyphra
              </span>
            </Link>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Zero-knowledge payment and settlement protocol on Midnight Network.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://twitter.com/CyphraPayment"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-zinc-600 hover:text-black hover:border-black transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/BDutta18/Cyphra"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-zinc-600 hover:text-black hover:border-black transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Protocol Links */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-black">
              Navigation
            </div>
            <ul className="space-y-2 text-xs font-medium text-zinc-600">
              <li>
                <a href="#features" className="hover:text-black transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-black transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-black transition-colors">
                  Privacy Model
                </a>
              </li>
              <li>
                <a href="#docs" className="hover:text-black transition-colors">
                  Developers & SDK
                </a>
              </li>
            </ul>
          </div>

          {/* Midnight Network Settlement */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-black">
              Consensus
            </div>
            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-black font-semibold">Midnight Preprod</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono break-all leading-tight">
                Contract: {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
              </p>
              <a
                href={`https://preprod.midnightexplorer.com/contracts/${contract.address}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-800 hover:text-black font-semibold underline decoration-[#FFD400] transition-colors"
              >
                Midnight Explorer ↗
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>© {new Date().getFullYear()} Cyphra Protocol. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <span>Groth16 zk-SNARKs</span>
            <span>•</span>
            <span className="text-black font-semibold">1AM Wallet Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
