'use client';

import { useState, useCallback } from 'react';
import { ProofGenerationStep, TokenType } from '@cyphra/shared';
import {
  oneAMWallet,
  TransactionExecutionResult,
  InsufficientBalanceError,
  WalletRejectionError,
  InvalidRecipientError,
  InvalidAmountError,
  WalletUnavailableError,
  WrongNetworkError,
  DuplicateSubmissionError,
  TransactionFailedError,
} from '../lib/one-am-wallet-adapter';

export interface AccountForTransfer {
  shieldedAddress: string;
}

export function useConfidentialTransfer(account: AccountForTransfer | null) {
  const [isProving, setIsProving] = useState(false);
  const [step, setStep] = useState<ProofGenerationStep | null>(null);
  const [lastResult, setLastResult] = useState<TransactionExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendPayment = useCallback(
    async (params: {
      recipientAddress: string;
      amount: string;
      tokenType: TokenType;
      memo?: string;
    }): Promise<TransactionExecutionResult> => {
      if (!account || !oneAMWallet.isConnected()) {
        const err = new WalletUnavailableError('Please connect your 1AM Wallet to send confidential payments.');
        setError(err.message);
        throw err;
      }

      setIsProving(true);
      setError(null);
      setLastResult(null);

      // Step 1: Initializing & circuit preparation
      setStep({
        step: 'initializing',
        progress: 15,
        message: 'Initializing Compact circuit constraint system and verifying parameters...',
      });

      try {
        // Step 2: Synthesizing Witness
        setStep({
          step: 'synthesizing_witness',
          progress: 35,
          message: 'Extracting private witness inputs & note preimages from 1AM Wallet...',
        });

        // Step 3: Proving & 1AM Approval Prompt
        setStep({
          step: 'generating_proof',
          progress: 60,
          message: 'Generating zero-knowledge proof (proving value conservation) in 1AM prover...',
        });

        // Step 4: Balancing
        setStep({
          step: 'balancing_tx',
          progress: 80,
          message: 'Balancing transaction and covering DUST network fees...',
        });

        // Execute actual 1AM submission
        const result = await oneAMWallet.submitConfidentialPayment(params);

        // Step 5: Confirmed
        setStep({
          step: 'confirmed',
          progress: 100,
          message: 'Confidential transaction confirmed on Midnight blockchain!',
        });

        setLastResult(result);
        return result;
      } catch (err: unknown) {
        let userMessage = 'Confidential payment failed.';
        if (err instanceof InsufficientBalanceError) {
          userMessage = err.message;
        } else if (err instanceof WalletRejectionError) {
          userMessage = 'Transaction was rejected by the user in 1AM Wallet.';
        } else if (err instanceof InvalidRecipientError) {
          userMessage = err.message;
        } else if (err instanceof InvalidAmountError) {
          userMessage = err.message;
        } else if (err instanceof WrongNetworkError) {
          userMessage = err.message;
        } else if (err instanceof DuplicateSubmissionError) {
          userMessage = err.message;
        } else if (err instanceof WalletUnavailableError) {
          userMessage = err.message;
        } else if (err instanceof TransactionFailedError) {
          userMessage = err.message;
        } else if (err instanceof Error) {
          userMessage = err.message;
        }

        setError(userMessage);
        throw new Error(userMessage);
      } finally {
        setIsProving(false);
      }
    },
    [account]
  );

  const reset = useCallback(() => {
    setIsProving(false);
    setStep(null);
    setLastResult(null);
    setError(null);
  }, []);

  return {
    sendPayment,
    isProving,
    step,
    lastResult,
    error,
    reset,
  };
}
