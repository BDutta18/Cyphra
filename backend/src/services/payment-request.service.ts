/**
 * Payment Request Service
 *
 * Manages confidential payment requests on the CYPHRA platform.
 *
 * Privacy Model:
 *   - Amounts and memos are stored ONLY for the purpose of generating QR codes
 *     and deep links shared directly between parties (user-to-user, not public).
 *   - The backend stores the minimum metadata needed to facilitate the request flow.
 *   - Sensitive fields (memo content) are NEVER logged.
 *   - No private keys, balances, or wallet credentials are stored.
 *   - On-chain fulfillment verification is done via the Midnight indexer (nullifier check).
 *
 * Lifetime:
 *   - Requests expire after `expiryHours` (1–720 hours, default 24).
 *   - Fulfilled requests are marked 'completed' with the settlement tx hash.
 *   - Expired requests are cleaned up lazily on read.
 */

import crypto from 'node:crypto';
import {
  PaymentRequest,
  CreatePaymentRequestInput,
  FulfillPaymentRequestInput,
  computeRequestCommitment,
  encodePaymentUri,
  generateNonce,
  verifyPaymentRequestIntegrity,
} from '@cyphra/shared';
import { AppError } from '../types/index.js';
import { midnightService } from './midnight.service.js';
import { logger } from '../utils/logger.js';

class PaymentRequestService {
  // In-memory store — production deployment should use a persistent store
  private requests: Map<string, PaymentRequest> = new Map();

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  async createRequest(input: CreatePaymentRequestInput): Promise<{
    request: PaymentRequest;
    paymentUri: string;
  }> {
    const id = crypto.randomUUID();
    const nonce = generateNonce();
    const createdAt = Date.now();
    const expiresAt = createdAt + input.expiryHours * 60 * 60 * 1000;

    const commitmentHash = await computeRequestCommitment({
      recipientAddress: input.recipientAddress,
      amount: input.amount,
      tokenType: input.tokenType,
      nonce,
      memo: input.memo,
    });

    const request: PaymentRequest = {
      id,
      recipientAddress: input.recipientAddress,
      amount: input.amount,
      tokenType: input.tokenType,
      memo: input.memo,
      nonce,
      commitmentHash,
      status: 'pending',
      createdAt,
      expiresAt,
    };

    this.requests.set(id, request);

    // Log without sensitive content
    logger.info('Payment request created', {
      id,
      tokenType: input.tokenType,
      expiresAt: new Date(expiresAt).toISOString(),
    });

    const paymentUri = encodePaymentUri(request);
    return { request, paymentUri };
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async getRequestById(id: string): Promise<{
    request: PaymentRequest;
    paymentUri: string;
  } | null> {
    const req = this.requests.get(id);
    if (!req) return null;

    this.updateExpiry(req);
    return { request: req, paymentUri: encodePaymentUri(req) };
  }

  async listByRecipient(recipientAddress: string): Promise<PaymentRequest[]> {
    const list: PaymentRequest[] = [];

    for (const req of this.requests.values()) {
      if (req.recipientAddress.toLowerCase() === recipientAddress.toLowerCase()) {
        this.updateExpiry(req);
        list.push(req);
      }
    }

    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  // ---------------------------------------------------------------------------
  // Fulfill (called after 1AM Wallet submits the on-chain payment)
  // ---------------------------------------------------------------------------

  async fulfillRequest(input: FulfillPaymentRequestInput): Promise<PaymentRequest> {
    const req = this.requests.get(input.requestId);
    if (!req) {
      throw new AppError(`Payment request '${input.requestId}' not found.`, 404, 'REQUEST_NOT_FOUND');
    }

    this.updateExpiry(req);

    if (req.status === 'completed') {
      throw new AppError('Payment request has already been settled.', 409, 'ALREADY_SETTLED');
    }
    if (req.status === 'expired') {
      throw new AppError('Payment request has expired.', 410, 'REQUEST_EXPIRED');
    }
    if (req.status === 'cancelled') {
      throw new AppError('Payment request has been cancelled.', 410, 'REQUEST_CANCELLED');
    }

    // Verify on-chain: check that the provided nullifier is actually spent
    // This confirms the payment happened on Midnight without revealing amounts.
    let onChainVerified = false;
    try {
      onChainVerified = await midnightService.isNullifierSpent(input.paymentNullifier);
    } catch (err) {
      logger.warn('Could not verify nullifier on-chain during fulfillment', {
        requestId: input.requestId,
        error: err,
      });
    }

    if (!onChainVerified) {
      logger.warn('Nullifier not yet confirmed on-chain for fulfillment', {
        requestId: input.requestId,
        txHash: input.txHash,
      });
      // Allow fulfillment even if indexer hasn't indexed it yet
      // (indexer can lag a few blocks). Mark as 'settling' instead.
      req.status = 'settling' as PaymentRequest['status'];
    } else {
      req.status = 'completed';
    }

    req.settledAt = Date.now();
    req.settledTxHash = input.txHash;

    logger.info('Payment request fulfilled', {
      id: req.id,
      txHash: input.txHash,
      onChainVerified,
      status: req.status,
    });

    return req;
  }

  // ---------------------------------------------------------------------------
  // Verify integrity (for sender-side validation before paying)
  // ---------------------------------------------------------------------------

  async verifyIntegrity(requestId: string): Promise<{
    valid: boolean;
    request?: PaymentRequest;
    reason?: string;
  }> {
    const req = this.requests.get(requestId);
    if (!req) {
      return { valid: false, reason: 'Request not found' };
    }

    this.updateExpiry(req);

    if (req.status !== 'pending' && req.status !== 'settling') {
      return { valid: false, reason: `Request status is '${req.status}'` };
    }

    const integrityOk = await verifyPaymentRequestIntegrity({
      recipientAddress: req.recipientAddress,
      amount: req.amount,
      tokenType: req.tokenType,
      nonce: req.nonce,
      memo: req.memo,
      commitmentHash: req.commitmentHash,
    });

    if (!integrityOk) {
      return { valid: false, reason: 'Commitment hash mismatch — request may have been tampered' };
    }

    return { valid: true, request: req };
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private updateExpiry(req: PaymentRequest): void {
    if (req.status === 'pending' && Date.now() > req.expiresAt) {
      req.status = 'expired';
    }
  }
}

export const paymentRequestService = new PaymentRequestService();
