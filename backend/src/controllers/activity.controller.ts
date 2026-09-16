import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service.js';
import { ApiResponse } from '../types/index.js';
import { AppError } from '../types/index.js';
import { generateRequestId } from '../utils/crypto.js';
import { isValidMidnightAddress } from '../utils/crypto.js';
import { z } from 'zod';

// Query params schema
const ActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  type: z
    .enum([
      'send_confidential',
      'receive_confidential',
      'shield_deposit',
      'unshield_withdraw',
      'payment_request_fulfill',
    ])
    .optional(),
});

export class ActivityController {
  /**
   * GET /api/activity
   * Returns activity for the wallet address in x-wallet-address header.
   * Supports pagination and type filtering.
   */
  static async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const walletAddress = req.headers['x-wallet-address'] as string;

      if (!walletAddress || !isValidMidnightAddress(walletAddress)) {
        throw new AppError(
          'Valid x-wallet-address header required.',
          401,
          'MISSING_WALLET_ADDRESS'
        );
      }

      const query = ActivityQuerySchema.parse(req.query);
      const activities = activityService.getActivity(walletAddress, {
        limit: query.limit,
        offset: query.offset,
        typeFilter: query.type,
      });

      const body: ApiResponse<typeof activities> = {
        success: true,
        data: activities,
        meta: {
          timestamp: Date.now(),
          requestId,
          count: activities.length,
          limit: query.limit,
          offset: query.offset,
        },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/activity/record
   * Records a new transaction activity entry.
   * Called by the frontend after a transaction is confirmed.
   * Sensitive fields (amounts, memo) are accepted but handled per privacy model.
   */
  static async record(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const walletAddress = req.headers['x-wallet-address'] as string;

      if (!walletAddress || !isValidMidnightAddress(walletAddress)) {
        throw new AppError('Valid x-wallet-address header required.', 401, 'MISSING_WALLET_ADDRESS');
      }

      const activity = activityService.recordActivity(walletAddress, req.body);

      const body: ApiResponse<typeof activity> = {
        success: true,
        data: activity,
        meta: { timestamp: Date.now(), requestId },
      };

      res.status(201).json(body);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/activity/grant-auditor
   * Grants an auditor viewing access with a permissions bitmask.
   */
  static async grantAuditor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const grant = activityService.grantAuditorAccess(req.body);

      const body: ApiResponse<typeof grant> = {
        success: true,
        data: grant,
        meta: { timestamp: Date.now(), requestId },
      };

      res.status(201).json(body);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/activity/disclose
   * Generates a selective disclosure report for an auditor.
   */
  static async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const { ownerAddress, auditorAddress, periodStart, periodEnd } = req.body as {
        ownerAddress: string;
        auditorAddress: string;
        periodStart: number;
        periodEnd: number;
      };

      if (!ownerAddress || !auditorAddress || !periodStart || !periodEnd) {
        throw new AppError(
          'ownerAddress, auditorAddress, periodStart, and periodEnd are required.',
          400,
          'MISSING_FIELDS'
        );
      }

      const report = activityService.generateDisclosedReport({
        ownerAddress,
        auditorAddress,
        periodStart,
        periodEnd,
      });

      const body: ApiResponse<typeof report> = {
        success: true,
        data: report,
        meta: { timestamp: Date.now(), requestId },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }
}
