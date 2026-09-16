/**
 * CYPHRA Backend Types
 *
 * Internal types that extend or augment shared types for the Express layer.
 */

import { Request } from 'express';
import { ViewingKeyGrant } from '@cyphra/shared';

// ---------------------------------------------------------------------------
// Express Request Extensions
// ---------------------------------------------------------------------------

export interface AuthenticatedRequest extends Request {
  /** Shielded or unshielded Midnight address from the x-wallet-address header */
  walletAddress?: string;
  /** Viewing key grant (used for auditor disclosure endpoints) */
  grant?: ViewingKeyGrant;
}

// ---------------------------------------------------------------------------
// Standardized API Response Envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    timestamp: number;
    requestId?: string;
    [key: string]: unknown;
  };
}

// ---------------------------------------------------------------------------
// Health & Network Types
// ---------------------------------------------------------------------------

export interface NetworkHealth {
  status: 'online' | 'degraded' | 'offline';
  networkId: string;
  blockHeight: number;
  syncPercentage: number;
  indexerLatencyMs: number;
  contractAddress: string;
  proverAvailable: boolean;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  uptime: number;
  timestamp: number;
  midnight: NetworkHealth;
}

// ---------------------------------------------------------------------------
// Balance Types (non-custodial: amounts come from 1AM Wallet via indexer)
// ---------------------------------------------------------------------------

/**
 * The backend NEVER stores shielded balances. This type represents
 * indexer-observable on-chain data only (note count, public counters).
 * Actual token amounts always come from the 1AM Wallet client.
 */
export interface PublicOnChainBalance {
  /** Shielded wallet address (query key) */
  shieldedAddress: string;
  /** Number of unspent note commitments on-chain for this address */
  unspentNoteCount: number;
  /** Total on-chain shielded deposit count (from contract Counter) */
  totalDeposits: number;
  /** Total on-chain confidential transfer count */
  totalTransfers: number;
  /** When this data was last fetched from the indexer */
  lastSyncedAt: number;
}

// ---------------------------------------------------------------------------
// Payment / Transaction Types
// ---------------------------------------------------------------------------

export type PaymentStatus =
  | 'pending_proof'     // ZK proof being generated in wallet
  | 'pending_submit'    // Proven tx waiting to be submitted
  | 'submitted'         // Submitted to Midnight node
  | 'confirmed'         // Included in a finalized block
  | 'failed';           // Submission or proof failure

export interface PaymentRecord {
  id: string;
  /** Opaque nullifier hash — links to on-chain spend event, not to the amount */
  nullifierHash: string;
  /** Opaque recipient note commitment */
  recipientCommitment: string;
  /** Token type */
  tokenType: string;
  /** Transaction hash on Midnight */
  txHash: string;
  /** Midnight block height when confirmed */
  blockHeight?: number;
  status: PaymentStatus;
  /** ISO timestamp of creation */
  createdAt: number;
  /** ISO timestamp of on-chain confirmation */
  confirmedAt?: number;
  /** Midnight network this was sent on */
  networkId: string;
}

// ---------------------------------------------------------------------------
// App Error
// ---------------------------------------------------------------------------

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
