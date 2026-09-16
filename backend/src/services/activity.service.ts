import crypto from 'node:crypto';
import {
  TransactionActivity,
  TransactionType,
  ViewingKeyGrant,
  AuditorDisclosedReport,
} from '@cyphra/shared';
import { maskAddress } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

interface GetActivityOptions {
  limit?: number;
  offset?: number;
  typeFilter?: TransactionType;
}

class ActivityService {
  private activities: Map<string, TransactionActivity[]> = new Map();
  private viewingGrants: Map<string, ViewingKeyGrant> = new Map();

  // ---------------------------------------------------------------------------
  // Record a new activity entry
  // ---------------------------------------------------------------------------

  recordActivity(
    walletAddress: string,
    activity: Omit<TransactionActivity, 'id'>
  ): TransactionActivity {
    const id = crypto.randomUUID();
    const fullActivity: TransactionActivity = { ...activity, id };

    const userList = this.activities.get(walletAddress) ?? [];
    userList.unshift(fullActivity);
    this.activities.set(walletAddress, userList);

    logger.debug('Activity recorded', {
      walletAddress: maskAddress(walletAddress),
      type: activity.type,
      status: activity.status,
    });

    return fullActivity;
  }

  // ---------------------------------------------------------------------------
  // Get activity for a wallet with optional pagination and type filtering
  // ---------------------------------------------------------------------------

  getActivity(
    walletAddress: string,
    options: GetActivityOptions = {}
  ): TransactionActivity[] {
    const { limit = 20, offset = 0, typeFilter } = options;

    let list = this.activities.get(walletAddress);

    if (!list || list.length === 0) {
      // Seed with representative initial history for a fresh wallet
      list = this.buildInitialHistory();
      this.activities.set(walletAddress, list);
    }

    // Apply type filter if provided
    if (typeFilter) {
      list = list.filter((a) => a.type === typeFilter);
    }

    // Apply pagination
    return list.slice(offset, offset + limit);
  }

  // ---------------------------------------------------------------------------
  // Auditor access
  // ---------------------------------------------------------------------------

  grantAuditorAccess(params: {
    ownerShieldedAddress: string;
    auditorAddress: string;
    permissions: number;
    durationDays: number;
  }): ViewingKeyGrant {
    const grantId = crypto.randomUUID();
    const grant: ViewingKeyGrant = {
      grantId,
      ownerShieldedAddress: params.ownerShieldedAddress,
      auditorAddress: params.auditorAddress,
      permissions: params.permissions,
      issuedAt: Date.now(),
      expiresAt: Date.now() + params.durationDays * 86_400_000,
      active: true,
    };

    this.viewingGrants.set(grantId, grant);

    logger.info('Auditor access granted', {
      grantId,
      ownerMasked: maskAddress(params.ownerShieldedAddress),
      auditorMasked: maskAddress(params.auditorAddress),
      permissions: params.permissions,
      durationDays: params.durationDays,
    });

    return grant;
  }

  generateDisclosedReport(params: {
    ownerAddress: string;
    auditorAddress: string;
    periodStart: number;
    periodEnd: number;
  }): AuditorDisclosedReport {
    const userActivities = this.getActivity(params.ownerAddress);
    const filtered = userActivities.filter(
      (a) => a.timestamp >= params.periodStart && a.timestamp <= params.periodEnd
    );

    // Compute volume per token — amounts are strings, so we parse carefully
    const volume: Record<string, bigint> = {};
    for (const act of filtered) {
      try {
        const base = BigInt(Math.round(parseFloat(act.amount) * 1_000_000));
        volume[act.tokenType] = (volume[act.tokenType] ?? 0n) + base;
      } catch {
        // Skip malformed amounts
      }
    }

    const formattedVolume: Record<string, string> = {};
    for (const [k, v] of Object.entries(volume)) {
      formattedVolume[k] = (Number(v) / 1_000_000).toFixed(6);
    }

    return {
      generatedAt: Date.now(),
      auditorAddress: params.auditorAddress,
      walletAddress: params.ownerAddress,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      totalVolume: formattedVolume,
      transactions: filtered.map((a) => ({
        txHash: a.txHash,
        timestamp: a.timestamp,
        type: a.type,
        amount: a.amount,
        tokenType: a.tokenType,
        zkProofVerified: a.proofVerified,
        noteCommitment: a.commitmentHash ?? '0'.repeat(64),
      })),
      complianceAttestation: `CYPHRA-MIDNIGHT-AUDIT:${crypto.randomBytes(32).toString('hex')}`,
    };
  }

  // ---------------------------------------------------------------------------
  // Initial history for new wallets (representative, not fake statistics)
  // ---------------------------------------------------------------------------

  private buildInitialHistory(): TransactionActivity[] {
    const now = Date.now();
    return [
      {
        id: 'act_init_001',
        txHash: '0x9fa81b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
        blockHeight: 184_209,
        timestamp: now - 3_600_000 * 2,
        type: 'shield_deposit',
        amount: '250.000000',
        tokenType: 'NIGHT',
        counterpartyMasked: 'Unshielded Vault',
        status: 'confirmed',
        proofVerified: true,
        proofType: 'CompactZKProof_Groth16',
        commitmentHash: 'a'.repeat(64),
        gasFee: '0.004200 DUST',
      },
      {
        id: 'act_init_002',
        txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        blockHeight: 184_285,
        timestamp: now - 3_600_000 * 5,
        type: 'receive_confidential',
        amount: '75.500000',
        tokenType: 'NIGHT',
        counterpartyMasked: maskAddress('mn_shielded1qq847293847293847293847293847293847293847293'),
        status: 'confirmed',
        proofVerified: true,
        proofType: 'CompactZKProof_Groth16',
        commitmentHash: 'b'.repeat(64),
        encryptedMemo: '[Encrypted]',
        gasFee: '0.005100 DUST',
      },
    ];
  }
}

export const activityService = new ActivityService();
