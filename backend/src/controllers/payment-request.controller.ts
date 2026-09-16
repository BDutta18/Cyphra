import { Request, Response, NextFunction } from 'express';
import { paymentRequestService } from '../services/payment-request.service.js';
import { ApiResponse } from '../types/index.js';
import { AppError } from '../types/index.js';
import { generateRequestId } from '../utils/crypto.js';

export class PaymentRequestController {
  /**
   * POST /api/payment-requests
   * Creates a new payment request and returns a shareable URI + QR data.
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      // req.body already validated by validateBody(CreatePaymentRequestSchema)
      const { request, paymentUri } = await paymentRequestService.createRequest(req.body);

      const body: ApiResponse<{ request: typeof request; paymentUri: string }> = {
        success: true,
        data: { request, paymentUri },
        meta: { timestamp: Date.now(), requestId },
      };

      res.status(201).json(body);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/payment-requests/:id
   * Returns a payment request with integrity verification.
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const { id } = req.params;

      const result = await paymentRequestService.getRequestById(id);
      if (!result) {
        throw new AppError(`Payment request '${id}' not found.`, 404, 'NOT_FOUND');
      }

      const body: ApiResponse<typeof result> = {
        success: true,
        data: result,
        meta: { timestamp: Date.now(), requestId },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/payment-requests/:id/fulfill
   * Marks a payment request as fulfilled after on-chain confirmation.
   */
  static async fulfill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const { id } = req.params;

      const fulfilled = await paymentRequestService.fulfillRequest({
        requestId: id,
        ...req.body,
      });

      const body: ApiResponse<typeof fulfilled> = {
        success: true,
        data: fulfilled,
        meta: { timestamp: Date.now(), requestId },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/payment-requests/:id/verify
   * Verifies commitment hash integrity of a request (tamper detection).
   */
  static async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const { id } = req.params;

      const result = await paymentRequestService.verifyIntegrity(id);

      const body: ApiResponse<typeof result> = {
        success: true,
        data: result,
        meta: { timestamp: Date.now(), requestId },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/payment-requests/recipient/:address
   * Lists payment requests for a given recipient address.
   */
  static async listByRecipient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const { address } = req.params;

      if (!address) {
        throw new AppError('Recipient address parameter is required.', 400, 'MISSING_ADDRESS');
      }

      const requests = await paymentRequestService.listByRecipient(address);

      const body: ApiResponse<typeof requests> = {
        success: true,
        data: requests,
        meta: { timestamp: Date.now(), requestId, count: requests.length },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }
}
