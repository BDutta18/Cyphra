"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Copy, Check, Code2, ArrowRight } from "lucide-react";
import { CYPHRA_CONTENT } from "@/lib/cyphra-content";

const circuits = [
  { name: "deposit", desc: "Shield public NIGHT tokens into private UTXO note" },
  { name: "confidentialTransfer", desc: "Atomic transfer with zero balance or address leaks" },
  { name: "registerPaymentRequest", desc: "Anchor cryptographic invoice commitment on-chain" },
  { name: "fulfillPaymentRequest", desc: "Settle invoice atomically with proof verification" },
  { name: "grantAuditorAccess", desc: "Scoped viewing keys for compliance without spend rights" },
];

export function DocsSection() {
  const [copied, setCopied] = useState(false);

  const sdkCode = `import { CyphraClient } from '@cyphra/sdk';

// 1. Initialize client on Midnight Preprod
const cyphra = new CyphraClient({
  network: 'preprod',
  contractAddress: '${CYPHRA_CONTENT.contract.address}'
});

// 2. Synthesize client witness & execute transfer
const receipt = await cyphra.confidentialTransfer({
  recipient: 'mn_addr_preprod17hhujr34dkhlv2qpzdzddvxzuwr8qt4g4wy9jle7v37jedey6glsgp3k35',
  amount: 250n
});
console.log('Settled on Midnight! TxHash:', receipt.txHash);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="docs" className="py-20 lg:py-28 bg-[#FAFAFA] border-t border-black/[0.06] font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-3">
              <span className="w-8 h-px bg-[#FFD400]" />
              Developers
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-black tracking-tight leading-tight">
              TypeScript SDK & <br />
              <span className="text-zinc-500">Compact 0.31.1 Circuits.</span>
            </h2>
          </div>

          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-6 h-11 rounded-full border border-black/15 bg-white text-xs font-semibold uppercase tracking-wider text-black hover:border-black transition-colors shrink-0"
          >
            <BookOpen size={14} className="text-amber-600" />
            <span>Full Documentation ↗</span>
          </Link>
        </div>

        {/* 2-Column Minimal Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 cols: SDK Code Terminal */}
          <div className="lg:col-span-7 rounded-3xl bg-zinc-950 text-zinc-100 p-6 font-mono text-xs border border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#FFD400]" />
                <span>quickstart.ts</span>
              </span>
              <button
                onClick={handleCopy}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto leading-relaxed text-zinc-200">
              <code>{sdkCode}</code>
            </pre>
          </div>

          {/* Right 5 cols: Compact Circuits List */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
              Preprod Compact Circuits
            </span>
            {circuits.map((c) => (
              <div
                key={c.name}
                className="p-4 rounded-2xl border border-black/[0.06] bg-white hover:border-[#FFD400] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <code className="text-xs font-mono font-bold text-black">{c.name}()</code>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]" />
                </div>
                <p className="text-xs text-zinc-600 font-sans">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
