'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tooltip } from '../../components/ui/Tooltip';
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
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Clock,
  Coins,
} from 'lucide-react';

export default function SendPage() {
  const { account, isConnected, openConnectModal, network } = useMidnightWallet();
  const balances = usePrivateBalance(account);
  const { sendPayment, isProving, step, lastResult, error, reset } = useConfidentialTransfer(account);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenType, setTokenType] = useState<TokenType>('NIGHT');
  const [memo, setMemo] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showAdvancedCrypto, setShowAdvancedCrypto] = useState(false);

  // Review step state
  const [isReviewing, setIsReviewing] = useState(false);

  // Available balance for chosen asset
  const availableString = useMemo(() => {
    if (tokenType === 'NIGHT') return balances.shieldedNight;
    if (tokenType === 'DUST') return balances.shieldedDust;
    return balances.shieldedtCyphra;
  }, [tokenType, balances]);

  const availableNum = useMemo(() => {
    return parseFloat(availableString.replace(/,/g, '')) || 0;
  }, [availableString]);

  // Recipient address format validator
  const recipientValidation = useMemo(() => {
    if (!recipient) return { valid: false, message: null };
    const trimmed = recipient.trim();
    if (
      !trimmed.startsWith('mn_addr_preprod1') &&
      !trimmed.startsWith('mn_shielded1') &&
      !trimmed.startsWith('mn_addr1')
    ) {
      return {
        valid: false,
        message:
          'Invalid address prefix. Expected Midnight Preprod format (mn_addr_preprod1... or mn_shielded1...).',
      };
    }
    if (trimmed.length < 35) {
      return {
        valid: false,
        message: 'Address length is too short for a valid Midnight address (expected 45+ chars).',
      };
    }
    if (!/^[0-9a-z_]+$/.test(trimmed)) {
      return {
        valid: false,
        message: 'Address contains illegal characters. Only lowercase alphanumeric allowed.',
      };
    }
    return { valid: true, message: 'Valid Midnight Preprod recipient address' };
  }, [recipient]);

  // Estimated network fee
  const estimatedGasCost = '0.0038 DUST';

  // Remaining balance calculation
  const parsedAmount = parseFloat(amount) || 0;
  const remainingBalance = useMemo(() => {
    return Math.max(0, availableNum - parsedAmount).toFixed(6);
  }, [availableNum, parsedAmount]);

  const handleMaxAmount = () => {
    setAmount(availableNum.toString());
    setValidationError(null);
  };

  const handleGoToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Address validation
    if (!recipientValidation.valid) {
      setValidationError(
        recipientValidation.message ||
          'Recipient must be a valid Midnight Preprod address (mn_addr_preprod1... or mn_shielded1...)'
      );
      return;
    }

    // Amount validation
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Please enter a valid transfer amount greater than 0');
      return;
    }

    if (parsedAmount > availableNum) {
      setValidationError(
        `Insufficient ${tokenType} balance. You have ${availableString} ${tokenType} available, cannot send ${amount} ${tokenType}.`
      );
      return;
    }

    setIsReviewing(true);
  };

  const handleConfirmAndSign = async () => {
    if (!isConnected) {
      openConnectModal();
      return;
    }
    try {
      await sendPayment({
        recipientAddress: recipient.trim(),
        amount,
        tokenType,
        memo: memo || undefined,
      });
    } catch (err) {
      console.error('Send payment failed:', err);
    }
  };

  const handleCopyRecipient = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(recipient);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
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
              Off-chain zero-knowledge witness generation via Midnight Compact circuits.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFD400]/20 border border-[#FFD400] text-[11px] font-mono font-bold text-black shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span>Preprod ZK-Transfer</span>
          </div>
        </div>

        {/* Step Progression Indicator */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div
            className={`p-2 rounded-lg border text-center transition-colors ${
              !isReviewing
                ? 'bg-[#FFD400]/20 border-black font-bold text-black shadow-xs'
                : 'bg-zinc-50 border-zinc-200 text-zinc-500'
            }`}
          >
            1. Details & Fee
          </div>
          <div
            className={`p-2 rounded-lg border text-center transition-colors ${
              isReviewing && !isProving
                ? 'bg-[#FFD400]/20 border-black font-bold text-black shadow-xs'
                : 'bg-zinc-50 border-zinc-200 text-zinc-500'
            }`}
          >
            2. Review & Confirm
          </div>
          <div
            className={`p-2 rounded-lg border text-center transition-colors ${
              isProving
                ? 'bg-[#FFD400]/20 border-black font-bold text-black shadow-xs'
                : 'bg-zinc-50 border-zinc-200 text-zinc-500'
            }`}
          >
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
                  <div className="space-y-1">
                    <Input
                      label="Recipient Midnight Address"
                      placeholder="mn_addr_preprod1... or mn_shielded1..."
                      required
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value.trim());
                        setValidationError(null);
                      }}
                      error={validationError || undefined}
                      hint="Supports Midnight Preprod unshielded and shielded addresses"
                    />
                    {recipient && recipientValidation.valid && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-mono pl-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{recipientValidation.message}</span>
                      </div>
                    )}
                    {recipient && !recipientValidation.valid && recipientValidation.message && (
                      <div className="flex items-center gap-1 text-[11px] text-red-600 font-mono pl-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{recipientValidation.message}</span>
                      </div>
                    )}
                  </div>

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
                          onClick={() => {
                            setTokenType(tok);
                            setValidationError(null);
                          }}
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

                  {/* Amount with Available Balance & MAX button */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <label className="font-semibold text-zinc-800 font-sans flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-zinc-600" /> Amount
                      </label>
                      <div className="flex items-center gap-2 text-zinc-600">
                        <span>
                          Available:{' '}
                          <span className="text-black font-bold">
                            {availableString} {tokenType}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={handleMaxAmount}
                          className="text-black bg-[#FFD400] px-2 py-0.5 rounded font-bold text-[11px] hover:bg-[#E5BE00] transition-colors border border-black/10 shadow-xs"
                          title="Fill available shielded balance"
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

                    {/* Dynamic Remaining Balance calculation */}
                    {parsedAmount > 0 && (
                      <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 pt-0.5">
                        <span>Remaining after transfer:</span>
                        <span
                          className={`font-semibold ${
                            parsedAmount > availableNum ? 'text-red-600' : 'text-zinc-700'
                          }`}
                        >
                          {remainingBalance} {tokenType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Private Memo */}
                  <Input
                    label="Optional Private Memo"
                    placeholder="e.g. Consulting fee invoice #1042"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    hint="Encrypted with counterparty public key; never exposed on the public ledger"
                  />

                  {/* Transaction Fee & Guarantees Breakdown */}
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2 text-xs font-mono text-zinc-600">
                    <div className="flex justify-between items-center pb-1.5 border-b border-zinc-200">
                      <span className="flex items-center gap-1.5 text-zinc-700 font-semibold">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Estimated Network Fee:
                        <Tooltip content="Settlement cost paid in DUST gas and balanced by 1AM Wallet." />
                      </span>
                      <span className="text-black font-bold">{estimatedGasCost}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-zinc-700">
                        <Lock className="w-3.5 h-3.5 text-black" /> Privacy Guarantee:
                        <Tooltip content="Value and parties are proven via Groth16 zero-knowledge proofs. No plaintext is broadcast to block explorers." />
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        100% Shielded Note
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-zinc-200">
                      <span className="text-zinc-800 font-bold">Total Deduction:</span>
                      <span className="text-black font-black">
                        {parsedAmount > 0 ? parsedAmount.toFixed(6) : '0.000000'} {tokenType} + {estimatedGasCost}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full text-sm font-bold bg-[#FFD400] text-black hover:bg-[#E5BE00] shadow-sm"
                    disabled={!amount || parsedAmount <= 0}
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
                    <ArrowLeft className="w-3 h-3" /> Edit Details
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-zinc-600 font-medium">Transfer Amount:</span>
                      <span className="text-2xl font-black text-black tabular-nums">
                        {amount}{' '}
                        <span className="bg-[#FFD400] px-1.5 py-0.5 rounded text-sm font-bold border border-black/15">
                          {tokenType}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 pt-2 border-t border-zinc-200">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-600 font-medium">Recipient Address:</span>
                        <button
                          type="button"
                          onClick={handleCopyRecipient}
                          className="text-[11px] text-zinc-500 hover:text-black flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedAddress ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <span className="text-black text-[11px] break-all bg-white p-2.5 rounded border border-zinc-200 font-bold select-all">
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
                      <span className="text-zinc-600">Network Gas:</span>
                      <span className="text-black font-bold">{estimatedGasCost} (1AM DUST)</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-zinc-200 font-bold">
                      <span className="text-zinc-800">Final Debit Total:</span>
                      <span className="text-black">
                        {amount} {tokenType} + {estimatedGasCost}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] text-xs text-zinc-800 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed font-sans font-medium">
                      Authorizing this transfer generates a Groth16 zk-SNARK proof locally. The nullifier will be committed on the Midnight Preprod ledger without disclosing the sender, recipient, or amount.
                    </span>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
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
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-zinc-600 shadow-sm gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-black shrink-0" />
            <span>Need an onboarded Preprod test address?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setRecipient('mn_addr_preprod1gwv5ww5tvagek3cvqk2gvkh8pxt6840ql8r50lzuv3k44ljmfetqszz0yw');
              setValidationError(null);
            }}
            className="text-black font-bold hover:underline bg-zinc-100 hover:bg-[#FFD400] px-2 py-1 rounded border border-zinc-200 transition-colors text-left sm:text-right"
          >
            Insert Preprod Account #1
          </button>
        </div>

        {/* Collapsible Advanced Cryptography Section */}
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowAdvancedCrypto(!showAdvancedCrypto)}
            className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono font-bold text-zinc-800 hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-zinc-500" />
              <span>Advanced Cryptography & Circuit Metrics</span>
            </div>
            {showAdvancedCrypto ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showAdvancedCrypto && (
            <div className="px-4 pb-4 pt-1 border-t border-zinc-100 space-y-3 text-xs font-mono text-zinc-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Circuit Engine</div>
                  <div className="font-bold text-black text-xs">Compact 0.31.1 / Midnight Ledger</div>
                </div>
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Proving Scheme</div>
                  <div className="font-bold text-black text-xs">Groth16 zk-SNARK (Pairing-friendly)</div>
                </div>
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Nullifier Formula</div>
                  <div className="font-bold text-black text-xs">N = H(pk_spend, rho)</div>
                </div>
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Note Commitment</div>
                  <div className="font-bold text-black text-xs">C = H(owner, amount, blinding)</div>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 font-sans leading-relaxed pt-1">
                <strong>Zero-Knowledge Assurance:</strong> The receiver note commitment and change note commitment are computed off-chain inside the browser witness synthesizer. Only the nullifier and note commitments are posted to the Midnight Preprod smart contract (<code>0xcc4a29303...</code>).
              </div>
            </div>
          )}
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
