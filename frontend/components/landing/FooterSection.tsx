"use client";

import Link from "next/link";
import { Shield, ExternalLink, Github, Twitter } from "lucide-react";
import { CYPHRA_CONTENT } from "@/lib/cyphra-content";

export function FooterSection() {
  const { contract, brand } = CYPHRA_CONTENT;

  return (
    <footer className="relative border-t border-zinc-200/80 bg-white pt-16 pb-12 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-100">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xs">
                <Shield className="w-4 h-4 fill-amber-400/30 text-amber-600" />
              </div>
              <span className="font-heading font-extrabold text-lg text-zinc-950 tracking-tight">
                Cyphra
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-[10px] font-mono text-zinc-600 border border-zinc-200">
                Preprod
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              {brand.tagline}. Powered by Midnight Network&apos;s Compact 0.31.1 zero-knowledge proving stack.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://twitter.com/CyphraPayment"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/BDutta18/Cyphra"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Protocol Links */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900">
              Protocol
            </div>
            <ul className="space-y-2 text-xs font-medium text-zinc-600">
              <li>
                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#privacy-model" className="hover:text-zinc-950 transition-colors">
                  Privacy Model
                </a>
              </li>
              <li>
                <Link href="/docs" className="hover:text-zinc-950 transition-colors">
                  Compact 0.31.1 Specs
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">
                  Launch Sandbox App
                </Link>
              </li>
            </ul>
          </div>

          {/* Midnight Network Settlement */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900">
              Network Status
            </div>
            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-zinc-800 font-semibold">{contract.network}</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono break-all leading-tight">
                Contract: {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
              </p>
              <a
                href={`https://preprod.midnightexplorer.com/contracts/${contract.address}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 hover:text-amber-800 transition-colors"
              >
                Midnight Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>© {new Date().getFullYear()} Cyphra Protocol. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Client-side Groth16 zk-SNARKs</span>
            <span>•</span>
            <span className="text-zinc-800 font-semibold">1AM Wallet Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
