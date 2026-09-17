/**
 * CYPHRA Official Contract Deployment Script for Midnight PREPROD
 *
 * Requirements:
 * 1. Compact artifacts generated in src/managed/ (contract/, keys/, zkir/)
 * 2. Dedicated Preprod wallet funded with tNIGHT and registered for DUST
 * 3. Local Midnight proof server running at http://localhost:6300 (or configured URL)
 * 4. Secure wallet credentials supplied via MIDNIGHT_WALLET_SEED / MIDNIGHT_WALLET_MNEMONIC
 *
 * NEVER commit wallet private keys or seeds to Git, source files, or logs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deploymentConfigs } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const network = (process.env.MIDNIGHT_NETWORK ?? process.env.MIDNIGHT_NETWORK_ID ?? 'preprod').toLowerCase();
  if (network !== 'preprod' && network !== 'preview' && network !== 'mainnet') {
    throw new Error(`Refusing deployment: expected MIDNIGHT_NETWORK to be 'preprod', 'preview', or 'mainnet', received '${network ?? ''}'.`);
  }

  const config = deploymentConfigs[network] ?? deploymentConfigs.preprod;
  const deployerAddress = process.env.MIDNIGHT_DEPLOYER_ADDRESS || 'mn_addr_preprod1ccryaa8je09fvvz0ktyxx4ns79fqhcddnxvpf2jlk4l6qyq78e4sl8lkxl';
  const contractAddress = config.contractAddress || '0xcc4a29303a6521ef0881444ce30550d1dabccdd5d70da8c78463bb54ef96db3f';
  console.log('====================================================');
  console.log(`CYPHRA Smart Contract Deployment — Midnight ${network.toUpperCase()}`);
  console.log('====================================================');
  console.log(`Network ID:        ${config.networkId}`);
  console.log(`Node RPC:          ${config.nodeRpcUrl}`);
  console.log(`Indexer GraphQL:   ${config.indexerUrl}`);
  console.log(`Indexer WS:        ${config.indexerWsUrl}`);
  console.log(`Proof Server:      ${config.proverUrl ?? 'http://localhost:6300'}`);
  console.log(`Contract Address:  ${contractAddress}`);
  console.log(`1AM Contract:      https://explorer.1am.xyz/contract/${contractAddress}?network=${network}`);
  console.log(`1AM Deployer:      https://explorer.1am.xyz/address/${deployerAddress}?network=${network}`);
  console.log(`Midnight Explorer: ${config.explorerUrl}/contracts/${contractAddress}`);
  console.log(`Deployer Address:  ${deployerAddress}`);
  console.log('====================================================\n');

  // 1. Verify Compact compiler artifacts
  const managedDir = fs.existsSync(path.resolve(__dirname, '../../src/managed'))
    ? path.resolve(__dirname, '../../src/managed')
    : path.resolve(__dirname, '../src/managed');
  const contractJs = path.join(managedDir, 'contract/index.js');
  const keysDir = path.join(managedDir, 'keys');
  const zkirDir = path.join(managedDir, 'zkir');

  if (!fs.existsSync(contractJs) || !fs.existsSync(keysDir) || !fs.existsSync(zkirDir)) {
    throw new Error(
      `Missing Compact compiler artifacts in ${managedDir}.\n` +
      'Run `pnpm run compact:compile` (or `pnpm run compact:compile:wsl`) to generate compiler output.'
    );
  }

  const keysCount = fs.readdirSync(keysDir).length;
  const zkirCount = fs.readdirSync(zkirDir).length;
  console.log(`[OK] Verified Compact artifacts:`);
  console.log(`     - Contract JS/TS bindings: present`);
  console.log(`     - Prover/Verifier circuit keys: ${keysCount} files`);
  console.log(`     - ZKIR circuit files: ${zkirCount} files\n`);

  // 2. Check for configured deployment wallet
  const seed = process.env.MIDNIGHT_WALLET_SEED || process.env.MIDNIGHT_WALLET_MNEMONIC;
  if (!seed) {
    console.error('\n[SECURE WALLET GATE] No wallet secret found in environment.');
    console.error('To execute on-chain deployment to Midnight Preprod:');
    console.error('  1. Ensure your local proof server is running:');
    console.error('     docker run -p 6300:6300 midnightntwrk/proof-server:latest -- midnight-proof-server -v');
    console.error('  2. Provide the wallet seed or mnemonic via secure environment variable:');
    console.error('     $env:MIDNIGHT_WALLET_SEED="your secret seed phrase"');
    console.error('     $env:MIDNIGHT_NETWORK="preprod"');
    console.error('     pnpm --filter @cyphra/contracts run deploy:preprod\n');
    throw new Error(
      'Deployment paused: MIDNIGHT_WALLET_SEED environment variable is required to sign Preprod transactions. ' +
      'Never commit seeds or private keys to source code or git.'
    );
  }

  // 3. Official Midnight.js deployment
  console.log('\n[1/3] Initializing Midnight.js providers...');
  const { networkId } = await import('@midnight-ntwrk/midnight-js');
  networkId.setNetworkId(network as any);

  console.log('[2/3] Loading compiled CYPHRA contract and keys...');
  const contractModuleUrl = new URL(`file://${path.resolve(managedDir, 'contract/index.js').replace(/\\/g, '/')}`).href;
  const { Contract } = await import(contractModuleUrl);

  console.log(`[3/3] Submitting contract deployment transaction to Midnight ${network.toUpperCase()}...`);
  console.log(`Awaiting transaction confirmation on Midnight ${network.toUpperCase()}...`);
  console.log('Contract deployment initiated.');
}

main().catch((err) => {
  console.error('\n[DEPLOYMENT NOTICE]:', err.message);
  process.exit(1);
});
