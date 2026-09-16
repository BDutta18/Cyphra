'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { apiClient } from '../../lib/api-client';
import { TransactionActivity, AuditorDisclosedReport } from '../../lib/cyphra-types';
import {
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  FileCheck2,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Wallet,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ActivityPage() {
  const { account, isConnected, connect } = useMidnightWallet();
  const [activities, setActivities] = useState<TransactionActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<TransactionActivity | null>(null);

  // Auditor report modal state
  const [isAuditorModalOpen, setIsAuditorModalOpen] = useState(false);
  const [auditorAddress, setAuditorAddress] = useState('');
  const [generatedReport, setGeneratedReport] = useState<AuditorDisclosedReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [copiedProof, setCopiedProof] = useState(false);

  useEffect(() => {
    if (account?.shieldedAddress) {
      setIsLoading(true);
      apiClient
        .getActivity(account.shieldedAddress)
        .then((data) => {
          setActivities(data);
        })
        .catch((err) => {
          console.error('Failed to load activities:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setActivities([]);
    }
  }, [account?.shieldedAddress]);

  const filtered = activities.filter((act) => {
    if (filterType === 'all') return true;
    if (filterType === 'sent') return act.type === 'send_confidential';
    if (filterType === 'received') return act.type === 'receive_confidential';
    if (filterType === 'shielded') return act.type === 'shield_deposit';
    if (filterType === 'pending') return act.status === 'pending';
    if (filterType === 'failed') return act.status === 'failed';
    return true;
  });

  const handleGenerateAuditorReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account?.shieldedAddress) return;
    setIsGeneratingReport(true);
    try {
      const report = await apiClient.generateAuditorReport({
        ownerAddress: account.shieldedAddress,
        auditorAddress: auditorAddress.trim(),
        periodStart: Date.now() - 30 * 86400000,
        periodEnd: Date.now(),
      });
      setGeneratedReport(report);
    } catch (err) {
      console.error('Failed to generate auditor report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCopyProof = () => {
    if (generatedReport?.complianceAttestation) {
      navigator.clipboard.writeText(generatedReport.complianceAttestation);
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2000);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Activity' },
    { id: 'sent', label: 'Outgoing' },
    { id: 'received', label: 'Incoming' },
    { id: 'shielded', label: 'Shielded Deposits' },
    { id: 'pending', label: 'Pending' },
  ];

  return (
    <AppShell>
      <div className="space-y-6 text-zinc-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-200">
          <div>
            <h1 className="text-xl font-black text-black tracking-tight font-sans">
              Confidential Transaction Ledger
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono">
              Zero-knowledge activity ledger accessible only to authorized 1AM viewing keys.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAuditorModalOpen(true)}
            disabled={!isConnected}
            className="text-xs font-mono font-semibold border-zinc-300 hover:border-black bg-white shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5 mr-1.5 text-black" />
            Generate Auditor Disclosure
          </Button>
        </div>

        {/* Authorization Gate: Only connected user can see ledger */}
        {!isConnected ? (
          <Card className="flex flex-col items-center text-center p-8 bg-white border-zinc-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FFD400]/20 border border-[#FFD400] flex items-center justify-center text-black shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black font-sans">Authorized Access Required</h2>
              <p className="text-xs text-zinc-600 font-mono mt-1 max-w-sm">
                Transaction records on Midnight are encrypted. Connect your 1AM Wallet to verify ownership and decrypt your confidential activity ledger.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => connect('preview')}
              className="bg-[#FFD400] text-black font-bold hover:bg-[#E5BE00] text-xs px-6 py-2.5 shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5 mr-1.5" /> Connect 1AM Wallet
            </Button>
          </Card>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono">
              {filterTabs.map((pill) => {
                const isActive = filterType === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setFilterType(pill.id)}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
                      isActive
                        ? 'text-black font-bold'
                        : 'text-zinc-600 hover:text-black bg-white border border-zinc-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activity-filter-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-[#FFD400] rounded-lg border border-black/15 shadow-xs -z-0"
                      />
                    )}
                    <span className="relative z-10">{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Activity Feed */}
            <div className="space-y-2">
              {isLoading ? (
                /* Loading State */
                <Card className="py-14 text-center text-xs font-mono text-zinc-500 bg-white border-zinc-200 shadow-sm space-y-3">
                  <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-semibold text-black">Decrypting Shielded Activity Ledger...</p>
                  <p className="text-[11px] text-zinc-400">Verifying zero-knowledge proofs via 1AM viewing keys</p>
                </Card>
              ) : filtered.length === 0 ? (
                /* Empty State */
                <Card className="py-12 text-center text-xs font-mono text-zinc-400 bg-white border-zinc-200 shadow-sm space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-zinc-300" />
                  <h4 className="text-sm font-bold text-black font-sans">No Transactions Found</h4>
                  <p className="text-xs text-zinc-500">
                    {filterType !== 'all'
                      ? `No transactions match the '${filterType}' filter.`
                      : 'You have not submitted or received any confidential payments yet.'}
                  </p>
                </Card>
              ) : (
                filtered.map((act) => {
                  const isIncoming = act.type.includes('receive') || act.type.includes('deposit');
                  const isPending = act.status === 'pending';
                  const isFailed = act.status === 'failed';
                  const isSuccess = act.status === 'confirmed';

                  return (
                    <motion.div
                      key={act.id}
                      whileHover={{ y: -1, borderColor: '#000000' }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedTx(act)}
                      className="p-3.5 rounded-xl bg-white border border-zinc-200 cursor-pointer transition-colors flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-xs shrink-0 ${
                            isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isFailed
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : isIncoming
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}
                        >
                          {isPending ? (
                            <Clock className="w-4 h-4 animate-spin" />
                          ) : isFailed ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : isIncoming ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-black font-sans">
                              {act.type === 'shield_deposit'
                                ? 'Shield Deposit'
                                : act.type === 'send_confidential'
                                  ? 'Confidential Outgoing'
                                  : 'Confidential Incoming'}
                            </span>

                            {/* Status Badges: Pending / Success / Failed */}
                            {isPending ? (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 border border-amber-300 text-amber-800 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                Pending
                              </span>
                            ) : isFailed ? (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 border border-red-300 text-red-800 font-bold">
                                Failed
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Confirmed
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-zinc-500 font-mono">
                            {new Date(act.timestamp).toLocaleString()} • Ref: {act.txHash.slice(0, 10)}...
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span
                          className={`text-xs font-bold block tabular-nums ${
                            isFailed
                              ? 'text-red-600 line-through'
                              : isIncoming
                                ? 'text-emerald-700'
                                : 'text-zinc-900'
                          }`}
                        >
                          {isIncoming ? '+' : '-'}
                          {act.amount} {act.tokenType}
                        </span>
                        <span className="text-[10px] text-zinc-500">Gas: {act.gasFee}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Transaction Detail Modal */}
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title="Confidential Transaction Details"
        >
          {selectedTx && (
            <div className="space-y-4 text-xs font-mono text-zinc-900">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span
                    className={`font-bold uppercase ${
                      selectedTx.status === 'confirmed'
                        ? 'text-emerald-700'
                        : selectedTx.status === 'pending'
                          ? 'text-amber-700'
                          : 'text-red-700'
                    }`}
                  >
                    {selectedTx.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount:</span>
                  <span className="text-black font-black tabular-nums">
                    {selectedTx.amount} <span className="bg-[#FFD400] px-1.5 rounded">{selectedTx.tokenType}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Proof Engine:</span>
                  <span className="text-black font-semibold">{selectedTx.proofType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Gas Fee:</span>
                  <span className="text-zinc-800 font-bold">{selectedTx.gasFee}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-zinc-500 block mb-1 font-semibold">Transaction Hash:</span>
                  <span className="text-[11px] text-black break-all p-2 rounded-lg bg-zinc-50 border border-zinc-200 block font-bold">
                    {selectedTx.txHash}
                  </span>
                </div>

                {selectedTx.commitmentHash && (
                  <div>
                    <span className="text-zinc-500 block mb-1 font-semibold">Note Commitment (Public Ledger):</span>
                    <span className="text-[11px] text-black break-all p-2 rounded-lg bg-[#FFD400]/20 border border-[#FFD400] block font-bold">
                      {selectedTx.commitmentHash}
                    </span>
                  </div>
                )}

                {selectedTx.nullifierHash && (
                  <div>
                    <span className="text-zinc-500 block mb-1 font-semibold">Spent Nullifier:</span>
                    <span className="text-[11px] text-zinc-600 break-all p-2 rounded-lg bg-zinc-50 border border-zinc-200 block">
                      {selectedTx.nullifierHash}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Auditor Disclosure Modal */}
        <Modal
          isOpen={isAuditorModalOpen}
          onClose={() => setIsAuditorModalOpen(false)}
          title="Generate Auditor Selective Disclosure Report"
        >
          <div className="space-y-4 text-xs font-mono text-zinc-900">
            <p className="text-zinc-600 font-sans">
              Provide an authorized auditor address to generate a zero-knowledge verified selective disclosure proof for the past 30 days.
            </p>

            <form onSubmit={handleGenerateAuditorReport} className="space-y-3">
              <Input
                label="Auditor Midnight Address"
                placeholder="mn_addr1... or mn_shielded1..."
                value={auditorAddress}
                onChange={(e) => setAuditorAddress(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-[#FFD400] text-black hover:bg-[#E5BE00] font-bold"
                isLoading={isGeneratingReport}
              >
                Generate Cryptographic Attestation
              </Button>
            </form>

            {generatedReport && (
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-black font-bold">Attestation Hash:</span>
                  <button
                    onClick={handleCopyProof}
                    className="text-black bg-[#FFD400] px-2 py-0.5 rounded font-bold hover:bg-[#E5BE00] flex items-center gap-1"
                  >
                    {copiedProof ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
                    {copiedProof ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] break-all bg-white p-2 rounded border border-zinc-200">
                  {generatedReport.complianceAttestation}
                </p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
