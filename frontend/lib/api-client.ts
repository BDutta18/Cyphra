/**
 * CYPHRA Frontend API Client
 * Connects frontend to the real backend in /backend
 *
 * Never transmits or stores:
 *   - Private keys
 *   - Seed phrases
 *   - Wallet credentials
 *   - Private balances
 */

import {
  PaymentRequest,
  CreatePaymentRequestInput,
  FulfillPaymentRequestInput,
  TransactionActivity,
  AuditorDisclosedReport,
} from './cyphra-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: Array<{ field: string; message: string }>;
  meta?: Record<string, unknown>;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  walletAddress?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (walletAddress) {
    headers['x-wallet-address'] = walletAddress;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const json = (await res.json()) as ApiEnvelope<T>;

  if (!res.ok || !json.success) {
    const errorMsg = json.error || `HTTP ${res.status}: ${res.statusText}`;
    const err = new Error(errorMsg) as Error & { code?: string; details?: unknown };
    err.code = json.code;
    err.details = json.details;
    throw err;
  }

  return json.data as T;
}

export const apiClient = {
  // ---------------------------------------------------------------------------
  // Health & Network
  // ---------------------------------------------------------------------------
  async getHealth() {
    return request<{ status: string; service: string; midnight: unknown }>('/health');
  },

  async getNetworkStatus() {
    return request<unknown>('/api/network');
  },

  // ---------------------------------------------------------------------------
  // Balance (Public On-Chain Stats only - private balance is from 1AM Wallet)
  // ---------------------------------------------------------------------------
  async getPublicBalance(walletAddress: string) {
    return request<{
      balance: {
        shieldedAddress: string;
        unspentNoteCount: number;
        totalDeposits: number;
        totalTransfers: number;
        lastSyncedAt: number;
      };
      indexerEndpoint: string;
      walletQueryNote: string;
    }>('/api/balance', { method: 'GET' }, walletAddress);
  },

  // ---------------------------------------------------------------------------
  // Payments (Status Tracking)
  // ---------------------------------------------------------------------------
  async registerPayment(
    payment: {
      nullifierHash: string;
      recipientCommitment: string;
      tokenType: string;
      txHash: string;
    },
    walletAddress: string
  ) {
    return request<{
      id: string;
      nullifierHash: string;
      recipientCommitment: string;
      tokenType: string;
      txHash: string;
      status: string;
      createdAt: number;
      networkId: string;
    }>(
      '/api/payments',
      {
        method: 'POST',
        body: JSON.stringify(payment),
      },
      walletAddress
    );
  },

  async getPaymentStatus(paymentId: string) {
    return request<{
      id: string;
      txHash: string;
      status: string;
      blockHeight?: number;
      confirmedAt?: number;
    }>(`/api/payments/${paymentId}`);
  },

  // ---------------------------------------------------------------------------
  // Payment Requests
  // ---------------------------------------------------------------------------
  async createPaymentRequest(
    input: CreatePaymentRequestInput,
    walletAddress?: string
  ): Promise<{ request: PaymentRequest; paymentUri: string }> {
    return request<{ request: PaymentRequest; paymentUri: string }>(
      '/api/payment-requests',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      walletAddress || input.recipientAddress
    );
  },

  async getPaymentRequest(id: string): Promise<{ request: PaymentRequest; paymentUri: string }> {
    return request<{ request: PaymentRequest; paymentUri: string }>(`/api/payment-requests/${id}`);
  },

  async verifyPaymentRequest(id: string): Promise<{ valid: boolean; request?: PaymentRequest; reason?: string }> {
    return request<{ valid: boolean; request?: PaymentRequest; reason?: string }>(
      `/api/payment-requests/${id}/verify`
    );
  },

  async fulfillPaymentRequest(
    input: FulfillPaymentRequestInput,
    walletAddress?: string
  ): Promise<PaymentRequest> {
    return request<PaymentRequest>(
      `/api/payment-requests/${input.requestId}/fulfill`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      walletAddress || input.payerShieldedAddress
    );
  },

  async getRecipientRequests(address: string): Promise<PaymentRequest[]> {
    try {
      return await request<PaymentRequest[]>(`/api/payment-requests/recipient/${address}`);
    } catch {
      return [];
    }
  },

  // ---------------------------------------------------------------------------
  // Activity
  // ---------------------------------------------------------------------------
  async recordActivity(
    walletAddress: string,
    activity: Omit<TransactionActivity, 'id'>
  ): Promise<TransactionActivity> {
    return request<TransactionActivity>(
      '/api/activity/record',
      {
        method: 'POST',
        body: JSON.stringify(activity),
      },
      walletAddress
    );
  },

  async getActivity(walletAddress: string): Promise<TransactionActivity[]> {
    try {
      return await request<TransactionActivity[]>('/api/activity', { method: 'GET' }, walletAddress);
    } catch {
      return [];
    }
  },

  // ---------------------------------------------------------------------------
  async generateAuditorReport(params: {
    ownerAddress: string;
    auditorAddress: string;
    periodStart: number;
    periodEnd: number;
  }): Promise<AuditorDisclosedReport> {
    return request<AuditorDisclosedReport>('/api/activity/disclose', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async requestFaucet(
    address: string,
    token: string = 'NIGHT'
  ): Promise<{ success: boolean; txHash: string; amount: string }> {
    return request<{ success: boolean; txHash: string; amount: string }>('/api/network/faucet', {
      method: 'POST',
      body: JSON.stringify({ address, token }),
    });
  },
};
