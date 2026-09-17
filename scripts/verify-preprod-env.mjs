/** Fail closed before a main-branch Preprod deployment. */
const required = [
  'MIDNIGHT_NETWORK',
  'MIDNIGHT_RPC_URL',
  'CONTRACT_ADDRESS',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_MIDNIGHT_NETWORK',
];

const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) throw new Error(`Missing Preprod configuration: ${missing.join(', ')}`);

if (process.env.MIDNIGHT_NETWORK !== 'preprod' || process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK !== 'preprod') {
  throw new Error('Both MIDNIGHT_NETWORK and NEXT_PUBLIC_MIDNIGHT_NETWORK must be exactly "preprod".');
}

const values = required.map((key) => process.env[key]).join(' ').toLowerCase();
if (/preview|mainnet|production|your[-_ ]|example/.test(values)) {
  throw new Error('Preprod configuration contains a forbidden network or placeholder value.');
}

if (process.env.MIDNIGHT_RPC_URL !== 'https://rpc.preprod.midnight.network') {
  throw new Error('MIDNIGHT_RPC_URL must be the official Midnight Preprod RPC endpoint.');
}

if (!/^(0x)?[0-9a-f]{64}$/i.test(process.env.CONTRACT_ADDRESS)) {
  throw new Error('CONTRACT_ADDRESS must be the 64-hex address returned by Midnight deployContract.');
}

if (!process.env.NEXT_PUBLIC_API_URL.startsWith('https://')) {
  throw new Error('NEXT_PUBLIC_API_URL must be an HTTPS Preprod backend URL.');
}

console.log('Preprod configuration is pinned to Midnight Preprod.');
