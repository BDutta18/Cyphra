'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { WalletConnectModal } from './WalletConnectModal';
import {
  ShieldCheck,
  ChevronDown,
  LogOut,
  Copy,
  Check,
  Wallet,
} from 'lucide-react';

export function WalletConnectButton() {
  const {
    isConnected,
    isConnecting,
    account,
    error,
    isConnectModalOpen,
    openConnectModal,
    closeConnectModal,
    disconnect,
  } = useMidnightWallet();

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCopy = () => {
    if (account?.shieldedAddress) {
      navigator.clipboard.writeText(account.shieldedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected || !account) {
    return (
      <>
        <div className="flex items-center gap-2">
          {error && (
            <span className="hidden lg:inline-flex text-[11px] font-mono text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {error.length > 35 ? `${error.slice(0, 35)}...` : error}
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            isLoading={isConnecting}
            onClick={openConnectModal}
            className="text-xs font-bold px-4 py-2 bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 mr-1.5" /> Connect 1AM Wallet
          </Button>
        </div>

        {/* 1AM Wallet Detection and Authorization Modal */}
        <WalletConnectModal
          isOpen={isConnectModalOpen}
          onClose={closeConnectModal}
        />
      </>
    );
  }

  const shortShielded = `${account.shieldedAddress.slice(0, 8)}...${account.shieldedAddress.slice(-6)}`;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-zinc-300 hover:border-black transition-colors text-xs font-mono text-zinc-900 shadow-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" /> {shortShielded}
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-500 ml-0.5" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-zinc-200 shadow-xl p-3.5 z-50 animate-in fade-in text-zinc-900">
            <div className="p-2 border-b border-zinc-200 mb-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">Connected Wallet</span>
                <span className="font-bold text-black font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 1AM Wallet
                </span>
              </div>
              <div className="mt-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200 font-mono text-[11px] text-zinc-800 break-all flex items-center justify-between gap-1">
                <span className="truncate">{account.shieldedAddress}</span>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-black text-zinc-500 transition-colors"
                  title="Copy Address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between px-2 py-1 text-zinc-600">
                <span>Network:</span>
                <span className="text-black uppercase font-bold">{account.networkId}</span>
              </div>
              <div className="flex justify-between px-2 py-1 text-zinc-600">
                <span>DApp API:</span>
                <span className="text-zinc-800 font-semibold">1AM Connector v4.0.1</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-200 flex gap-1.5">
              <button
                onClick={() => {
                  disconnect();
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Disconnect 1AM
              </button>
            </div>
          </div>
        )}
      </div>

      <WalletConnectModal
        isOpen={isConnectModalOpen}
        onClose={closeConnectModal}
      />
    </>
  );
}

