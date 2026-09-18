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
    connectDemo,
    isConnecting,
    isWalletAvailable,
    isDetecting,
    detectedApi,
    detectWallet,
    network: currentNetwork,
    setNetwork: setGlobalNetwork,
    isSyncing,
    syncProgress,
    error,
    clearError,
  } = useMidnightWallet();

  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>(currentNetwork || 'preprod');
  const [localError, setLocalError] = useState<string | null>(null);

  // Re-detect on modal open (instant check first, short 400ms polling fallback)
  useEffect(() => {
    if (isOpen) {
      clearError();
      setLocalError(null);
      detectWallet(400);
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
    await detectWallet(600);
  };

  const handleConnectDemo = async () => {
    clearError();
    setLocalError(null);
    try {
      setGlobalNetwork(selectedNetwork);
      await connectDemo(selectedNetwork);
      if (onConnectSuccess) {
        onConnectSuccess();
      }
      onClose();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
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
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <p className="leading-snug">{localError || error}</p>
              </div>
              {((localError || error)?.includes('network') || (localError || error)?.includes('configured for')) && (
                <div className="pt-2 border-t border-red-200/60 flex flex-col gap-1.5 font-mono text-[11px]">
                  <p className="text-zinc-700 font-sans">
                    <strong>Quick Switch:</strong> Select your desired active network:
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNetwork('preview');
                        setGlobalNetwork('preview');
                        connect('preview')
                          .then(() => {
                            if (onConnectSuccess) onConnectSuccess();
                            onClose();
                          })
                          .catch((e: unknown) => {
                            setLocalError(e instanceof Error ? e.message : String(e));
                          });
                      }}
                      className="px-2.5 py-1 rounded bg-[#FFD400] text-black font-bold hover:bg-[#E5BE00] transition-colors text-xs"
                    >
                      Connect on Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNetwork('preprod');
                        setGlobalNetwork('preprod');
                        connect('preprod')
                          .then(() => {
                            if (onConnectSuccess) onConnectSuccess();
                            onClose();
                          })
                          .catch((e: unknown) => {
                            setLocalError(e instanceof Error ? e.message : String(e));
                          });
                      }}
                      className="px-2.5 py-1 rounded bg-black text-white font-bold hover:bg-zinc-800 transition-colors text-xs"
                    >
                      Connect on Preprod
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                    To change network in 1AM Wallet: Click the 1AM icon in your browser toolbar and toggle the network dropdown at the top to your preferred network.
                  </p>
                </div>
              )}

              {((localError || error)?.toLowerCase().includes('sync')) && (
                <div className="pt-2 border-t border-amber-200 flex flex-col gap-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-700 shrink-0" />
                      <span>1AM Wallet Syncing Midnight Preprod Blocks</span>
                    </div>
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.max(5, syncProgress)}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-amber-700">
                        {syncProgress < 100
                          ? `Auto-reconnecting when sync completes… (${syncProgress}%)`
                          : '✓ Sync complete — reconnecting now…'}
                      </p>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-snug">
                      The 1AM extension is scanning testnet blocks on first open. Cyphra will <strong>reconnect automatically</strong> — no action needed.
                    </p>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleConnectDemo}
                      className="w-full bg-[#FFD400] text-black hover:bg-[#E5BE00] font-bold text-xs py-2 shadow-xs"
                    >
                      ⚡ Skip sync — Use Instant Preprod Demo (Aarav Sharma)
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-1 space-y-2.5">
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

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                <span className="bg-zinc-50 px-2">or quick review</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full font-bold text-xs py-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300"
              isLoading={isConnecting}
              onClick={handleConnectDemo}
            >
              <Shield className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Launch Instant Preprod Demo (Aarav Sharma)
            </Button>
            <p className="text-[10px] text-zinc-500 text-center font-mono">
              Zero-lag testing with 1,500 NIGHT &amp; 120 DUST pre-funded balance
            </p>
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
