import { Request, Response, NextFunction } from 'express';
import { balanceService } from '../services/balance.service.js';
import { ApiResponse } from '../types/index.js';
import { generateRequestId } from '../utils/crypto.js';

/**
 * Balance Controller
 *
 * Returns public on-chain observable data only.
 * Private balances (NIGHT, DUST, tCYPHRA) are NEVER exposed here.
 * Those must be fetched directly from 1AM Wallet via ConnectedAPI.
 */
export class BalanceController {
  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
      const shieldedAddress = req.headers['x-wallet-address'] as string;

      // shieldedAddress is validated by requireWalletAddress middleware upstream
      const result = await balanceService.getPublicOnChainData(shieldedAddress);

      const body: ApiResponse<typeof result> = {
        success: true,
        data: result,
        meta: {
          timestamp: Date.now(),
          requestId,
          note: 'Private balances are only accessible via your 1AM Wallet. See data.walletQueryNote.',
        },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }
}
