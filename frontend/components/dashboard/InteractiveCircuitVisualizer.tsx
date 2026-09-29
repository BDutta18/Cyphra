'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu, Lock, CheckCircle2, FileCode, Layers, Key, ArrowRight, ExternalLink } from 'lucide-react';
import { CyphraLogoMark } from '../ui/CyphraLogo';

interface CircuitSpec {
  id: 'deposit' | 'confidentialTransfer' | 'registerPaymentRequest' | 'fulfillPaymentRequest' | 'grantAuditorAccess';
  name: string;
  signature: string;
  category: 'Shielding' | 'Private Transfer' | 'Invoicing' | 'Settlement' | 'Compliance';
  witnesses: string[];
  assertions: string[];
  stateMutations: string[];
  zkCurve: string;
  description: string;
}

const CIRCUITS: CircuitSpec[] = [
  {
    id: 'deposit',
    name: 'deposit() Circuit',
    signature: 'circuit deposit(amount: Uint<64>, noteCommitment: Bytes<32>): []',
    category: 'Shielding',
    witnesses: ['get_spending_key(): Bytes<32>', 'get_blinding_factor(): Bytes<32>'],
    assertions: [
      'assert(amount > 0, "Deposit amount must be strictly positive")',
      'assert(!commitments.member(disclose(noteCommitment)), "Note commitment already exists")',
    ],
    stateMutations: [
      'commitments.insert(disclose(noteCommitment), true)',
      'totalShieldedDeposits.increment(1)',
    ],
    zkCurve: 'Groth16 over BLS12-381 (Poseidon Hash)',
    description: 'Converts unshielded public L1 tokens into an encrypted, off-chain zero-knowledge note commitment without revealing the deposited quantity on the public ledger.',
  },
  {
    id: 'confidentialTransfer',
    name: 'confidentialTransfer() Circuit',
    signature: 'circuit confidentialTransfer(nullifier: Bytes<32>, newCommitment: Bytes<32>, changeCommitment: Bytes<32>): []',
    category: 'Private Transfer',
    witnesses: [
      'get_spending_key(): Bytes<32>',
      'get_input_note_value(): Uint<64>',
      'get_output_note_value(): Uint<64>',
      'get_change_note_value(): Uint<64>',
      'get_blinding_factor(): Bytes<32>',
    ],
    assertions: [
      'assert(!nullifiers.member(disclose(nullifier)), "Nullifier already spent (double-spend rejected)")',
      'assert(!commitments.member(disclose(newCommitment)), "Recipient commitment replay detected")',
      'assert(!commitments.member(disclose(changeCommitment)), "Change commitment replay detected")',
      'assert(input_val == output_val + change_val, "ZK Value Conservation violated")',
    ],
    stateMutations: [
      'nullifiers.insert(disclose(nullifier), true)',
      'commitments.insert(disclose(newCommitment), true)',
      'commitments.insert(disclose(changeCommitment), true)',
      'totalConfidentialTransfers.increment(1)',
    ],
    zkCurve: 'Groth16 over BLS12-381 (R1CS Arithmetic)',
    description: 'Atomically nullifies the spent input note, verifies balance conservation, and creates fresh note commitments for the recipient and sender change.',
  },
  {
    id: 'registerPaymentRequest',
    name: 'registerPaymentRequest() Circuit',
    signature: 'circuit registerPaymentRequest(requestId: Bytes<32>, requestCommitment: Bytes<32>): []',
    category: 'Invoicing',
    witnesses: ['get_invoice_nonce(): Bytes<32>', 'get_recipient_shielded_pubkey(): Bytes<32>'],
    assertions: [
      'assert(!paymentRequests.member(disclose(requestId)), "Payment request ID collision")',
      'assert(requestCommitment != 0x0, "Invalid invoice commitment binding")',
    ],
    stateMutations: [
      'paymentRequests.insert(disclose(requestId), disclose(requestCommitment))',
      'totalPaymentRequests.increment(1)',
    ],
    zkCurve: 'Groth16 over BLS12-381 (Compact Standard)',
    description: 'Publishes an opaque cryptographic invoice identifier on-chain, binding payment terms off-chain with deterministic verification.',
  },
  {
    id: 'fulfillPaymentRequest',
    name: 'fulfillPaymentRequest() Circuit',
    signature: 'circuit fulfillPaymentRequest(requestId: Bytes<32>, paymentNullifier: Bytes<32>, receiptCommitment: Bytes<32>): []',
    category: 'Settlement',
    witnesses: [
      'get_spending_key(): Bytes<32>',
      'get_invoice_matching_proof(): Bytes<32>',
    ],
    assertions: [
      'assert(paymentRequests.member(disclose(requestId)), "Unregistered payment request")',
      'assert(!paidRequests.member(disclose(requestId)), "Invoice already fulfilled")',
      'assert(!nullifiers.member(disclose(paymentNullifier)), "Settlement nullifier already spent")',
    ],
    stateMutations: [
      'nullifiers.insert(disclose(paymentNullifier), true)',
      'commitments.insert(disclose(receiptCommitment), true)',
      'paidRequests.insert(disclose(requestId), true)',
    ],
    zkCurve: 'Groth16 over BLS12-381 (Atomic State Transition)',
    description: 'Binds payer settlement proof directly to an open invoice, issuing an on-chain zero-knowledge receipt without leaking counterparty identities.',
  },
  {
    id: 'grantAuditorAccess',
    name: 'grantAuditorAccess() Circuit',
    signature: 'circuit grantAuditorAccess(auditorKey: Bytes<32>, permissions: Uint<32>): []',
    category: 'Compliance',
    witnesses: ['get_owner_viewing_private_key(): Bytes<32>'],
    assertions: [
      'assert(permissions > 0 && permissions <= 0x07, "Invalid permission bitmask")',
      'assert(auditorKey != 0x0, "Invalid auditor viewing key")',
    ],
    stateMutations: [
      'auditorRegistry.insert(disclose(auditorKey), disclose(permissions))',
    ],
    zkCurve: 'Groth16 over BLS12-381 (Selective Disclosure)',
    description: 'Grants time-bounded, granular viewing access (net balances, counterparties, or tax disclosures) without exposing private spending keys.',
  },
];

export function InteractiveCircuitVisualizer() {
  const [selectedCircuitId, setSelectedCircuitId] = useState<CircuitSpec['id']>('confidentialTransfer');
  const activeSpec = CIRCUITS.find((c) => c.id === selectedCircuitId) || CIRCUITS[1];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <CyphraLogoMark size={20} />
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-zinc-500">
              Midnight Compact 0.31.1 Verification Inspector
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-black tracking-tight mt-0.5 font-sans">
            Formal Circuit Specification & R1CS Constraint Engine
          </h3>
        </div>

        <a
          href="https://github.com/BDutta18/Cyphra/blob/main/contracts/cyphra/src/cyphra.compact"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300 font-sans text-xs font-semibold transition-colors"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>View <code className="font-mono text-[11px]">cyphra.compact</code> Source</span>
          <ExternalLink className="w-3 h-3 text-zinc-500" />
        </a>
      </div>

      {/* Circuit Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-4 pb-3">
        {CIRCUITS.map((circ) => {
          const isSelected = circ.id === selectedCircuitId;
          const [fn, label] = circ.name.split(' ');
          return (
            <button
              key={circ.id}
              onClick={() => setSelectedCircuitId(circ.id)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 select-none ${
                isSelected
                  ? 'bg-black text-[#FFD400] font-bold shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-black font-medium'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono font-bold tracking-tight">{fn}</span>
              {label && <span className="font-sans text-[11px] opacity-75">{label}</span>}
            </button>
          );
        })}
      </div>

      {/* Circuit Signature Banner */}
      <div className="p-3.5 rounded-xl bg-zinc-950 text-zinc-100 text-xs border border-zinc-800 space-y-1.5 my-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-sans font-medium text-zinc-400">Compact 0.31.1 Formal Signature</span>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFD400]/20 text-[#FFD400] border border-[#FFD400]/40 uppercase tracking-wide">
            {activeSpec.category}
          </span>
        </div>
        <p className="font-mono text-xs text-emerald-400 font-bold overflow-x-auto whitespace-pre-wrap leading-relaxed tracking-tight">
          {activeSpec.signature}
        </p>
        <p className="font-sans text-xs text-zinc-400 leading-normal pt-0.5">
          {activeSpec.description}
        </p>
      </div>

      {/* 3-Column Formal Specification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {/* Column 1: Off-Chain Witnesses (Private) */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-700" />
              1. Off-Chain Witnesses
            </span>
            <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-zinc-200/80 text-zinc-700 font-bold">
              Private
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-sans leading-relaxed">
            Supplied locally by the 1AM Wallet witness synthesizer. Values never touch the public network:
          </p>
          <div className="space-y-1.5">
            {activeSpec.witnesses.map((w, idx) => (
              <div key={idx} className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200/90 text-zinc-800">
                <code className="font-mono text-[11px] sm:text-xs tracking-tight break-all font-medium">{w}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: R1CS Constraints (ZK Verifier) */}
        <div className="p-4 rounded-xl bg-white border-2 border-black space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-black" />
              2. ZK Arithmetic Constraints
            </span>
            <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-[#FFD400] text-black font-extrabold shadow-2xs">
              Groth16
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-sans leading-relaxed">
            Mathematically verified on-chain by the Midnight ledger consensus before applying state transitions:
          </p>
          <div className="space-y-1.5">
            {activeSpec.assertions.map((a, idx) => (
              <div key={idx} className="px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900">
                <code className="font-mono text-[11px] sm:text-xs tracking-tight break-all font-medium leading-relaxed">{a}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Ledger State Mutations */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              3. On-Chain Ledger Mutation
            </span>
            <span className="text-[10px] font-sans px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              Public State
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-sans leading-relaxed">
            Persistent updates recorded to the Midnight consensus ledger:
          </p>
          <div className="space-y-1.5">
            {activeSpec.stateMutations.map((m, idx) => (
              <div key={idx} className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200/90 text-emerald-800">
                <code className="font-mono text-[11px] sm:text-xs tracking-tight break-all font-medium leading-relaxed">{m}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between text-xs text-zinc-500 font-sans gap-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Proving Scheme:</span>
          <code className="font-mono font-bold text-zinc-700 text-[11px]">{activeSpec.zkCurve}</code>
        </span>
        <span className="text-zinc-500">
          Consensus: <span className="font-semibold text-zinc-700">Midnight Preprod Dual-Ledger Architecture</span>
        </span>
      </div>
    </div>
  );
}
