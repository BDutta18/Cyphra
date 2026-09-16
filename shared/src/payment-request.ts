import { PaymentRequest, TokenType } from './types/index.js';
import { URI_SCHEME } from './constants/index.js';

/**
 * Portable SHA-256 implementation that works seamlessly in Node.js, Next.js Edge, and Browser
 */
export async function sha256Hex(message: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(message);

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fast self-contained SHA-256 implementation (zero external or node dependencies)
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = data.length * 8;

  let hash = [];
  let k = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  for (i = 0; i < data.length; i++) {
    words[i >> 2] |= data[i] << ((3 - (i % 4)) * 8);
  }
  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);

    for (j = 0; j < 64; j++) {
      const w15 = w[j - 15],
        w2 = w[j - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[j] =
        j < 16
          ? w[j]
          : ((w[j - 16] + s0 + w[j - 7] + s1) | 0);

      const s1h: number =
        rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch: number = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1: number = hash[7] + s1h + ch + k[j] + (w[j] | 0);
      const s0h: number =
        rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj: number = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2: number = s0h + maj;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

/**
 * Generate a random 32-byte hex nonce
 */
export function generateNonce(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(32);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hex = '';
  for (let i = 0; i < 64; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}

// ---------------------------------------------------------------------------
// Payment Request Interfaces
// ---------------------------------------------------------------------------

export interface PaymentRequestData {
  /** Unique payment identifier */
  id: string;
  /** Shielded recipient Midnight address */
  recipientAddress: string;
  /** Asset / token denomination */
  asset: TokenType;
  /** Backwards compatibility alias for asset */
  tokenType: TokenType;
  /** Amount in token units (string format for exact precision) */
  amount: string;
  /** Optional private note or memo */
  note?: string;
  /** Backwards compatibility alias for note */
  memo?: string;
  /** Expiration timestamp (Unix epoch in milliseconds) */
  expiration: number;
  /** Backwards compatibility alias for expiration */
  expiresAt: number;
  /** 32-byte cryptographic nonce preventing replay */
  nonce: string;
  /** Cryptographic commitment hash */
  commitmentHash: string;
}

export interface DecodedPaymentRequest extends PaymentRequestData {
  /** Whether the request has passed its expiration timestamp */
  isExpired: boolean;
  /** Remaining validity duration in milliseconds (0 if expired) */
  expiresInMs: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  code?: 'EXPIRED' | 'TAMPERED' | 'INVALID_FORMAT' | 'INVALID_ADDRESS' | 'INVALID_AMOUNT' | 'INVALID_ASSET';
  request?: DecodedPaymentRequest;
}

/**
 * Compute the cryptographic commitment for a payment request
 */
export async function computeRequestCommitment(params: {
  recipientAddress: string;
  amount: string;
  tokenType: TokenType;
  nonce: string;
  memo?: string;
}): Promise<string> {
  const preimage = `${params.recipientAddress}:${params.amount}:${params.tokenType}:${params.nonce}:${params.memo || ''}`;
  return sha256Hex(preimage);
}

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Encodes a payment request into a standard cyphra:pay URI
 * e.g., cyphra:pay?id=...&recipient=mn_shielded1...&asset=NIGHT&amount=25.50&exp=...&c=...&n=...
 */
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
  urlParams.set('token', params.asset); // Backwards compatibility
  urlParams.set('amount', params.amount);
  urlParams.set('exp', params.expiration.toString());
  urlParams.set('c', commitmentHash);
  urlParams.set('n', nonce);

  if (params.note) {
    urlParams.set('note', params.note);
    urlParams.set('memo', params.note); // Backwards compatibility
  }

  return `${URI_SCHEME}?${urlParams.toString()}`;
}

/**
 * Decodes a cyphra:pay URI into a structured DecodedPaymentRequest
 */
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

  return {
    id,
    recipientAddress: recipient,
    asset,
    tokenType: asset,
    amount,
    note,
    memo: note,
    expiration,
    expiresAt: expiration,
    nonce,
    commitmentHash: commitment,
    isExpired,
    expiresInMs,
  };
}

/**
 * Validates a payment request (format, expiration, and cryptographic integrity)
 */
export async function validatePaymentRequest(
  input: string | DecodedPaymentRequest
): Promise<ValidationResult> {
  let req: DecodedPaymentRequest;

  if (typeof input === 'string') {
    try {
      req = decodePaymentRequest(input);
    } catch (err) {
      return {
        valid: false,
        code: 'INVALID_FORMAT',
        reason: err instanceof Error ? err.message : 'Invalid payment URI format',
      };
    }
  } else {
    req = input;
  }

  // 1. Recipient address validation
  if (
    !req.recipientAddress.startsWith('mn_shielded1') &&
    !req.recipientAddress.startsWith('mn_addr1')
  ) {
    return {
      valid: false,
      code: 'INVALID_ADDRESS',
      reason: 'Recipient address is not a valid Midnight address format',
      request: req,
    };
  }

  // 2. Asset validation
  if (!['NIGHT', 'DUST', 'tCYPHRA'].includes(req.asset)) {
    return {
      valid: false,
      code: 'INVALID_ASSET',
      reason: `Unsupported asset: ${req.asset}`,
      request: req,
    };
  }

  // 3. Amount validation
  const numAmount = parseFloat(req.amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      valid: false,
      code: 'INVALID_AMOUNT',
      reason: 'Amount must be a positive numerical value',
      request: req,
    };
  }

  // 4. Expiration validation
  if (req.expiration > 0 && Date.now() > req.expiration) {
    return {
      valid: false,
      code: 'EXPIRED',
      reason: `Payment request expired on ${new Date(req.expiration).toISOString()}`,
      request: req,
    };
  }

  // 5. Cryptographic integrity check (tamper detection)
  const expectedCommitment = await computeRequestCommitment({
    recipientAddress: req.recipientAddress,
    amount: req.amount,
    tokenType: req.asset,
    nonce: req.nonce,
    memo: req.note,
  });

  if (expectedCommitment.toLowerCase() !== req.commitmentHash.toLowerCase()) {
    return {
      valid: false,
      code: 'TAMPERED',
      reason: 'Cryptographic commitment hash mismatch: payment request parameters have been tampered with',
      request: req,
    };
  }

  return {
    valid: true,
    request: req,
  };
}

// ---------------------------------------------------------------------------
// Backwards Compatibility Aliases
// ---------------------------------------------------------------------------

export function encodePaymentUri(request: PaymentRequest): string {
  const params = new URLSearchParams();
  params.set('id', request.id);
  params.set('recipient', request.recipientAddress);
  params.set('amount', request.amount);
  params.set('asset', request.tokenType);
  params.set('token', request.tokenType);
  params.set('c', request.commitmentHash);
  params.set('n', request.nonce);
  params.set('exp', request.expiresAt.toString());

  if (request.memo) {
    params.set('memo', request.memo);
    params.set('note', request.memo);
  }

  return `${URI_SCHEME}?${params.toString()}`;
}

export type DecodedPaymentUri = DecodedPaymentRequest;

export function decodePaymentUri(uri: string): DecodedPaymentRequest {
  return decodePaymentRequest(uri);
}

export async function verifyPaymentRequestIntegrity(request: {
  recipientAddress: string;
  amount: string;
  tokenType: TokenType;
  nonce: string;
  memo?: string;
  commitmentHash: string;
}): Promise<boolean> {
  const computed = await computeRequestCommitment(request);
  return computed.toLowerCase() === request.commitmentHash.toLowerCase();
}
