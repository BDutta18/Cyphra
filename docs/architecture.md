# Cyphra Architecture & Midnight Privacy Model

Cyphra is a production-grade, privacy-first payment application built on the **Midnight Network**. It enables users to send, receive, and request digital assets with complete transaction confidentiality while preserving verifiable compliance.

---

## 1. The Core Problem: Blockchain Privacy Leakage

On traditional public ledgers (Ethereum, Bitcoin, Solana), every transaction details:
- The sender and receiver addresses
- The exact transfer amount and asset
- The timestamp and balance progression

This exposes businesses, freelancers, DAOs, and ordinary users to surveillance, competitor intelligence gathering, front-running, and security risks.

---

## 2. Midnight's Zero-Knowledge Foundation

Midnight resolves this dilemma using **Programmable Data Protection**:
1. **Confidential State**: Stored locally on the user's client/wallet. Sensitive preimages (spending keys, note values, memos) never touch the network unencrypted.
2. **Zero-Knowledge Circuits (Compact)**: Smart contract circuits run inside an off-chain prover to generate zero-knowledge proofs demonstrating that:
   - The sender owns the note being spent (`get_spending_key()`).
   - The input note has not been spent before (verifying non-membership in the spent nullifier set).
   - Value is conserved ($\text{Input} = \text{Output} + \text{Change}$).
3. **Public Ledger Commitments**: The Midnight blockchain records only cryptographic note commitments (`commitments: Map<Bytes<32>, Boolean>`) and spent nullifiers (`nullifiers: Map<Bytes<32>, Boolean>`).

---

## 3. Cyphra System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Cyphra Frontend                        │
│               (Next.js 15, Tailwind, Lucide)                │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      1AM Wallet DApp         │ │       Cyphra Backend       │
│        Connector v4          │ │   (Node.js/Express API)    │
│  - window.midnight[walletId] │ │  - Payment Request store   │
│  - Shielded Addresses        │ │  - Encrypted memo indexing │
│  - DUST Fee Balancing        │ │  - Selective disclosure    │
└──────────────┬───────────────┘ └────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Midnight Network                         │
│  - Cyphra Compact Smart Contract (circuits & ledger)        │
│  - Note Commitments & Nullifiers Tree                       │
│  - ZK Proof Verification (Groth16 / Halo2)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Key Security Invariants

- **Double-Spend Prevention**: Each note can only generate its deterministic nullifier once. The Compact circuit asserts `!nullifiers.member(nullifier)`.
- **Zero-Knowledge Boundary**: Off-chain witnesses provide private values to circuits. Private values are never assigned to public ledger variables without explicit zero-knowledge verification or intentional `disclose()` wrappers.
- **Selective Disclosure**: Users can generate viewing attestations for auditors or tax authorities that prove volume without handing over spending keys.
