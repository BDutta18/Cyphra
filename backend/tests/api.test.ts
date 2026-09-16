import assert from 'node:assert/strict';
import { test, describe, before, after } from 'node:test';
import http from 'node:http';
import { app } from '../src/app.js';
import { paymentRequestService } from '../src/services/payment-request.service.js';
import { activityService } from '../src/services/activity.service.js';
import { midnightService } from '../src/services/midnight.service.js';
import { paymentService } from '../src/services/payment.service.js';

let server: http.Server;
let baseUrl: string;

const TEST_SHIELDED_SENDER = 'mn_shielded1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
const TEST_SHIELDED_RECIPIENT = 'mn_shielded1recipient0000000000000000000000000000000000000000';
const TEST_NULLIFIER = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const TEST_COMMITMENT = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Unit Services', () => {
  test('Payment Request Service - Lifecycle', async () => {
    const { request, paymentUri } = await paymentRequestService.createRequest({
      recipientAddress: TEST_SHIELDED_RECIPIENT,
      amount: '50.00',
      tokenType: 'NIGHT',
      memo: 'Confidential Consultation Fee',
      expiryHours: 24,
    });

    assert.ok(request.id);
    assert.equal(request.status, 'pending');
    assert.equal(request.amount, '50.00');
    assert.ok(paymentUri.startsWith('cyphra:pay?'));

    const fetched = await paymentRequestService.getRequestById(request.id);
    assert.ok(fetched);
    assert.equal(fetched.request.id, request.id);

    // Verify integrity
    const integrity = await paymentRequestService.verifyIntegrity(request.id);
    assert.equal(integrity.valid, true);

    // Fulfillment
    const fulfilled = await paymentRequestService.fulfillRequest({
      requestId: request.id,
      payerShieldedAddress: TEST_SHIELDED_SENDER,
      txHash: '0x' + 'a'.repeat(64),
      paymentNullifier: '00'.repeat(32),
      receiptCommitment: '11'.repeat(32),
    });

    assert.ok(fulfilled.status === 'completed' || fulfilled.status === 'settling');
    assert.equal(fulfilled.settledTxHash, '0x' + 'a'.repeat(64));
  });

  test('Payment Service - Registration & Lookup', async () => {
    const payment = await paymentService.createPayment({
      nullifierHash: TEST_NULLIFIER,
      recipientCommitment: TEST_COMMITMENT,
      tokenType: 'NIGHT',
      txHash: '0x' + 'b'.repeat(64),
    });

    assert.ok(payment.id);
    assert.equal(payment.nullifierHash, TEST_NULLIFIER);
    assert.equal(payment.recipientCommitment, TEST_COMMITMENT);
    assert.equal(payment.status, 'submitted');

    const fetched = await paymentService.getPayment(payment.id);
    assert.equal(fetched.id, payment.id);

    // Double spend rejection at API level
    await assert.rejects(
      () =>
        paymentService.createPayment({
          nullifierHash: TEST_NULLIFIER,
          recipientCommitment: TEST_COMMITMENT,
          tokenType: 'NIGHT',
          txHash: '0x' + 'c'.repeat(64),
        }),
      /double-spend attempt/i
    );
  });

  test('Activity Service - Record and Selective Disclosure', async () => {
    activityService.recordActivity(TEST_SHIELDED_SENDER, {
      txHash: '0x' + 'd'.repeat(64),
      timestamp: Date.now(),
      type: 'send_confidential',
      amount: '30.00',
      tokenType: 'NIGHT',
      status: 'confirmed',
      proofVerified: true,
      proofType: 'CompactZKProof_Groth16',
      gasFee: '0.004 DUST',
    });

    const list = activityService.getActivity(TEST_SHIELDED_SENDER);
    assert.ok(list.length >= 1);

    const report = activityService.generateDisclosedReport({
      ownerAddress: TEST_SHIELDED_SENDER,
      auditorAddress: 'mn_addr1auditor00000000000000000000000000000000000000000',
      periodStart: Date.now() - 3600000,
      periodEnd: Date.now() + 3600000,
    });

    assert.equal(report.walletAddress, TEST_SHIELDED_SENDER);
    assert.ok(report.complianceAttestation.startsWith('CYPHRA-MIDNIGHT-AUDIT:'));
  });

  test('Midnight Service - Network Health Query', async () => {
    const health = await midnightService.getNetworkHealth();
    assert.ok(['online', 'degraded', 'offline'].includes(health.status));
    assert.ok(health.networkId);
  });
});

describe('HTTP Endpoints', () => {
  test('GET /health - returns server and Midnight network status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.service, 'cyphra-backend');
    assert.ok(json.data.midnight);
    assert.ok(json.meta.requestId);
  });

  test('GET /api/balance - requires x-wallet-address header', async () => {
    const res = await fetch(`${baseUrl}/api/balance`);
    assert.equal(res.status, 401);

    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.code, 'MISSING_WALLET_ADDRESS');
  });

  test('GET /api/balance - rejects malformed wallet address', async () => {
    const res = await fetch(`${baseUrl}/api/balance`, {
      headers: { 'x-wallet-address': 'invalid_address_format' },
    });
    assert.equal(res.status, 400);

    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.code, 'INVALID_WALLET_ADDRESS');
  });

  test('GET /api/balance - returns public on-chain metadata with valid header', async () => {
    const res = await fetch(`${baseUrl}/api/balance`, {
      headers: { 'x-wallet-address': TEST_SHIELDED_SENDER },
    });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.balance.shieldedAddress, TEST_SHIELDED_SENDER);
    // Verifies that private balances are not stored/returned
    assert.ok(json.data.walletQueryNote.includes('1AM Wallet'));
  });

  test('POST /api/payments - validates required fields and types', async () => {
    // Missing required fields
    const badRes = await fetch(`${baseUrl}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': TEST_SHIELDED_SENDER,
      },
      body: JSON.stringify({ tokenType: 'INVALID' }),
    });
    assert.equal(badRes.status, 400);

    const badJson = await badRes.json();
    assert.equal(badJson.success, false);
    assert.equal(badJson.code, 'VALIDATION_ERROR');

    // Valid registration
    const freshNullifier = '99'.repeat(32);
    const goodRes = await fetch(`${baseUrl}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': TEST_SHIELDED_SENDER,
      },
      body: JSON.stringify({
        nullifierHash: freshNullifier,
        recipientCommitment: TEST_COMMITMENT,
        tokenType: 'NIGHT',
        txHash: '0x' + 'e'.repeat(64),
      }),
    });
    assert.equal(goodRes.status, 201);

    const goodJson = await goodRes.json();
    assert.equal(goodJson.success, true);
    assert.equal(goodJson.data.nullifierHash, freshNullifier);
    assert.ok(goodJson.data.id);
  });

  test('GET /api/payments/:id - retrieves payment record', async () => {
    // Create first
    const nullifier = '88'.repeat(32);
    const postRes = await fetch(`${baseUrl}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': TEST_SHIELDED_SENDER,
      },
      body: JSON.stringify({
        nullifierHash: nullifier,
        recipientCommitment: TEST_COMMITMENT,
        tokenType: 'NIGHT',
        txHash: '0x' + 'f'.repeat(64),
      }),
    });
    const postJson = await postRes.json();
    const paymentId = postJson.data.id;

    // Get
    const getRes = await fetch(`${baseUrl}/api/payments/${paymentId}`);
    assert.equal(getRes.status, 200);

    const getJson = await getRes.json();
    assert.equal(getJson.success, true);
    assert.equal(getJson.data.id, paymentId);
    assert.equal(getJson.data.nullifierHash, nullifier);
  });

  test('GET /api/payments/:id - returns 404 for unknown ID', async () => {
    const res = await fetch(`${baseUrl}/api/payments/unknown-uuid-000`);
    assert.equal(res.status, 404);

    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.code, 'PAYMENT_NOT_FOUND');
  });

  test('POST /api/payment-requests - creates new request and returns payment URI', async () => {
    const res = await fetch(`${baseUrl}/api/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': TEST_SHIELDED_RECIPIENT,
      },
      body: JSON.stringify({
        recipientAddress: TEST_SHIELDED_RECIPIENT,
        amount: '125.00',
        tokenType: 'NIGHT',
        memo: 'Project Escrow Deposit',
        expiryHours: 72,
      }),
    });
    assert.equal(res.status, 201);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.request.id);
    assert.equal(json.data.request.amount, '125.00');
    assert.ok(json.data.paymentUri.startsWith('cyphra:pay?'));

    // Retrieve created request by ID
    const getRes = await fetch(`${baseUrl}/api/payment-requests/${json.data.request.id}`);
    assert.equal(getRes.status, 200);
    const getJson = await getRes.json();
    assert.equal(getJson.data.request.id, json.data.request.id);
  });

  test('GET /api/activity - returns transaction history for wallet address', async () => {
    const res = await fetch(`${baseUrl}/api/activity`, {
      headers: { 'x-wallet-address': TEST_SHIELDED_SENDER },
    });
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length >= 1);
  });

  test('GET /unknown-route - returns 404 with structured error', async () => {
    const res = await fetch(`${baseUrl}/unknown-nonexistent-endpoint`);
    assert.equal(res.status, 404);

    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.code, 'NOT_FOUND');
  });

  test('Security - Helmet headers are active', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.headers.get('x-dns-prefetch-control'), 'off');
    assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  });
});
