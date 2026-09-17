/**
 * CYPHRA Deployment Configuration
 *
 * Official Midnight network endpoints via Blockfrost.
 * All requests to Blockfrost require a project_id header.
 *
 * Sign up: https://blockfrost.io
 * Midnight docs: https://docs.midnight.network/develop/reference/environments
 * Endpoint reference: https://blockfrost.dev/docs/start-building/midnight/
 */

export interface DeploymentConfig {
  /** Midnight network identifier ('preview' | 'preprod' | 'mainnet' | 'local') */
  networkId: string;
  /** Midnight substrate node RPC endpoint */
  nodeRpcUrl: string;
  /** Midnight Indexer GraphQL endpoint */
  indexerUrl: string;
  /** Midnight Indexer WebSocket endpoint (for subscriptions) */
  indexerWsUrl: string;
  /** Optional remote prover endpoint. 1AM Wallet normally provides proving. */
  proverUrl?: string;
  /** Block explorer URL for this network */
  explorerUrl: string;
  /** Deployed CYPHRA contract address on this network */
  contractAddress?: string;
  /** Maximum gas / fee budget in DUST base units */
  gasLimit: bigint;
}

export const deploymentConfigs: Record<string, DeploymentConfig> = {
  /**
   * Midnight Preview — early-stage development network
   * Use this for all PR preview deployments and active development.
   * Faucet: https://docs.midnight.network/develop/resources/faucet
   */
  preview: {
    networkId: 'preview',
    nodeRpcUrl:
      process.env.MIDNIGHT_NODE_URI || 'https://rpc.midnight-preview.blockfrost.io',
    indexerUrl:
      process.env.MIDNIGHT_INDEXER_URI ||
      'https://midnight-preview.blockfrost.io/api/v0',
    indexerWsUrl:
      process.env.MIDNIGHT_INDEXER_WS_URI ||
      'wss://midnight-preview.blockfrost.io/api/v0/ws',
    explorerUrl: 'https://midnightexplorer.com',
    contractAddress: process.env.CYPHRA_CONTRACT_ADDRESS,
    gasLimit: 50_000_000n,
  },

  /**
   * Midnight Preprod — staging network for final validation before mainnet.
   * Requires a separate Blockfrost Midnight Preprod project_id.
   */
  preprod: {
    networkId: 'preprod',
    nodeRpcUrl:
      process.env.MIDNIGHT_RPC_URL ||
      process.env.MIDNIGHT_NODE_URI ||
      'https://rpc.preprod.midnight.network',
    indexerUrl:
      process.env.MIDNIGHT_INDEXER_URI ||
      'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWsUrl:
      process.env.MIDNIGHT_INDEXER_WS_URI ||
      'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    proverUrl:
      process.env.MIDNIGHT_PROOF_SERVER_URL ||
      'http://localhost:6300',
    explorerUrl:
      process.env.MIDNIGHT_EXPLORER_URL ||
      'https://preprod.midnightexplorer.com',
    contractAddress: process.env.CONTRACT_ADDRESS || process.env.CYPHRA_CONTRACT_ADDRESS,
    gasLimit: 50_000_000n,
  },

  /**
   * Midnight Mainnet — production network.
   * Contract deployments here are permanent and require real DUST.
   * Requires a separate Blockfrost Midnight Mainnet project_id.
   */
  mainnet: {
    networkId: 'mainnet',
    nodeRpcUrl:
      process.env.MIDNIGHT_NODE_URI || 'https://rpc.midnight-mainnet.blockfrost.io',
    indexerUrl:
      process.env.MIDNIGHT_INDEXER_URI ||
      'https://midnight-mainnet.blockfrost.io/api/v0',
    indexerWsUrl:
      process.env.MIDNIGHT_INDEXER_WS_URI ||
      'wss://midnight-mainnet.blockfrost.io/api/v0/ws',
    explorerUrl: 'https://midnightexplorer.com',
    contractAddress: process.env.CYPHRA_CONTRACT_ADDRESS,
    gasLimit: 50_000_000n,
  },

  /**
   * Local devnet — for local development with docker-compose midnight node
   */
  local: {
    networkId: 'local',
    nodeRpcUrl: 'http://localhost:9944',
    indexerUrl: 'http://localhost:8088/api/v1/graphql',
    indexerWsUrl: 'ws://localhost:8088/api/v1/graphql',
    explorerUrl: 'http://localhost:3001',
    gasLimit: 10_000_000n,
  },
};
