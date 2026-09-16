'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProofProgressModal } from '../../components/payment/ProofProgressModal';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { usePrivateBalance } from '../../hooks/usePrivateBalance';
import { useConfidentialTransfer } from '../../hooks/useConfidentialTransfer';
import { TokenType } from '../../lib/cyphra-types';
import {
  Send,
  Lock,
  ShieldCheck,
  Zap,
  Info,
  ArrowLeft,
  Check,
  Cpu,
} from 'lucide-react';

export default function SendPage() {
  const { account, isConnected, connect } = useMidnightWallet();
  const balances = usePrivateBalance(account);
  const { sendPayment, isProving, step, lastResult, error, reset } = useConfidentialTransfer(account);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenType, setTokenType] = useState<TokenType>('NIGHT');
  const [memo, setMemo] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Review step state
  const [isReviewing, setIsReviewing] = useState(false);

  const handleMaxAmount = () => {
    if (tokenType === 'NIGHT') setAmount(balances.shieldedNight.replace(/,/g, ''));
    if (tokenType === 'DUST') setAmount(balances.shieldedDust.replace(/,/g, ''));
    if (tokenType === 'tCYPHRA') setAmount(balances.shieldedtCyphra.replace(/,/g, ''));
  };

  const handleGoToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Address format validation
    if (!recipient.startsWith('mn_shielded1') && !recipient.startsWith('mn_addr1')) {
      setValidationError('Recipient must be a valid Midnight address (starting with mn_shielded1 or mn_addr1)');
      return;
    }

    // Amount validation
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid transfer amount');
      return;
    }

    // Balance validation
    const available =
      tokenType === 'NIGHT'
        ? balances.shieldedNight
        : tokenType === 'DUST'
          ? balances.shieldedDust
          : balances.shieldedtCyphra;
    const availableNum = parseFloat(available.replace(/,/g, ''));
    if (numAmount > availableNum) {
      setValidationError(`Insufficient ${tokenType} balance. You have ${available} ${tokenType} available.`);
      return;
    }

    setIsReviewing(true);
  };

  const handleConfirmAndSign = async () => {
    if (!isConnected) {
      connect('preview');
      return;
    }
    try {
      await sendPayment({
        recipientAddress: recipient,
        amount,
        tokenType,
        memo: memo || undefined,
      });
    } catch (err) {
      console.error('Send payment failed:', err);
    }
  };

  const assetOptions: TokenType[] = ['NIGHT', 'DUST', 'tCYPHRA'];

  return (
    <AppShell>
      <div className="max-w-xl mx-auto space-y-6 text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h1 className="text-xl font-black text-black tracking-tight font-sans">
              Send Confidential Payment
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono">
              Off-chain zero-knowledge witness generation via Compact circuits.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFD400]/20 border border-[#FFD400] text-[11px] font-mono font-bold text-black shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-black" /> 1AM ZK-Transfer
          </div>
        </div>

        {/* Step Progression Indicator */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className={`p-2 rounded-lg border text-center transition-colors ${!isReviewing ? 'bg-[#FFD400]/20 border-black font-bold text-black shadow-xs' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>
            1. Details
          </div>
          <div className={`p-2 rounded-lg border text-center transition-colors ${isReviewing && !isProving ? 'bg-[#FFD400]/20 border-black font-bold text-black shadow-xs' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>
            2. Review Ticket
          </div>
          <div className={`p-2 rounded-lg border text-center transition-colors ${isProving ? 'bg-[#FFD400]/20 border-black font-bold text-black shadow-xs' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>
            3. Midnight Proof
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isReviewing ? (
            /* Step 1: Payment Details Input */
            <motion.div
              key="step-details"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white border-zinc-200 shadow-sm">
                <form onSubmit={handleGoToReview} className="space-y-4">
                  {/* Recipient */}
                  <Input
                    label="Recipient Shielded Address"
                    placeholder="mn_shielded1qq..."
                    required
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value.trim());
                      setValidationError(null);
                    }}
                    error={validationError || undefined}
                    hint="Funds are committed directly to the recipient's private note"
                  />

                  {/* Asset Selector Segmented Tabs with Framer Motion */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-zinc-800 text-xs font-sans">
                      Select Asset
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-zinc-100 border border-zinc-200">
                      {assetOptions.map((tok) => (
                        <button
                          key={tok}
                          type="button"
                          onClick={() => setTokenType(tok)}
                          className={`relative py-1.5 text-xs font-mono font-bold rounded-md transition-colors ${
                            tokenType === tok ? 'text-black' : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          {tokenType === tok && (
                            <motion.div
                              layoutId="asset-select-pill"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              className="absolute inset-0 bg-[#FFD400] rounded-md shadow-xs border border-black/15 -z-0"
                            />
                          )}
                          <span className="relative z-10">{tok}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <label className="font-semibold text-zinc-800 font-sans">Amount</label>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <span>
                          Available:{' '}
                          <span className="text-black font-bold">
                            {tokenType === 'NIGHT'
                              ? balances.shieldedNight
                              : tokenType === 'DUST'
                              ? balances.shieldedDust
                              : balances.shieldedtCyphra}{' '}
                            {tokenType}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={handleMaxAmount}
                          className="text-black bg-[#FFD400] px-1.5 py-0.2 rounded font-bold text-[11px] hover:bg-[#E5BE00] transition-colors"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    <Input
                      type="number"
                      step="0.000001"
                      min="0.000001"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setValidationError(null);
                      }}
                      rightElement={
                        <span className="text-xs font-mono font-bold text-black px-2 py-1 bg-zinc-100 rounded border border-zinc-300">
                          {tokenType}
                        </span>
                      }
                    />
                  </div>

                  {/* Private Memo */}
                  <Input
                    label="Optional Private Memo"
                    placeholder="e.g. Consulting fee invoice #1042"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    hint="Encrypted with counterparty public key; never exposed on the public ledger"
                  />

                  {/* Technical Guarantees Box */}
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5 text-xs font-mono text-zinc-600">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5 text-black font-semibold">
                        <Lock className="w-3.5 h-3.5 text-black" /> Privacy Protection:
                      </span>
                      <span className="text-black font-bold">100% Shielded Note</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5 text-zinc-600">
                        <Zap className="w-3.5 h-3.5 text-zinc-400" /> Estimated Gas:
                      </span>
                      <span className="text-zinc-800 font-semibold">0.0038 DUST</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full text-sm font-bold bg-[#FFD400] text-black hover:bg-[#E5BE00] shadow-sm"
                    disabled={!amount}
                  >
                    Review Confidential Payment
                  </Button>
                </form>
              </Card>
            </motion.div>
          ) : (
            /* Step 2: Review & Confirm Ticket */
            <motion.div
              key="step-review"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white border-zinc-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <h3 className="text-sm font-bold text-black font-sans">
                    Review Settlement Ticket
                  </h3>
                  <button
                    onClick={() => setIsReviewing(false)}
                    className="text-xs text-zinc-600 hover:text-black font-mono font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-zinc-600 font-medium">Transfer Amount:</span>
                      <span className="text-2xl font-black text-black tabular-nums">
                        {amount} <span className="bg-[#FFD400] px-1.5 rounded">{tokenType}</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 pt-2 border-t border-zinc-200">
                      <span className="text-zinc-600 font-medium">Recipient Address:</span>
                      <span className="text-black text-[11px] break-all bg-white p-2 rounded border border-zinc-200 font-bold">
                        {recipient}
                      </span>
                    </div>

                    {memo && (
                      <div className="flex flex-col gap-1 pt-2 border-t border-zinc-200">
                        <span className="text-zinc-600 font-medium">Encrypted Memo:</span>
                        <span className="text-black text-xs italic bg-white p-2 rounded border border-zinc-200">
                          &quot;{memo}&quot;
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-zinc-200">
                      <span className="text-zinc-600">Circuit Operation:</span>
                      <span className="text-black font-bold">Compact: confidentialTransfer()</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-600">Gas Cost:</span>
                      <span className="text-black font-bold">0.0038 DUST (1AM Wallet)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] text-xs text-zinc-800 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed font-sans font-medium">
                      Upon clicking confirm, your 1AM Wallet will prompt you to authorize and balance the transaction. All note data remains confidential.
                    </span>
                  </div>
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setIsReviewing(false)}
                    className="w-1/3 text-xs font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleConfirmAndSign}
                    disabled={!isConnected || isProving}
                    className="w-2/3 text-xs font-bold bg-[#FFD400] text-black hover:bg-[#E5BE00] shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {isConnected ? 'Confirm & Sign with 1AM' : 'Connect 1AM to Send'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo address helper */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between text-xs font-mono text-zinc-600 shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-black" />
            <span>Need a test address?</span>
          </div>
          <button
            onClick={() => {
              setRecipient('mn_shielded1qqg847293847192837192847192847192847192847192847192847192847');
              setValidationError(null);
            }}
            className="text-black font-bold hover:underline"
          >
            Insert Testnet Demo Address
          </button>
        </div>

        {/* Prover Pipeline Modal */}
        <ProofProgressModal
          isOpen={isProving || !!lastResult}
          step={step}
          txHash={lastResult?.txHash}
          onClose={() => {
            reset();
            setIsReviewing(false);
            setAmount('');
            setRecipient('');
            setMemo('');
          }}
        />
      </div>
    </AppShell>
  );
}
