/**
 * Balance Service
 *
 * Non-custodial public balance data service.
 *
 * IMPORTANT DESIGN PRINCIPLE:
 * This service NEVER stores, computes, or returns private token balances.
 * Private shielded balances are only accessible to the user through their
 * 1AM Wallet client, which decrypts them locally using the wallet's
 * viewing key. The backend has no access to private state.
 *
 * What this service DOES provide:
 *   - Public on-chain statistics (note counts, transfer totals from contract Counters)
 *   - A hint to the frontend about which indexer endpoint to use for wallet queries
 *   - Validation that a given wallet address is a valid Midnight format
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { midnightService } from './midnight.service.js';
import { AppError, PublicOnChainBalance } from '../types/index.js';
import { isValidMidnightAddress } from '../utils/crypto.js';

// ---------------------------------------------------------------------------
// GraphQL query for public contract counter state
// ---------------------------------------------------------------------------

const CONTRACT_COUNTERS_QUERY = `
  query ContractCounters($address: String!) {
    contractState(address: $address) {
      totalShieldedDeposits
      totalConfidentialTransfers
      totalPaymentRequests
    }
  }
`;

interface ContractCountersData {
  contractState: {
    totalShieldedDeposits: number;
    totalConfidentialTransfers: number;
    totalPaymentRequests: number;
  } | null;
}

// ---------------------------------------------------------------------------
// BalanceService
// ---------------------------------------------------------------------------

class BalanceService {
  /**
   * Returns only public, on-chain observable data for a wallet address.
   *
   * Does NOT return:
   *   - NIGHT token amount
   *   - DUST token amount
   *   - tCYPHRA token amount
   *   - Transaction counterparties
   *   - Any private payment information
   *
   * The frontend fetches private balances directly from 1AM Wallet via
   * ConnectedAPI.getShieldedBalances() / .getDustBalance() — those calls
   * never touch this backend.
   */
  async getPublicOnChainData(shieldedAddress: string): Promise<{
    balance: PublicOnChainBalance;
    indexerEndpoint: string;
    walletQueryNote: string;
  }> {
    if (!isValidMidnightAddress(shieldedAddress)) {
      throw new AppError(
        'Invalid Midnight address format.',
        400,
        'INVALID_ADDRESS'
      );
    }

    logger.debug('Fetching public on-chain data', { shieldedAddress });

    // Fetch public contract counters from indexer
    let counters = { totalShieldedDeposits: 0, totalConfidentialTransfers: 0, totalPaymentRequests: 0 };

    try {
      const raw = await fetch(config.midnight.indexerUri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CONTRACT_COUNTERS_QUERY,
          variables: { address: config.midnight.contractAddress },
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (raw.ok) {
        const json = (await raw.json()) as { data?: ContractCountersData };
        if (json.data?.contractState) {
          counters = json.data.contractState;
        }
      }
    } catch (err) {
      logger.warn('Could not fetch contract counters from indexer', err);
    }

    return {
      balance: {
        shieldedAddress,
        unspentNoteCount: 0, // Not queryable per-address without viewing key — by design
        totalDeposits: counters.totalShieldedDeposits,
        totalTransfers: counters.totalConfidentialTransfers,
        lastSyncedAt: Date.now(),
      },
      indexerEndpoint: config.midnight.indexerUri,
      walletQueryNote:
        'Private balances (NIGHT, DUST, tCYPHRA) are only accessible via your connected 1AM Wallet. ' +
        'Use ConnectedAPI.getShieldedBalances() in the browser.',
    };
  }
}

export const balanceService = new BalanceService();
