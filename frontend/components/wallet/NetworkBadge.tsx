'use client';

import React from 'react';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';

export function NetworkBadge() {
  const { network, setNetwork, isConnected, connect } = useMidnightWallet();
  const [isOpen, setIsOpen] = React.useState(false);
  const activeNet = network || 'preview';
  const displayNet = activeNet.toUpperCase();

  const networks: { id: 'preview' | 'preprod' | 'mainnet'; label: string; desc: string }[] = [
    { id: 'preview', label: 'PREVIEW', desc: 'Pre-release testnet' },
    { id: 'preprod', label: 'PREPROD', desc: 'Staging environment' },
    { id: 'mainnet', label: 'MAINNET', desc: 'Production ledger' },
  ];

  const handleSelect = async (net: 'preview' | 'preprod' | 'mainnet') => {
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
        title="Click to switch Midnight network"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
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
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-zinc-200 shadow-xl py-1.5 z-50 text-left font-mono">
            <div className="px-3 py-1 text-[10px] text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-100">
              Midnight Consensus
            </div>
            {networks.map((net) => {
              const isSelected = activeNet === net.id;
              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => handleSelect(net.id)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 font-bold text-black'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-emerald-500' : 'bg-zinc-300'
                        }`}
                      />
                      <span>{net.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-sans block pl-3">
                      {net.desc}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-black font-bold">ACTIVE</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
