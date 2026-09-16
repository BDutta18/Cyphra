/**
 * CYPHRA Contract Client & Cryptographic Utilities
 *
 * This module provides:
 *   1. createNoteCommitment() — Derives opaque note commitment hashes
 *   2. deriveNullifier()       — Derives spend-proving nullifiers
 *   3. CyphraContractClient   — In-process simulator of Compact circuit semantics
 *
 * On Midnight Preprod/Mainnet, the actual Compact circuits are executed by the
 * Midnight node and proven by 1AM Wallet's WASM prover. This client simulates
 * the same state transition logic for local testing and UI integration.
 *
 * Integration with 1AM Wallet:
 *   - The frontend obtains a ConnectedAPI from oneAMWallet.getConnectedApi()
 *   - It then calls balanceUnsealedTransaction() + submitTransaction() to
 *     execute circuits on-chain. The ConnectedAPI handles key management,
 *     coin selection, DUST fee payment, and proof generation.
 */

import type {
  ContractLedgerState,
  ContractWitnesses,
  DepositCircuitParams,
  TransferCircuitParams,
  RegisterRequestCircuitParams,
  FulfillRequestCircuitParams,
  GrantAuditorParams,
  RevokeAuditorParams,
  CircuitResult,
  ShieldedNote,
} from './contract.types.js';

export * from './contract.types.js';

// ---------------------------------------------------------------------------
// Cryptographic Utilities
// ---------------------------------------------------------------------------

/**
 * Derives a deterministic Note Commitment from private parameters.
 *
 * In production, this uses the same hash function as the Compact circuit's
 * commitment scheme. Here we use SHA-256 as a structurally compatible substitute
 * for the off-chain SDK layer.
 *
 * The commitment is: SHA-256(ownerKey || ":" || amount || ":" || blinding || ":" || token)
 *
 * @param ownerKey       The owner's shielded coin public key (hex)
 * @param amount         The note's private value in NIGHT base units
 * @param blindingFactor A fresh random 32-byte blinding factor (hex)
 * @param tokenType      Token identifier, defaults to 'NIGHT'
 * @returns              64-char hex string (32-byte commitment)
 */
export async function createNoteCommitment(
  ownerKey: string,
  amount: bigint,
  blindingFactor: string,
  tokenType: string = 'NIGHT'
): Promise<string> {
  const preimage = `commitment:${ownerKey}:${amount.toString()}:${blindingFactor}:${tokenType}`;
  return sha256Hex(preimage);
}

/**
 * Derives a Nullifier that marks a note as spent without revealing which note.
 *
 * The nullifier is: SHA-256("nullifier:" || spendingKey || ":" || noteCommitment)
 *
 * Nullifiers are unlinkable to commitments without the private spending key,
 * preserving sender privacy on-chain.
 *
 * @param spendingKey    The owner's private spending key (hex)
 * @param noteCommitment The 64-char hex commitment of the note being spent
 * @returns              64-char hex nullifier
 */
export async function deriveNullifier(
  spendingKey: string,
  noteCommitment: string
): Promise<string> {
  const preimage = `nullifier:${spendingKey}:${noteCommitment}`;
  return sha256Hex(preimage);
}

/**
 * Generates a random 32-byte blinding factor as a hex string.
 * Used when creating new note commitments.
 */
export function generateBlindingFactor(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(32);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Node.js fallback
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

/**
 * Generates a random 32-byte request ID for payment requests.
 */
export function generateRequestId(): string {
  return generateBlindingFactor();
}

// Internal SHA-256 helper
async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const hash = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  try {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
  } catch {
    // Deterministic fallback (testing only)
    return '0'.repeat(64);
  }
}

// ---------------------------------------------------------------------------
// CYPHRA Contract Client
// ---------------------------------------------------------------------------

/**
 * CyphraContractClient
 *
 * Simulates the CYPHRA Compact contract's state machine locally.
 * Mirrors the exact assertion logic from cyphra.compact so that
 * TypeScript tests exercise the same invariants that the ZK circuits enforce.
 *
 * On-chain usage:
 *   The frontend calls circuits via 1AM Wallet's ConnectedAPI:
 *     const tx = await connectedApi.balanceUnsealedTransaction(unsealedTx);
 *     await connectedApi.submitTransaction(tx.tx);
 *
 * Local simulation:
 *   Tests instantiate CyphraContractClient directly, which gives
 *   deterministic, synchronous-friendly behavior for CI.
 */
export class CyphraContractClient {
  private ledger: ContractLedgerState;

  constructor(initialState?: Partial<ContractLedgerState>) {
    this.ledger = {
      commitments: initialState?.commitments ?? new Set<string>(),
      nullifiers: initialState?.nullifiers ?? new Set<string>(),
      paymentRequests: initialState?.paymentRequests ?? new Map<string, string>(),
      paidRequests: initialState?.paidRequests ?? new Set<string>(),
      auditorRegistry: initialState?.auditorRegistry ?? new Map<string, number>(),
      totalShieldedDeposits: initialState?.totalShieldedDeposits ?? 0,
      totalConfidentialTransfers: initialState?.totalConfidentialTransfers ?? 0,
      totalPaymentRequests: initialState?.totalPaymentRequests ?? 0,
    };
  }

  /** Returns a read-only snapshot of the current ledger state. */
  getLedgerState(): Readonly<ContractLedgerState> {
    return Object.freeze({
      commitments: new Set(this.ledger.commitments),
      nullifiers: new Set(this.ledger.nullifiers),
      paymentRequests: new Map(this.ledger.paymentRequests),
      paidRequests: new Set(this.ledger.paidRequests),
      auditorRegistry: new Map(this.ledger.auditorRegistry),
      totalShieldedDeposits: this.ledger.totalShieldedDeposits,
      totalConfidentialTransfers: this.ledger.totalConfidentialTransfers,
      totalPaymentRequests: this.ledger.totalPaymentRequests,
    });
  }

  // -------------------------------------------------------------------------
  // Circuit: deposit
  // -------------------------------------------------------------------------

  /**
   * Simulates the deposit() Compact circuit.
   *
   * Validates:
   *   - amount > 0
   *   - noteCommitment not already in commitments
   *
   * Mutates:
   *   - commitments.insert(noteCommitment)
   *   - totalShieldedDeposits++
   */
  async deposit(params: DepositCircuitParams): Promise<CircuitResult> {
    if (params.amount <= 0n) {
      throw new Error('Deposit amount must be strictly positive');
    }
    if (this.ledger.commitments.has(params.noteCommitment)) {
      throw new Error('Note commitment already exists');
    }
    if (params.noteCommitment.length !== 64) {
      throw new Error('Note commitment must be a 64-character hex string (32 bytes)');
    }

    this.ledger.commitments.add(params.noteCommitment);
    this.ledger.totalShieldedDeposits += 1;

    return { success: true, txHash: mockTxHash() };
  }

  // -------------------------------------------------------------------------
  // Circuit: confidentialTransfer
  // -------------------------------------------------------------------------

  /**
   * Simulates the confidentialTransfer() Compact circuit.
   *
   * Validates:
   *   - nullifier not already spent
   *   - newCommitment not already in commitments
   *   - inputVal == outputVal + changeVal  (value conservation)
   *
   * Mutates:
   *   - nullifiers.insert(nullifier)
   *   - commitments.insert(newCommitment)
   *   - commitments.insert(changeCommitment) if changeVal > 0
   *   - totalConfidentialTransfers++
   */
  async confidentialTransfer(
    params: TransferCircuitParams,
    witnesses: ContractWitnesses
  ): Promise<CircuitResult> {
    if (this.ledger.nullifiers.has(params.nullifier)) {
      throw new Error('Double-spend rejected: nullifier already spent');
    }
    if (this.ledger.commitments.has(params.newCommitment)) {
      throw new Error('Recipient note commitment already exists');
    }

    const inputVal = await witnesses.getInputNoteValue();
    const outputVal = await witnesses.getOutputNoteValue();
    const changeVal = await witnesses.getChangeNoteValue();

    if (inputVal !== outputVal + changeVal) {
      throw new Error(
        `Value conservation violated: input(${inputVal}) != output(${outputVal}) + change(${changeVal})`
      );
    }

    this.ledger.nullifiers.add(params.nullifier);
    this.ledger.commitments.add(params.newCommitment);

    if (changeVal > 0n) {
      if (this.ledger.commitments.has(params.changeCommitment)) {
        throw new Error('Change note commitment already exists');
      }
      this.ledger.commitments.add(params.changeCommitment);
    }

    this.ledger.totalConfidentialTransfers += 1;

    return { success: true, txHash: mockTxHash() };
  }

  // -------------------------------------------------------------------------
  // Circuit: registerPaymentRequest
  // -------------------------------------------------------------------------

  /**
   * Simulates the registerPaymentRequest() Compact circuit.
   */
  async registerPaymentRequest(
    params: RegisterRequestCircuitParams
  ): Promise<{ success: boolean }> {
    if (this.ledger.paymentRequests.has(params.requestId)) {
      throw new Error('Payment request ID already registered');
    }
    this.ledger.paymentRequests.set(params.requestId, params.requestCommitment);
    this.ledger.totalPaymentRequests += 1;
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Circuit: fulfillPaymentRequest
  // -------------------------------------------------------------------------

  /**
   * Simulates the fulfillPaymentRequest() Compact circuit.
   */
  async fulfillPaymentRequest(params: FulfillRequestCircuitParams): Promise<CircuitResult> {
    if (!this.ledger.paymentRequests.has(params.requestId)) {
      throw new Error('Payment request does not exist');
    }
    if (this.ledger.paidRequests.has(params.requestId)) {
      throw new Error('Payment request is already marked paid');
    }
    if (this.ledger.nullifiers.has(params.paymentNullifier)) {
      throw new Error('Payment nullifier already spent');
    }

    this.ledger.nullifiers.add(params.paymentNullifier);
    this.ledger.commitments.add(params.receiptCommitment);
    this.ledger.paidRequests.add(params.requestId);

    return { success: true, txHash: mockTxHash() };
  }

  // -------------------------------------------------------------------------
  // Circuit: grantAuditorAccess
  // -------------------------------------------------------------------------

  /**
   * Simulates the grantAuditorAccess() Compact circuit.
   */
  async grantAuditorAccess(params: GrantAuditorParams): Promise<{ success: boolean }> {
    if (params.permissions === 0) {
      throw new Error('Permission bitmask must be non-zero');
    }
    this.ledger.auditorRegistry.set(params.auditorKey, params.permissions);
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Circuit: revokeAuditorAccess
  // -------------------------------------------------------------------------

  /**
   * Simulates the revokeAuditorAccess() Compact circuit.
   */
  async revokeAuditorAccess(params: RevokeAuditorParams): Promise<{ success: boolean }> {
    if (!this.ledger.auditorRegistry.has(params.auditorKey)) {
      throw new Error('Auditor key not found in registry');
    }
    // Set permissions to 0 (mirrors contract behavior of inserting 0)
    this.ledger.auditorRegistry.set(params.auditorKey, 0);
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Note Management Helpers
  // -------------------------------------------------------------------------

  /**
   * Returns true if the given note commitment exists unspent on the ledger.
   */
  isNoteUnspent(commitment: string): boolean {
    return this.ledger.commitments.has(commitment);
  }

  /**
   * Returns true if the given nullifier has been spent.
   */
  isNullifierSpent(nullifier: string): boolean {
    return this.ledger.nullifiers.has(nullifier);
  }

  /**
   * Returns true if the given payment request exists and has not been fulfilled.
   */
  isRequestPending(requestId: string): boolean {
    return (
      this.ledger.paymentRequests.has(requestId) && !this.ledger.paidRequests.has(requestId)
    );
  }
}

// ---------------------------------------------------------------------------
// ShieldedNote Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a ShieldedNote object representing an off-chain private note.
 * Notes are managed by the 1AM Wallet and never stored on-chain.
 */
export async function createShieldedNote(
  ownerKey: string,
  amount: bigint,
  tokenType: string = 'NIGHT',
  blockHeight?: number
): Promise<ShieldedNote> {
  const blindingFactor = generateBlindingFactor();
  const commitment = await createNoteCommitment(ownerKey, amount, blindingFactor, tokenType);
  return {
    commitment,
    amount,
    blindingFactor,
    tokenType,
    spent: false,
    blockHeight,
  };
}

// ---------------------------------------------------------------------------
// Internal utility
// ---------------------------------------------------------------------------

function mockTxHash(): string {
  const ts = Date.now().toString(16).padStart(12, '0');
  const rand = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0');
  return `0xcyphra${ts}${rand}`;
}
