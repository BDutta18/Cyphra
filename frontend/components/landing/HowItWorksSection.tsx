"use client";

import { useState } from "react";
import { ArrowRight, Clock, Code2, Check, Copy } from "lucide-react";

const steps = [
  {
    number: "01",
    badge: "Local WASM",
    title: "Synthesize Private Witness",
    description: "Generate spending keys, Poseidon blinding salts, and payment terms in local browser memory with zero network egress.",
    latency: "~45ms (Local Memory)",
    code: `// 1. Synthesize Off-Chain Witness
const witness = await cyphra.synthesizeWitness({
  amount: 250n,
  recipient: recipientShieldedPk,
  memo: "Private Settlement #0829"
});`,
  },
  {
    number: "02",
    badge: "Compact 0.31.1",
    title: "Compile Succinct Groth16 Proof",
    description: "The Compact circuit generates a zk-SNARK proof verifying value conservation and note ownership without disclosing amounts.",
    latency: "~840ms (Local Prover)",
    code: `// 2. Groth16 zk-SNARK Prover
const proof = await compactProver.confidentialTransfer({
  nullifier: computeNullifier(witness.spendingKey, inputNote.nonce),
  newCommitment: poseidonHash(recipientPk, 250n, salt1),
  changeCommitment: poseidonHash(myPk, changeAmount, salt2)
});`,
  },
  {
    number: "03",
    badge: "Consensus",
    title: "Midnight Preprod Settlement",
    description: "The proof submits to Midnight. Consensus verifies constraints, records spent nullifiers, and inserts fresh commitments.",
    latency: "~12s (Block Finality)",
    code: `// 3. Midnight Preprod On-Chain State Update
const tx = await midnightContract.confidentialTransfer(
  proof.nullifier,
  proof.newCommitment,
  proof.changeCommitment
);
// Ledger Outcome: Nullifier spent | MEV: $0.00 | Balances: Hidden`,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const current = steps[activeStep];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#FAFAFA] border-t border-black/[0.06] font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-3">
            <span className="w-8 h-px bg-[#FFD400]" />
            Execution Flow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-black tracking-tight leading-tight">
            How It Works in <br />
            <span className="text-zinc-500">Three Mathematical Steps.</span>
          </h2>
        </div>

        {/* Step Selector Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-3xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-white border-[#FFD400] shadow-sm ring-2 ring-[#FFD400]/40"
                    : "bg-white/70 border-black/[0.06] hover:bg-white hover:border-black/15"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-zinc-400">Step {step.number}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                      isActive ? "bg-[#FFD400] text-black" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {step.badge}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-black mb-1 leading-snug">{step.title}</h3>
                <span className="text-xs text-zinc-500 font-mono flex items-center gap-1.5 mt-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {step.latency}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Deep-Dive Container */}
        <div className="bg-white border border-black/[0.07] rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left 5 cols: Step Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300/60 text-xs font-mono font-bold text-zinc-900">
                Phase {current.number}: {current.badge}
              </div>

              <h3 className="text-2xl sm:text-3xl font-heading font-black text-black tracking-tight leading-snug">
                {current.title}
              </h3>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans">
                {current.description}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FFD400]" />
                </button>
              </div>
            </div>

            {/* Right 7 cols: Code Box */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-zinc-950 text-zinc-100 p-5 font-mono text-xs border border-zinc-800 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-[#FFD400]" />
                    <span>settlement_lifecycle.ts</span>
                  </span>
                  <button
                    onClick={handleCopy}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto leading-relaxed text-zinc-200">
                  <code>{current.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
