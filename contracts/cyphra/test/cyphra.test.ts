/**
 * CYPHRA Contract Test Suite
 *
 * Tests the TypeScript simulation layer (CyphraContractClient) which mirrors
 * the exact Compact circuit assertions from cyphra.compact.
 *
 * Covers:
 *   - deposit() circuit
 *   - confidentialTransfer() circuit
 *   - Double-spend prevention
 *   - Value conservation enforcement
 *   - registerPaymentRequest() circuit
 *   - fulfillPaymentRequest() circuit
 *   - grantAuditorAccess() + revokeAuditorAccess() circuits
 *   - Helper functions: createNoteCommitment, deriveNullifier, generateBlindingFactor
 *   - Edge cases: zero value, duplicate commitments, non-existent requests
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  CyphraContractClient,
  createNoteCommitment,
  deriveNullifier,
  generateBlindingFactor,
  generateRequestId,
  createShieldedNote,
  AUDITOR_PERMISSIONS,
} from '../src/index.js';

// ---------------------------------------------------------------------------
// Test fixture keys (hex strings representing key material)
// In production, these come from 1AM Wallet's internal key derivation
// ---------------------------------------------------------------------------
const ALICE_KEY = 'a1ce000000000000000000000000000000000000000000000000000000000001';
const BOB_KEY = 'b0b0000000000000000000000000000000000000000000000000000000000002';
const AUDITOR_KEY = 'aaaaaa0000000000000000000000000000000000000000000000000000000003';

// ---------------------------------------------------------------------------
// Section 1: Cryptographic Helper Functions
// ---------------------------------------------------------------------------

describe('createNoteCommitment', () => {
  test('produces a 64-character hex string', async () => {
    const commitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind01', 'NIGHT');
    assert.equal(typeof commitment, 'string', 'commitment should be a string');
    assert.equal(commitment.length, 64, 'commitment should be 64 hex characters (32 bytes)');
    assert.match(commitment, /^[0-9a-f]+$/, 'commitment should be lowercase hex');
  });

  test('produces different commitments for different amounts', async () => {
    const c1 = await createNoteCommitment(ALICE_KEY, 100n, 'blind01', 'NIGHT');
    const c2 = await createNoteCommitment(ALICE_KEY, 200n, 'blind01', 'NIGHT');
    assert.notEqual(c1, c2, 'different amounts should produce different commitments');
  });

  test('produces different commitments for different blinding factors', async () => {
    const c1 = await createNoteCommitment(ALICE_KEY, 100n, 'blind01', 'NIGHT');
    const c2 = await createNoteCommitment(ALICE_KEY, 100n, 'blind02', 'NIGHT');
    assert.notEqual(c1, c2, 'different blinding factors should produce different commitments');
  });

  test('produces different commitments for different owners', async () => {
    const c1 = await createNoteCommitment(ALICE_KEY, 100n, 'blind01', 'NIGHT');
    const c2 = await createNoteCommitment(BOB_KEY, 100n, 'blind01', 'NIGHT');
    assert.notEqual(c1, c2, 'different owners should produce different commitments');
  });

  test('is deterministic for same inputs', async () => {
    const c1 = await createNoteCommitment(ALICE_KEY, 100n, 'deterministic_blind', 'NIGHT');
    const c2 = await createNoteCommitment(ALICE_KEY, 100n, 'deterministic_blind', 'NIGHT');
    assert.equal(c1, c2, 'same inputs should always produce same commitment');
  });
});

describe('deriveNullifier', () => {
  test('produces a 64-character hex nullifier', async () => {
    const commitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind01');
    const nullifier = await deriveNullifier(ALICE_KEY, commitment);
    assert.equal(nullifier.length, 64, 'nullifier should be 64 hex characters');
    assert.match(nullifier, /^[0-9a-f]+$/, 'nullifier should be lowercase hex');
  });

  test('is different from the commitment it was derived from', async () => {
    const commitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind01');
    const nullifier = await deriveNullifier(ALICE_KEY, commitment);
    assert.notEqual(nullifier, commitment, 'nullifier must differ from commitment');
  });

  test('same note produces same nullifier (deterministic)', async () => {
    const commitment = await createNoteCommitment(ALICE_KEY, 50n, 'blind_det');
    const n1 = await deriveNullifier(ALICE_KEY, commitment);
    const n2 = await deriveNullifier(ALICE_KEY, commitment);
    assert.equal(n1, n2, 'nullifier derivation must be deterministic');
  });

  test('different spending keys produce different nullifiers', async () => {
    const commitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind01');
    const n1 = await deriveNullifier(ALICE_KEY, commitment);
    const n2 = await deriveNullifier(BOB_KEY, commitment);
    assert.notEqual(n1, n2, 'different spending keys must produce different nullifiers');
  });
});

describe('generateBlindingFactor', () => {
  test('produces a 64-character hex string', () => {
    const bf = generateBlindingFactor();
    assert.equal(bf.length, 64, 'blinding factor should be 64 hex chars');
    assert.match(bf, /^[0-9a-f]+$/, 'blinding factor should be lowercase hex');
  });

  test('produces different values on each call', () => {
    const b1 = generateBlindingFactor();
    const b2 = generateBlindingFactor();
    assert.notEqual(b1, b2, 'blinding factors should be random (non-deterministic)');
  });
});

describe('generateRequestId', () => {
  test('produces a 64-character unique ID', () => {
    const id = generateRequestId();
    assert.equal(id.length, 64);
  });
});

// ---------------------------------------------------------------------------
// Section 2: deposit() Circuit
// ---------------------------------------------------------------------------

describe('deposit() circuit', () => {
  test('shields a positive amount and registers commitment', async () => {
    const client = new CyphraContractClient();
    const commitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind_deposit_01');

    const result = await client.deposit({ amount: 100n, noteCommitment: commitment });

    assert.equal(result.success, true, 'deposit should succeed');
    assert.ok(result.txHash.length > 0, 'txHash should be non-empty');
    assert.equal(client.getLedgerState().commitments.has(commitment), true);
    assert.equal(client.getLedgerState().totalShieldedDeposits, 1);
  });

  test('increments counter for each deposit', async () => {
    const client = new CyphraContractClient();

    for (let i = 0; i < 3; i++) {
      const commitment = await createNoteCommitment(ALICE_KEY, BigInt(i + 1) * 10n, `blind_${i}`);
      await client.deposit({ amount: BigInt(i + 1) * 10n, noteCommitment: commitment });
    }

    assert.equal(client.getLedgerState().totalShieldedDeposits, 3);
  });

  test('rejects zero-value deposit', async () => {
    const client = new CyphraContractClient();
    const commitment = await createNoteCommitment(ALICE_KEY, 0n, 'blind_zero');

    await assert.rejects(
      () => client.deposit({ amount: 0n, noteCommitment: commitment }),
      { message: 'Deposit amount must be strictly positive' }
    );
  });

  test('rejects duplicate note commitment', async () => {
    const client = new CyphraContractClient();
    const commitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind_dup');

    await client.deposit({ amount: 100n, noteCommitment: commitment });

    await assert.rejects(
      () => client.deposit({ amount: 100n, noteCommitment: commitment }),
      { message: 'Note commitment already exists' }
    );
  });
});

// ---------------------------------------------------------------------------
// Section 3: confidentialTransfer() Circuit
// ---------------------------------------------------------------------------

describe('confidentialTransfer() circuit', () => {
  test('transfers value from Alice to Bob with change', async () => {
    const client = new CyphraContractClient();

    // Alice deposits 100 NIGHT
    const aliceCommitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind_alice_in');
    await client.deposit({ amount: 100n, noteCommitment: aliceCommitment });

    // Alice sends 40 to Bob, 60 change to herself
    const aliceNullifier = await deriveNullifier(ALICE_KEY, aliceCommitment);
    const bobCommitment = await createNoteCommitment(BOB_KEY, 40n, 'blind_bob_out');
    const aliceChange = await createNoteCommitment(ALICE_KEY, 60n, 'blind_alice_change');

    const result = await client.confidentialTransfer(
      {
        nullifier: aliceNullifier,
        newCommitment: bobCommitment,
        changeCommitment: aliceChange,
      },
      {
        getSpendingKey: async () => ALICE_KEY,
        getInputNoteValue: async () => 100n,
        getOutputNoteValue: async () => 40n,
        getChangeNoteValue: async () => 60n,
        getBlindingFactor: async () => 'blind_alice_in',
      }
    );

    assert.equal(result.success, true);

    const state = client.getLedgerState();
    assert.equal(state.nullifiers.has(aliceNullifier), true, 'nullifier should be spent');
    assert.equal(state.commitments.has(bobCommitment), true, "Bob's note should exist");
    assert.equal(state.commitments.has(aliceChange), true, "Alice's change should exist");
    assert.equal(state.totalConfidentialTransfers, 1);
  });

  test('transfers exact amount with no change', async () => {
    const client = new CyphraContractClient();

    const aliceCommitment = await createNoteCommitment(ALICE_KEY, 50n, 'blind_exact_in');
    await client.deposit({ amount: 50n, noteCommitment: aliceCommitment });

    const nullifier = await deriveNullifier(ALICE_KEY, aliceCommitment);
    const bobCommitment = await createNoteCommitment(BOB_KEY, 50n, 'blind_exact_out');
    const zeroChange = await createNoteCommitment(ALICE_KEY, 0n, 'blind_no_change');

    const result = await client.confidentialTransfer(
      {
        nullifier,
        newCommitment: bobCommitment,
        changeCommitment: zeroChange,
      },
      {
        getSpendingKey: async () => ALICE_KEY,
        getInputNoteValue: async () => 50n,
        getOutputNoteValue: async () => 50n,
        getChangeNoteValue: async () => 0n,
        getBlindingFactor: async () => 'blind_exact_in',
      }
    );

    assert.equal(result.success, true);
    // Zero-change commitment should NOT be added to ledger
    assert.equal(client.getLedgerState().commitments.has(zeroChange), false);
  });

  test('rejects double-spend: same nullifier used twice', async () => {
    const client = new CyphraContractClient();

    const aliceCommitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind_dbl');
    await client.deposit({ amount: 100n, noteCommitment: aliceCommitment });

    const nullifier = await deriveNullifier(ALICE_KEY, aliceCommitment);
    const bobCommitment = await createNoteCommitment(BOB_KEY, 60n, 'blind_bob1');
    const changeCommitment = await createNoteCommitment(ALICE_KEY, 40n, 'blind_chg1');

    await client.confidentialTransfer(
      { nullifier, newCommitment: bobCommitment, changeCommitment },
      {
        getSpendingKey: async () => ALICE_KEY,
        getInputNoteValue: async () => 100n,
        getOutputNoteValue: async () => 60n,
        getChangeNoteValue: async () => 40n,
        getBlindingFactor: async () => 'blind_dbl',
      }
    );

    // Attempt double-spend
    const dummyNew = await createNoteCommitment(BOB_KEY, 60n, 'blind_dup_new');
    const dummyChange = await createNoteCommitment(ALICE_KEY, 40n, 'blind_dup_chg');

    await assert.rejects(
      () =>
        client.confidentialTransfer(
          { nullifier, newCommitment: dummyNew, changeCommitment: dummyChange },
          {
            getSpendingKey: async () => ALICE_KEY,
            getInputNoteValue: async () => 100n,
            getOutputNoteValue: async () => 60n,
            getChangeNoteValue: async () => 40n,
            getBlindingFactor: async () => 'blind_dbl',
          }
        ),
      /Double-spend rejected/
    );
  });

  test('rejects transfer when value conservation fails', async () => {
    const client = new CyphraContractClient();

    const aliceCommitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind_inval');
    await client.deposit({ amount: 100n, noteCommitment: aliceCommitment });

    const nullifier = await deriveNullifier(ALICE_KEY, aliceCommitment);
    const bobCommitment = await createNoteCommitment(BOB_KEY, 80n, 'blind_inval_out');
    const changeCommitment = await createNoteCommitment(ALICE_KEY, 40n, 'blind_inval_chg');

    // 100 != 80 + 40 → conservation check fails
    await assert.rejects(
      () =>
        client.confidentialTransfer(
          { nullifier, newCommitment: bobCommitment, changeCommitment },
          {
            getSpendingKey: async () => ALICE_KEY,
            getInputNoteValue: async () => 100n,
            getOutputNoteValue: async () => 80n,
            getChangeNoteValue: async () => 40n, // 80 + 40 = 120 != 100
            getBlindingFactor: async () => 'blind_inval',
          }
        ),
      /Value conservation violated/
    );
  });
});

// ---------------------------------------------------------------------------
// Section 4: Payment Request Circuits
// ---------------------------------------------------------------------------

describe('registerPaymentRequest() circuit', () => {
  test('registers a new payment request', async () => {
    const client = new CyphraContractClient();
    const requestId = generateRequestId();
    const requestCommitment = await createNoteCommitment(ALICE_KEY, 250n, 'blind_req_01');

    await client.registerPaymentRequest({ requestId, requestCommitment });

    assert.equal(client.getLedgerState().paymentRequests.get(requestId), requestCommitment);
    assert.equal(client.getLedgerState().totalPaymentRequests, 1);
    assert.equal(client.isRequestPending(requestId), true);
  });

  test('rejects duplicate request ID', async () => {
    const client = new CyphraContractClient();
    const requestId = generateRequestId();
    const commitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind_req_dup');

    await client.registerPaymentRequest({ requestId, requestCommitment: commitment });

    await assert.rejects(
      () => client.registerPaymentRequest({ requestId, requestCommitment: commitment }),
      /Payment request ID already registered/
    );
  });
});

describe('fulfillPaymentRequest() circuit', () => {
  test('fulfills a pending payment request', async () => {
    const client = new CyphraContractClient();
    const requestId = generateRequestId();
    const requestCommitment = await createNoteCommitment(ALICE_KEY, 250n, 'blind_req_fulfil');

    await client.registerPaymentRequest({ requestId, requestCommitment });

    const paymentNullifier = await deriveNullifier(BOB_KEY, requestCommitment);
    const receiptCommitment = await createNoteCommitment(ALICE_KEY, 250n, 'blind_receipt');

    const result = await client.fulfillPaymentRequest({
      requestId,
      paymentNullifier,
      receiptCommitment,
    });

    assert.equal(result.success, true);
    assert.equal(client.getLedgerState().paidRequests.has(requestId), true);
    assert.equal(client.getLedgerState().nullifiers.has(paymentNullifier), true);
    assert.equal(client.getLedgerState().commitments.has(receiptCommitment), true);
    assert.equal(client.isRequestPending(requestId), false);
  });

  test('rejects fulfillment of non-existent request', async () => {
    const client = new CyphraContractClient();

    await assert.rejects(
      () =>
        client.fulfillPaymentRequest({
          requestId: generateRequestId(),
          paymentNullifier: generateBlindingFactor(),
          receiptCommitment: generateBlindingFactor(),
        }),
      /Payment request does not exist/
    );
  });

  test('rejects double-fulfillment of same request', async () => {
    const client = new CyphraContractClient();
    const requestId = generateRequestId();
    const requestCommitment = await createNoteCommitment(BOB_KEY, 100n, 'blind_dbl_req');

    await client.registerPaymentRequest({ requestId, requestCommitment });

    const nullifier1 = generateBlindingFactor();
    const receipt1 = generateBlindingFactor();

    await client.fulfillPaymentRequest({
      requestId,
      paymentNullifier: nullifier1,
      receiptCommitment: receipt1,
    });

    await assert.rejects(
      () =>
        client.fulfillPaymentRequest({
          requestId,
          paymentNullifier: generateBlindingFactor(),
          receiptCommitment: generateBlindingFactor(),
        }),
      /already marked paid/
    );
  });

  test('rejects reuse of spent nullifier in payment', async () => {
    const client = new CyphraContractClient();
    const requestId = generateRequestId();
    const requestCommitment = await createNoteCommitment(BOB_KEY, 50n, 'blind_reuse_req');

    await client.registerPaymentRequest({ requestId, requestCommitment });

    const nullifier = generateBlindingFactor();
    const receipt1 = generateBlindingFactor();

    // First fulfillment
    await client.fulfillPaymentRequest({
      requestId,
      paymentNullifier: nullifier,
      receiptCommitment: receipt1,
    });

    // Second request
    const requestId2 = generateRequestId();
    await client.registerPaymentRequest({
      requestId: requestId2,
      requestCommitment: generateBlindingFactor(),
    });

    // Try to reuse spent nullifier
    await assert.rejects(
      () =>
        client.fulfillPaymentRequest({
          requestId: requestId2,
          paymentNullifier: nullifier, // already spent
          receiptCommitment: generateBlindingFactor(),
        }),
      /Payment nullifier already spent/
    );
  });
});

// ---------------------------------------------------------------------------
// Section 5: Auditor Access Circuits
// ---------------------------------------------------------------------------

describe('grantAuditorAccess() circuit', () => {
  test('registers auditor viewing key with permissions', async () => {
    const client = new CyphraContractClient();

    await client.grantAuditorAccess({
      auditorKey: AUDITOR_KEY,
      permissions: AUDITOR_PERMISSIONS.ALL,
    });

    assert.equal(client.getLedgerState().auditorRegistry.get(AUDITOR_KEY), AUDITOR_PERMISSIONS.ALL);
  });

  test('rejects zero permission bitmask', async () => {
    const client = new CyphraContractClient();

    await assert.rejects(
      () => client.grantAuditorAccess({ auditorKey: AUDITOR_KEY, permissions: 0 }),
      /Permission bitmask must be non-zero/
    );
  });

  test('allows partial permissions (balances only)', async () => {
    const client = new CyphraContractClient();

    await client.grantAuditorAccess({
      auditorKey: AUDITOR_KEY,
      permissions: AUDITOR_PERMISSIONS.BALANCES,
    });

    assert.equal(
      client.getLedgerState().auditorRegistry.get(AUDITOR_KEY),
      AUDITOR_PERMISSIONS.BALANCES
    );
  });
});

describe('revokeAuditorAccess() circuit', () => {
  test('revokes an existing auditor entry', async () => {
    const client = new CyphraContractClient();

    await client.grantAuditorAccess({
      auditorKey: AUDITOR_KEY,
      permissions: AUDITOR_PERMISSIONS.ALL,
    });

    await client.revokeAuditorAccess({ auditorKey: AUDITOR_KEY });

    assert.equal(client.getLedgerState().auditorRegistry.get(AUDITOR_KEY), 0);
  });

  test('rejects revocation of non-existent auditor', async () => {
    const client = new CyphraContractClient();

    await assert.rejects(
      () => client.revokeAuditorAccess({ auditorKey: AUDITOR_KEY }),
      /Auditor key not found in registry/
    );
  });
});

// ---------------------------------------------------------------------------
// Section 6: Helper Methods
// ---------------------------------------------------------------------------

describe('CyphraContractClient helpers', () => {
  test('isNoteUnspent returns correct values', async () => {
    const client = new CyphraContractClient();
    const commitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind_helper');

    assert.equal(client.isNoteUnspent(commitment), false, 'should be false before deposit');
    await client.deposit({ amount: 100n, noteCommitment: commitment });
    assert.equal(client.isNoteUnspent(commitment), true, 'should be true after deposit');
  });

  test('isNullifierSpent returns correct values', async () => {
    const client = new CyphraContractClient();
    const commitment = await createNoteCommitment(ALICE_KEY, 100n, 'blind_null_helper');
    await client.deposit({ amount: 100n, noteCommitment: commitment });

    const nullifier = await deriveNullifier(ALICE_KEY, commitment);
    assert.equal(client.isNullifierSpent(nullifier), false, 'should be false before spend');

    const bobCommitment = await createNoteCommitment(BOB_KEY, 100n, 'blind_bob_helper');
    const zeroChange = await createNoteCommitment(ALICE_KEY, 0n, 'blind_zero_helper');
    await client.confidentialTransfer(
      { nullifier, newCommitment: bobCommitment, changeCommitment: zeroChange },
      {
        getSpendingKey: async () => ALICE_KEY,
        getInputNoteValue: async () => 100n,
        getOutputNoteValue: async () => 100n,
        getChangeNoteValue: async () => 0n,
        getBlindingFactor: async () => 'blind_null_helper',
      }
    );

    assert.equal(client.isNullifierSpent(nullifier), true, 'should be true after spend');
  });
});

// ---------------------------------------------------------------------------
// Section 7: createShieldedNote integration
// ---------------------------------------------------------------------------

describe('createShieldedNote', () => {
  test('creates a valid off-chain note structure', async () => {
    const note = await createShieldedNote(ALICE_KEY, 500n, 'NIGHT', 12345);

    assert.equal(note.amount, 500n);
    assert.equal(note.tokenType, 'NIGHT');
    assert.equal(note.spent, false);
    assert.equal(note.blockHeight, 12345);
    assert.equal(note.commitment.length, 64);
    assert.equal(note.blindingFactor.length, 64);
  });

  test('two notes with same owner and amount have different commitments', async () => {
    const note1 = await createShieldedNote(ALICE_KEY, 100n);
    const note2 = await createShieldedNote(ALICE_KEY, 100n);
    // Different blinding factors ensure different commitments
    assert.notEqual(note1.commitment, note2.commitment);
  });
});

// ---------------------------------------------------------------------------
// Section 8: Full End-to-End Flow
// ---------------------------------------------------------------------------

describe('Full E2E: Deposit → Transfer → Request → Fulfill', () => {
  test('complete payment lifecycle', async () => {
    const client = new CyphraContractClient();

    // 1. Alice deposits 200 NIGHT
    const aliceNote = await createShieldedNote(ALICE_KEY, 200n);
    await client.deposit({ amount: 200n, noteCommitment: aliceNote.commitment });
    assert.equal(client.getLedgerState().totalShieldedDeposits, 1);

    // 2. Bob creates a payment request for 75 NIGHT
    const reqId = generateRequestId();
    const reqCommitment = await createNoteCommitment(BOB_KEY, 75n, 'blind_req_e2e');
    await client.registerPaymentRequest({ requestId: reqId, requestCommitment: reqCommitment });
    assert.equal(client.isRequestPending(reqId), true);

    // 3. Alice transfers 75 NIGHT to Bob (fulfilling the request)
    const aliceNullifier = await deriveNullifier(ALICE_KEY, aliceNote.commitment);
    const bobReceipt = await createNoteCommitment(BOB_KEY, 75n, 'blind_receipt_e2e');
    const aliceChange = await createNoteCommitment(ALICE_KEY, 125n, 'blind_change_e2e');

    await client.confidentialTransfer(
      {
        nullifier: aliceNullifier,
        newCommitment: bobReceipt,
        changeCommitment: aliceChange,
      },
      {
        getSpendingKey: async () => ALICE_KEY,
        getInputNoteValue: async () => 200n,
        getOutputNoteValue: async () => 75n,
        getChangeNoteValue: async () => 125n,
        getBlindingFactor: async () => aliceNote.blindingFactor,
      }
    );

    // 4. Fulfill the payment request using Bob's receipt
    const payNullifier = await deriveNullifier(BOB_KEY, reqCommitment);
    await client.fulfillPaymentRequest({
      requestId: reqId,
      paymentNullifier: payNullifier,
      receiptCommitment: bobReceipt,
    });

    // 5. Validate final state
    const state = client.getLedgerState();
    assert.equal(state.totalShieldedDeposits, 1);
    assert.equal(state.totalConfidentialTransfers, 1);
    assert.equal(state.paidRequests.has(reqId), true);
    assert.equal(state.nullifiers.has(aliceNullifier), true);
    assert.equal(state.commitments.has(aliceChange), true);
    assert.equal(client.isRequestPending(reqId), false);

    console.log('✅ Full E2E lifecycle test passed');
    console.log(`   Deposits: ${state.totalShieldedDeposits}`);
    console.log(`   Transfers: ${state.totalConfidentialTransfers}`);
    console.log(`   Commitments on ledger: ${state.commitments.size}`);
    console.log(`   Nullifiers spent: ${state.nullifiers.size}`);
  });
});
