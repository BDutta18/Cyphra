import { Request, Response, NextFunction } from 'express';
import { midnightService } from '../services/midnight.service.js';
import { ApiResponse } from '../types/index.js';
import { generateRequestId } from '../utils/crypto.js';

export class NetworkController {
  static async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = (req.headers['x-request-id'] as string) ?? generateRequestId();
      const health = await midnightService.getNetworkHealth();
      const response: ApiResponse<typeof health> = {
        success: true,
        data: health,
        meta: { timestamp: Date.now(), requestId },
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  static async getTxStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = (req.headers['x-request-id'] as string) ?? generateRequestId();
      const { hash } = req.params;
      const txInfo = await midnightService.getTransactionStatus(hash);
      const response: ApiResponse<typeof txInfo> = {
        success: true,
        data: txInfo,
        meta: { timestamp: Date.now(), requestId },
      };
      res.status(txInfo.found ? 200 : 404).json(response);
    } catch (err) {
      next(err);
    }
  }
}
