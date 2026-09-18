'use client';

import React, { useState } from 'react';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export function NetworkBadge() {
  const { network, setNetwork, isConnected, connect } = useMidnightWallet();
  const [isOpen, setIsOpen] = useState(false);
  const activeNet = network || 'preprod';
  const displayNet = activeNet.toUpperCase();

  const networks: {
    id: 'preprod' | 'preview' | 'mainnet';
    label: string;
    desc: string;
    supported: boolean;
  }[] = [
    {
      id: 'preprod',
      label: 'PREPROD',
      desc: 'Active Midnight Preprod Ledger',
      supported: true,
    },
    {
      id: 'preview',
      label: 'PREVIEW',
      desc: 'Disabled (Preprod only deployment)',
      supported: false,
    },
    {
      id: 'mainnet',
      label: 'MAINNET',
      desc: 'Upcoming Production Ledger',
      supported: false,
    },
  ];

  const handleSelect = async (net: 'preview' | 'preprod' | 'mainnet', supported: boolean) => {
    if (!supported) return; // Prevent switching to unsupported networks
    setIsOpen(false);
    setNetwork(net);
    if (isConnected) {
      try {
        await connect(net);
      } catch (err) {
        console.warn('Network switch error:', err);
      }
    }
  };

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider bg-[#FFD400] hover:bg-[#E5BE00] text-black border border-black/15 shadow-xs transition-colors cursor-pointer"
        title="Midnight Preprod Active Ledger (0xcc4a293...)"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
        <span>{displayNet}</span>
        <svg
          className={`w-3 h-3 text-black transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white border border-zinc-200 shadow-xl py-1.5 z-50 text-left font-mono">
            <div className="px-3 py-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-100 flex items-center justify-between">
              <span>Midnight Consensus</span>
              <span className="text-emerald-600 font-bold">LIVE</span>
            </div>
            {networks.map((net) => {
              const isSelected = activeNet === net.id;
              return (
                <button
                  key={net.id}
                  type="button"
                  disabled={!net.supported}
                  onClick={() => handleSelect(net.id, net.supported)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 font-bold text-black cursor-default'
                      : net.supported
                      ? 'text-zinc-700 hover:bg-zinc-50 hover:text-black cursor-pointer'
                      : 'text-zinc-400 bg-zinc-50/50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? 'bg-emerald-500 ring-2 ring-emerald-200'
                            : net.supported
                            ? 'bg-zinc-300'
                            : 'bg-zinc-200'
                        }`}
                      />
                      <span>{net.label}</span>
                      {!net.supported && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-200 text-zinc-500 font-sans uppercase">
                          Disabled
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans block pl-3">
                      {net.desc}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
            <div className="p-2 border-t border-zinc-100 mt-1 bg-zinc-50 text-[10px] text-zinc-500 font-mono">
              <span className="font-bold text-zinc-700 block">Contract:</span>
              <span className="truncate block font-mono text-[9px] text-zinc-600">0xcc4a2930...db3f</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
