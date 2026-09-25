'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { BalanceCard } from '../../components/dashboard/BalanceCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { PrivacyScoreMeter } from '../../components/dashboard/PrivacyScoreMeter';
import { ShieldedVolumeChart } from '../../components/dashboard/ShieldedVolumeChart';
import { VisualPrivacyWorkflow } from '../../components/dashboard/VisualPrivacyWorkflow';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PaymentRequestModal } from '../../components/payment/PaymentRequestModal';
import { useMidnightWallet } from '../../hooks/useMidnightWallet';
import { usePrivateBalance } from '../../hooks/usePrivateBalance';
import { apiClient } from '../../lib/api-client';
import { oneAMWallet } from '../../lib/one-am-wallet-adapter';
import { TransactionActivity } from '../../lib/cyphra-types';
import { CyphraLogoMark } from '../../components/ui/CyphraLogo';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  History,
  CheckCircle2,
  Lock,
  ArrowRight,
  Wallet,
} from 'lucide-react';

export default function DashboardPage() {
  const { account, isConnected, openConnectModal, connectDemo, refreshBalances } = useMidnightWallet();
  const balances = usePrivateBalance(account);
  const [activities, setActivities] = useState<TransactionActivity[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);

  // Fetch recent activity
  useEffect(() => {
    if (account?.shieldedAddress) {
      apiClient
        .getActivity(account.shieldedAddress)
        .then(setActivities)
        .catch((err) => {
          console.warn('Could not fetch activity feed:', err);
        });
    }
  }, [account?.shieldedAddress]);

  const [depositError, setDepositError] = useState<string | null>(null);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setIsDepositing(true);
    setDepositError(null);
    try {
      await oneAMWallet.depositShielded(depositAmount, 'NIGHT');
      await refreshBalances();
      try {
        const updated = await apiClient.getActivity(account.shieldedAddress);
        setActivities(updated);
      } catch {}
      setDepositSuccess(true);
      setTimeout(() => {
        setIsDepositOpen(false);
        setDepositSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      setDepositError(err instanceof Error ? err.message : 'Deposit failed.');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleFaucet = async () => {
    if (!account?.shieldedAddress) return;
    setFaucetLoading(true);
    try {
      await apiClient.requestFaucet(account.shieldedAddress, 'NIGHT');
      await refreshBalances();
    } catch (err) {
      console.error(err);
    } finally {
      setFaucetLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <AppShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 text-zinc-900"
      >
        {/* Header Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <CyphraLogoMark size={28} className="drop-shadow-xs" />
              <h1 className="text-xl font-black text-black tracking-tight font-sans">
                Confidential Treasury
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Preprod Contract 0xcc4a29...db3f
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono">
              Balances shielded using Compact 0.31.1 zero-knowledge note commitments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFaucet}
                isLoading={faucetLoading}
                className="text-xs font-mono font-semibold border-zinc-300 hover:border-black bg-white shadow-xs"
              >
                <Coins className="w-3.5 h-3.5 mr-1.5 text-black" />
                Claim Testnet NIGHT
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => connectDemo('preprod')}
                  className="text-xs font-mono font-bold border-zinc-300 hover:border-black bg-white text-zinc-900 shadow-xs flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Instant Demo (Aarav)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openConnectModal}
                  className="text-xs font-bold px-4 py-2 bg-[#FFD400] text-black hover:bg-[#E5BE00] border border-black/15 shadow-xs"
                >
                  <Wallet className="w-3.5 h-3.5 mr-1.5" /> Connect 1AM Wallet
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Balance & Score Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <BalanceCard
              shieldedNight={balances.shieldedNight}
              shieldedDust={balances.shieldedDust}
              shieldedtCyphra={balances.shieldedtCyphra}
              unshieldedNight={balances.unshieldedNight}
              onOpenDeposit={() => setIsDepositOpen(true)}
              onRefresh={refreshBalances}
            />
          </div>
          <div>
            <PrivacyScoreMeter
              shieldedNight={balances.shieldedNight}
              unshieldedNight={balances.unshieldedNight}
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Quick Actions
            </h3>
          </div>
          <QuickActions
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenInvoice={() => setIsInvoiceOpen(true)}
          />
        </motion.div>

        {/* Analytics & Volume Chart */}
        <motion.div variants={itemVariants}>
          <ShieldedVolumeChart />
        </motion.div>

        {/* Visual Zero-Knowledge Privacy Workflow */}
        <motion.div variants={itemVariants}>
          <VisualPrivacyWorkflow />
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div variants={itemVariants}>
          <Card className="space-y-3 bg-white border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-black" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-bold">
                  Recent Confidential Activity
                </h3>
              </div>
              <Link
                href="/activity"
                className="text-xs text-zinc-600 hover:text-black font-mono font-medium flex items-center gap-1 transition-colors"
              >
                View Full History <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100">
              {activities.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-zinc-400">
                  No recent transactions found on this account.
                </div>
              ) : (
                activities.slice(0, 4).map((act) => {
                  const isIncoming = act.type.includes('receive') || act.type.includes('deposit');
                  return (
                    <motion.div
                      key={act.id}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.015)' }}
                      className="py-3 px-2 rounded-lg flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs ${
                            isIncoming
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}
                        >
                          {isIncoming ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-black">
                              {act.type === 'shield_deposit'
                                ? 'Shield Deposit'
                                : act.type === 'send_confidential'
                                ? 'Confidential Transfer'
                                : act.type === 'receive_confidential'
                                ? 'Confidential Receive'
                                : 'Payment Request Settlement'}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold">
                              ZK Verified
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {act.counterpartyMasked || 'Shielded Commitment'} •{' '}
                            {new Date(act.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span
                          className={`text-xs font-bold block tabular-nums ${
                            isIncoming ? 'text-emerald-700' : 'text-zinc-900'
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
          </Card>
        </motion.div>

        {/* Shield / Deposit Modal */}
        <Modal
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          title="Shield Funds (L1 → Confidential Note)"
        >
          {depositSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-black">Funds Successfully Shielded</h3>
              <p className="text-xs text-zinc-600 font-sans">
                Your L1 assets have been committed into a private zero-knowledge note on Midnight.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleDeposit} className="space-y-4">
              <p className="text-xs text-zinc-600">
                Move unshielded L1 NIGHT into a confidential Midnight note via 1AM Wallet. The resulting balance will be completely private.
              </p>

              <Input
                label="Amount to Shield"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                rightElement={<span className="text-xs font-mono font-bold text-zinc-700">NIGHT</span>}
                hint={`Available Unshielded: ${balances.unshieldedNight} NIGHT`}
              />

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1 text-xs font-mono text-zinc-600">
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span className="text-black font-bold">1AM Shielded Vault</span>
                </div>
                <div className="flex justify-between">
                  <span>Circuit:</span>
                  <span className="text-zinc-800 font-semibold">Compact: deposit()</span>
                </div>
              </div>

              {depositError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                  {depositError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 font-bold"
                isLoading={isDepositing}
              >
                Shield Into Private Balance
              </Button>
            </form>
          )}
        </Modal>

        {/* Quick Invoice Creation Modal */}
        <PaymentRequestModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          account={account}
        />
      </motion.div>
    </AppShell>
  );
}
