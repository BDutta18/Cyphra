'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { QRCodeDisplay } from './QRCodeDisplay';
import { TokenType, PaymentRequest, encodePaymentRequest } from '../../lib/cyphra-types';
import { usePaymentRequest } from '../../hooks/usePaymentRequest';
import { QrCode, Copy, Check, Share2, AlertCircle } from 'lucide-react';

export interface PaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: { shieldedAddress: string } | null;
}

export function PaymentRequestModal({ isOpen, onClose, account }: PaymentRequestModalProps) {
  const { createRequest, isLoading, error } = usePaymentRequest(account);
  const [amount, setAmount] = useState('');
  const [tokenType, setTokenType] = useState<TokenType>('NIGHT');
  const [note, setNote] = useState('');
  const [expiryHours, setExpiryHours] = useState(24);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    request: PaymentRequest;
    paymentUri: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    try {
      const res = await createRequest({
        recipientAddress: account.shieldedAddress,
        amount,
        tokenType,
        memo: note || undefined,
        expiryHours,
      });
      setCreatedResult(res);
    } catch (err) {
      console.error('Failed to create payment request:', err);
    }
  };

  const handleCopy = () => {
    if (!createdResult) return;
    navigator.clipboard.writeText(createdResult.paymentUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!createdResult) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `CYPHRA Invoice: ${createdResult.request.amount} ${createdResult.request.tokenType}`,
          text: `Confidential payment request for ${createdResult.request.amount} ${createdResult.request.tokenType}`,
          url: createdResult.paymentUri,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleReset = () => {
    setCreatedResult(null);
    setAmount('');
    setNote('');
    setCopied(false);
    setShared(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={createdResult ? 'Confidential Payment QR' : 'Create Payment Request'}
    >
      {createdResult ? (
        <div className="space-y-4 animate-in fade-in text-zinc-900">
          <QRCodeDisplay
            value={createdResult.paymentUri}
            label={`Requesting ${createdResult.request.amount} ${createdResult.request.tokenType}`}
          />

          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-600">
              <span>Identifier:</span>
              <span className="text-black font-bold truncate max-w-[200px]">
                {createdResult.request.id}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Asset:</span>
              <span className="text-black font-bold">
                {createdResult.request.amount} {createdResult.request.tokenType}
              </span>
            </div>
            {createdResult.request.memo && (
              <div className="flex justify-between text-zinc-600">
                <span>Note:</span>
                <span className="text-black italic">{createdResult.request.memo}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Expires:</span>
              <span className="text-black font-semibold">
                {new Date(createdResult.request.expiresAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600 pt-1 border-t border-zinc-200">
              <span>Status:</span>
              <span className="text-amber-700 font-bold uppercase">Unpaid / Pending</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs font-bold border-zinc-300 hover:border-black"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Copied URI' : 'Copy Request URI'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="text-xs font-bold"
            >
              {shared ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 mr-1.5" />}
              Share Request
            </Button>
          </div>

          <Button variant="primary" className="w-full font-bold bg-[#FFD400] text-black hover:bg-[#E5BE00]" onClick={handleReset}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-zinc-900">
          <Input
            label="Amount"
            type="number"
            step="0.000001"
            min="0.000001"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            rightElement={
              <select
                value={tokenType}
                onChange={(e) => setTokenType(e.target.value as TokenType)}
                className="bg-white border border-zinc-300 text-black text-xs font-mono font-bold rounded px-2 py-1 outline-none cursor-pointer"
              >
                <option value="NIGHT">NIGHT</option>
                <option value="DUST">DUST</option>
                <option value="tCYPHRA">tCYPHRA</option>
              </select>
            }
          />

          <Input
            label="Optional Private Note / Invoice Memo"
            placeholder="e.g. Audit milestone consultation #2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            hint="Stored locally and transmitted peer-to-peer via QR/URI. Never in a public database."
          />

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5 font-sans">
              Expiration Window
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 6, 24, 168].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setExpiryHours(hours)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors ${
                    expiryHours === hours
                      ? 'bg-[#FFD400] border-black text-black shadow-xs'
                      : 'bg-white border-zinc-300 text-zinc-700 hover:border-black'
                  }`}
                >
                  {hours === 168 ? '7 Days' : `${hours}h`}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 font-bold bg-[#FFD400] text-black hover:bg-[#E5BE00] shadow-xs"
            isLoading={isLoading}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <QrCode className="w-4 h-4 mr-1.5" /> Generate Confidential Request
          </Button>
        </form>
      )}
    </Modal>
  );
}
