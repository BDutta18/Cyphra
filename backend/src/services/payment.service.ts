/**
 * Payment Service
 *
 * Handles confidential payment metadata records.
 *
 * NON-CUSTODIAL DESIGN:
 * This service tracks payment records by their ON-CHAIN observable data only:
 *   - Transaction hash (public)
 *   - Nullifier hash (public opaque identifier — not linked to amounts)
 *   - Recipient commitment (public opaque commitment hash)
 *   - Status (derived from on-chain data)
 *
 * The backend NEVER stores:
 *   - Payment amounts
 *   - Sender or recipient identities
 *   - Private memos
 *   - Proving keys or witnesses
 *
 * All transaction construction, proving, signing, and submission
 * is handled by the frontend + 1AM Wallet client.
 *
 * This service only provides:
 *   1. Receipt record creation (after wallet submits a tx)
 *   2. Status tracking (by querying the Midnight indexer)
 *   3. Lookup by backend-generated payment ID or tx hash
 */

import crypto from 'node:crypto';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { midnightService } from './midnight.service.js';
import { AppError, PaymentRecord, PaymentStatus } from '../types/index.js';
import { isValidHex32 } from '../utils/crypto.js';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod Schema for creating a payment record
// ---------------------------------------------------------------------------

export const CreatePaymentSchema = z.object({
  /**
   * Nullifier hash of the note being spent.
   * Public on-chain identifier — does NOT reveal amount or sender.
   */
  nullifierHash: z
    .string()
    .length(64, 'Nullifier must be a 64-char hex string (32 bytes)')
    .regex(/^[0-9a-f]+$/i, 'Nullifier must be lowercase hex'),

  /**
   * Commitment hash of the recipient's new note.
   * Public on-chain identifier — does NOT reveal amount or recipient identity.
   */
  recipientCommitment: z
    .string()
    .length(64, 'Commitment must be a 64-char hex string (32 bytes)')
    .regex(/^[0-9a-f]+$/i, 'Commitment must be lowercase hex'),

  /** Token type (NIGHT, DUST, tCYPHRA) */
  tokenType: z.enum(['NIGHT', 'DUST', 'tCYPHRA']),

  /**
   * Transaction hash returned by 1AM Wallet after submission.
   * The backend uses this to query on-chain status from the Midnight indexer.
   */
  txHash: z.string().min(10, 'Invalid transaction hash'),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

// ---------------------------------------------------------------------------
// In-memory payment record store (production: replace with persistent DB)
// ---------------------------------------------------------------------------

class PaymentService {
  private payments: Map<string, PaymentRecord> = new Map();

  /**
   * Creates a new payment record after the user's wallet submits a transaction.
   * The wallet (1AM) handles all proving, signing, and submission.
   * The frontend calls this endpoint to register the tx hash for status tracking.
   */
  async createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
    // Validate hex32 format
    if (!isValidHex32(input.nullifierHash)) {
      throw new AppError('nullifierHash must be a valid 64-char hex string.', 400, 'INVALID_NULLIFIER');
    }
    if (!isValidHex32(input.recipientCommitment)) {
      throw new AppError('recipientCommitment must be a valid 64-char hex string.', 400, 'INVALID_COMMITMENT');
    }

    // Check for duplicate nullifier (double-spend detection at the API layer)
    for (const record of this.payments.values()) {
      if (record.nullifierHash === input.nullifierHash) {
        throw new AppError(
          'A payment record with this nullifier already exists. Possible double-spend attempt.',
          409,
          'DUPLICATE_NULLIFIER'
        );
      }
    }

    const id = crypto.randomUUID();
    const record: PaymentRecord = {
      id,
      nullifierHash: input.nullifierHash,
      recipientCommitment: input.recipientCommitment,
      tokenType: input.tokenType,
      txHash: input.txHash,
      status: 'submitted',
      createdAt: Date.now(),
      networkId: config.midnight.networkId,
    };

    this.payments.set(id, record);

    logger.info('Payment record created', {
      id,
      txHash: input.txHash,
      tokenType: input.tokenType,
      networkId: config.midnight.networkId,
    });

    // Async: verify on-chain status without blocking the response
    this.updateStatusFromChain(id).catch((err) =>
      logger.warn('Background status update failed', err)
    );

    return record;
  }

  /**
   * Retrieves a payment record by its backend-assigned UUID.
   * Also refreshes on-chain status if the record is not yet confirmed.
   */
  async getPayment(id: string): Promise<PaymentRecord> {
    const record = this.payments.get(id);
    if (!record) {
      throw new AppError(`Payment record '${id}' not found.`, 404, 'PAYMENT_NOT_FOUND');
    }

    // Refresh status from chain if still in-flight
    if (record.status === 'submitted' || record.status === 'pending_submit') {
      await this.updateStatusFromChain(id);
    }

    return this.payments.get(id)!;
  }

  /**
   * Retrieves a payment record by its on-chain transaction hash.
   */
  async getPaymentByTxHash(txHash: string): Promise<PaymentRecord | null> {
    for (const record of this.payments.values()) {
      if (record.txHash === txHash) {
        if (record.status === 'submitted') {
          await this.updateStatusFromChain(record.id);
        }
        return this.payments.get(record.id) ?? null;
      }
    }
    return null;
  }

  /**
   * Queries the Midnight indexer for the on-chain status of a payment.
   * Updates the local record's status accordingly.
   */
  private async updateStatusFromChain(id: string): Promise<void> {
    const record = this.payments.get(id);
    if (!record || record.status === 'confirmed' || record.status === 'failed') return;

    try {
      const txInfo = await midnightService.getTransactionStatus(record.txHash);

      if (!txInfo.found) {
        // Not yet indexed — remains 'submitted'
        return;
      }

      if (txInfo.status === 'confirmed' || txInfo.status === 'finalized') {
        record.status = 'confirmed';
        record.blockHeight = txInfo.blockHeight;
        record.confirmedAt = Date.now();
        logger.info('Payment confirmed on-chain', { id, txHash: record.txHash, blockHeight: txInfo.blockHeight });
      } else if (txInfo.status === 'failed' || txInfo.status === 'invalid') {
        record.status = 'failed';
        logger.warn('Payment failed on-chain', { id, txHash: record.txHash });
      }
    } catch (err) {
      logger.warn('Failed to update payment status from chain', { id, err });
    }
  }
}

export const paymentService = new PaymentService();
