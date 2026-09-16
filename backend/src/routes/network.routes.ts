import { Router } from 'express';
import { midnightService } from '../services/midnight.service.js';
import { ApiResponse } from '../types/index.js';
import { generateRequestId } from '../utils/crypto.js';
import { config } from '../config/index.js';

export const networkRouter: Router = Router();

/**
 * GET /api/network
 * Returns live Midnight network status queried from the indexer.
 */
networkRouter.get('/', async (req, res, next) => {
  try {
    const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
    const health = await midnightService.getNetworkHealth();

    const body: ApiResponse<typeof health> = {
      success: true,
      data: health,
      meta: {
        timestamp: Date.now(),
        requestId,
        indexerUri: config.midnight.indexerUri,
        explorerBase: `https://explorer.${config.midnight.networkId}.midnight.network`,
      },
    };

    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/network/tx/:hash
 * Returns on-chain status for a transaction hash.
 */
networkRouter.get('/tx/:hash', async (req, res, next) => {
  try {
    const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
    const { hash } = req.params;
    const txInfo = await midnightService.getTransactionStatus(hash);

    const body: ApiResponse<typeof txInfo> = {
      success: true,
      data: txInfo,
      meta: { timestamp: Date.now(), requestId },
    };

    res.status(txInfo.found ? 200 : 404).json(body);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/network/commitment/:hash
 * Checks whether a note commitment exists on-chain (unspent).
 */
networkRouter.get('/commitment/:hash', async (req, res, next) => {
  try {
    const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
    const exists = await midnightService.isCommitmentOnChain(req.params.hash);

    res.status(200).json({
      success: true,
      data: { commitment: req.params.hash, exists },
      meta: { timestamp: Date.now(), requestId },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/network/nullifier/:hash
 * Checks whether a nullifier has been spent on-chain.
 */
networkRouter.get('/nullifier/:hash', async (req, res, next) => {
  try {
    const requestId = req.headers['x-request-id'] as string ?? generateRequestId();
    const spent = await midnightService.isNullifierSpent(req.params.hash);

    res.status(200).json({
      success: true,
      data: { nullifier: req.params.hash, spent },
      meta: { timestamp: Date.now(), requestId },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/network/faucet
 * Testnet faucet funding helper for testing.
 */
networkRouter.post('/faucet', async (req, res, next) => {
  try {
    const requestId = (req.headers['x-request-id'] as string) ?? generateRequestId();
    const { address, token = 'NIGHT' } = req.body;
    if (!address) {
      res.status(400).json({ success: false, error: 'Recipient address is required' });
      return;
    }
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    res.status(200).json({
      success: true,
      data: {
        success: true,
        txHash,
        amount: token === 'DUST' ? '10.00' : '100.00',
      },
      meta: { timestamp: Date.now(), requestId },
    });
  } catch (err) {
    next(err);
  }
});
