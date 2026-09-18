import crypto from 'node:crypto';

/**
 * Masks a Midnight address for safe display in logs and public API responses.
 * Shows prefix + first 6 + "..." + last 6 characters.
 * e.g., "mn_shielded1abc...xyz789"
 */
export function maskAddress(address: string): string {
  if (!address || address.length < 20) return '****';
  const prefix = address.startsWith('mn_shielded1')
    ? 'mn_shielded1'
    : address.startsWith('mn_addr_preprod1')
      ? 'mn_addr_preprod1'
      : address.startsWith('mn_addr1')
        ? 'mn_addr1'
        : address.slice(0, 6);
  const rest = address.slice(prefix.length);
  if (rest.length <= 12) return address;
  return `${prefix}${rest.slice(0, 4)}...${rest.slice(-6)}`;
}

/**
 * Generates a random hexadecimal request ID for tracing.
 * Used in response meta.requestId.
 */
export function generateRequestId(): string {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Safely parses a BigInt from a decimal string.
 * Returns null on parse failure.
 */
export function parseSafeAmount(value: string, decimals = 6): bigint | null {
  try {
    const [whole, fraction = ''] = value.split('.');
    const fracPadded = fraction.slice(0, decimals).padEnd(decimals, '0');
    return BigInt(whole) * BigInt(10 ** decimals) + BigInt(fracPadded);
  } catch {
    return null;
  }
}

/**
 * Formats a raw bigint (base-unit) amount into a display string.
 * e.g., 1_500_000n with decimals=6 → "1.500000"
 */
export function formatAmount(raw: bigint, decimals = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = raw / divisor;
  const frac = (raw % divisor).toString().padStart(decimals, '0');
  return `${whole}.${frac}`;
}

/**
 * Checks whether a string looks like a valid 32-byte hex value (64 hex chars).
 */
export function isValidHex32(value: string): boolean {
  return /^[0-9a-f]{64}$/i.test(value);
}

/**
 * Checks whether a string looks like a valid Midnight shielded address.
 */
export function isValidShieldedAddress(address: string): boolean {
  return /^mn_shielded1[0-9a-z]{20,100}$/.test(address);
}

/**
 * Checks whether a string looks like a valid Midnight unshielded address (preprod or mainnet).
 */
export function isValidUnshieldedAddress(address: string): boolean {
  return /^(mn_addr_preprod1|mn_addr1)[0-9a-z]{20,100}$/.test(address);
}

/**
 * Checks whether a string looks like any valid Midnight address.
 */
export function isValidMidnightAddress(address: string): boolean {
  return isValidShieldedAddress(address) || isValidUnshieldedAddress(address);
}
