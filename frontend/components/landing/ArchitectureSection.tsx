"use client";

import { useEffect, useState, useRef } from "react";
import { CYPHRA_CONTENT } from "@/lib/cyphra-content";
import { ExternalLink, ShieldCheck, Cpu } from "lucide-react";

const architectureNodes = [
  { name: "Client WASM Prover Engine", role: "Browser Witness & SNARK Generator", latency: "~840ms", status: "Active" },
  { name: "Compact 0.31.1 ZKIR Compiler", role: "Constraint Satisfaction Verifier", latency: "<15ms", status: "Operational" },
  { name: "1AM DApp Connector v4", role: "Secure Key Vault & Signer", latency: "<20ms", status: "Connected" },
  { name: "Midnight Preprod Consensus", role: "Confidential UTXO State Ledger", latency: "~12s", status: "Operational" },
  { name: "Encrypted Invoice Channel", role: "ECDH Curve25519 Metadata Store", latency: "<45ms", status: "Synced" },
  { name: "Selective Viewing Key Engine", role: "Time-Bounded Audit Disclosures", latency: "<10ms", status: "Operational" },
];

const architectureStages = [
  {
    stage: "01",
    subtitle: "Client-Side Witness",
    title: "Off-Chain Witness Synthesis",
    description:
      "Users synthesize spending keys and Poseidon note salts locally in browser memory with zero network telemetry or server leakage.",
    features: ["Local Browser Memory", "Zero Network Egress", "ECDH Curve25519"],
  },
  {
    stage: "02",
    subtitle: "Compact 0.31.1",
    title: "Succinct Groth16 Circuit Prover",
    description:
      "Generates cryptographic zk-SNARK proofs verifying that transferred sums equal input sums without exposing the transfer amounts.",
    features: ["Poseidon Hash Trees", "Value Conservation", "Nullifier Proof"],
  },
  {
    stage: "03",
    subtitle: "Ledger Consensus",
    title: "Midnight Preprod Nullification",
    description:
      "Publishes the 32-byte nullifier on Midnight to prevent double-spending and registers new note commitments for the recipient.",
    features: ["Double-Spend Guard", "Dual-Ledger Privacy", "Block Inclusion"],
  },
  {
    stage: "04",
    subtitle: "Programmable Audit",
    title: "Selective Compliance Disclosures",
    description:
      "Cryptographically bounds viewing scopes for tax authorities or financial auditors without surrendering private spend permissions.",
    features: ["Auditor Scopes", "Time-Bounded Decryption", "Spend-Exempt"],
  },
];

export function ArchitectureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeNode, setActiveNode] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { contract } = CYPHRA_CONTENT;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % architectureNodes.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="architecture" ref={sectionRef} className="py-20 lg:py-28 overflow-hidden bg-white border-t border-zinc-200/60">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Architecture Stages */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-amber-600 mb-3 font-semibold">
              <span className="w-8 h-px bg-[#FFD400]" />
              System Architecture
            </span>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4 text-zinc-950 font-heading">
              Zero-knowledge
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-zinc-800 to-amber-600">
                by mathematical design.
              </span>
            </h2>
            <p className="text-sm lg:text-base text-zinc-600 leading-relaxed mb-8 max-w-lg font-sans">
              Transactors synthesize private witnesses in browser memory. Proofs compile client-side in under a second. Midnight Preprod verifies mathematical compliance without revealing parameters.
            </p>

            {/* Stages Stack */}
            <div className="space-y-3 mb-8">
              {architectureStages.map((stage) => (
                <div
                  key={stage.stage}
                  className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-zinc-50 transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      STAGE {stage.stage}
                    </span>
                    <span className="font-mono text-xs text-amber-700 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {stage.subtitle}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg text-zinc-950 font-bold mb-1.5 font-heading">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans mb-2.5">
                    {stage.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stage.features.map((feat) => (
                      <span
                        key={feat}
                        className="text-[11px] font-mono text-zinc-700 bg-white px-2.5 py-0.5 rounded-lg border border-zinc-200/80 font-medium"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-200/80">
              <div>
                <div className="text-2xl lg:text-3xl font-mono text-zinc-950 font-bold">&lt;840ms</div>
                <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">ZK Proof Time</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-mono text-zinc-950 font-bold">100%</div>
                <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Client-side Proving</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-mono text-amber-600 font-bold">$0.00</div>
                <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Balance Leakage</div>
              </div>
            </div>
          </div>

          {/* Right: Real-Time Protocol Nodes Board in Crisp White/Transparent Glass (User Constraint: White, Yellow, Black font) */}
          <div
            className={`lg:sticky lg:top-28 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-zinc-200/90 rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl text-zinc-950 shadow-sm">
              <div className="px-6 py-4 border-b border-zinc-200/80 flex items-center justify-between bg-zinc-50/80">
                <span className="text-xs font-mono text-zinc-700 uppercase tracking-wider font-bold flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  Protocol Subsystems
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  All 6 Operational
                </span>
              </div>

              <div className="divide-y divide-zinc-100">
                {architectureNodes.map((node, index) => (
                  <div
                    key={node.name}
                    className={`px-6 py-4 flex items-center justify-between transition-colors duration-200 ${
                      activeNode === index ? "bg-amber-50/60" : "hover:bg-zinc-50/60"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                        {node.name}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">{node.role}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs font-semibold text-zinc-700 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                        {node.latency}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-zinc-50/80 border-t border-zinc-200/80 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Deployed Compact Contract</span>
                <a
                  href={`https://preprod.midnightexplorer.com/contracts/${contract.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 truncate max-w-[220px]"
                >
                  {contract.address.slice(0, 10)}...{contract.address.slice(-6)} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
