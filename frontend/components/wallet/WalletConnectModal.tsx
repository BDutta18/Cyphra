'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Shield,
  ExternalLink,
  Wallet,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Globe,
  Radio,
  Check,
} from 'lucide-react';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { SupportedNetwork } from '../../lib/one-am-wallet-adapter';



export interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectSuccess?: () => void;
}

export function WalletConnectModal({
  isOpen,
  onClose,
  onConnectSuccess,
}: WalletConnectModalProps) {
  const {
    connect,
    isConnecting,
    isWalletAvailable,
    isDetecting,
    detectedApi,
    detectWallet,
    network: currentNetwork,
    setNetwork: setGlobalNetwork,
    error,
    clearError,
  } = useMidnightWallet();

  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>(currentNetwork || 'preview');
  const [localError, setLocalError] = useState<string | null>(null);

  // Re-detect on modal open
  useEffect(() => {
    if (isOpen) {
      clearError();
      setLocalError(null);
      detectWallet(1500);
    }
  }, [isOpen, detectWallet, clearError]);

  const handleAuthorize = async () => {
    clearError();
    setLocalError(null);
    try {
      setGlobalNetwork(selectedNetwork);
      await connect(selectedNetwork);
      if (onConnectSuccess) {
        onConnectSuccess();
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes('reject') ||
        msg.toLowerCase().includes('cancel') ||
        msg.toLowerCase().includes('user denied')
      ) {
        setLocalError('Connection request was declined in 1AM Wallet. Click Authorize to try again.');
      } else {
        setLocalError(msg);
      }
    }
  };

  const handleManualRedetect = async () => {
    setLocalError(null);
    await detectWallet(2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect 1AM Wallet">
      <div className="space-y-4 text-zinc-900 font-sans">
        <p className="text-xs text-zinc-600 leading-relaxed">
          CYPHRA connects securely to your <strong>1AM Wallet</strong> for Midnight. Connecting prompts the extension to authorize session access without exposing private keys or seed phrases.
        </p>

        {/* 1AM Wallet Detection Box */}
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center p-1.5 shadow-xs shrink-0">
                <Image
                  src="/logo.png"
                  alt="1AM Wallet"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-black">
                    {detectedApi?.name || '1AM Wallet'}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-yellow text-black border border-black/15">
                    Midnight
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs font-mono">
                  {isDetecting ? (
                    <span className="text-zinc-500 flex items-center gap-1">
                      <RotateCw className="w-3 h-3 animate-spin text-zinc-600" />
                      Scanning for extension...
                    </span>
                  ) : isWalletAvailable ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      Extension Detected in Browser
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      Extension Not Detected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Re-detect button */}
            <button
              onClick={handleManualRedetect}
              disabled={isDetecting}
              title="Scan browser for 1AM Wallet extension"
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors text-xs font-mono flex items-center gap-1"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-[11px]">Re-detect</span>
            </button>
          </div>

          {/* Extension Details when detected */}
          {isWalletAvailable && detectedApi && (
            <div className="p-2.5 rounded-lg bg-white border border-zinc-200/80 font-mono text-[11px] text-zinc-600 space-y-1">
              <div className="flex justify-between">
                <span>DApp API:</span>
                <span className="font-semibold text-black">v{detectedApi.apiVersion || '4.0.1'}</span>
              </div>
              {detectedApi.rdns && (
                <div className="flex justify-between">
                  <span>Identifier:</span>
                  <span className="font-semibold text-zinc-800">{detectedApi.rdns}</span>
                </div>
              )}
            </div>
          )}

          {/* Network Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-mono font-semibold text-zinc-600 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Target Midnight Network
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              {(['preprod', 'preview', 'mainnet'] as SupportedNetwork[]).map((net) => {
                const isSelected = selectedNetwork === net;
                return (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setSelectedNetwork(net)}
                    className={`py-1.5 px-2 rounded-lg border font-bold uppercase transition-all text-center flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-[#FFD400]" />}
                    {net}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <p className="leading-snug">{localError || error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-1">
            {isWalletAvailable ? (
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold text-xs py-2.5 bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-sm"
                isLoading={isConnecting}
                onClick={handleAuthorize}
              >
                <Wallet className="w-4 h-4 mr-1.5" /> Authorize 1AM Connection
              </Button>
            ) : (
              <div className="space-y-2">
                <a
                  href="https://chromewebstore.google.com/detail/1am-wallet/gkkffocodidofhnoahkmplbfohcnonkn"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full font-bold text-xs py-2.5 bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" /> Install 1AM Wallet Extension
                  </Button>
                </a>
                <p className="text-[11px] text-zinc-500 text-center font-mono">
                  Once installed, click &quot;Re-detect&quot; above to connect.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1 text-zinc-700 font-medium">
            <Shield className="w-3.5 h-3.5 text-black" /> Non-Custodial DApp Connector
          </span>
          <a
            href="https://docs.midnight.network"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-black font-semibold hover:underline"
          >
            Midnight Docs <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
