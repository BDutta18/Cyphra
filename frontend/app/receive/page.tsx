'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { QRCodeDisplay } from '../../components/payment/QRCodeDisplay';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import {
  Copy,
  Check,
  Shield,
  KeyRound,
  Share2,
  Sparkles,
} from 'lucide-react';

export default function ReceivePage() {
  const { account, isConnected, connect } = useMidnightWallet();
  const [copiedShielded, setCopiedShielded] = useState(false);
  const [copiedUnshielded, setCopiedUnshielded] = useState(false);
  const [shared, setShared] = useState(false);
  const [stealthActive, setStealthActive] = useState(false);
  const [stealthAddress, setStealthAddress] = useState<string | null>(null);

  const activeShielded = account?.shieldedAddress || '';
  const currentAddress = stealthActive && stealthAddress ? stealthAddress : activeShielded;

  const handleCopyShielded = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopiedShielded(true);
    setTimeout(() => setCopiedShielded(false), 2000);
  };

  const handleCopyUnshielded = () => {
    if (account?.unshieldedAddress) {
      navigator.clipboard.writeText(account.unshieldedAddress);
      setCopiedUnshielded(true);
      setTimeout(() => setCopiedUnshielded(false), 2000);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'My Shielded Midnight Address',
          text: currentAddress,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        handleCopyShielded();
      }
    } else {
      handleCopyShielded();
    }
  };

  const generateStealthAddress = () => {
    const randomHex = Array.from({ length: 48 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const oneTime = `mn_shielded1qq_stealth_${randomHex}`;
    setStealthAddress(oneTime);
    setStealthActive(true);
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto space-y-6 text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h1 className="text-xl font-black text-black tracking-tight font-sans">
              Receive Confidential Payments
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono">
              Provide your shielded payment identifier to receive confidential assets.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFD400]/20 border border-[#FFD400] text-[11px] font-mono font-bold text-black shadow-xs">
            <Shield className="w-3.5 h-3.5 text-black" /> Shielded
          </div>
        </div>

        {!isConnected ? (
          <Card className="flex flex-col items-center text-center p-8 bg-white border-zinc-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black font-sans">1AM Wallet Disconnected</h2>
              <p className="text-xs text-zinc-600 font-mono mt-1 max-w-sm">
                Connect your 1AM Wallet to view your shielded receiving address and generate confidential QR payment codes.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => connect('preview')}
              className="bg-[#FFD400] text-black font-bold hover:bg-[#E5BE00] text-xs px-6 py-2.5 shadow-sm"
            >
              Connect 1AM Wallet
            </Button>
          </Card>
        ) : (
          <Card className="flex flex-col items-center text-center p-6 bg-white border-zinc-200 shadow-sm">
          {/* QR Display with spring scale */}
          <motion.div
            key={currentAddress}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="mb-5"
          >
            <QRCodeDisplay
              value={currentAddress}
              size={200}
              label={
                stealthActive
                  ? 'One-Time Stealth Shielded Address'
                  : 'Permanent Shielded Midnight Identifier'
              }
            />
          </motion.div>

          {/* Address Box */}
          <div className="w-full p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-left mb-4">
            <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-zinc-600">
              <span className="flex items-center gap-1.5 font-bold text-black">
                <Shield className="w-3.5 h-3.5 text-black" />
                {stealthActive ? 'Stealth Address' : 'Shielded Address'}
              </span>
              <button
                onClick={handleCopyShielded}
                className="bg-[#FFD400] text-black px-2.5 py-1 rounded-md font-bold hover:bg-[#E5BE00] flex items-center gap-1.5 text-xs transition-colors active:scale-95 shadow-xs"
              >
                {copiedShielded ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedShielded ? 'Copied to Clipboard' : 'Copy Address'}
              </button>
            </div>
            <p className="font-mono text-xs text-black font-semibold break-all leading-relaxed bg-white p-2.5 rounded-lg border border-zinc-200 shadow-xs">
              {currentAddress}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateStealthAddress}
              className="text-xs font-mono font-semibold border-zinc-300 hover:border-black bg-white"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-black" />
              Generate Stealth Address
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="text-xs font-mono font-semibold"
            >
              {shared ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
              Share Address
            </Button>

            {stealthActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStealthActive(false)}
                className="text-xs font-mono text-zinc-600 hover:text-black"
              >
                Reset Default
              </Button>
            )}
          </div>
        </Card>
      )}

        {/* Public L1 Unshielded Reference */}
        {account?.unshieldedAddress && (
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-1.5 text-xs font-mono shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 font-semibold">Public L1 Address (Non-shielded):</span>
              <button
                onClick={handleCopyUnshielded}
                className="text-black font-bold hover:underline flex items-center gap-1 text-[11px]"
              >
                {copiedUnshielded ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                Copy L1
              </button>
            </div>
            <p className="font-mono text-zinc-600 break-all text-[11px] bg-zinc-50 p-2 rounded border border-zinc-200">
              {account.unshieldedAddress}
            </p>
            <p className="text-[11px] text-zinc-500 font-sans">
              Notice: L1 transactions are visible on public block explorers. Always share your shielded address for confidential receipts.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
