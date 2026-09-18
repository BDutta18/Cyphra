'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Shield, Eye, EyeOff, Lock, CheckCircle2, ArrowRight, Database } from 'lucide-react';

export function VisualPrivacyWorkflow() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'comparison'>('workflow');

  return (
    <Card className="bg-white border-zinc-200 shadow-sm p-4 text-zinc-900 space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200">
        <div>
          <h3 className="text-sm font-bold text-black font-sans flex items-center gap-2">
            <Shield className="w-4 h-4 text-black" />
            <span>Zero-Knowledge Privacy Architecture</span>
          </h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            How Compact smart contracts and Groth16 zk-SNARKs protect transactional data.
          </p>
        </div>

        <div className="flex rounded-lg bg-zinc-100 p-1 border border-zinc-200 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'workflow' ? 'bg-[#FFD400] text-black shadow-xs' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Proof Workflow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'comparison' ? 'bg-[#FFD400] text-black shadow-xs' : 'text-zinc-600 hover:text-black'
            }`}
          >
            On-Chain vs Shielded
          </button>
        </div>
      </div>

      {activeTab === 'workflow' ? (
        /* Workflow Stepper */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {/* Step 1: Off-Chain Witness */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Step 1 • Browser Local</span>
              <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
            </div>
            <h4 className="font-bold text-black text-xs font-sans">Private Witness Generation</h4>
            <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
              Your 1AM Wallet synthesizes the secret note values (owner spending key, input balance, and blinding salt). Secret parameters never touch the network.
            </p>
            <div className="p-1.5 rounded bg-white border border-zinc-200 text-[10px] text-zinc-700">
              <code>Witness = (sk, amount, salt)</code>
            </div>
          </div>

          {/* Step 2: Groth16 Proof */}
          <div className="p-3.5 rounded-xl bg-[#FFD400]/15 border border-[#FFD400] space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-black uppercase">Step 2 • Cryptographic Circuit</span>
              <Lock className="w-3.5 h-3.5 text-black" />
            </div>
            <h4 className="font-bold text-black text-xs font-sans">Groth16 zk-SNARK Proving</h4>
            <p className="text-[11px] text-zinc-700 font-sans leading-relaxed">
              The Compact circuit proves value conservation (<code>in = out + change</code>) and spends the input nullifier without revealing amounts or counterparties.
            </p>
            <div className="p-1.5 rounded bg-white border border-zinc-200 text-[10px] text-black font-bold">
              <code>Proof = π_zk (R1CS Constraints)</code>
            </div>
          </div>

          {/* Step 3: Ledger Verification */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Step 3 • Midnight Preprod</span>
              <Database className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h4 className="font-bold text-black text-xs font-sans">On-Chain State Transition</h4>
            <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
              The Midnight consensus ledger verifies the zero-knowledge proof, marks the nullifier as spent, and records the new note commitment.
            </p>
            <div className="p-1.5 rounded bg-white border border-zinc-200 text-[10px] text-emerald-700 font-bold">
              <code>Ledger: Commit(C_new) + Nullify(N)</code>
            </div>
          </div>
        </div>
      ) : (
        /* Comparison Table: Public Ledger vs Shielded Data */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border border-zinc-200 rounded-lg overflow-hidden">
            <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700">
              <tr>
                <th className="p-2.5 font-bold">Transaction Parameter</th>
                <th className="p-2.5 font-bold text-emerald-700">Shielded Off-Chain</th>
                <th className="p-2.5 font-bold text-zinc-600">Visible On-Chain Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr className="hover:bg-zinc-50">
                <td className="p-2.5 font-bold text-black">Sender & Recipient</td>
                <td className="p-2.5 text-emerald-700 font-semibold">100% Shielded (Zero Public Link)</td>
                <td className="p-2.5 text-zinc-500">Only cryptographic note commitment hash</td>
              </tr>
              <tr className="hover:bg-zinc-50">
                <td className="p-2.5 font-bold text-black">Transfer Amount</td>
                <td className="p-2.5 text-emerald-700 font-semibold">Private (Known only to counterparties)</td>
                <td className="p-2.5 text-zinc-500">Hidden via blinding factor salt</td>
              </tr>
              <tr className="hover:bg-zinc-50">
                <td className="p-2.5 font-bold text-black">Anti-Double-Spend</td>
                <td className="p-2.5 text-zinc-600">Derived off-chain: N = H(sk, rho)</td>
                <td className="p-2.5 text-black font-semibold">Public nullifier hash spent status</td>
              </tr>
              <tr className="hover:bg-zinc-50">
                <td className="p-2.5 font-bold text-black">Optional Memo</td>
                <td className="p-2.5 text-emerald-700 font-semibold">Encrypted with recipient public key</td>
                <td className="p-2.5 text-zinc-500">Zero plaintext or leaked metadata</td>
              </tr>
              <tr className="hover:bg-zinc-50">
                <td className="p-2.5 font-bold text-black">Transaction Fee (Gas)</td>
                <td className="p-2.5 text-zinc-600">Balanced by 1AM Wallet DUST</td>
                <td className="p-2.5 text-black font-semibold">Standard 0.0038 DUST consensus fee</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
