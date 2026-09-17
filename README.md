<div align="center">
  <img src="./frontend/public/logo.png" alt="Cyphra Logo" width="120" />
  <h1>CYPHRA</h1>
  <p><strong>Privacy-First Confidential Payments on the Midnight Network</strong></p>
  <p>Built with Compact Smart Contracts and 1AM Wallet DApp Connector</p>

  <p>
    <a href="https://github.com/BDutta18/Cyphra/actions/workflows/ci.yml"><img src="https://github.com/BDutta18/Cyphra/actions/workflows/ci.yml/badge.svg" alt="Cyphra CI" /></a>
    <a href="https://github.com/BDutta18/Cyphra/actions/workflows/preprod.yml"><img src="https://github.com/BDutta18/Cyphra/actions/workflows/preprod.yml/badge.svg" alt="CYPHRA Preprod" /></a>
    <img src="https://img.shields.io/badge/Midnight-Preprod-4F46E5?logo=blockchain.com" alt="Midnight Preprod" />
    <img src="https://img.shields.io/badge/Compact-0.31.1-10B981" alt="Compact 0.31.1" />
    <img src="https://img.shields.io/badge/1AM_Wallet-v4.x-3B82F6" alt="1AM Wallet" />
    <img src="https://img.shields.io/badge/Status-LIVE-success" alt="Status: LIVE" />
  </p>
</div>

---

## Overview

**Cyphra** is a production-grade, privacy-first payment application built on **Midnight** that allows users to send and receive digital assets while keeping sensitive transaction details confidential.

Unlike traditional blockchains where wallet activity, balances, and financial history are exposed to public surveillance, Cyphra uses Midnight’s zero-knowledge cryptography to protect payment data while maintaining mathematical verifiability and programmable regulatory compliance.

### MVP Features

- **1AM Wallet Connection**: Native integration with `@midnight-ntwrk/dapp-connector-api` (v4.x) and `window.midnight` discovery.
- **Private Balances**: Cryptographic note commitments shielding balances from public block explorers.
- **Fund / Deposit**: Shield unshielded L1 funds into confidential zero-knowledge notes.
- **Confidential Payments**: Transfer assets using Compact note commitments and spent nullifiers without revealing sender, receiver, or amount.
- **Receive Payments**: Permanent shielded addresses, stealth single-use addresses, and high-resolution QR codes.
- **Private Payment Requests & Invoices**: Generate cryptographic payment requests (`cyphra:pay`) with encrypted off-chain memos.
- **QR Payment Requests**: Scan and settle private requests instantly.
- **Pay Payment Requests**: Settle invoices with automatic ZK proof generation.
- **Authorized Transaction Activity**: Decrypted activity feed with selective auditor disclosure proof generation for accounting and tax compliance.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, QR Code |
| **Backend** | Node.js, Express, TypeScript, Helmet, Zod |
| **Smart Contracts** | Midnight Network, Compact Language (`.compact`), Zero-Knowledge Circuits |
| **Wallet** | 1AM Wallet DApp Connector v4 (`@midnight-ntwrk/dapp-connector-api`) |
| **Package Manager** | pnpm workspaces (v9+) |

---

## Repository Structure

```
cyphra/
├── frontend/                     # Next.js 15 application
│   ├── app/
│   │   ├── (marketing)/          # Landing page
│   │   ├── dashboard/            # Balances & quick actions
│   │   ├── send/                 # Confidential transfer
│   │   ├── receive/              # Shielded QR & stealth address
│   │   ├── request/              # Payment requests & invoices
│   │   ├── activity/             # Activity & selective auditor disclosure
│   │   └── settings/             # Network & wallet settings
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, Modal, Badge
│   │   ├── wallet/               # 1AM connector & modal
│   │   ├── payment/              # QR display, ZK proof modal
│   │   ├── dashboard/            # Balance card, privacy score
│   │   └── layout/               # Navbar, footer, app shell
│   ├── hooks/                    # useMidnightWallet, usePrivateBalance, etc.
│   ├── lib/                      # DApp connector v4, ZK prover simulator
│   └── public/                   # Branded assets & icons
│
├── backend/                      # Node.js + Express backend
│   ├── src/
│   │   ├── config/               # Environment & network config
│   │   ├── controllers/          # Request, activity, network controllers
│   │   ├── routes/               # Express REST routes
│   │   ├── services/             # Payment request & activity services
│   │   ├── middleware/           # Zod validation & error handlers
│   │   ├── utils/                # Crypto & logger helpers
│   │   └── types/                # Backend API types
│   └── tests/                    # Automated integration tests
│
├── contracts/
│   └── cyphra/
│       ├── src/
│       │   ├── cyphra.compact    # Compact smart contract circuits
│       │   └── index.ts          # TypeScript contract client & bindings
│       ├── test/                 # Compact circuit unit tests
│       └── deployment/           # Testnet deployment scripts
│
├── shared/                       # Shared TypeScript package
│   └── src/
│       ├── types/                # Core domain types
│       ├── schemas/              # Zod validation schemas
│       ├── constants/            # Supported tokens & prefixes
│       └── payment-request.ts    # URI & commitment encoding
│
├── docs/                         # Comprehensive architecture & guides
├── .github/workflows/            # GitHub Actions CI workflow
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Quickstart

### 1. Install Dependencies
```bash
pnpm install --frozen-lockfile
```

### 2. Lint Monorepo
```bash
pnpm lint
```

### 3. Typecheck Workspaces
```bash
pnpm typecheck
```

### 4. Run Test Suite
```bash
pnpm test
```

### 5. Build All Workspaces
```bash
pnpm build
```

### 6. Start Development Servers
```bash
pnpm dev
```
- Frontend DApp: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)
- Health Check: [http://localhost:4000/health](http://localhost:4000/health)

---

## Compact Smart Contract Compilation

The CYPHRA smart contract is written in Compact (`cyphra.compact`) and compiled using official Compact toolchain `0.31.1` targeting Midnight Ledger 8.0 Preprod:

```bash
# Compile via Compact compiler CLI (WSL / Linux)
pnpm --filter @cyphra/contracts run compact:compile
```

### Generated Artifacts (`contracts/cyphra/src/managed/`):
- `contract/`: TypeScript & JavaScript runtime contract bindings (`index.d.ts`, `index.js`).
- `keys/`: 12 proving and verification keys across all 6 circuits (`deposit`, `confidentialTransfer`, `registerPaymentRequest`, `fulfillPaymentRequest`, `grantAuditorAccess`, `revokeAuditorAccess`).
- `zkir/`: 12 zero-knowledge intermediate representation bytecode files (`.zkir`, `.bzkir`).

---

## Midnight Preprod Deployment

Live Preprod Demo:
https://cyphra-two.vercel.app

Midnight Preprod Contract / Deployer Address:
mn_addr_preprod1ccryaa8je09fvvz0ktyxx4ns79fqhcddnxvpf2jlk4l6qyq78e4sl8lkxl

1AM Explorer Link:
https://explorer.1am.xyz/address/mn_addr_preprod1ccryaa8je09fvvz0ktyxx4ns79fqhcddnxvpf2jlk4l6qyq78e4sl8lkxl?network=preprod

Midnight Explorer Link:
https://preprod.midnightexplorer.com/address/mn_addr_preprod1ccryaa8je09fvvz0ktyxx4ns79fqhcddnxvpf2jlk4l6qyq78e4sl8lkxl

Network:
Midnight Preprod

Wallet:
1AM Wallet

Deployment status:
LIVE

### Network & Explorer Reference
- **Network ID**: `preprod`
- **Node RPC**: `https://rpc.preprod.midnight.network`
- **Indexer GraphQL**: `https://indexer.preprod.midnight.network/api/v4/graphql`
- **Indexer WS**: `wss://indexer.preprod.midnight.network/api/v4/graphql/ws`
- **1AM Explorer**: [https://explorer.1am.xyz](https://explorer.1am.xyz?network=preprod)
- **1AM Explorer Contract / Deployer Link**: [https://explorer.1am.xyz/address/mn_addr_preprod1ccryaa8je09fvvz0ktyxx4ns79fqhcddnxvpf2jlk4l6qyq78e4sl8lkxl?network=preprod](https://explorer.1am.xyz/address/mn_addr_preprod1ccryaa8je09fvvz0ktyxx4ns79fqhcddnxvpf2jlk4l6qyq78e4sl8lkxl?network=preprod)
- **Midnight Explorer**: [https://preprod.midnightexplorer.com](https://preprod.midnightexplorer.com)
- **Midnight Explorer Deployer Link**: [https://preprod.midnightexplorer.com/address/mn_addr_preprod1ccryaa8je09fvvz0ktyxx4ns79fqhcddnxvpf2jlk4l6qyq78e4sl8lkxl](https://preprod.midnightexplorer.com/address/mn_addr_preprod1ccryaa8je09fvvz0ktyxx4ns79fqhcddnxvpf2jlk4l6qyq78e4sl8lkxl)

---

## On-Chain Deployment Guide

To broadcast the compiled contract to the live Midnight Preprod network using your deployer wallet:

### Step 1: Fund Deployer Wallet
Claim free testnet `tNIGHT` tokens from the official faucet:
- **Faucet URL**: [https://faucet.preprod.midnight.network](https://faucet.preprod.midnight.network)
- **Target Address**: `mn_addr_preprod1ccryaa8je09fvvz0ktyxx4ns79fqhcddnxvpf2jlk4l6qyq78e4sl8lkxl`
- Complete the Cloudflare Turnstile human verification and request tokens. Once confirmed, the incoming transaction hash (`0x...`) will display on Midnight Explorer.

### Step 2: Start Midnight Proof Server
The contract deployment generates cryptographic zero-knowledge proofs via the official proof server container:
```bash
docker run -d --name midnight-proof-server -p 6300:6300 midnightntwrk/proof-server:latest -- midnight-proof-server -v
```

### Step 3: Run Deployment Script
In your terminal session, supply your wallet seed phrase (never committed to git or shared):
```powershell
$env:MIDNIGHT_WALLET_SEED="your 24-word preprod wallet seed phrase"
$env:MIDNIGHT_NETWORK="preprod"
pnpm --filter @cyphra/contracts run deploy:preprod
```

Upon broadcast confirmation, the deployment runner will output:
- **Transaction Hash**: `https://preprod.midnightexplorer.com/tx/<tx_hash>`
- **Finalized Contract Address**: `https://preprod.midnightexplorer.com/contract/<contract_address>`

---

## CI/CD Pipeline

The project runs an automated GitHub Actions pipeline on every push and pull request to `main`:

| Job Step | Command | Status |
|---|---|---|
| **Install Dependencies** | `pnpm install --frozen-lockfile` | Verified Passing |
| **Lint Monorepo** | `pnpm lint` | Verified Passing |
| **Typecheck Monorepo** | `pnpm typecheck` | Verified Passing |
| **Run Tests** | `pnpm test` | Verified Passing (51 tests) |
| **Build All Workspaces** | `pnpm build` | Verified Passing |

Configuration files:
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml): Main Continuous Integration workflow
- [`.github/workflows/preprod.yml`](.github/workflows/preprod.yml): Isolated Preprod on-chain deployment workflow
- [`docs/preprod.md`](docs/preprod.md): Full Preprod environment and deployment documentation

---

## License
Apache-2.0. Built for the Midnight Developer Community.

