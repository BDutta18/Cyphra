'use client';

import { useState, useCallback, useEffect } from 'react';
import { PaymentRequest, CreatePaymentRequestInput, FulfillPaymentRequestInput } from '@cyphra/shared';
import { apiClient } from '../lib/api-client';

export interface AccountForRequests {
  shieldedAddress: string;
}

export function usePaymentRequest(account: AccountForRequests | null) {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRequests = useCallback(async () => {
    if (!account?.shieldedAddress) return;
    setIsLoading(true);
    try {
      const data = await apiClient.getRecipientRequests(account.shieldedAddress);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  }, [account?.shieldedAddress]);

  useEffect(() => {
    refreshRequests();
  }, [refreshRequests]);

  const createRequest = useCallback(
    async (input: CreatePaymentRequestInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.createPaymentRequest(input, account?.shieldedAddress);
        await refreshRequests();
        return res;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create request';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [account?.shieldedAddress, refreshRequests]
  );

  const fulfillRequest = useCallback(
    async (input: FulfillPaymentRequestInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.fulfillPaymentRequest(input, account?.shieldedAddress);
        await refreshRequests();
        return res;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fulfill payment request';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [account?.shieldedAddress, refreshRequests]
  );

  const verifyRequest = useCallback(async (requestId: string) => {
    return await apiClient.verifyPaymentRequest(requestId);
  }, []);

  return {
    requests,
    isLoading,
    error,
    createRequest,
    fulfillRequest,
    verifyRequest,
    refreshRequests,
  };
}
