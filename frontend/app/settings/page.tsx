'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { SupportedNetwork } from '../../lib/one-am-wallet-adapter';
import {
  Globe,
  Key,
  Check,
  Cpu,
  Lock,
} from 'lucide-react';



export default function SettingsPage() {
  const { account, network, connect, disconnect } = useMidnightWallet();
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>((network as SupportedNetwork) || 'preprod');
  const [isSwitching, setIsSwitching] = useState(false);
  const [devMode, setDevMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cyphra_dev_mode') === 'true';
    }
    return false;
  });

  const toggleDevMode = () => {
    setDevMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('cyphra_dev_mode', String(next));
      }
      return next;
    });
  };

  const handleNetworkSwitch = async (net: SupportedNetwork) => {
    setSelectedNetwork(net);
    setIsSwitching(true);
    try {
      await connect(net);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 text-zinc-900">
        {/* Header */}
        <div className="pb-3 border-b border-zinc-200">
          <h1 className="text-xl font-black text-black tracking-tight font-sans">
            Settings & Protocol Configuration
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
            Manage Midnight RPC network endpoints, 1AM Wallet connection, and zero-knowledge parameters.
          </p>
        </div>

        {/* Network Selection */}
        <Card className="space-y-4 bg-white border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-200">
            <Globe className="w-4 h-4 text-black" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-bold">
              Midnight Consensus Network
            </h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-2.5">
            {[
              { id: 'preprod' as SupportedNetwork, name: 'Midnight Preprod', desc: 'Pre-production Testnet' },
              { id: 'preview' as SupportedNetwork, name: 'Midnight Preview', desc: 'Pre-release Preview Network' },
              { id: 'mainnet' as SupportedNetwork, name: 'Midnight Mainnet', desc: 'Production Confidential Ledger' },
            ].map((net) => {
              const isSelected = selectedNetwork === net.id;
              return (
                <motion.button
                  key={net.id}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNetworkSwitch(net.id)}
                  className={`p-3 rounded-xl border text-left transition-colors font-mono shadow-xs relative ${
                    isSelected
                      ? 'bg-[#FFD400]/20 border-black text-black'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black hover:border-black'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-black">{net.name}</span>
                    {isSelected && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 block font-sans font-medium">{net.desc}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono space-y-1.5 text-zinc-600">
            <div className="flex justify-between">
              <span>Indexer GraphQL:</span>
              <span className="text-black font-semibold truncate max-w-[280px]">
                https://indexer.{selectedNetwork}.midnight.network/graphql
              </span>
            </div>
            <div className="flex justify-between">
              <span>Prover Service:</span>
              <span className="text-black font-semibold truncate max-w-[280px]">
                https://prover.{selectedNetwork}.midnight.network
              </span>
            </div>
          </div>
        </Card>

        {/* Verified Preprod Contract */}
        <Card className="space-y-4 bg-white border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-black" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-bold">
                Midnight Preprod Contract
              </h3>
            </div>
            <Badge variant="green" size="sm">Verified</Badge>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-zinc-500 block mb-1 font-semibold">Contract Address:</span>
              <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 font-mono text-[11px] text-black break-all select-all font-bold">
                0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href="https://explorer.1am.xyz/contract/0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f?network=preprod"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 hover:border-black bg-zinc-50 hover:bg-zinc-100 transition-colors font-sans text-xs font-semibold text-black"
              >
                <span>1AM Explorer</span>
                <span className="text-[11px] font-mono text-zinc-500">View &rarr;</span>
              </a>

              <a
                href="https://preprod.midnightexplorer.com/contracts/0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 hover:border-black bg-zinc-50 hover:bg-zinc-100 transition-colors font-sans text-xs font-semibold text-black"
              >
                <span>Midnight Explorer</span>
                <span className="text-[11px] font-mono text-zinc-500">View &rarr;</span>
              </a>
            </div>
          </div>
        </Card>

        {/* 1AM Wallet Keys Inspection */}
        <Card className="space-y-4 bg-white border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-black" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-bold">
                1AM Wallet Cryptographic Keys
              </h3>
            </div>
            {account && (
              <Badge variant="green" size="sm" pulseDot>
                Connected
              </Badge>
            )}
          </div>

          {account ? (
            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block mb-1 font-semibold">Shielded Coin Public Key:</span>
                <span className="text-[11px] text-black break-all p-2 rounded-lg bg-zinc-50 border border-zinc-200 block font-bold">
                  {account.shieldedCoinPublicKey}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1 font-semibold">Shielded Encryption Public Key:</span>
                <span className="text-[11px] text-black break-all p-2 rounded-lg bg-zinc-50 border border-zinc-200 block font-bold">
                  {account.shieldedEncryptionPublicKey}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1 font-semibold">DUST Address (Gas Balancing):</span>
                <span className="text-[11px] text-black break-all p-2 rounded-lg bg-zinc-50 border border-zinc-200 block font-bold">
                  {account.dustAddress}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs font-mono text-zinc-400 py-4 text-center">
              Connect 1AM Wallet to inspect active cryptographic public keys and addresses.
            </p>
          )}
        </Card>

        {/* Developer Mode & Circuit Telemetry */}
        <Card className="space-y-4 bg-white border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-black" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-bold">
                Developer & Circuit Debugger Mode
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-500">
                {devMode ? 'Active' : 'Disabled'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={devMode}
                onClick={toggleDevMode}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  devMode ? 'bg-[#FFD400]' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    devMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-600 font-sans">
            Enable advanced cryptographic inspection, circuit nullifier logs, and raw witness payloads across transactions.
          </p>

          {devMode && (
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <div className="p-3 bg-zinc-900 text-zinc-200 rounded-xl text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-yellow-400 font-bold border-b border-zinc-800 pb-1.5">
                  <span>CIRCUIT SPECIFICATION</span>
                  <span>COMPACT 0.31.1</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-zinc-500 block">Curve:</span>
                    <span className="text-white">BLS12-381 / Jubjub</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Hash Engine:</span>
                    <span className="text-white">Poseidon (4:1)</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Commitment Tree:</span>
                    <span className="text-white">Merkle Tree (depth 32)</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Active Circuits:</span>
                    <span className="text-white">6 Verified (Groth16)</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">VERIFIED CIRCUITS:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {['mint', 'deposit', 'send', 'withdraw', 'create_invoice', 'pay_invoice'].map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-zinc-800 text-yellow-300 text-[10px] font-mono">
                        {c}()
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 1AM Wallet Disconnect Option */}
        {account && (
          <Card className="border-red-200 bg-red-50/50 flex items-center justify-between p-4 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-red-900">Disconnect 1AM Wallet</h4>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                Clears the active session and disconnects from Midnight DApp connector.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={disconnect}
              className="text-xs font-mono font-bold"
            >
              Disconnect
            </Button>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
