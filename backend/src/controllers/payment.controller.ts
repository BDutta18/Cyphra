import { Request, Response, NextFunction } from 'express';
import { paymentService, CreatePaymentSchema } from '../services/payment.service.js';
import { midnightService } from '../services/midnight.service.js';
import { ApiResponse } from '../types/index.js';
import { AppError } from '../types/index.js';
import { generateRequestId } from '../utils/crypto.js';

/**
 * Payment Controller
 *
 * Non-custodial payment status tracking.
 *
 * POST /api/payments
 *   Called by the frontend AFTER 1AM Wallet submits the proven transaction.
 *   Records the public identifiers (txHash, nullifier, commitment) for status tracking.
 *   NEVER receives amounts, private keys, or wallet credentials.
 *
 * GET /api/payments/:id
 *   Returns the payment record with current on-chain status.
 */
export class PaymentController {
  /**
   * POST /api/payments
   * Register a submitted payment for on-chain status tracking.
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();

      // Validate with Zod (body already parsed by validateBody middleware)
      const input = CreatePaymentSchema.parse(req.body);

      const record = await paymentService.createPayment(input);

      const body: ApiResponse<typeof record> = {
        success: true,
        data: record,
        meta: {
          timestamp: Date.now(),
          requestId,
          explorerUrl: `https://explorer.${record.networkId}.midnight.network/tx/${record.txHash}`,
        },
      };

      res.status(201).json(body);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/payments/:id
   * Get a payment record by its backend-assigned UUID.
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        throw new AppError('Payment ID is required.', 400, 'MISSING_ID');
      }

      const record = await paymentService.getPayment(id);

      // Augment with live on-chain status if submitted
      let onChainInfo: Record<string, unknown> = {};
      if (record.txHash && (record.status === 'submitted' || record.status === 'confirmed')) {
        const txInfo = await midnightService.getTransactionStatus(record.txHash);
        if (txInfo.found) {
          onChainInfo = {
            onChainStatus: txInfo.status,
            blockHeight: txInfo.blockHeight,
            explorerUrl: txInfo.explorerUrl,
          };
        }
      }

      const body: ApiResponse<typeof record> = {
        success: true,
        data: record,
        meta: {
          timestamp: Date.now(),
          requestId,
          ...onChainInfo,
        },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }
}
