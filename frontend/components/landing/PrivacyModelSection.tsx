"use client";

import { useState } from "react";
import { EyeOff, Eye, ShieldCheck, Lock, Hash, Shield, FileCheck, Coins } from "lucide-react";

const modelData = {
  private: [
    {
      title: "Sender & Receiver Keys",
      description: "Public keys and wallet addresses are never written to on-chain state during transactions.",
      icon: EyeOff,
      tag: "100% Shielded",
    },
    {
      title: "Transfer Amounts",
      description: "Transferred values exist solely as encrypted Pedersen and Poseidon note commitments.",
      icon: Lock,
      tag: "Hidden Values",
    },
    {
      title: "Account Balances",
      description: "Balances are computed locally by decrypting private UTXOs. Explorers observe $0.00.",
      icon: Coins,
      tag: "Local State",
    },
    {
      title: "Invoice & Memo Details",
      description: "Invoices are encrypted off-chain via Curve25519 ECDH between counterparties.",
      icon: FileCheck,
      tag: "Peer-to-Peer",
    },
  ],
  public: [
    {
      title: "32-Byte Note Commitments",
      description: "Opaque cryptographic hashes confirming value exists without revealing inputs or keys.",
      icon: Hash,
      tag: "State Tree",
    },
    {
      title: "Spent Note Nullifiers",
      description: "Unique single-use nullifiers published upon spend to mathematically eliminate double-spending.",
      icon: ShieldCheck,
      tag: "Double-Spend Guard",
    },
    {
      title: "ZK-SNARK Verification State",
      description: "Boolean verification status confirming Groth16 mathematical validity against circuit constraints.",
      icon: Shield,
      tag: "Groth16 Verified",
    },
    {
      title: "Midnight Consensus Height",
      description: "Timestamp and block height inclusion on the decentralized Midnight Preprod ledger.",
      icon: Eye,
      tag: "Ledger Inclusion",
    },
  ],
  proves: [
    {
      title: "Value Conservation",
      description: "Proves input equals transfer plus change sum without revealing any individual amount.",
      icon: ShieldCheck,
      tag: "Conservation",
    },
    {
      title: "Spend Authority",
      description: "Proves knowledge of the private spending key for the nullified note without revealing it.",
      icon: Lock,
      tag: "Authorized",
    },
    {
      title: "Nullifier Uniqueness",
      description: "Proves the spent note has never been nullified before across ledger history.",
      icon: Hash,
      tag: "Unspent UTXO",
    },
    {
      title: "Invoice Conformance",
      description: "Proves payment fulfillment matches requested merchant terms and expiration window.",
      icon: FileCheck,
      tag: "Settlement Bound",
    },
  ],
};

export function PrivacyModelSection() {
  const [activeTab, setActiveTab] = useState<"private" | "public" | "proves">("private");
  const cards = modelData[activeTab];

  return (
    <section id="privacy" className="py-20 lg:py-28 bg-white border-t border-black/[0.06] font-sans">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-3">
              <span className="w-8 h-px bg-[#FFD400]" />
              Cryptographic Boundary
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-black tracking-tight leading-tight">
              Midnight Privacy Model. <br />
              <span className="text-zinc-500">Zero Mempool Exposure.</span>
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-full border border-black/[0.08] bg-zinc-50 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("private")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === "private"
                  ? "bg-black text-white shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <EyeOff size={13} className="text-[#FFD400]" />
              <span>What Stays Private</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("public")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === "public"
                  ? "bg-black text-white shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <Eye size={13} />
              <span>What Is Public</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("proves")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === "proves"
                  ? "bg-[#FFD400] text-black shadow-xs font-bold"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <ShieldCheck size={13} />
              <span>What You Prove</span>
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-3xl border border-black/[0.07] bg-white hover:border-[#FFD400] transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-black/[0.06] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-black mb-2 leading-snug">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
