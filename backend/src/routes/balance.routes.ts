import { Router } from 'express';
import { BalanceController } from '../controllers/balance.controller.js';
import { requireWalletAddress } from '../middleware/wallet.middleware.js';

export const balanceRouter: Router = Router();

/**
 * GET /api/balance
 * Returns public on-chain observable data for the requesting wallet.
 *
 * IMPORTANT: Private balances (NIGHT, DUST, tCYPHRA) are NOT returned here.
 * They must be fetched client-side via 1AM Wallet's ConnectedAPI:
 *   - ConnectedAPI.getShieldedBalances()
 *   - ConnectedAPI.getDustBalance()
 *
 * Headers required:
 *   x-wallet-address: <shielded Midnight address>
 *
 * Returns:
 *   - unspentNoteCount: always 0 (not queryable without viewing key — by design)
 *   - totalDeposits:    aggregate shield deposit count from contract Counter
 *   - totalTransfers:   aggregate confidential transfer count from contract Counter
 *   - indexerEndpoint:  the indexer the frontend should use for direct queries
 *   - walletQueryNote:  guidance text about where to get private balances
 */
balanceRouter.get('/', requireWalletAddress, BalanceController.get);
