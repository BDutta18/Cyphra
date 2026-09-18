/**
 * Cyphra Core Domain Types
 */

export type TokenType = 'NIGHT' | 'DUST' | 'tCYPHRA';

export interface TokenMetadata {
  symbol: TokenType;
  name: string;
  decimals: number;
  icon: string;
  isShieldedDefault: boolean;
}

export interface AddressInfo {
  shieldedAddress: string;
  shieldedCoinPublicKey: string;
  shieldedEncryptionPublicKey: string;
  unshieldedAddress: string;
  dustAddress: string;
}

export type PaymentRequestStatus =
  | 'pending'
  | 'settling'
  | 'completed'
  | 'expired'
  | 'cancelled';

export interface PaymentRequest {
  id: string;
  recipientAddress: string; // Shielded address
  amount: string; // In base units (e.g. string for high precision)
  tokenType: TokenType;
  memo?: string;
  nonce: string; // 32-byte hex string
  commitmentHash: string; // SHA-256 or Poseidon commitment of request
  status: PaymentRequestStatus;
  createdAt: number;
  expiresAt: number;
  settledAt?: number;
  settledTxHash?: string;
  signature?: string; // Optional request verification signature
}

export type TransactionType =
  | 'send_confidential'
  | 'receive_confidential'
  | 'shield_deposit'
  | 'unshield_withdraw'
  | 'payment_request_fulfill';

export interface TransactionActivity {
  id: string;
  txHash: string;
  blockHeight?: number;
  timestamp: number;
  type: TransactionType;
  amount: string;
  tokenType: TokenType;
  counterpartyMasked?: string;
  status: 'confirmed' | 'pending' | 'failed';
  proofVerified: boolean;
  proofType: 'CompactZKProof_Groth16' | 'CompactZKProof_Halo2';
  commitmentHash?: string;
  nullifierHash?: string;
  encryptedMemo?: string;
  gasFee: string;
}

export interface ViewingKeyGrant {
  grantId: string;
  ownerShieldedAddress: string;
  auditorAddress: string;
  permissions: number; // Bitmask: 1 = Read amounts, 2 = Read counterparty, 4 = Read memo
  expiresAt: number;
  issuedAt: number;
  active: boolean;
}

export interface AuditorDisclosedReport {
  generatedAt: number;
  auditorAddress: string;
  walletAddress: string;
  periodStart: number;
  periodEnd: number;
  totalVolume: Record<string, string>;
  transactions: Array<{
    txHash: string;
    timestamp: number;
    type: string;
    amount: string;
    tokenType: string;
    zkProofVerified: boolean;
    noteCommitment: string;
  }>;
  complianceAttestation: string;
}

export type MidnightNetworkId = 'preprod' | 'preview' | 'testnet' | 'devnet' | 'mainnet' | 'local';

export interface MidnightNetworkConfig {
  networkId: MidnightNetworkId;
  indexerUri: string;
  indexerWsUri: string;
  nodeUri: string;
  proverServerUri?: string;
  contractAddress: string;
  explorerUrl: string;
}

export interface ProofGenerationStep {
  step: 'initializing' | 'synthesizing_witness' | 'generating_proof' | 'balancing_tx' | 'signing' | 'broadcasting' | 'confirmed';
  progress: number;
  message: string;
}
