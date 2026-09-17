/**
 * Midnight Indexer Service
 *
 * Integrates with the Midnight GraphQL Indexer API to:
 *   - Query network/block health
 *   - Look up transaction status by hash
 *   - Check on-chain commitment/nullifier existence
 *   - Query contract ledger state (public counters)
 *
 * The backend NEVER handles proving, signing, or balance computation.
 * These responsibilities belong exclusively to the 1AM Wallet client.
 *
 * All private state (amounts, recipients, memos) is end-to-end encrypted
 * in Midnight's shielded model and is never accessible to this service.
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { NetworkHealth } from '../types/index.js';

// ---------------------------------------------------------------------------
// GraphQL Queries
// These target the Midnight Indexer's public GraphQL schema.
// ---------------------------------------------------------------------------

const NETWORK_INFO_QUERY = `
  query NetworkInfo {
    nodeInfo {
      nodeVersion
      blockchainHeight
      bestBlockHash
      syncedBlockHeight
    }
  }
`;

const TX_STATUS_QUERY = `
  query TxStatus($hash: String!) {
    transaction(hash: $hash) {
      hash
      blockHeight
      timestamp
      status
    }
  }
`;

const COMMITMENT_EXISTS_QUERY = `
  query CommitmentExists($address: String!, $commitment: String!) {
    contractState(address: $address) {
      commitments(key: $commitment)
    }
  }
`;

const NULLIFIER_EXISTS_QUERY = `
  query NullifierExists($address: String!, $nullifier: String!) {
    contractState(address: $address) {
      nullifiers(key: $nullifier)
    }
  }
`;

// ---------------------------------------------------------------------------
// Indexer HTTP Client
// ---------------------------------------------------------------------------

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  if (config.env === 'test' || process.env.NODE_ENV === 'test') {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(config.midnight.indexerUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'cyphra-backend/0.1.0',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.warn(`Indexer responded with HTTP ${response.status}`);
      return null;
    }

    const json = (await response.json()) as GraphQLResponse<T>;

    if (json.errors?.length) {
      logger.warn('Indexer GraphQL errors', json.errors);
      return null;
    }

    return json.data ?? null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Indexer fetch failed: ${msg}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// MidnightService
// ---------------------------------------------------------------------------

interface NodeInfoData {
  nodeInfo: {
    nodeVersion: string;
    blockchainHeight: number;
    bestBlockHash: string;
    syncedBlockHeight: number;
  } | null;
}

interface TxStatusData {
  transaction: {
    hash: string;
    blockHeight: number;
    timestamp: string;
    status: string;
  } | null;
}

class MidnightService {
  // Cached block height — updated on each health check to reduce latency
  private cachedBlockHeight: number = 0;
  private cachedAt: number = 0;
  private readonly cacheTtlMs = 15_000; // 15 seconds

  /**
   * Fetches current network health from the Midnight Indexer.
   * Falls back to cached or simulated data if indexer is unavailable.
   */
  async getNetworkHealth(): Promise<NetworkHealth> {
    const now = Date.now();

    // Return cached value within TTL
    if (this.cachedBlockHeight > 0 && now - this.cachedAt < this.cacheTtlMs) {
      return this.buildHealthResponse(this.cachedBlockHeight, 'online', 0);
    }

    const fetchStart = Date.now();
    const data = await gqlFetch<NodeInfoData>(NETWORK_INFO_QUERY);
    const latency = Date.now() - fetchStart;

    if (data?.nodeInfo) {
      const { blockchainHeight, syncedBlockHeight } = data.nodeInfo;
      const syncPct =
        blockchainHeight > 0
          ? Math.min(100, (syncedBlockHeight / blockchainHeight) * 100)
          : 100;

      this.cachedBlockHeight = blockchainHeight;
      this.cachedAt = now;

      return {
        status: syncPct >= 99.9 ? 'online' : 'degraded',
        networkId: config.midnight.networkId,
        blockHeight: blockchainHeight,
        syncPercentage: parseFloat(syncPct.toFixed(2)),
        indexerLatencyMs: latency,
        contractAddress: config.midnight.contractAddress,
        proverAvailable: true,
      };
    }

    // Indexer unreachable — return degraded status with last known height
    logger.warn('Midnight indexer unreachable — returning degraded network health');
    return this.buildHealthResponse(
      this.cachedBlockHeight || 0,
      this.cachedBlockHeight > 0 ? 'degraded' : 'offline',
      latency
    );
  }

  /**
   * Looks up a transaction's status on the Midnight blockchain.
   */
  async getTransactionStatus(txHash: string): Promise<{
    found: boolean;
    blockHeight?: number;
    timestamp?: string;
    status?: string;
    explorerUrl?: string;
  }> {
    const data = await gqlFetch<TxStatusData>(TX_STATUS_QUERY, { hash: txHash });

    if (!data?.transaction) {
      return { found: false };
    }

    const { blockHeight, timestamp, status } = data.transaction;
    const explorerBase = `https://explorer.${config.midnight.networkId}.midnight.network`;

    return {
      found: true,
      blockHeight,
      timestamp,
      status,
      explorerUrl: `${explorerBase}/tx/${txHash}`,
    };
  }

  /**
   * Checks whether a note commitment exists on-chain (unspent).
   * This is a public query — commitments are opaque hashes with no private info.
   */
  async isCommitmentOnChain(commitment: string): Promise<boolean> {
    const data = await gqlFetch<{ contractState: { commitments: boolean } | null }>(
      COMMITMENT_EXISTS_QUERY,
      { address: config.midnight.contractAddress, commitment }
    );
    return data?.contractState?.commitments === true;
  }

  /**
   * Checks whether a nullifier has been spent on-chain.
   * Nullifiers are opaque hashes that prevent double-spend — no private info.
   */
  async isNullifierSpent(nullifier: string): Promise<boolean> {
    const data = await gqlFetch<{ contractState: { nullifiers: boolean } | null }>(
      NULLIFIER_EXISTS_QUERY,
      { address: config.midnight.contractAddress, nullifier }
    );
    return data?.contractState?.nullifiers === true;
  }

  /**
   * Builds a NetworkHealth response object.
   */
  private buildHealthResponse(
    blockHeight: number,
    status: 'online' | 'degraded' | 'offline',
    latency: number
  ): NetworkHealth {
    return {
      status,
      networkId: config.midnight.networkId,
      blockHeight,
      syncPercentage: status === 'online' ? 100.0 : 0,
      indexerLatencyMs: latency,
      contractAddress: config.midnight.contractAddress,
      proverAvailable: status !== 'offline',
    };
  }
}

export const midnightService = new MidnightService();
