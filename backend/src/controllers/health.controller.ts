import { Request, Response, NextFunction } from 'express';
import { midnightService } from '../services/midnight.service.js';
import { config } from '../config/index.js';
import { ApiResponse, HealthResponse } from '../types/index.js';
import { generateRequestId } from '../utils/crypto.js';

export class HealthController {
  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const midnight = await midnightService.getNetworkHealth();

      const body: ApiResponse<HealthResponse> = {
        success: true,
        data: {
          status: midnight.status === 'offline' ? 'error' : midnight.status === 'degraded' ? 'degraded' : 'ok',
          service: 'cyphra-backend',
          version: '0.1.0',
          uptime: Math.floor(process.uptime()),
          timestamp: Date.now(),
          midnight,
        },
        meta: { timestamp: Date.now(), requestId },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }
}
