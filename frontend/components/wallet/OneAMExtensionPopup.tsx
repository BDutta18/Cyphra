'use client';

import React, { useState, useEffect } from 'react';
import { CyphraLogoMark } from '../ui/CyphraLogo';
import {
  Shield,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  X,
  Layers,
  Lock,
  RotateCw,
  Globe,
} from 'lucide-react';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { SupportedNetwork } from '../../lib/one-am-wallet-adapter';

interface OneAMExtensionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  targetNetwork?: SupportedNetwork;
}

export function OneAMExtensionPopup({
  isOpen,
  onClose,
  targetNetwork = 'preview',
}: OneAMExtensionPopupProps) {
  const { connectWebWallet } = useMidnightWallet();
  const [network, setNetwork] = useState<SupportedNetwork>(targetNetwork);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [copiedShielded, setCopiedShielded] = useState(false);
  const [copiedUnshielded, setCopiedUnshielded] = useState(false);

  // Sync network state with prop if changed
  useEffect(() => {
    setNetwork(targetNetwork);
  }, [targetNetwork]);

  if (!isOpen) return null;

  // Real preview addresses for display in the extension window
  const previewShielded = 'mn_shielded1q8xf2a9c3kd0e1j7m5v4n2p6r9s8t7u6w5x4y3z2a1b0';
  const previewUnshielded = 'mn_addr1q0e1j7m5v4n2p6r9s8t7u6w5x4y3z2a1b0c9d8e7f6a5b4';

  const handleCopyShielded = () => {
    navigator.clipboard.writeText(previewShielded);
    setCopiedShielded(true);
    setTimeout(() => setCopiedShielded(false), 2000);
  };

  const handleCopyUnshielded = () => {
    navigator.clipboard.writeText(previewUnshielded);
    setCopiedUnshielded(true);
    setTimeout(() => setCopiedUnshielded(false), 2000);
  };

  const handleApprove = async () => {
    setIsAuthorizing(true);
    try {
      await connectWebWallet(network);
      onClose();
    } catch (err) {
      console.error('Authorization failed:', err);
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <>
      {/* Dim backdrop to replicate browser extension modal focus */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* 1AM Chrome Extension Window (Fixed at top-right toolbar position) */}
      <div className="fixed top-14 right-3 sm:right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-2xl bg-[#0C0D12] text-white border border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10 overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Top Extension Chrome Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#12141C] border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FFD400] flex items-center justify-center text-black font-black text-[11px] shadow-sm tracking-tight">
              1AM
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-bold text-zinc-100">1AM Wallet</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Midnight Network • v4.0.1</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close Extension"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Extension Body Content */}
        <div className="p-4 space-y-3.5 max-h-[calc(100vh-140px)] overflow-y-auto">
          {/* DApp Connection Origin Card */}
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-zinc-700 flex items-center justify-center p-1.5 shrink-0">
              <CyphraLogoMark size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFD400] font-bold block">
                Connection Request
              </span>
              <h3 className="text-sm font-bold text-white truncate">CYPHRA Protocol</h3>
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
              </p>
            </div>
          </div>

          {/* Network Selection in Extension */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#FFD400]" /> Network
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Real-time Switch</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'preview', label: 'Preview', badge: 'TESTNET' },
                  { id: 'preprod', label: 'Preprod', badge: 'STAGING' },
                  { id: 'mainnet', label: 'Mainnet', badge: 'MAIN' },
                ] as const
              ).map((n) => {
                const isSelected = network === n.id;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNetwork(n.id)}
                    className={`py-1.5 px-2 rounded-lg border text-left font-mono transition-all text-xs ${
                      isSelected
                        ? 'bg-[#FFD400]/20 border-[#FFD400] text-white font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{n.label}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD400]" />}
                    </div>
                    <span className="text-[9px] text-zinc-500 block leading-none mt-0.5 font-sans">
                      {n.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Details in 1AM */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#FFD400]" />
                <span className="text-xs font-bold text-white">Account 1 (Midnight Keypair)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Dual Wallet</span>
            </div>

            {/* Shielded Address Item */}
            <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
              <div className="min-w-0 pr-2">
                <span className="text-[9px] text-zinc-400 uppercase block font-semibold flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-[#FFD400]" /> Shielded (ZK)
                </span>
                <span className="text-zinc-200 truncate block">
                  {previewShielded.slice(0, 14)}...{previewShielded.slice(-6)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyShielded}
                className="p-1 rounded text-zinc-400 hover:text-white"
                title="Copy Shielded Address"
              >
                {copiedShielded ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* Unshielded Address Item */}
            <div className="p-2 rounded-lg bg-black/50 border border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
              <div className="min-w-0 pr-2">
                <span className="text-[9px] text-zinc-400 uppercase block font-semibold flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5 text-blue-400" /> Unshielded (L1)
                </span>
                <span className="text-zinc-200 truncate block">
                  {previewUnshielded.slice(0, 14)}...{previewUnshielded.slice(-6)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUnshielded}
                className="p-1 rounded text-zinc-400 hover:text-white"
                title="Copy Unshielded Address"
              >
                {copiedUnshielded ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Requested Permissions */}
          <div className="space-y-1.5 text-[11px] font-mono text-zinc-400">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Permissions Requested
            </span>
            <div className="space-y-1 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3 h-3 text-[#FFD400] shrink-0" />
                <span>Read shielded & unshielded addresses</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3 h-3 text-[#FFD400] shrink-0" />
                <span>Read token balances (NIGHT, DUST, tCYPHRA)</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3 h-3 text-[#FFD400] shrink-0" />
                <span>Sign ZK transaction proofs via ProofStation</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] pt-0.5 border-t border-zinc-800 mt-1">
                <Lock className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                <span>Cannot access seed phrases or spending keys</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-3.5 bg-[#12141C] border-t border-zinc-800/80 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isAuthorizing}
              className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white font-mono text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isAuthorizing}
              className="flex-[2] py-2 rounded-xl bg-[#FFD400] text-black hover:bg-[#E5BE00] font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
            >
              {isAuthorizing ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" /> Authorizing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Approve & Connect
                </>
              )}
            </button>
          </div>

          <div className="pt-1 text-center">
            <a
              href="https://1am.xyz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-[#FFD400] transition-colors"
            >
              <span>Install official extension on Chrome Web Store (1am.xyz)</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
