"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Copy, Check, Terminal, Shield, Layers, FileCode, ArrowRight } from "lucide-react";
import { CYPHRA_CONTENT } from "@/lib/cyphra-content";

interface DocTopic {
  id: string;
  label: string;
  icon: typeof Terminal;
  title: string;
  description: string;
}

const DOCS_TOPICS: DocTopic[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Terminal,
    title: "Client-Side SDK & Quickstart",
    description: "Install the Cyphra TypeScript SDK to synthesize off-chain zk-SNARK witnesses and submit confidential settlements directly to Midnight Preprod.",
  },
  {
    id: "zk-circuits",
    label: "Compact Circuits",
    icon: FileCode,
    title: "Compact 0.31.1 ZKIR Circuits",
    description: "Formalized zero-knowledge state transitions compiling to succinct Groth16 verification keys on the Midnight consensus layer.",
  },
  {
    id: "math-invariants",
    label: "Invariants & Math",
    icon: Layers,
    title: "Cryptographic Formulations",
    description: "Mathematical constraints enforced inside client-side zero-knowledge circuits guaranteeing value conservation and nullifier uniqueness.",
  },
  {
    id: "security",
    label: "Compliance & Audit",
    icon: Shield,
    title: "Programmable Viewing Keys",
    description: "Cryptographically bounded disclosures for institutional auditability and tax compliance without surrendering private spend permissions.",
  },
];

export function DocsSection() {
  const [activeTab, setActiveTab] = useState("getting-started");
  const [copied, setCopied] = useState(false);

  const sdkSnippet = `import { CyphraClient } from '@cyphra/sdk';

// 1. Initialize client bound to Midnight Preprod
const cyphra = new CyphraClient({
  network: 'preprod',
  contractAddress: '${CYPHRA_CONTENT.contract.address}'
});

// 2. Synthesize client-side ZK witness in browser memory
const witness = await cyphra.synthesizeWitness({
  amount: 250n,
  recipient: 'mn_addr_preprod17hhujr34dkhlv2qpzdzddvxzuwr8qt4g4wy9jle7v37jedey6glsgp3k35',
  memo: 'Confidential B2B Settlement #0829'
});

// 3. Prove with Compact 0.31.1 Groth16 circuit & submit
const receipt = await cyphra.confidentialTransfer(witness);
console.log('Confirmed on Midnight consensus! TxHash:', receipt.txHash);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sdkSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="docs" className="py-20 lg:py-28 overflow-hidden bg-white border-t border-zinc-200/60">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-amber-600 mb-3 font-semibold">
              <span className="w-8 h-px bg-[#FFD400]" />
              Developer Documentation
            </span>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-zinc-950 font-heading leading-tight">
              Institutional Zero-Knowledge <br />
              <span className="text-zinc-500">Developer Infrastructure.</span>
            </h2>
          </div>

          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 hover:border-black hover:bg-zinc-50 transition-all shrink-0 self-start lg:self-auto"
          >
            <BookOpen size={14} className="text-amber-600" />
            <span>Full API Reference ↗</span>
          </Link>
        </div>

        {/* Tabbed Interactive Cockpit */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Tabs */}
          <div className="lg:col-span-4 space-y-2">
            {DOCS_TOPICS.map((topic) => {
              const Icon = topic.icon;
              const isActive = activeTab === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTab(topic.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-amber-50/80 border-amber-400 text-zinc-950 shadow-xs"
                      : "bg-zinc-50/70 border-zinc-200/80 text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-950"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isActive ? "bg-[#FFD400] text-black" : "bg-white border border-zinc-200 text-zinc-500"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">{topic.label}</div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">{topic.title}</div>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className={`transition-transform duration-200 ${
                      isActive ? "text-zinc-950 translate-x-1" : "text-zinc-400 opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Display Panel */}
          <div className="lg:col-span-8 bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
            {/* Tab 1: Getting Started */}
            {activeTab === "getting-started" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-950 font-heading">Protocol Quickstart</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                      Complete end-to-end confidential transfer using the Cyphra Client SDK.
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy SDK"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed">
                  <pre>{sdkSnippet}</pre>
                </div>
              </div>
            )}

            {/* Tab 2: Compact Circuits */}
            {activeTab === "zk-circuits" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-950 font-heading">Compact 0.31.1 ZKIR Circuits</h3>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                    All state mutations on Midnight Preprod are mathematically bound to these 5 circuits.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {CYPHRA_CONTENT.contract.circuits.map((c) => (
                    <div key={c.name} className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-xs font-mono font-bold text-amber-700">{c.name}()</code>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-600">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed font-sans">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Invariants & Math */}
            {activeTab === "math-invariants" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-950 font-heading">Cryptographic Formulations</h3>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                    Formalized mathematical guarantees enforced during client Groth16 witness generation.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70">
                    <div className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-700 mb-1">
                      1. Note Commitment Hash Formulation
                    </div>
                    <code className="text-xs font-mono text-zinc-900 block bg-white p-2.5 rounded-xl border border-zinc-200">
                      C = Poseidon(pk_shielded, amount, blinding_salt)
                    </code>
                    <p className="text-xs text-zinc-600 mt-2">
                      Value exists on the Midnight state tree without revealing owner public key or note amount.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70">
                    <div className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-700 mb-1">
                      2. Value Conservation & Zero Double-Spend
                    </div>
                    <code className="text-xs font-mono text-zinc-900 block bg-white p-2.5 rounded-xl border border-zinc-200">
                      amount_input = amount_transfer + amount_change &and; Nullifier &notin; NullifierSet
                    </code>
                    <p className="text-xs text-zinc-600 mt-2">
                      Ensures tokens cannot be inflated, duplicated, or spent multiple times across ledger forks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Security & Compliance */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-950 font-heading">Selective Audit Disclosure</h3>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                    Decoupling spend authority from viewing capability through Curve25519 ECDH encryption.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-900 mb-1">
                      <Shield size={14} className="text-amber-600" />
                      Cryptographically Scoped Viewing Keys
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      Organizations generate read-only decryptors restricted to specific date ranges or invoice IDs. Tax inspectors and financial auditors can prove full tax compliance while the enterprise preserves competitive secrecy.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70">
                    <div className="text-xs font-mono font-bold text-zinc-900 mb-1">
                      Zero Mempool MEV
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Because transactions are submitted as opaque nullifiers and fresh commitments, front-running bots and searchers cannot deduce trading intentions, volume, or target addresses.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
