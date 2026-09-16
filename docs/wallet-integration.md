# 1AM Wallet DApp Connector Integration Guide

This guide describes how Cyphra connects to the **1AM Wallet** and other Midnight-compatible wallets using the official `@midnight-ntwrk/dapp-connector-api` (version 4.x).

---

## 1. Wallet Discovery

Wallets inject an `InitialAPI` into the global `window.midnight` dictionary:

```typescript
declare global {
  interface Window {
    midnight?: {
      [key: string]: InitialAPI;
    };
  }
}
```

Cyphra discovers installed wallets dynamically by enumerating `Object.entries(window.midnight || {})`. It detects 1AM Wallet using:
- `api.name.toLowerCase().includes('1am')`
- `api.rdns?.includes('1am')` (e.g. `xyz.1am.wallet`)
- Key matching `1am`

---

## 2. Connection Flow

To initiate a session, call `connect(networkId)` on the desired wallet:

```typescript
import { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

const wallet: InitialAPI = window.midnight['1am'];
const connectedApi: ConnectedAPI = await wallet.connect('testnet');
```

---

## 3. Account Querying Methods (ConnectedAPI v4)

Once connected, Cyphra queries addresses and balances:

```typescript
// 1. Retrieve shielded Bech32m addresses and keys
const { shieldedAddress, shieldedCoinPublicKey, shieldedEncryptionPublicKey } =
  await connectedApi.getShieldedAddresses();

// 2. Retrieve unshielded L1 address
const { unshieldedAddress } = await connectedApi.getUnshieldedAddress();

// 3. Retrieve DUST address and balance (for gas payments)
const { dustAddress } = await connectedApi.getDustAddress();
const { balance, cap } = await connectedApi.getDustBalance();

// 4. Retrieve shielded balances
const shieldedBalances = await connectedApi.getShieldedBalances();
// e.g. { 'NIGHT': 1250000000n, 'tCYPHRA': 5000000000n }
```

---

## 4. Transaction Balancing & Submission

When building a transaction with Compact circuits:
1. Compile circuit and generate off-chain zero-knowledge proof.
2. Call `balanceUnsealedTransaction(tx, { payFees: true })` to let 1AM wallet balance DUST transaction fees automatically.
3. Cryptographically seal and sign the transaction with 1AM wallet spending keys.
4. Call `submitTransaction(sealedTx)` to relay the transaction to Midnight testnet.
