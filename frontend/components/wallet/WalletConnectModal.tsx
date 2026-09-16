'use client';

import React from 'react';
import Image from 'next/image';
import { Modal } from '../ui/Modal';
import { Shield, ExternalLink, Wallet, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  isAvailable: boolean;
}

export function WalletConnectModal({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
  isAvailable,
}: WalletConnectModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect 1AM Wallet">
      <div className="space-y-4 text-zinc-900">
        <p className="text-xs text-zinc-600">
          CYPHRA integrates with the official 1AM Wallet extension for Midnight. All zero-knowledge transactions and note commitments are authorized through 1AM.
        </p>

        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="1AM Wallet"
                width={34}
                height={34}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-black">1AM Wallet</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-yellow text-black border border-black/15">
                  Required
                </span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {isAvailable ? 'Extension Detected in Browser' : 'Extension Not Detected'}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full font-bold text-xs py-2 bg-brand-yellow text-black hover:bg-brand-hover shadow-sm"
            isLoading={isConnecting}
            onClick={async () => {
              await onConnect();
              onClose();
            }}
          >
            <Wallet className="w-3.5 h-3.5 mr-1.5" /> Authorize 1AM Connection
          </Button>
        </div>

        <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5 text-zinc-700 font-medium">
            <Shield className="w-3.5 h-3.5 text-black" /> Compact ZK-Proof Engine
          </span>
          <a
            href="https://docs.midnight.network"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-black font-semibold hover:underline"
          >
            1AM Docs <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
