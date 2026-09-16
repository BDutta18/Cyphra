import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireWalletAddress } from '../middleware/wallet.middleware.js';
import { CreatePaymentSchema } from '../services/payment.service.js';

export const paymentRouter: Router = Router();

/**
 * POST /api/payments
 * Register a submitted payment transaction for on-chain status tracking.
 *
 * Headers required:
 *   x-wallet-address: <sender's Midnight shielded address>
 *
 * Body (JSON):
 *   nullifierHash:       string  — 64-char hex, the spent note's nullifier
 *   recipientCommitment: string  — 64-char hex, the recipient's note commitment
 *   tokenType:           string  — 'NIGHT' | 'DUST' | 'tCYPHRA'
 *   txHash:              string  — transaction hash from 1AM Wallet
 */
paymentRouter.post(
  '/',
  requireWalletAddress,
  validateBody(CreatePaymentSchema),
  PaymentController.create
);

/**
 * GET /api/payments/:id
 * Get a payment record by its backend-assigned UUID.
 * Returns current on-chain status from Midnight indexer.
 */
paymentRouter.get('/:id', PaymentController.getById);
