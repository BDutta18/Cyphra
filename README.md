<div align="center">
  <img src="./frontend/public/logo.png" alt="Cyphra Logo" width="120" />
  <h1>CYPHRA</h1>
  <p><strong>Privacy-First Confidential Payments on the Midnight Network</strong></p>
  <p>Built with Compact Smart Contracts and 1AM Wallet DApp Connector</p>
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
| **Package Manager** | npm workspaces |

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
npm install
```

### 2. Typecheck Workspaces
```bash
npm run typecheck
```

### 3. Run Tests
```bash
npm test
```

### 4. Build All Workspaces
```bash
npm run build
```

### 5. Start Development Servers
```bash
npm run dev
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)

---

## License
Apache-2.0. Built for the Midnight Developer Community.
