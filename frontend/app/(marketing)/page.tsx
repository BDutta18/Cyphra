'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { GridPattern, AmbientGlow } from '../../components/ui/GridPattern';
import { InteractiveCircuitVisualizer } from '../../components/dashboard/InteractiveCircuitVisualizer';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import {
  Lock,
  ArrowRight,
  QrCode,
  FileCheck2,
  CheckCircle2,
  Shield,
  Zap,
  Cpu,
  ChevronRight,
  ShieldCheck,
  EyeOff,
  Globe,
} from 'lucide-react';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { SupportedNetwork } from '../../lib/one-am-wallet-adapter';

export default function MarketingPage() {
  const { network, setNetwork, isConnected, connect } = useMidnightWallet();
  const [demoAmount, setDemoAmount] = useState('250.00');
  const [demoToken, setDemoToken] = useState<'NIGHT' | 'DUST' | 'tCYPHRA'>('NIGHT');
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  const activeNetwork: SupportedNetwork = (network as SupportedNetwork) || 'preview';

  const networkOptions: {
    id: SupportedNetwork;
    label: string;
    badge: string;
    description: string;
  }[] = [
    {
      id: 'preview',
      label: 'Preview',
      badge: 'Testnet',
      description: 'Pre-release sandbox environment with test faucet',
    },
    {
      id: 'preprod',
      label: 'Preprod',
      badge: 'Staging',
      description: 'Multi-validator staging network for dapp rehearsals',
    },
    {
      id: 'mainnet',
      label: 'Mainnet',
      badge: 'Production',
      description: 'Live confidential settlement consensus ledger',
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

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col relative overflow-hidden font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-zinc-200">
        <GridPattern />
        <AmbientGlow />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            {/* Minimalist Top Pill */}
            <motion.div variants={itemVariants}>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/90 text-xs font-medium text-zinc-800 transition-colors mb-4 shadow-xs group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Midnight Network • Official 1AM Wallet DApp Connector</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-black transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            {/* Midnight Network Toggle: Preview, Preprod, Mainnet */}
            <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center">
              <div className="inline-flex items-center p-1.5 rounded-2xl bg-zinc-100/90 border border-zinc-200/90 shadow-xs backdrop-blur-sm">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
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
                        className={`relative px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all select-none cursor-pointer flex items-center gap-2 ${
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
                            className="absolute inset-0 bg-[#FFD400] rounded-xl border border-black/15 -z-0"
                          />
                        )}
                        <span
                          className={`relative z-10 w-2 h-2 rounded-full ${
                            isSelected ? 'bg-black animate-pulse' : 'bg-zinc-400'
                          }`}
                        />
                        <span className="relative z-10">{net.label}</span>
                        <span
                          className={`relative z-10 text-[9px] uppercase px-1.5 py-0.5 rounded font-sans font-semibold tracking-wide ${
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
              <div className="mt-2 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span className="text-zinc-400">Target RPC:</span>
                <span className="text-zinc-800 font-medium">
                  {networkOptions.find((n) => n.id === activeNetwork)?.description}
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-[-0.03em] text-zinc-950 max-w-3xl mx-auto leading-[1.08]"
            >
              Confidential Payments for the Private Web
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-5 text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Maintain shielded balances, send zero-knowledge payments, and issue encrypted invoices on Midnight.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-sm px-7 py-3.5 font-bold bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-sm"
                >
                  Launch Application <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/send" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-sm px-6 py-3.5 font-semibold border-zinc-300"
                >
                  <Lock className="w-4 h-4 mr-2 text-zinc-800" /> Send Payment
                </Button>
              </Link>
            </motion.div>

            {/* Interactive HyperDex-Style Payment Card Preview */}
            <motion.div
              variants={itemVariants}
              className="mt-14 w-full max-w-md mx-auto text-left"
            >
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-black">Confidential Transfer</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Midnight {activeNetwork.toUpperCase()} Circuit
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ZK-Encrypted
                  </span>
                </div>

                <div className="space-y-3 pt-3.5">
                  {/* Recipient box */}
                  <div>
                    <label className="text-[11px] font-mono font-semibold text-zinc-500 block mb-1">
                      Recipient Shielded Address
                    </label>
                    <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-mono text-xs text-zinc-800 flex items-center justify-between">
                      <span className="truncate">mn_shielded1qqg847...92847</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Amount and Asset selection */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-500 mb-1">
                      <label className="font-semibold">Transfer Amount</label>
                      <span>Balance: 1,450.00 NIGHT</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                      <input
                        type="text"
                        value={demoAmount}
                        onChange={(e) => setDemoAmount(e.target.value)}
                        className="w-full bg-transparent font-mono text-lg font-bold text-black px-2 outline-none"
                      />
                      <div className="flex gap-1">
                        {(['NIGHT', 'DUST', 'tCYPHRA'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setDemoToken(t)}
                            className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
                              demoToken === t
                                ? 'bg-black text-white'
                                : 'bg-white text-zinc-600 border border-zinc-200 hover:text-black'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Privacy badge */}
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs font-mono text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Ledger Visibility:</span>
                    </span>
                    <span className="font-bold text-black">Private Note (Zero-Leak)</span>
                  </div>

                  {/* Action Link */}
                  <Link href="/send" className="block pt-1">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full font-bold text-xs py-2.5 bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/10"
                    >
                      Execute Confidential Payment <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Protocol Metrics Bar */}
            <motion.div
              variants={itemVariants}
              className="mt-14 pt-8 border-t border-zinc-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-zinc-700 w-full"
            >
              <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200 text-left shadow-xs">
                <span className="text-zinc-500 block mb-1 font-semibold text-[10px] uppercase">
                  Shielded Volume (7D)
                </span>
                <span className="text-black font-bold text-base tabular-nums">
                  $<AnimatedCounter value={1845920} decimals={0} />
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200 text-left shadow-xs">
                <span className="text-zinc-500 block mb-1 font-semibold text-[10px] uppercase">
                  WASM Prover Time
                </span>
                <span className="text-black font-bold text-base tabular-nums flex items-center gap-1">
                  1.38s <span className="text-xs font-normal text-emerald-600">(-32%)</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200 text-left shadow-xs">
                <span className="text-zinc-500 block mb-1 font-semibold text-[10px] uppercase">
                  Proof Engine
                </span>
                <span className="text-black font-bold text-base tabular-nums">
                  BLS12-381 ZK
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200 text-left shadow-xs">
                <span className="text-zinc-500 block mb-1 font-semibold text-[10px] uppercase">
                  1AM Connector
                </span>
                <span className="text-black font-bold text-base tabular-nums flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> v4.0.1 Official
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
            <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
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
              Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
              Privacy by Cryptographic Guarantee
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Unlike public ledgers where every invoice and balance is indexed forever, Cyphra uses Midnight zero-knowledge cryptography to preserve complete financial discretion.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-zinc-50/60 border border-zinc-200 hover:border-black transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-black mb-2">Confidential Transfers</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Transfers execute using Compact note commitments and spent nullifiers. Neither sender, recipient, nor transfer amounts are revealed on-chain.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50/60 border border-zinc-200 hover:border-black transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-black mb-2">Private Invoices & QR</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Generate cryptographic invoices with encrypted memos. Payers settle seamlessly through 1AM Wallet with zero-knowledge proof verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50/60 border border-zinc-200 hover:border-black transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-black mb-2">Selective Auditing</h3>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
              Public Blockchains vs. Cyphra on Midnight
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-700">
                  <th className="p-4 font-bold">CAPABILITY</th>
                  <th className="p-4 font-semibold text-zinc-500">PUBLIC BLOCKCHAINS</th>
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

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            Ready to experience confidential payments?
          </h2>
          <p className="mt-3 text-zinc-600 text-sm sm:text-base max-w-md mx-auto">
            Connect your 1AM Wallet extension to access private shielded balances on Midnight.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="px-8 py-3.5 font-bold text-sm bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-sm"
              >
                Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
