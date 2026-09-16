/**
 * CYPHRA Contract Type Definitions
 *
 * TypeScript mirror of the Compact contract state and circuit parameters.
 * These types are used by CyphraContractClient and the frontend integration.
 *
 * Privacy note: amounts, addresses, and memos are NEVER part of public ledger state.
 * All sensitive values are witnesses supplied by the 1AM Wallet prover.
 */

// ---------------------------------------------------------------------------
// Ledger State (mirrors public on-chain state from cyphra.compact)
// ---------------------------------------------------------------------------

/**
 * The public portion of CYPHRA's on-chain ledger state.
 * All values here are opaque 32-byte hash commitments — no amounts or addresses.
 */
export interface ContractLedgerState {
  /** Unspent note commitments: Set<hex-encoded 32-byte hash> */
  commitments: Set<string>;
  /** Spent nullifiers: Set<hex-encoded 32-byte hash> */
  nullifiers: Set<string>;
  /** Payment requests: requestId → requestCommitment */
  paymentRequests: Map<string, string>;
  /** Fulfilled payment request IDs */
  paidRequests: Set<string>;
  /** Auditor viewing key registry: auditorKey → permission bitmask */
  auditorRegistry: Map<string, number>;
  /** Aggregate counters (no individual amounts) */
  totalShieldedDeposits: number;
  totalConfidentialTransfers: number;
  totalPaymentRequests: number;
}

// ---------------------------------------------------------------------------
// Witnesses (private values supplied by 1AM Wallet's WASM prover)
// These values NEVER appear on the public ledger.
// ---------------------------------------------------------------------------

export interface ContractWitnesses {
  /** The sender's private spending key (32-byte hex) */
  getSpendingKey: () => Promise<string>;
  /** The input note's private amount (in NIGHT base units) */
  getInputNoteValue: () => Promise<bigint>;
  /** The output note's private amount (recipient's note) */
  getOutputNoteValue: () => Promise<bigint>;
  /** The change note's private amount */
  getChangeNoteValue: () => Promise<bigint>;
  /** The random blinding factor for commitment derivation */
  getBlindingFactor: () => Promise<string>;
}

// ---------------------------------------------------------------------------
// Circuit Parameters (inputs to each Compact circuit)
// ---------------------------------------------------------------------------

/** Parameters for the deposit() circuit */
export interface DepositCircuitParams {
  /** Amount of NIGHT to shield (must be > 0n) */
  amount: bigint;
  /** Pre-computed note commitment: Hash(spendKey, amount, blinding) */
  noteCommitment: string;
}

/** Parameters for the confidentialTransfer() circuit */
export interface TransferCircuitParams {
  /** Nullifier derived from spending key + input note commitment */
  nullifier: string;
  /** Recipient's new note commitment */
  newCommitment: string;
  /** Sender's change note commitment (may be zero-note if exact payment) */
  changeCommitment: string;
}

/** Parameters for the registerPaymentRequest() circuit */
export interface RegisterRequestCircuitParams {
  /** Unique request identifier (32-byte hex) */
  requestId: string;
  /** Commitment to request parameters (amount, recipient, expiry) */
  requestCommitment: string;
}

/** Parameters for the fulfillPaymentRequest() circuit */
export interface FulfillRequestCircuitParams {
  /** The request ID to fulfill */
  requestId: string;
  /** Nullifier of the note used to pay */
  paymentNullifier: string;
  /** New note commitment created as payment receipt */
  receiptCommitment: string;
}

/** Parameters for the grantAuditorAccess() circuit */
export interface GrantAuditorParams {
  /** Auditor's 32-byte viewing key commitment */
  auditorKey: string;
  /**
   * Permission bitmask:
   * 0x01 = view balances
   * 0x02 = view transfers
   * 0x04 = view payment requests
   * 0xFF = all permissions
   */
  permissions: number;
}

/** Parameters for the revokeAuditorAccess() circuit */
export interface RevokeAuditorParams {
  /** Auditor's viewing key to revoke */
  auditorKey: string;
}

// ---------------------------------------------------------------------------
// Transaction Results
// ---------------------------------------------------------------------------

export interface CircuitResult {
  success: boolean;
  /** Hex-encoded transaction hash (once submitted to Midnight) */
  txHash: string;
}

// ---------------------------------------------------------------------------
// Note — Off-chain representation of a shielded note
// (Never stored on-chain. Lives in 1AM Wallet's local encrypted storage.)
// ---------------------------------------------------------------------------

export interface ShieldedNote {
  /** Opaque commitment hash (matches on-chain entry) */
  commitment: string;
  /** Private amount in NIGHT base units (kept off-chain only) */
  amount: bigint;
  /** Random blinding factor used to derive this commitment */
  blindingFactor: string;
  /** The token type (e.g., 'NIGHT') */
  tokenType: string;
  /** Whether this note has been spent */
  spent: boolean;
  /** Block height when this note was created (for sync purposes) */
  blockHeight?: number;
}

// ---------------------------------------------------------------------------
// Auditor Permissions
// ---------------------------------------------------------------------------

export const AUDITOR_PERMISSIONS = {
  BALANCES: 0x01,
  TRANSFERS: 0x02,
  PAYMENT_REQUESTS: 0x04,
  ALL: 0xff,
} as const;

export type AuditorPermission = (typeof AUDITOR_PERMISSIONS)[keyof typeof AUDITOR_PERMISSIONS];
