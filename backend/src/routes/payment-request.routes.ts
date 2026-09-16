import { Router } from 'express';
import { PaymentRequestController } from '../controllers/payment-request.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireWalletAddress } from '../middleware/wallet.middleware.js';
import { CreatePaymentRequestSchema, FulfillPaymentRequestSchema } from '@cyphra/shared';

export const paymentRequestRouter: Router = Router();

/**
 * POST /api/payment-requests
 * Create a new payment request. Returns a shareable URI + commitment hash.
 *
 * Headers: x-wallet-address (recipient's shielded address)
 * Body: { recipientAddress, amount, tokenType, memo?, expiryHours? }
 */
paymentRequestRouter.post(
  '/',
  requireWalletAddress,
  validateBody(CreatePaymentRequestSchema),
  PaymentRequestController.create
);

/**
 * GET /api/payment-requests/recipient/:address
 * List all payment requests for a given recipient address.
 * NOTE: Must be before /:id to avoid route shadowing
 */
paymentRequestRouter.get(
  '/recipient/:address',
  PaymentRequestController.listByRecipient
);

/**
 * GET /api/payment-requests/:id
 * Get a specific payment request by ID.
 */
paymentRequestRouter.get('/:id', PaymentRequestController.getById);

/**
 * GET /api/payment-requests/:id/verify
 * Verify the integrity of a payment request (commitment hash check).
 * Senders call this before fulfilling to detect tampering.
 */
paymentRequestRouter.get('/:id/verify', PaymentRequestController.verify);

/**
 * POST /api/payment-requests/:id/fulfill
 * Mark a payment request as fulfilled after on-chain submission.
 * Verifies the nullifier is spent on-chain via Midnight indexer.
 *
 * Body: { payerShieldedAddress, txHash, paymentNullifier, receiptCommitment }
 */
paymentRequestRouter.post(
  '/:id/fulfill',
  requireWalletAddress,
  validateBody(FulfillPaymentRequestSchema),
  PaymentRequestController.fulfill
);
