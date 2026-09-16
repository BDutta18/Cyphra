'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { SupportedNetwork } from '../../lib/one-am-wallet-adapter';
import {
  ShieldCheck,
  ChevronDown,
  LogOut,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  Wallet,
  Globe,
  RotateCw,
} from 'lucide-react';

export function WalletConnectButton() {
  const {
    isConnected,
    isConnecting,
    isWalletAvailable,
    account,
    network,
    error,
    clearError,
    connect,
    disconnect,
  } = useMidnightWallet();

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'unavailable' | 'rejection' | 'wrong_network' | 'generic';
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'generic',
  });
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>('preview');

  const handleCopy = () => {
    if (account?.shieldedAddress) {
      navigator.clipboard.writeText(account.shieldedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    clearError();
    try {
      await connect(selectedNetwork);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('not detected') || msg.toLowerCase().includes('unavailable')) {
        setModalState({
          isOpen: true,
          title: '1AM Wallet Extension Required',
          description:
            'CYPHRA is built on Midnight and requires the official 1AM Wallet extension to maintain private balances, sign zero-knowledge proofs, and protect transaction confidentiality.',
          type: 'unavailable',
        });
      } else if (msg.toLowerCase().includes('reject') || msg.toLowerCase().includes('denied')) {
        setModalState({
          isOpen: true,
          title: 'Connection Authorization Rejected',
          description:
            'The connection prompt in your 1AM Wallet was closed or rejected. To access your shielded balances, please authorize the connection in the 1AM popup.',
          type: 'rejection',
        });
      } else if (msg.toLowerCase().includes('network')) {
        setModalState({
          isOpen: true,
          title: 'Network Switch Required',
          description: msg,
          type: 'wrong_network',
        });
      } else {
        setModalState({
          isOpen: true,
          title: 'Connection Failed',
          description: msg,
          type: 'generic',
        });
      }
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
            onClick={handleConnect}
            className="text-xs font-bold px-4 py-2 bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 mr-1.5" /> Connect 1AM Wallet
          </Button>
        </div>

        {/* 1AM Wallet Interaction Modal */}
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
          title={modalState.title}
        >
          <div className="space-y-4 text-xs font-sans text-zinc-900">
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                modalState.type === 'unavailable'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : modalState.type === 'rejection'
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-800'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  modalState.type === 'unavailable'
                    ? 'text-amber-600'
                    : modalState.type === 'rejection'
                    ? 'text-zinc-600'
                    : 'text-red-600'
                }`}
              />
              <div>
                <p className="text-zinc-700 leading-relaxed font-sans">{modalState.description}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 font-mono text-zinc-700">
              <div className="flex justify-between">
                <span>Official Wallet:</span>
                <span className="font-bold text-black">1AM Wallet (Midnight)</span>
              </div>
              <div className="flex justify-between">
                <span>Supported Networks:</span>
                <span className="font-bold text-black">Preview, Preprod, Mainnet</span>
              </div>
              <div className="flex justify-between">
                <span>Specification:</span>
                <span className="font-bold text-black">@midnight-ntwrk/dapp-connector-api v4.0.1</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href="https://docs.midnight.network"
                target="_blank"
                rel="noreferrer"
                className="flex-1"
              >
                <Button variant="secondary" size="md" className="w-full text-xs font-semibold">
                  Midnight Docs <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </a>
              <Button
                variant="primary"
                size="md"
                className="flex-1 text-xs font-bold bg-[#FFD400] text-black hover:bg-[#E5BE00]"
                onClick={() => {
                  setModalState((prev) => ({ ...prev, isOpen: false }));
                  handleConnect();
                }}
              >
                <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Retry Connection
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  const shortShielded = `${account.shieldedAddress.slice(0, 8)}...${account.shieldedAddress.slice(-6)}`;

  return (
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
  );
}
