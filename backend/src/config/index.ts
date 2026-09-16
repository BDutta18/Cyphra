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

export const config = {
  // -------------------------------------------------------------------------
  // Runtime
  // -------------------------------------------------------------------------
  env,
  isProd,
  port: parseInt(process.env.PORT ?? '4000', 10),

  // -------------------------------------------------------------------------
  // CORS — explicitly list allowed origins in production
  // -------------------------------------------------------------------------
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:4000,http://127.0.0.1:4000')
    .split(',')
    .map((o) => o.trim()),

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
  // Midnight Network
  // -------------------------------------------------------------------------
  midnight: {
    networkId: process.env.MIDNIGHT_NETWORK_ID ?? 'preprod',
    indexerUri:
      process.env.MIDNIGHT_INDEXER_URI ??
      'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWsUri:
      process.env.MIDNIGHT_INDEXER_WS_URI ??
      'wss://indexer.testnet-02.midnight.network/api/v1/graphql',
    nodeUri:
      process.env.MIDNIGHT_NODE_URI ??
      'https://rpc.testnet-02.midnight.network',
    proverServerUri:
      process.env.MIDNIGHT_PROVER_SERVER_URI ??
      'https://proves.testnet-02.midnight.network',
    contractAddress:
      process.env.CYPHRA_CONTRACT_ADDRESS ??
      'mn1cyphratest637970687261003a707265706f6f643a302e312e30',
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
