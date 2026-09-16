/**
 * CYPHRA Deployment Configuration
 *
 * Official Midnight network endpoints for Preprod and Mainnet deployments.
 * 1AM Wallet handles all transaction signing, proving, and DUST fee payment.
 *
 * Endpoint source: https://docs.midnight.network/develop/reference/environments
 */

export interface DeploymentConfig {
  /** Midnight network identifier ('preprod' | 'mainnet' | 'local') */
  networkId: string;
  /** Midnight substrate node WebSocket/HTTPS RPC endpoint */
  nodeRpcUrl: string;
  /** Midnight Indexer GraphQL API endpoint */
  indexerUrl: string;
  /** Midnight Indexer WebSocket endpoint (for subscriptions) */
  indexerWsUrl: string;
  /** Midnight Proving Server endpoint (optional: 1AM Wallet provides its own) */
  proverUrl?: string;
  /** Maximum gas / fee budget in DUST base units */
  gasLimit: bigint;
}

export const deploymentConfigs: Record<string, DeploymentConfig> = {
  /**
   * Midnight Preprod — official pre-production test network
   * Use this for integration testing and staged rollouts before mainnet.
   */
  preprod: {
    networkId: 'preprod',
    nodeRpcUrl:
      process.env.MIDNIGHT_NODE_URI || 'https://rpc.testnet-02.midnight.network',
    indexerUrl:
      process.env.MIDNIGHT_INDEXER_URI ||
      'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    indexerWsUrl:
      process.env.MIDNIGHT_INDEXER_WS_URI ||
      'wss://indexer.testnet-02.midnight.network/api/v1/graphql',
    proverUrl:
      process.env.MIDNIGHT_PROVER_SERVER_URI ||
      'https://proves.testnet-02.midnight.network',
    gasLimit: 50_000_000n,
  },

  /**
   * Midnight Mainnet — production network
   * Contract deployments here are permanent and require real DUST.
   */
  mainnet: {
    networkId: 'mainnet',
    nodeRpcUrl:
      process.env.MIDNIGHT_NODE_URI || 'https://rpc.midnight.network',
    indexerUrl:
      process.env.MIDNIGHT_INDEXER_URI ||
      'https://indexer.midnight.network/api/v1/graphql',
    indexerWsUrl:
      process.env.MIDNIGHT_INDEXER_WS_URI ||
      'wss://indexer.midnight.network/api/v1/graphql',
    proverUrl:
      process.env.MIDNIGHT_PROVER_SERVER_URI ||
      'https://proves.midnight.network',
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
    gasLimit: 10_000_000n,
  },
};
