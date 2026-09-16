import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-white py-8 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <Image src="/logo.png" alt="Cyphra" width={22} height={22} />
            </div>
            <span className="text-xs font-bold text-black font-mono">CYPHRA</span>
            <span className="text-xs text-zinc-300">/</span>
            <span className="text-xs text-zinc-600">
              Privacy-first payments powered by <span className="text-black font-semibold">Midnight</span> & <span className="text-black font-semibold">1AM Wallet</span>
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs text-zinc-600">
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
            <Link href="/settings" className="hover:text-black transition-colors">
              Protocol Settings
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700">
            <Shield className="w-3.5 h-3.5 text-black" />
            <span>Zero-Knowledge Protected</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>CYPHRA Confidential Payments. Production MVP.</span>
          <span>1AM Wallet DApp Connector v4.0.1</span>
        </div>
      </div>
    </footer>
  );
}
