import dotenv from 'dotenv';
dotenv.config();

// ---------------------------------------------------------------------------
// CYPHRA Backend Configuration
// Reads from environment variables with safe defaults for development.
// NEVER expose private keys, seed phrases, or wallet credentials here.
// ---------------------------------------------------------------------------

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

const env = process.env.NODE_ENV ?? 'development';
const isProd = env === 'production';
const deploymentEnvironment = process.env.CYPHRA_DEPLOYMENT_ENV ?? '';
const midnightNetwork = process.env.MIDNIGHT_NETWORK ?? process.env.MIDNIGHT_NETWORK_ID ?? 'preview';
const midnightRpcUrl = process.env.MIDNIGHT_RPC_URL ?? process.env.MIDNIGHT_NODE_URI;
const contractAddress = process.env.CONTRACT_ADDRESS ?? process.env.CYPHRA_CONTRACT_ADDRESS ?? '';

if (deploymentEnvironment === 'preprod') {
  if (midnightNetwork !== 'preprod') {
    throw new Error(`Preprod backend must use Midnight Preprod, received '${midnightNetwork}'.`);
  }
  if (!midnightRpcUrl || !contractAddress) {
    throw new Error('Preprod backend requires MIDNIGHT_RPC_URL and CONTRACT_ADDRESS.');
  }
  if (/preview|mainnet|production/i.test(`${midnightRpcUrl} ${contractAddress}`)) {
    throw new Error('Preprod backend configuration contains a Preview or Production value.');
  }
}

export const config = {
  // -------------------------------------------------------------------------
  // Runtime
  // -------------------------------------------------------------------------
  env,
  isProd,
  port: parseInt(process.env.PORT ?? '4000', 10),

  // -------------------------------------------------------------------------
  // CORS — allow localhost for dev, cyphra-two.vercel.app for prod,
  //        and *.vercel.app for Vercel PR preview deployments
  // -------------------------------------------------------------------------
  corsOrigins: (
    process.env.CORS_ORIGINS ??
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,https://cyphra-two.vercel.app'
  )
    .split(',')
    .map((o) => o.trim()),

  // Allow *.vercel.app wildcard for preview deployments
  corsOriginPattern: /https:\/\/.*\.vercel\.app$/,

  // -------------------------------------------------------------------------
  // Rate Limiting
  // -------------------------------------------------------------------------
  rateLimit: {
    /** General API: requests per window */
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),   // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX ?? '60', 10),          // 60 req/min

    /** Stricter limit for write endpoints (payments, requests) */
    writeWindowMs: parseInt(process.env.WRITE_RATE_LIMIT_WINDOW_MS ?? '60000', 10),
    writeMaxRequests: parseInt(process.env.WRITE_RATE_LIMIT_MAX ?? '10', 10), // 10 writes/min
  },

  // -------------------------------------------------------------------------
  // Midnight Network — defaults to Preview (Blockfrost)
  // Override via environment variables for Preprod / Mainnet deployments.
  // Blockfrost endpoints: https://blockfrost.dev/docs/start-building/midnight/
  // -------------------------------------------------------------------------
  midnight: {
    networkId: midnightNetwork,
    blockfrostProjectId: process.env.BLOCKFROST_PROJECT_ID ?? '',
    indexerUri:
      process.env.MIDNIGHT_INDEXER_URI ??
      'https://midnight-preview.blockfrost.io/api/v0',
    indexerWsUri:
      process.env.MIDNIGHT_INDEXER_WS_URI ??
      'wss://midnight-preview.blockfrost.io/api/v0/ws',
    nodeUri:
      midnightRpcUrl ??
      'https://rpc.midnight-preview.blockfrost.io',
    explorerUrl: process.env.MIDNIGHT_EXPLORER_URL ?? 'https://midnightexplorer.com',
    // A contract address must be supplied by the environment. Never fall back
    // to a plausible-looking address, which could route a real wallet action
    // to the wrong deployment.
    contractAddress,
  },

  // -------------------------------------------------------------------------
  // Security (tokens only used for optional inter-service auth, NOT wallet auth)
  // Wallet authorization always stays in 1AM Wallet — never in the backend.
  // -------------------------------------------------------------------------
  security: {
    apiKey: isProd
      ? requireEnv('API_KEY')
      : (process.env.API_KEY ?? 'cyphra_dev_api_key_unsafe_change_for_prod'),
  },

  // -------------------------------------------------------------------------
  // Payment Request defaults
  // -------------------------------------------------------------------------
  paymentRequest: {
    defaultExpiryHours: 24,
    maxExpiryHours: 720,
    maxMemoLength: 256,
  },
} as const;
