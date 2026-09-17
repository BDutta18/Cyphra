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

    let list = this.activities.get(walletAddress) ?? [];

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
}

export const activityService = new ActivityService();
