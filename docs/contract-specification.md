# Cyphra Compact Smart Contract Specification

The Cyphra smart contract is written in **Compact** (the domain-specific language for Midnight).

Source: `contracts/cyphra/src/cyphra.compact`

---

## 1. Public Ledger State

Stored on the Midnight blockchain:

```compact
export ledger commitments: Map<Bytes<32>, Boolean>;
export ledger nullifiers: Map<Bytes<32>, Boolean>;
export ledger paymentRequests: Map<Bytes<32>, Bytes<32>>;
export ledger paidRequests: Map<Bytes<32>, Boolean>;
export ledger auditorRegistry: Map<Bytes<32>, Uint<32>>;
export ledger totalShieldedDeposits: Counter;
export ledger totalConfidentialTransfers: Counter;
```

- **`commitments`**: Set of active shielded note commitments.
- **`nullifiers`**: Set of spent note nullifiers to prevent double spending.
- **`paymentRequests`**: Map from unique request ID to cryptographic commitment.
- **`paidRequests`**: Fulfilled request statuses.
- **`auditorRegistry`**: Permitted auditor keys and bitmask permissions.

---

## 2. Witnesses (Private Off-Chain Inputs)

Supplied locally by the user's wallet / prover:

```compact
witness get_spending_key(): Bytes<32>;
witness get_input_note_value(): Uint<64>;
witness get_output_note_value(): Uint<64>;
witness get_change_note_value(): Uint<64>;
witness get_blinding_factor(): Bytes<32>;
```

---

## 3. Zero-Knowledge Circuits

### `deposit(amount: Uint<64>, noteCommitment: Bytes<32>): []`
Converts unshielded tokens into a shielded note commitment.

### `confidentialTransfer(nullifier: Bytes<32>, newCommitment: Bytes<32>, changeCommitment: Bytes<32>): []`
Spends a note, creates a recipient note commitment, and generates a change note commitment while verifying value conservation off-chain.

### `registerPaymentRequest(requestId: Bytes<32>, requestCommitment: Bytes<32>): []`
Registers a private invoice on-chain with its cryptographic commitment.

### `fulfillPaymentRequest(requestId: Bytes<32>, paymentNullifier: Bytes<32>, receiptCommitment: Bytes<32>): []`
Confidentially fulfills a payment request without linking payer to payee publicly.
