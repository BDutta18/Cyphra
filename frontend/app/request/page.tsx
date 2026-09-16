'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { QRCodeDisplay } from '../../components/payment/QRCodeDisplay';
import { PaymentRequestModal } from '../../components/payment/PaymentRequestModal';
import { ProofProgressModal } from '../../components/payment/ProofProgressModal';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { usePaymentRequest } from '../../hooks/usePaymentRequest';
import { useConfidentialTransfer } from '../../hooks/useConfidentialTransfer';
import {
  decodePaymentRequest,
  encodePaymentRequest,
  validatePaymentRequest,
  PaymentRequest,
  DecodedPaymentRequest,
  ValidationResult,
} from '../../lib/cyphra-types';
import {
  QrCode,
  Plus,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Share2,
  AlertTriangle,
  FileDown,
  ShieldAlert,
  Calendar,
  Wallet,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function RequestPage() {
  const { account, isConnected, connect } = useMidnightWallet();
  const { requests, isLoading, fulfillRequest, refreshRequests } = usePaymentRequest(account);
  const { sendPayment, isProving, step, lastResult, reset } = useConfidentialTransfer(account);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [qrModalRequest, setQrModalRequest] = useState<PaymentRequest | null>(null);
  const [qrModalUri, setQrModalUri] = useState<string | null>(null);

  // Import & Pay state
  const [importInput, setImportInput] = useState('');
  const [importedRequest, setImportedRequest] = useState<DecodedPaymentRequest | null>(null);
  const [importValidation, setImportValidation] = useState<ValidationResult | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState<{ txHash: string } | null>(null);

  // Copied & Shared feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  // Filter tab state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'expired'>('all');

  const handleCopyLink = async (req: PaymentRequest) => {
    const uri = await encodePaymentRequest({
      id: req.id,
      recipientAddress: req.recipientAddress,
      asset: req.tokenType,
      amount: req.amount,
      note: req.memo,
      expiration: req.expiresAt,
      nonce: req.nonce,
      commitmentHash: req.commitmentHash,
    });
    navigator.clipboard.writeText(uri);
    setCopiedId(req.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareLink = async (req: PaymentRequest) => {
    const uri = await encodePaymentRequest({
      id: req.id,
      recipientAddress: req.recipientAddress,
      asset: req.tokenType,
      amount: req.amount,
      note: req.memo,
      expiration: req.expiresAt,
      nonce: req.nonce,
      commitmentHash: req.commitmentHash,
    });

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `CYPHRA Payment Request: ${req.amount} ${req.tokenType}`,
          text: `Confidential payment request for ${req.amount} ${req.tokenType}`,
          url: uri,
        });
        setSharedId(req.id);
        setTimeout(() => setSharedId(null), 2000);
      } catch {
        handleCopyLink(req);
      }
    } else {
      handleCopyLink(req);
    }
  };

  const handleOpenQrModal = async (req: PaymentRequest) => {
    const uri = await encodePaymentRequest({
      id: req.id,
      recipientAddress: req.recipientAddress,
      asset: req.tokenType,
      amount: req.amount,
      note: req.memo,
      expiration: req.expiresAt,
      nonce: req.nonce,
      commitmentHash: req.commitmentHash,
    });
    setQrModalRequest(req);
    setQrModalUri(uri);
  };

  // Import handler with validation
  const handleImportRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);
    setPaySuccess(null);
    setImportedRequest(null);
    setImportValidation(null);

    const trimmed = importInput.trim();
    if (!trimmed) return;

    const validation = await validatePaymentRequest(trimmed);
    setImportValidation(validation);

    if (validation.valid && validation.request) {
      setImportedRequest(validation.request);
    }
  };

  // Pay imported request
  const handlePayImported = async () => {
    if (!importedRequest) return;
    if (!isConnected || !account?.shieldedAddress) {
      connect('preview');
      return;
    }

    setPayError(null);
    setIsProcessingImport(true);

    try {
      // 1. Send confidential payment via 1AM Wallet
      const proverRes = await sendPayment({
        recipientAddress: importedRequest.recipientAddress,
        amount: importedRequest.amount,
        tokenType: importedRequest.asset,
        memo: importedRequest.note,
      });

      // 2. Fulfill request on backend
      await fulfillRequest({
        requestId: importedRequest.id,
        payerShieldedAddress: account.shieldedAddress,
        txHash: proverRes.txHash,
        paymentNullifier: proverRes.nullifierHash,
        receiptCommitment: proverRes.noteCommitment,
      });

      setPaySuccess({ txHash: proverRes.txHash });
      setImportedRequest(null);
      setImportInput('');
      setImportValidation(null);
      refreshRequests();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Payment fulfillment failed.');
    } finally {
      setIsProcessingImport(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return req.status === 'pending';
    if (statusFilter === 'completed') return req.status === 'completed';
    if (statusFilter === 'expired') return req.status === 'expired' || Date.now() > req.expiresAt;
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6 text-zinc-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-200">
          <div>
            <h1 className="text-xl font-black text-black tracking-tight font-sans">
              Confidential Payment Requests
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono">
              Peer-to-peer zero-knowledge invoices with encrypted memos and QR sharing. No public database.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!isConnected}
            className="font-bold text-xs px-4 py-2 bg-[#FFD400] text-black hover:bg-[#E5BE00] shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Payment Request
          </Button>
        </div>

        {/* Import & Pay Box */}
        <Card className="border-zinc-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <FileDown className="w-4 h-4 text-black" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-bold">
              Import & Pay a Confidential Request
            </h3>
          </div>

          <form onSubmit={handleImportRequest} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Paste cyphra:pay?id=... request URI"
                value={importInput}
                onChange={(e) => {
                  setImportInput(e.target.value);
                  setImportValidation(null);
                  setImportedRequest(null);
                  setPayError(null);
                  setPaySuccess(null);
                }}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="md"
              className="sm:w-auto shrink-0 text-xs font-bold border-zinc-300 hover:border-black bg-white"
              disabled={!importInput.trim()}
            >
              Verify & Import
            </Button>
          </form>

          {/* Validation Result / Tampered Notice */}
          {importValidation && !importValidation.valid && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-bold block">
                  {importValidation.code === 'TAMPERED'
                    ? 'Cryptographic Tampering Detected!'
                    : importValidation.code === 'EXPIRED'
                      ? 'Payment Request Expired'
                      : 'Invalid Request Format'}
                </span>
                <span className="text-[11px] text-red-600 leading-relaxed block mt-0.5">
                  {importValidation.reason}
                </span>
              </div>
            </div>
          )}

          {/* Successful Import Preview Ticket */}
          {importedRequest && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs font-mono"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span className="font-bold text-black flex items-center gap-1.5 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified Invoice Ready for Payment
                </span>
                <Badge variant="yellow" size="sm" pulseDot>
                  Unpaid
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-zinc-500 block">Amount:</span>
                  <span className="text-base font-black text-black">
                    {importedRequest.amount} <span className="bg-[#FFD400] px-1.5 rounded">{importedRequest.asset}</span>
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Expiration:</span>
                  <span className="text-zinc-800 font-semibold">
                    {new Date(importedRequest.expiration).toLocaleString()}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-500 block">Recipient Shielded Address:</span>
                  <span className="text-black font-semibold break-all bg-white p-1.5 rounded border border-zinc-200 block mt-0.5">
                    {importedRequest.recipientAddress}
                  </span>
                </div>
                {importedRequest.note && (
                  <div className="sm:col-span-2">
                    <span className="text-zinc-500 block">Private Note:</span>
                    <span className="text-zinc-800 italic bg-white p-1.5 rounded border border-zinc-200 block mt-0.5">
                      &quot;{importedRequest.note}&quot;
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-zinc-200">
                <span className="text-[11px] text-zinc-500 font-sans">
                  Requires 1AM Wallet confirmation & local zero-knowledge proof.
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePayImported}
                  isLoading={isProcessingImport}
                  className="font-bold bg-[#FFD400] text-black hover:bg-[#E5BE00] shadow-xs text-xs px-4"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {isConnected ? 'Pay Confidentially' : 'Connect 1AM to Pay'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Payment Errors & Success feedback */}
          {payError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{payError}</span>
            </div>
          )}

          {paySuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment successfully submitted to Midnight! Ref: {paySuccess.txHash.slice(0, 14)}...</span>
              </div>
              <button
                onClick={() => setPaySuccess(null)}
                className="text-emerald-800 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </Card>

        {/* Requests Management Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
                Your Created Requests
              </h3>
              <span className="text-xs text-zinc-500 font-mono font-medium">({filteredRequests.length})</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 font-mono text-xs">
              {(['all', 'pending', 'completed', 'expired'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                    statusFilter === filter
                      ? 'bg-black text-white font-bold'
                      : 'bg-zinc-100 text-zinc-600 hover:text-black'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <Card className="py-12 text-center text-xs font-mono text-zinc-500 bg-white border-zinc-200 shadow-sm space-y-2">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading payment requests...</p>
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card className="text-center py-10 space-y-2.5 bg-white border-zinc-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center mx-auto text-zinc-400 border border-zinc-200">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-black font-sans">No Payment Requests Found</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-mono">
                {statusFilter !== 'all'
                  ? `No requests match the '${statusFilter}' status filter.`
                  : 'Create a confidential payment request to bill counterparties privately.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!isConnected}
                className="mt-2 text-xs font-mono font-semibold border-zinc-300 hover:border-black bg-white"
              >
                <Plus className="w-3.5 h-3.5 mr-1 text-black" /> Create Request
              </Button>
            </Card>
          ) : (
            <div className="grid gap-2.5">
              {filteredRequests.map((req) => {
                const isExpired = req.status === 'expired' || Date.now() > req.expiresAt;
                const isPaid = req.status === 'completed';

                return (
                  <motion.div
                    key={req.id}
                    whileHover={{ y: -1, borderColor: '#000000' }}
                    className="p-4 rounded-xl bg-white border border-zinc-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-black font-mono">
                          {req.amount} <span className="bg-[#FFD400] px-1.5 rounded">{req.tokenType}</span>
                        </span>

                        {isPaid ? (
                          <Badge variant="emerald" size="sm">
                            Paid
                          </Badge>
                        ) : isExpired ? (
                          <Badge variant="neutral" size="sm">
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="yellow" size="sm" pulseDot>
                            Unpaid / Pending
                          </Badge>
                        )}
                      </div>

                      {req.memo && (
                        <p className="text-xs text-zinc-600 italic">
                          &quot;{req.memo}&quot;
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created: {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires: {new Date(req.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center font-mono text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenQrModal(req)}
                        className="border-zinc-300 hover:border-black text-xs font-semibold py-1 px-2.5 h-8 bg-white"
                        title="View QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5 mr-1 text-black" /> QR
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(req)}
                        className="border-zinc-300 hover:border-black text-xs font-semibold py-1 px-2.5 h-8 bg-white"
                        title="Copy payment link"
                      >
                        {copiedId === req.id ? (
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 mr-1 text-zinc-700" />
                        )}
                        {copiedId === req.id ? 'Copied' : 'Copy'}
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleShareLink(req)}
                        className="text-xs font-semibold py-1 px-2.5 h-8"
                        title="Share payment request"
                      >
                        {sharedId === req.id ? (
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5 mr-1" />
                        )}
                        Share
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Payment Request Modal */}
        <PaymentRequestModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            refreshRequests();
          }}
          account={account}
        />

        {/* Dedicated QR View Modal */}
        <Modal
          isOpen={!!qrModalRequest}
          onClose={() => {
            setQrModalRequest(null);
            setQrModalUri(null);
          }}
          title="Payment Request QR"
        >
          {qrModalRequest && qrModalUri && (
            <div className="space-y-4 text-center">
              <QRCodeDisplay
                value={qrModalUri}
                label={`Pay ${qrModalRequest.amount} ${qrModalRequest.tokenType}`}
              />

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-left text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className="text-black font-bold uppercase">{qrModalRequest.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Expires:</span>
                  <span className="text-zinc-800">{new Date(qrModalRequest.expiresAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(qrModalRequest)}
                  className="text-xs border-zinc-300 hover:border-black font-semibold"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy URI
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleShareLink(qrModalRequest)}
                  className="text-xs font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Prover Pipeline Modal */}
        <ProofProgressModal
          isOpen={isProving || !!lastResult}
          step={step}
          txHash={lastResult?.txHash}
          onClose={() => {
            reset();
          }}
        />
      </div>
    </AppShell>
  );
}
