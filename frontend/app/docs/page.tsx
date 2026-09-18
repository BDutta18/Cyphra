'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  BookOpen,
  Code,
  ShieldCheck,
  Cpu,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Terminal,
  FileCheck,
} from 'lucide-react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'circuits' | 'verification' | 'wallet' | 'zk'>('circuits');
  const [copiedAddr, setCopiedAddr] = useState(false);

  const contractAddress = '0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f';

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const circuits = [
    {
      name: 'deposit(amount: Uint<64>, noteCommitment: Bytes<32>)',
      desc: 'Transfers unshielded public L1 NIGHT into a confidential zero-knowledge note commitment. The note commitment is registered in the on-chain commitment accumulator.',
      inputs: 'amount (public uint64), noteCommitment (32-byte Poseidon hash)',
      stateTransition: 'Increments totalShieldedCommitments counter, appends commitment to ledger.',
    },
    {
      name: 'confidentialTransfer(nullifier: Bytes<32>, newCommitment: Bytes<32>, changeCommitment: Bytes<32>)',
      desc: 'Executes peer-to-peer confidential transfer. Verifies in zero-knowledge that input note is unspent, computes spent nullifier to prevent double-spending, and creates fresh note commitments.',
      inputs: 'nullifier (spent note token), newCommitment (recipient note), changeCommitment (sender change)',
      stateTransition: 'Verifies nullifier is not in spent set; commits nullifier; appends 2 new commitments.',
    },
    {
      name: 'registerPaymentRequest(requestId: Bytes<32>, requestCommitment: Bytes<32>)',
      desc: 'Registers an off-chain cryptographic invoice request on the Midnight Preprod ledger.',
      inputs: 'requestId (unique uuid hash), requestCommitment (cryptographic parameter binding)',
      stateTransition: 'Stores request commitment mapped to requestId in contract ledger state.',
    },
    {
      name: 'fulfillPaymentRequest(requestId: Bytes<32>, paymentNullifier: Bytes<32>, receiptCommitment: Bytes<32>)',
      desc: 'Atomically fulfills a registered payment request. Verifies payer spending authority and produces an on-chain zero-knowledge receipt.',
      inputs: 'requestId, paymentNullifier, receiptCommitment',
      stateTransition: 'Marks payment request as fulfilled; marks nullifier as spent.',
    },
    {
      name: 'grantAuditorAccess(auditorKey: Bytes<32>, permissions: Uint<8>)',
      desc: 'Grants time-bounded, permissioned viewing key access for regulatory compliance and selective auditing without revealing private spending keys.',
      inputs: 'auditorKey (viewing public key), permissions (read bitmask: amounts, counterparty, memos)',
      stateTransition: 'Registers authorized auditor key in viewing directory.',
    },
    {
      name: 'revokeAuditorAccess(auditorKey: Bytes<32>)',
      desc: 'Revokes viewing key permissions for a previously authorized auditor address.',
      inputs: 'auditorKey (viewing public key)',
      stateTransition: 'Deletes or nullifies auditor key entry.',
    },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 text-zinc-900 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-black" />
              <span>Cyphra Technical Documentation</span>
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Comprehensive reference for Compact smart contract circuits, Midnight Preprod deployment, and zero-knowledge cryptography.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/BDutta18/Cyphra"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-[#FFD400] text-black border border-zinc-300 text-xs font-mono font-bold transition-colors shadow-xs"
            >
              <Code className="w-3.5 h-3.5" /> GitHub Monorepo <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Contract Address Banner */}
        <Card className="bg-[#FFD400]/15 border-[#FFD400] p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wider block">
                Deployed Preprod Smart Contract
              </span>
              <code className="text-xs font-mono font-bold text-black break-all select-all">
                {contractAddress}
              </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="text-xs font-mono font-bold bg-white border-zinc-300"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAddr ? 'Copied' : 'Copy'}
              </Button>
              <a
                href={`https://preprod.midnightexplorer.com/contracts/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#FFD400] hover:bg-[#E5BE00] text-black text-xs font-mono font-bold border border-black/15 shadow-xs transition-colors"
              >
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 text-xs font-mono font-bold gap-2">
          <button
            onClick={() => setActiveTab('circuits')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'circuits'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Compact Circuits
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" /> Preprod Verification
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'wallet'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> 1AM Wallet DApp API
          </button>
          <button
            onClick={() => setActiveTab('zk')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'zk'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-500 hover:text-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> ZK Cryptographic Model
          </button>
        </div>

        {/* Tab Content: Compact Circuits */}
        {activeTab === 'circuits' && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 font-mono">
              The Cyphra smart contract is written in <strong>Compact 0.31.1</strong>, compiled into zero-knowledge intermediate representations (ZKIR), and verified on-chain via Groth16 zk-SNARK verifier keys.
            </p>

            <div className="space-y-3">
              {circuits.map((circ, idx) => (
                <Card key={idx} className="p-4 bg-white border-zinc-200 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-xs font-mono font-bold text-black bg-zinc-100 p-1.5 rounded border border-zinc-200 break-all">
                      {circ.name}
                    </code>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                      Circuit #{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed font-sans">{circ.desc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-[11px] font-mono text-zinc-600">
                    <div>
                      <span className="font-bold text-zinc-500 block">Inputs:</span>
                      <span>{circ.inputs}</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-500 block">Ledger State Effect:</span>
                      <span>{circ.stateTransition}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Preprod Verification */}
        {activeTab === 'verification' && (
          <Card className="p-5 bg-white border-zinc-200 shadow-sm space-y-4 text-xs font-mono">
            <h3 className="font-bold text-black text-sm font-sans">Independent Preprod Verification</h3>
            <p className="text-zinc-600 font-sans leading-relaxed">
              Anyone can independently verify the deployed Cyphra smart contract and proving keys against the Midnight Preprod test ledger.
            </p>

            <div className="p-3 bg-zinc-900 text-zinc-100 rounded-lg space-y-2">
              <div className="text-[10px] text-zinc-400 font-bold uppercase">Run Verification Locally</div>
              <pre className="text-[11px] overflow-x-auto text-emerald-400">
{`# 1. Clone repository
git clone https://github.com/BDutta18/Cyphra.git
cd Cyphra

# 2. Verify Preprod environment variables and contract checksum
pnpm run verify:preprod-env

# 3. Inspect compiled Compact circuits & keys
ls contracts/cyphra/src/managed/keys/`}
              </pre>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between border-b border-zinc-100 pb-1.5">
                <span className="text-zinc-500">Contract Address:</span>
                <span className="font-bold text-black">{contractAddress}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1.5">
                <span className="text-zinc-500">Midnight Ledger Version:</span>
                <span className="font-bold text-black">Midnight Ledger 8.0 Preprod</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1.5">
                <span className="text-zinc-500">Compact Compiler:</span>
                <span className="font-bold text-black">Compact v0.31.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">1AM DApp Connector:</span>
                <span className="font-bold text-black">v4.0.1 Official</span>
              </div>
            </div>
          </Card>
        )}

        {/* Tab Content: 1AM Wallet */}
        {activeTab === 'wallet' && (
          <Card className="p-5 bg-white border-zinc-200 shadow-sm space-y-4 text-xs font-mono">
            <h3 className="font-bold text-black text-sm font-sans">1AM Wallet Integration Guide</h3>
            <p className="text-zinc-600 font-sans leading-relaxed">
              Cyphra is designed specifically for <strong>1AM Wallet v4.x</strong>. The DApp communicates with the wallet extension via <code>window.midnight</code> to delegate transaction balancing, dust gas provisioning, and cryptographic key signing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Address Formats Supported</span>
                <ul className="list-disc pl-4 space-y-1 text-zinc-700 text-[11px]">
                  <li><code>mn_addr_preprod1...</code> (Preprod Unshielded)</li>
                  <li><code>mn_shielded1...</code> (Shielded Coin Key)</li>
                  <li><code>mn_addr1...</code> (Preview / Mainnet Format)</li>
                </ul>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Security Guarantees</span>
                <ul className="list-disc pl-4 space-y-1 text-zinc-700 text-[11px]">
                  <li>Seed phrases NEVER leave 1AM extension</li>
                  <li>Private keys never exposed to frontend code</li>
                  <li>Deterministic witness synthesis inside sandbox</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Tab Content: ZK Cryptographic Model */}
        {activeTab === 'zk' && (
          <Card className="p-5 bg-white border-zinc-200 shadow-sm space-y-4 text-xs font-mono">
            <h3 className="font-bold text-black text-sm font-sans">Cryptographic Security Model</h3>
            <p className="text-zinc-600 font-sans leading-relaxed">
              Cyphra guarantees financial privacy using zero-knowledge succinct non-interactive arguments of knowledge (zk-SNARKs) based on the Groth16 proof system.
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-black font-bold block mb-1">1. Note Commitment Formula</span>
                <code className="text-xs text-black block bg-white p-2 rounded border border-zinc-200">
                  C = Poseidon(owner_pk, amount, blinding_factor)
                </code>
                <span className="text-[11px] text-zinc-500 font-sans block mt-1">
                  Commitments are collision-resistant and perfectly hiding.
                </span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-black font-bold block mb-1">2. Nullifier Derivation</span>
                <code className="text-xs text-black block bg-white p-2 rounded border border-zinc-200">
                  N = Poseidon(spending_secret_key, note_nonce)
                </code>
                <span className="text-[11px] text-zinc-500 font-sans block mt-1">
                  Nullifiers are unique per note and cannot be linked to the note commitment by third-party observers.
                </span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-black font-bold block mb-1">3. Value Conservation Proof</span>
                <code className="text-xs text-black block bg-white p-2 rounded border border-zinc-200">
                  in_amount == out_amount + change_amount (mod p)
                </code>
                <span className="text-[11px] text-zinc-500 font-sans block mt-1">
                  Enforces zero inflation without revealing any of the 3 balance figures.
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
