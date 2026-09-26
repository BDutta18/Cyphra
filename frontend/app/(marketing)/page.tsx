'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { GridPattern, AmbientGlow } from '../../components/ui/GridPattern';
import { InteractiveCircuitVisualizer } from '../../components/dashboard/InteractiveCircuitVisualizer';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { CyphraLogoMark } from '../../components/ui/CyphraLogo';
import {
  Lock,
  ArrowRight,
  QrCode,
  FileCheck2,
  CheckCircle2,
  Shield,
  Zap,
  Cpu,
  ShieldCheck,
  EyeOff,
  Eye,
  Globe,
  Coins,
  Sparkles,
  ExternalLink,
  Check,
  Play,
  KeyRound,
  SlidersHorizontal,
  Terminal,
  Copy,
  Code,
} from 'lucide-react';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { SupportedNetwork } from '../../lib/one-am-wallet-adapter';

export default function MarketingPage() {
  const { network, setNetwork, isConnected, connect, connectDemo } = useMidnightWallet();
  const [demoAmount, setDemoAmount] = useState('250.00');
  const [demoToken, setDemoToken] = useState<'NIGHT' | 'DUST' | 'tCYPHRA'>('NIGHT');
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [isProvingDemo, setIsProvingDemo] = useState(false);
  const [demoStep, setDemoStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [activeLedgerView, setActiveLedgerView] = useState<'public' | 'auditor'>('public');

  const activeNetwork: SupportedNetwork = (network as SupportedNetwork) || 'preprod';

  const networkOptions: {
    id: SupportedNetwork;
    label: string;
    badge: string;
    description: string;
  }[] = [
    {
      id: 'preprod',
      label: 'Preprod',
      badge: 'Active Staging',
      description: 'Decentralized Midnight staging network (Contract 0xcc4a29303...db3f)',
    },
    {
      id: 'preview',
      label: 'Preview',
      badge: 'Sandbox',
      description: 'Pre-release sandbox environment with test faucet',
    },
    {
      id: 'mainnet',
      label: 'Mainnet',
      badge: 'Production',
      description: 'Confidential settlement consensus ledger (Upcoming)',
    },
  ];

  const handleNetworkSelect = async (net: SupportedNetwork) => {
    if (net === activeNetwork) return;
    setIsSwitchingNetwork(true);
    setNetwork(net);
    if (isConnected) {
      try {
        await connect(net);
      } catch (e) {
        console.warn('Network switch error:', e);
      }
    }
    setIsSwitchingNetwork(false);
  };

  const runDemoProof = () => {
    setIsProvingDemo(true);
    setDemoStep(1);
    setTimeout(() => setDemoStep(2), 500);
    setTimeout(() => setDemoStep(3), 1000);
    setTimeout(() => {
      setDemoStep(4);
      setTimeout(() => {
        setIsProvingDemo(false);
      }, 1200);
    }, 1500);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const [activeCodeTab, setActiveCodeTab] = useState<'sdk' | 'contract' | 'cli'>('sdk');
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippets: Record<'sdk' | 'contract' | 'cli', { title: string; filename: string; code: string }> = {
    sdk: {
      title: 'TypeScript Client SDK',
      filename: 'settlement.ts',
      code: `import { CyphraClient } from '@cyphra/sdk';

// Initialize non-custodial client bound to Midnight Preprod
const cyphra = new CyphraClient({
  network: 'preprod',
  contractAddress: '0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f',
  indexerUri: 'https://indexer.preprod.midnight.network/api/v4/graphql'
});

// Synthesize client-side ZK witness & submit confidential settlement
const receipt = await cyphra.transferShielded({
  recipient: 'mn_addr_preprod17hhujr34dkhlv2qpzdzddvxzuwr8qt4g4wy9jle7v37jedey6glsgp3k35',
  amount: '250.00',
  asset: 'NIGHT',
  memo: 'Confidential B2B Invoice Settlement #0829'
});

console.log('Confirmed on Midnight consensus! TxHash:', receipt.txHash);`,
    },
    contract: {
      title: 'Compact 0.31.1 ZK Smart Contract',
      filename: 'cyphra.compact',
      code: `// Compiled to Groth16 zero-knowledge verification circuits
export ledger {
  commitments: Set<Bytes<32>>,
  nullifiers: Set<Bytes<32>>,
  invoices: Map<Bytes<32>, InvoiceRecord>
}

// Confidential transfer circuit: verifies proof & marks nullifier
export circuit confidentialTransfer(
  nullifier: Bytes<32>,
  newCommitment: Bytes<32>,
  changeCommitment: Bytes<32>
): Void {
  // Enforces spending authorization & double-spend prevention
  assert !ledger.nullifiers.member(nullifier);
  ledger.nullifiers.insert(nullifier);
  ledger.commitments.insert(newCommitment);
  ledger.commitments.insert(changeCommitment);
}`,
    },
    cli: {
      title: 'Midnight Indexer & CLI Verification',
      filename: 'verify.sh',
      code: `# Query live Midnight Preprod contract state via GraphQL
curl -s -X POST https://indexer.preprod.midnight.network/api/v4/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{ contract(address: \\"0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f\\") { state { rootNullifierTree } } }"}'

# Execute Compact local test suite
pnpm test`,
    },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col relative overflow-hidden font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-18 md:pb-28 border-b border-zinc-200">
        <GridPattern />
        <AmbientGlow />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            {/* Midnight Network Switcher */}
            <motion.div variants={itemVariants} className="mb-6 sm:mb-8 flex flex-col items-center max-w-full px-2">
              <div className="inline-flex items-center p-1 sm:p-1.5 rounded-2xl bg-zinc-100/90 border border-zinc-200 shadow-xs backdrop-blur-sm max-w-full overflow-x-auto scrollbar-none">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider shrink-0">
                  <Globe className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Network:</span>
                </div>
                <div className="flex items-center gap-1">
                  {networkOptions.map((net) => {
                    const isSelected = activeNetwork === net.id;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => handleNetworkSelect(net.id)}
                        disabled={isSwitchingNetwork}
                        className={`relative px-2.5 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all select-none cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                          isSelected
                            ? 'text-black shadow-xs'
                            : 'text-zinc-600 hover:text-black hover:bg-zinc-200/50'
                        }`}
                        title={`Select Midnight ${net.label}`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="homepage-network-toggle-indicator"
                            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                            className="absolute inset-0 bg-[#FFD400] rounded-xl border border-black/10 -z-0"
                          />
                        )}
                        <span
                          className={`relative z-10 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${
                            isSelected ? 'bg-black animate-pulse' : 'bg-zinc-400'
                          }`}
                        />
                        <span className="relative z-10">{net.label}</span>
                        <span
                          className={`relative z-10 text-[9px] uppercase px-1.5 py-0.5 rounded font-sans font-bold tracking-wide hidden sm:inline-block ${
                            isSelected
                              ? 'bg-black/10 text-black'
                              : 'bg-zinc-200/80 text-zinc-600'
                          }`}
                        >
                          {net.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Brand Logo Hero Icon */}
            <motion.div variants={itemVariants} className="mb-5 sm:mb-6 flex justify-center">
              <div className="relative inline-flex items-center justify-center transition-transform hover:scale-105 duration-300">
                <CyphraLogoMark size={96} className="drop-shadow-[0_10px_28px_rgba(255,212,0,0.25)]" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 max-w-4xl mx-auto leading-[1.08] px-2 break-words"
            >
              Confidential Payments for the Private Web
            </motion.h1>

            {/* Subtitle — Short, Punchy, Fintech-Grade */}
            <motion.p
              variants={itemVariants}
              className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-zinc-600 max-w-xl mx-auto font-normal leading-relaxed px-4"
            >
              Zero-knowledge confidential payments and private digital assets powered by <span className="font-semibold text-black">Midnight</span>.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-sm px-8 py-3.5 font-bold bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-fintech"
                >
                  Launch Treasury <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/send" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-sm px-6 py-3.5 font-bold border-zinc-300 shadow-fintech"
                >
                  <Lock className="w-4 h-4 mr-2 text-zinc-800" /> Send Shielded Assets
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => connectDemo('preprod')}
                className="w-full sm:w-auto text-sm px-5 py-3.5 font-mono font-bold border-zinc-300 hover:border-black bg-zinc-50/80 shadow-fintech flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Explore Sandbox Mode
              </Button>
            </motion.div>

            {/* Interactive Live Confidential Payment Sandbox */}
            <motion.div
              variants={itemVariants}
              className="mt-10 sm:mt-14 w-full max-w-xl mx-auto text-left px-1 sm:px-0"
            >
              <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white p-4 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 relative overflow-hidden">
                {/* Top hairline accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD400] via-black to-[#FFD400]" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-white to-zinc-50 border border-zinc-200/90 flex items-center justify-center p-0.5 shadow-xs shrink-0">
                      <CyphraLogoMark size={24} className="drop-shadow-xs" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-black font-sans">
                        Confidential Transfer Sandbox
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Compact ZK-SNARK Prover • Preprod Testnet
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ZK-Encrypted
                  </span>
                </div>

                <div className="space-y-3.5 sm:space-y-4 pt-4">
                  {/* Recipient box */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono font-semibold text-zinc-500 mb-1">
                      <span>Recipient Address (Bech32)</span>
                      <span className="text-emerald-700 font-bold">Preprod Validated</span>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-[11px] sm:text-xs text-zinc-800 flex items-center justify-between shadow-xs">
                      <span className="truncate">mn_addr_preprod17hhujr34dkhlv2qpzdzddvxzuwr8qt...</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Amount and Asset selection */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-500 mb-1">
                      <span className="font-semibold">Transfer Amount</span>
                      <span className="truncate">Shielded: 1,500 NIGHT</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border border-zinc-200 bg-zinc-50/70">
                      <input
                        type="text"
                        value={demoAmount}
                        onChange={(e) => setDemoAmount(e.target.value)}
                        className="w-full bg-transparent font-mono text-lg sm:text-xl font-black text-black px-2 outline-none"
                      />
                      <div className="flex gap-1 shrink-0">
                        {(['NIGHT', 'DUST', 'tCYPHRA'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setDemoToken(t)}
                            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all ${
                              demoToken === t
                                ? 'bg-black text-white shadow-xs'
                                : 'bg-white text-zinc-600 border border-zinc-200 hover:text-black hover:border-zinc-300'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Public vs Auditor View Mode Toggle */}
                  <div className="pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] font-mono text-zinc-500 mb-2">
                      <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">Live Ledger Visibility:</span>
                      <div className="flex rounded-lg bg-zinc-100 p-0.5 border border-zinc-200 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveLedgerView('public')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-colors ${
                            activeLedgerView === 'public'
                              ? 'bg-black text-white'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          <EyeOff className="w-2.5 h-2.5 inline mr-1" /> Public Explorer
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveLedgerView('auditor')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-colors ${
                            activeLedgerView === 'auditor'
                              ? 'bg-[#FFD400] text-black font-extrabold'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          <Eye className="w-2.5 h-2.5 inline mr-1" /> Viewing Key
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs border border-zinc-800 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                        <span className="text-zinc-400">Sender Identity:</span>
                        <span className="font-bold text-[#FFD400] truncate max-w-[140px] sm:max-w-none">
                          {activeLedgerView === 'public' ? '0x[ZERO_KNOWLEDGE_SHIELDED]' : 'Authorized Auditor (Viewing Key 0x3f1a)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                        <span className="text-zinc-400">Transfer Amount:</span>
                        <span className="font-bold text-emerald-400">
                          {activeLedgerView === 'public' ? '•••••••• (Encrypted)' : `${demoAmount} ${demoToken}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                        <span className="text-zinc-400">Note Commitment:</span>
                        <span className="text-zinc-400 text-[9px] sm:text-[10px] truncate max-w-[140px] sm:max-w-[210px]">
                          0x8f3c7e91b4a2d0c5...01fe
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prover Simulation Button & Feedback */}
                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={runDemoProof}
                      disabled={isProvingDemo}
                      className="w-full font-bold text-xs py-2.5 sm:py-3 bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-sm"
                    >
                      {isProvingDemo ? (
                        <span className="flex items-center justify-center gap-1.5 truncate">
                          <Cpu className="w-3.5 h-3.5 animate-spin text-black shrink-0" />
                          <span className="truncate">Step {demoStep}/4: {demoStep === 1 ? 'Witness Generation' : demoStep === 2 ? 'Constraint Checks' : demoStep === 3 ? 'Nullifier Anchor' : 'Preprod Ledger Settlement'}</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <Play className="w-3.5 h-3.5 fill-black" /> Simulate Compact ZK Circuit Prover
                        </span>
                      )}
                    </Button>

                    <Link href="/send" className="block text-center text-xs font-mono text-zinc-600 hover:text-black underline mt-1">
                      Or execute real transfer with 1AM Wallet →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Protocol Metrics Bar */}
            <motion.div
              variants={itemVariants}
              className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-zinc-200 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs font-mono text-zinc-700 w-full"
            >
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 text-left shadow-xs">
                <span className="text-zinc-500 block mb-0.5 sm:mb-1 font-semibold text-[9px] sm:text-[10px] uppercase">
                  Shielded Volume (7D)
                </span>
                <span className="text-black font-extrabold text-sm sm:text-base tabular-nums">
                  $<AnimatedCounter value={1845920} decimals={0} />
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 text-left shadow-xs">
                <span className="text-zinc-500 block mb-0.5 sm:mb-1 font-semibold text-[9px] sm:text-[10px] uppercase">
                  Client WASM Prover
                </span>
                <span className="text-black font-extrabold text-sm sm:text-base tabular-nums flex items-center gap-1">
                  840ms <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">(-42%)</span>
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 text-left shadow-xs">
                <span className="text-zinc-500 block mb-0.5 sm:mb-1 font-semibold text-[9px] sm:text-[10px] uppercase">
                  Compiler & Primitive
                </span>
                <span className="text-black font-extrabold text-sm sm:text-base tabular-nums">
                  Compact 0.31.1 ZK
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 text-left shadow-xs">
                <span className="text-zinc-500 block mb-0.5 sm:mb-1 font-semibold text-[9px] sm:text-[10px] uppercase">
                  1AM Connector
                </span>
                <span className="text-black font-extrabold text-sm sm:text-base tabular-nums flex items-center gap-1 sm:gap-1.5">
                  <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 shrink-0" /> v4.0.1 Official
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Circuit Demo Playground */}
      <section className="py-20 bg-[#FAFAFA] border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-xl mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">
              Circuit Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans">
              Test Midnight Compact Cryptography Live
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600">
              See how private witnesses, blinding factors, and spent nullifiers compute without revealing transaction amounts or wallet addresses to the public.
            </p>
          </div>

          <InteractiveCircuitVisualizer />
        </div>
      </section>

      {/* Core Architecture Pillars */}
      <section className="py-20 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1 block">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans">
              Privacy by Cryptographic Guarantee
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Unlike public ledgers where every invoice and balance is indexed forever, Cyphra uses Midnight zero-knowledge cryptography to preserve complete financial discretion.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-black transition-all shadow-card hover:shadow-card-hover group">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-4 group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-black mb-2 font-sans">Confidential Transfers</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Transfers execute using Compact note commitments and spent nullifiers. Neither sender, recipient, nor transfer amounts are revealed on-chain.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-black transition-all shadow-card hover:shadow-card-hover group">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-black mb-2 font-sans">Private Invoices & QR</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Generate cryptographic invoices with encrypted memos. Payers settle seamlessly through 1AM Wallet with zero-knowledge proof verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-black transition-all shadow-card hover:shadow-card-hover group">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-4 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-black mb-2 font-sans">Selective Auditing</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Grant compliance officers or tax accountants cryptographic read access through selective viewing keys without disclosing your private spend authority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="py-20 bg-[#FAFAFA] border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1 block">
              Ledger Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans">
              Public Blockchains vs. Cyphra on Midnight
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 overflow-x-auto bg-white shadow-card">
            <table className="w-full min-w-[540px] text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-700">
                  <th className="p-4 font-bold">CAPABILITY</th>
                  <th className="p-4 font-semibold text-zinc-500">PUBLIC BLOCKCHAINS (ETH/SOL)</th>
                  <th className="p-4 font-bold text-black bg-[#FFD400]/20">CYPHRA ON MIDNIGHT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 font-sans font-semibold text-black">Wallet Balances</td>
                  <td className="p-4 text-zinc-500">Publicly visible to anyone</td>
                  <td className="p-4 text-black font-bold flex items-center gap-1.5 bg-[#FFD400]/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    Shielded note commitments
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 font-sans font-semibold text-black">Transaction History</td>
                  <td className="p-4 text-zinc-500">Indexed & traceable forever</td>
                  <td className="p-4 text-black font-bold flex items-center gap-1.5 bg-[#FFD400]/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    Zero-knowledge verified
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 font-sans font-semibold text-black">Payment Invoices</td>
                  <td className="p-4 text-zinc-500">Exposes customer-vendor link</td>
                  <td className="p-4 text-black font-bold flex items-center gap-1.5 bg-[#FFD400]/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    Encrypted with counterparty PK
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 font-sans font-semibold text-black">Regulatory Compliance</td>
                  <td className="p-4 text-zinc-500">All-or-nothing public exposure</td>
                  <td className="p-4 text-black font-bold flex items-center gap-1.5 bg-[#FFD400]/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    Selective viewing key disclosure
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Institutional Security & Cryptographic Verifiability */}
      <section className="py-20 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1 block">
              Cryptographic Primitives
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans">
              Institutional Security & Formal Verification
            </h2>
            <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
              Engineered using Compact domain-specific smart contract compilation, Poseidon commitment accumulators, and non-malleable Groth16 zero-knowledge proofs on Midnight Preprod.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-14">
            <div className="p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 shadow-card hover:border-black transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-3">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-black text-sm mb-1.5 font-sans">Non-Custodial Client Proving</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Witness synthesis and ZK proof generation execute exclusively inside the browser WebAssembly environment. Private spending keys, salt factors, and plaintext balances never exit client memory.
              </p>
              <div className="mt-3 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Runtime: 1AM Connector WASM Prover (~840ms)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 shadow-card hover:border-black transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-black text-sm mb-1.5 font-sans">Deterministic Nullifiers</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Every spent confidential note emits an unlinkable 32-byte nullifier recorded on-chain. Consensus guarantees strict double-spend prevention without ever disclosing which prior commitment was consumed.
              </p>
              <div className="mt-3 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Ledger State: Preprod 0xcc4a2930...db3f</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 shadow-card hover:border-black transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-3">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-black text-sm mb-1.5 font-sans">Selective Viewing Keys</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Cyphra decouples spending authority from read auditing. Users can grant cryptographically scoped, time-bounded viewing keys to corporate auditors or tax regulators without exposing spend permissions.
              </p>
              <div className="mt-3 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Compliance: Zero-leakage selective disclosure</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 shadow-card hover:border-black transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-3">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-black text-sm mb-1.5 font-sans">Sparse Merkle Tree Commitments</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Confidential notes are inserted into a 32-depth Poseidon accumulator. Provers construct logarithmic inclusion proofs verifiable in constant time on the Midnight consensus network.
              </p>
              <div className="mt-3 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Complexity: O(log N) verification complexity</span>
              </div>
            </div>
          </div>

          {/* Developer Integration Terminal */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-left font-mono">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-zinc-400 font-semibold pl-2">
                  {codeSnippets[activeCodeTab].filename}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1">
                {(['sdk', 'contract', 'cli'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      activeCodeTab === tab
                        ? 'bg-[#FFD400] text-black'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {tab === 'sdk' ? 'TypeScript SDK' : tab === 'contract' ? 'Compact Circuit' : 'GraphQL Indexer'}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="ml-2 p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Code Viewport */}
            <div className="p-4 sm:p-5 overflow-x-auto text-[11px] sm:text-xs leading-relaxed text-zinc-300 max-h-[380px]">
              <pre className="font-mono">
                <code>{codeSnippets[activeCodeTab].code}</code>
              </pre>
            </div>

            <div className="px-4 py-2.5 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Midnight Preprod Consensus Verified
              </span>
              <a
                href="https://preprod.midnightexplorer.com/contracts/0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-[#FFD400] flex items-center gap-1 transition-colors"
              >
                Contract Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center mx-auto mb-6">
            <CyphraLogoMark size={52} className="drop-shadow-[0_6px_20px_rgba(255,212,0,0.25)]" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight font-sans">
            Ready to experience confidential payments?
          </h2>
          <p className="mt-4 text-zinc-600 text-sm sm:text-base max-w-md mx-auto">
            Connect your 1AM Wallet extension or launch our instant pre-funded sandbox account on Midnight Preprod.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 font-bold text-sm bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-fintech"
              >
                Launch Treasury <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => connectDemo('preprod')}
              className="w-full sm:w-auto px-6 py-3.5 font-mono font-bold text-sm border-zinc-300 hover:border-black bg-white shadow-fintech"
            >
              Explore Sandbox Mode
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
