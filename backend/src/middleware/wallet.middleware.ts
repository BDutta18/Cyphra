import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';
import { isValidMidnightAddress } from '../utils/crypto.js';

/**
 * Wallet address extraction middleware.
 *
 * Reads the wallet address from the x-wallet-address header.
 * This is the caller's Midnight shielded or unshielded address —
 * NOT a credential. The backend is NEVER custodial and never stores
 * private keys, seed phrases, or signing keys.
 *
 * The frontend sends this after 1AM Wallet returns the address via
 * ConnectedAPI.getShieldedAddresses() or .getUnshieldedAddress().
 *
 * Usage: apply to routes that need to know WHICH wallet is requesting data.
 */
export function extractWalletAddress(req: Request, _res: Response, next: NextFunction): void {
  const address = req.headers['x-wallet-address'] as string | undefined;
  if (address) {
    (req as Request & { walletAddress?: string }).walletAddress = address;
  }
  next();
}

/**
 * Requires a valid wallet address header to be present.
 * Returns 401 if missing or invalid format.
 */
export function requireWalletAddress(req: Request, _res: Response, next: NextFunction): void {
  const address = req.headers['x-wallet-address'] as string | undefined;
  if (!address) {
    throw new AppError(
      'Wallet address required. Set x-wallet-address header to your Midnight address.',
      401,
      'MISSING_WALLET_ADDRESS'
    );
  }
  if (!isValidMidnightAddress(address)) {
    throw new AppError(
      'Invalid Midnight wallet address in x-wallet-address header.',
      400,
      'INVALID_WALLET_ADDRESS'
    );
  }
  (req as Request & { walletAddress?: string }).walletAddress = address;
  next();
}
