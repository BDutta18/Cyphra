# Getting Started with Cyphra

This guide walks you through setting up, building, testing, and running Cyphra locally using **npm**.

---

## Prerequisites

- **Node.js**: v20+ or v22+
- **npm**: v10+ (included with Node.js)
- **1AM Wallet extension** (optional; built-in testnet sandbox simulator is included)

---

## 1. Installation

From the monorepo root:

```bash
npm install
```

---

## 2. Typecheck All Packages

```bash
npm run typecheck
```

---

## 3. Run Automated Tests

Execute unit and integration tests across contracts, backend, and shared libraries:

```bash
npm test
```

---

## 4. Run Linter

```bash
npm run lint
```

---

## 5. Build All Packages

Build shared library, smart contracts, backend server, and Next.js frontend:

```bash
npm run build
```

---

## 6. Run Development Servers

Start both the backend API and the frontend concurrently:

```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)

---

## 7. Testing the MVP Flow

1. Open [http://localhost:3000](http://localhost:3000).
2. Click **Connect 1AM Wallet** (choose **1AM Wallet (Midnight Testnet)** for instant pre-funded sandbox mode).
3. Check your **Private Shielded Balance** (1,250.00 NIGHT, 45.00 DUST).
4. Navigate to **Send**, enter a recipient shielded address (e.g. click the demo helper), enter an amount, and click **Sign & Generate Zero-Knowledge Transfer**.
5. Watch the step-by-step zero-knowledge proving pipeline execute!
6. Navigate to **Request** to create a private QR invoice or pay an existing request.
7. Navigate to **Activity** to review your zero-knowledge transaction history and generate an auditor disclosure proof!
