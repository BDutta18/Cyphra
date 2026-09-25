import React from 'react';
import Link from 'next/link';
import { CyphraLogo } from '../ui/CyphraLogo';
import { ExternalLink, ShieldCheck, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-white py-10 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <CyphraLogo variant="compact" size="sm" href="/" />
            <span className="hidden sm:inline text-xs text-zinc-300">|</span>
            <span className="text-xs text-zinc-600">
              Confidential payments on <span className="text-black font-bold">Midnight Network</span> with <span className="text-black font-bold">1AM Wallet</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-600">
            <a
              href="https://docs.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black flex items-center gap-1 transition-colors"
            >
              Midnight Docs <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/LFDT-Minokawa/compact"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black flex items-center gap-1 transition-colors"
            >
              Compact Circuits <ExternalLink className="w-3 h-3" />
            </a>
            <Link href="/docs" className="hover:text-black transition-colors font-medium">
              API Docs
            </Link>
            <Link href="/settings" className="hover:text-black transition-colors font-medium">
              Protocol Settings
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-medium px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">Midnight Preprod: Operational</span>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-zinc-700 font-semibold">
              <Cpu className="w-3 h-3 text-[#FFD400]" /> Compact v0.31.1 ZK-SNARK
            </span>
            <span>•</span>
            <a
              href="https://preprod.midnightexplorer.com/contracts/0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-700 hover:text-black hover:underline font-bold"
            >
              Contract: 0xcc4a29303...db3f
            </a>
            <span>•</span>
            <span>Ledger Consensus: Preprod</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>1AM DApp Connector v4.0.1 Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
