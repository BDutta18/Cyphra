/**
 * CYPHRA Frontend — Inlined Types & Utilities
 *
 * Vendors types and pure-JS utilities from @cyphra/shared and @cyphra/contracts
 * so the frontend builds correctly on Vercel without npm-workspace symlinks.
 *
 * Keep in sync with:
 *   shared/src/types/index.ts
 *   shared/src/payment-request.ts
 *   shared/src/constants/index.ts
 *   contracts/cyphra/src/index.ts  (crypto utilities only)
 */

// ---------------------------------------------------------------------------
// Core Domain Types
// ---------------------------------------------------------------------------

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
  recipientAddress: string;
  amount: string;
  tokenType: TokenType;
  memo?: string;
  nonce: string;
  commitmentHash: string;
  status: PaymentRequestStatus;
  createdAt: number;
  expiresAt: number;
  settledAt?: number;
  settledTxHash?: string;
  signature?: string;
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
  permissions: number;
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

export type MidnightNetworkId = 'testnet' | 'devnet' | 'mainnet' | 'local';

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
  step:
    | 'initializing'
    | 'synthesizing_witness'
    | 'generating_proof'
    | 'balancing_tx'
    | 'signing'
    | 'broadcasting'
    | 'confirmed';
  progress: number;
  message: string;
}

// ---------------------------------------------------------------------------
// Payment Request Types
// ---------------------------------------------------------------------------

export interface PaymentRequestData {
  id: string;
  recipientAddress: string;
  asset: TokenType;
  tokenType: TokenType;
  amount: string;
  note?: string;
  memo?: string;
  expiration: number;
  expiresAt: number;
  nonce: string;
  commitmentHash: string;
}

export interface DecodedPaymentRequest extends PaymentRequestData {
  isExpired: boolean;
  expiresInMs: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  code?: 'EXPIRED' | 'TAMPERED' | 'INVALID_FORMAT' | 'INVALID_ADDRESS' | 'INVALID_AMOUNT' | 'INVALID_ASSET';
  request?: DecodedPaymentRequest;
}

export interface CreatePaymentRequestInput {
  recipientAddress: string;
  amount: string;
  tokenType: TokenType;
  memo?: string;
  expiresInMs?: number;
  expiryHours?: number;
}

export interface FulfillPaymentRequestInput {
  requestId: string;
  senderShieldedAddress?: string;
  payerShieldedAddress?: string;
  txHash?: string;
  paymentNullifier?: string;
  receiptCommitment?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const URI_SCHEME = 'cyphra:pay';
export const DEFAULT_PAYMENT_REQUEST_EXPIRY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// SHA-256 (browser + edge + Node.js, zero external deps)
// ---------------------------------------------------------------------------

export async function sha256Hex(message: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(message);

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Pure-JS fallback
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number, j: number;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = data.length * 8;
  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = true;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  for (i = 0; i < data.length; i++) words[i >> 2] |= data[i] << ((3 - (i % 4)) * 8);
  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;
  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);
    for (j = 0; j < 64; j++) {
      const w15 = w[j - 15], w2 = w[j - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[j] = j < 16 ? w[j] : ((w[j - 16] + s0 + w[j - 7] + s1) | 0);
      const s1h = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = hash[7] + s1h + ch + k[j] + (w[j] | 0);
      const s0h = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      hash = [(temp1 + s0h + maj) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }
    for (j = 0; j < 8; j++) hash[j] = (hash[j] + oldHash[j]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Nonce / blinding factor generation
// ---------------------------------------------------------------------------

export function generateNonce(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(32);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hex = '';
  for (let i = 0; i < 64; i++) hex += Math.floor(Math.random() * 16).toString(16);
  return hex;
}

export function generateBlindingFactor(): string {
  return generateNonce();
}

export function generateRequestId(): string {
  return generateNonce();
}

// ---------------------------------------------------------------------------
// ZK-compatible crypto utilities (mirrors contracts/cyphra/src/index.ts)
// ---------------------------------------------------------------------------

export async function createNoteCommitment(
  ownerKey: string,
  amount: bigint,
  blindingFactor: string,
  tokenType: string = 'NIGHT'
): Promise<string> {
  return sha256Hex(`commitment:${ownerKey}:${amount.toString()}:${blindingFactor}:${tokenType}`);
}

export async function deriveNullifier(
  spendingKey: string,
  noteCommitment: string
): Promise<string> {
  return sha256Hex(`nullifier:${spendingKey}:${noteCommitment}`);
}

// ---------------------------------------------------------------------------
// Payment Request encode / decode / validate
// ---------------------------------------------------------------------------

async function computeRequestCommitment(params: {
  recipientAddress: string;
  amount: string;
  tokenType: TokenType;
  nonce: string;
  memo?: string;
}): Promise<string> {
  return sha256Hex(
    `${params.recipientAddress}:${params.amount}:${params.tokenType}:${params.nonce}:${params.memo || ''}`
  );
}

export async function encodePaymentRequest(params: {
  id: string;
  recipientAddress: string;
  asset: TokenType;
  amount: string;
  note?: string;
  expiration: number;
  nonce?: string;
  commitmentHash?: string;
}): Promise<string> {
  const nonce = params.nonce || generateNonce();
  const commitmentHash =
    params.commitmentHash ||
    (await computeRequestCommitment({
      recipientAddress: params.recipientAddress,
      amount: params.amount,
      tokenType: params.asset,
      nonce,
      memo: params.note,
    }));

  const urlParams = new URLSearchParams();
  urlParams.set('id', params.id);
  urlParams.set('recipient', params.recipientAddress);
  urlParams.set('asset', params.asset);
  urlParams.set('token', params.asset);
  urlParams.set('amount', params.amount);
  urlParams.set('exp', params.expiration.toString());
  urlParams.set('c', commitmentHash);
  urlParams.set('n', nonce);
  if (params.note) {
    urlParams.set('note', params.note);
    urlParams.set('memo', params.note);
  }
  return `${URI_SCHEME}?${urlParams.toString()}`;
}

export function decodePaymentRequest(uri: string): DecodedPaymentRequest {
  const trimmed = uri.trim();
  if (!trimmed.startsWith(`${URI_SCHEME}?`)) {
    throw new Error(`Invalid Cyphra payment URI format. Expected prefix '${URI_SCHEME}?'`);
  }
  const queryPart = trimmed.substring(`${URI_SCHEME}?`.length);
  const params = new URLSearchParams(queryPart);
  const id = params.get('id');
  const recipient = params.get('recipient');
  const asset = (params.get('asset') || params.get('token')) as TokenType;
  const amount = params.get('amount');
  const commitment = params.get('c');
  const nonce = params.get('n');
  const expStr = params.get('exp');
  const note = params.get('note') || params.get('memo') || undefined;
  if (!id || !recipient || !amount || !asset || !commitment || !nonce) {
    throw new Error('Malformed payment URI: Missing required payment fields');
  }
  const expiration = expStr ? parseInt(expStr, 10) : 0;
  const now = Date.now();
  const isExpired = expiration > 0 && now > expiration;
  const expiresInMs = Math.max(0, expiration - now);
  return { id, recipientAddress: recipient, asset, tokenType: asset, amount, note, memo: note, expiration, expiresAt: expiration, nonce, commitmentHash: commitment, isExpired, expiresInMs };
}

export async function validatePaymentRequest(
  input: string | DecodedPaymentRequest
): Promise<ValidationResult> {
  let req: DecodedPaymentRequest;
  if (typeof input === 'string') {
    try { req = decodePaymentRequest(input); }
    catch (err) {
      return { valid: false, code: 'INVALID_FORMAT', reason: err instanceof Error ? err.message : 'Invalid payment URI format' };
    }
  } else { req = input; }

  if (!req.recipientAddress.startsWith('mn_shielded1') && !req.recipientAddress.startsWith('mn_addr1')) {
    return { valid: false, code: 'INVALID_ADDRESS', reason: 'Recipient address is not a valid Midnight address format', request: req };
  }
  if (!['NIGHT', 'DUST', 'tCYPHRA'].includes(req.asset)) {
    return { valid: false, code: 'INVALID_ASSET', reason: `Unsupported asset: ${req.asset}`, request: req };
  }
  const numAmount = parseFloat(req.amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, code: 'INVALID_AMOUNT', reason: 'Amount must be a positive numerical value', request: req };
  }
  if (req.expiration > 0 && Date.now() > req.expiration) {
    return { valid: false, code: 'EXPIRED', reason: `Payment request expired on ${new Date(req.expiration).toISOString()}`, request: req };
  }
  const expected = await computeRequestCommitment({ recipientAddress: req.recipientAddress, amount: req.amount, tokenType: req.asset, nonce: req.nonce, memo: req.note });
  if (expected.toLowerCase() !== req.commitmentHash.toLowerCase()) {
    return { valid: false, code: 'TAMPERED', reason: 'Cryptographic commitment hash mismatch: payment request parameters have been tampered with', request: req };
  }
  return { valid: true, request: req };
}
