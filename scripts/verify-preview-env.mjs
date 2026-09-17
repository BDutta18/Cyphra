/**
 * Fail closed before creating a PR preview.  This script deliberately accepts
 * only public Preview configuration; secret network credentials are never
 * copied into a browser build.
 */
const required = [
  'NEXT_PUBLIC_MIDNIGHT_NETWORK_ID',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_INDEXER_URI',
  'NEXT_PUBLIC_CYPHRA_CONTRACT_ADDRESS',
];

const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  throw new Error(`Missing Preview configuration: ${missing.join(', ')}`);
}

const network = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID.trim().toLowerCase();
if (network !== 'preview') {
  throw new Error(`Preview deployments must use Midnight Preview, received '${network}'.`);
}

const unsafeValues = [
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_INDEXER_URI,
  process.env.NEXT_PUBLIC_CYPHRA_CONTRACT_ADDRESS,
].join(' ').toLowerCase();

if (/preprod|mainnet|production|your[-_ ]/.test(unsafeValues)) {
  throw new Error('Preview configuration contains a placeholder or a Preprod/Production value.');
}

if (!/^https:\/\//.test(process.env.NEXT_PUBLIC_API_URL)) {
  throw new Error('NEXT_PUBLIC_API_URL must be an HTTPS Preview backend URL.');
}

console.log('Preview configuration is pinned to Midnight Preview.');
