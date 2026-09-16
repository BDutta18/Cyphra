import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  computeRequestCommitment,
  encodePaymentRequest,
  decodePaymentRequest,
  validatePaymentRequest,
  encodePaymentUri,
  decodePaymentUri,
  verifyPaymentRequestIntegrity,
  generateNonce,
} from './payment-request.js';
import { PaymentRequest } from './types/index.js';

describe('Payment Request Protocol', () => {
  const recipient = 'mn_shielded1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

  test('encodePaymentRequest & decodePaymentRequest - Full roundtrip', async () => {
    const id = 'pay_req_test_001';
    const amount = '250.50';
    const asset = 'NIGHT';
    const note = 'Confidential milestone audit payment';
    const expiration = Date.now() + 3600 * 1000;

    const uri = await encodePaymentRequest({
      id,
      recipientAddress: recipient,
      asset,
      amount,
      note,
      expiration,
    });

    assert.ok(uri.startsWith('cyphra:pay?'));
    assert.ok(uri.includes(`id=${id}`));
    assert.ok(uri.includes(`amount=${amount}`));
    assert.ok(uri.includes(`asset=${asset}`));

    const decoded = decodePaymentRequest(uri);
    assert.equal(decoded.id, id);
    assert.equal(decoded.recipientAddress, recipient);
    assert.equal(decoded.asset, asset);
    assert.equal(decoded.amount, amount);
    assert.equal(decoded.note, note);
    assert.equal(decoded.expiration, expiration);
    assert.equal(decoded.isExpired, false);
    assert.ok(decoded.expiresInMs > 0);
  });

  test('validatePaymentRequest - Valid request passes validation', async () => {
    const uri = await encodePaymentRequest({
      id: 'pay_req_valid',
      recipientAddress: recipient,
      asset: 'DUST',
      amount: '10.00',
      note: 'Network gas reserve invoice',
      expiration: Date.now() + 86400 * 1000,
    });

    const result = await validatePaymentRequest(uri);
    assert.equal(result.valid, true);
    assert.ok(result.request);
    assert.equal(result.request.id, 'pay_req_valid');
    assert.equal(result.request.asset, 'DUST');
  });

  test('validatePaymentRequest - Detects expired request', async () => {
    const expiredTime = Date.now() - 60 * 1000; // 1 minute in the past
    const uri = await encodePaymentRequest({
      id: 'pay_req_expired',
      recipientAddress: recipient,
      asset: 'NIGHT',
      amount: '50.00',
      expiration: expiredTime,
    });

    const result = await validatePaymentRequest(uri);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'EXPIRED');
    assert.ok(result.reason?.includes('expired'));
  });

  test('validatePaymentRequest - Detects tampered amount / parameters', async () => {
    const uri = await encodePaymentRequest({
      id: 'pay_req_tamper',
      recipientAddress: recipient,
      asset: 'NIGHT',
      amount: '50.00',
      expiration: Date.now() + 86400 * 1000,
    });

    // Tamper with the amount in the URI without updating commitment
    const tamperedUri = uri.replace('amount=50.00', 'amount=5000.00');

    const result = await validatePaymentRequest(tamperedUri);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'TAMPERED');
    assert.ok(result.reason?.includes('tampered'));
  });

  test('validatePaymentRequest - Detects invalid address format', async () => {
    const uri = await encodePaymentRequest({
      id: 'pay_req_bad_addr',
      recipientAddress: 'invalid_eth_address_0x1234',
      asset: 'NIGHT',
      amount: '10.00',
      expiration: Date.now() + 86400 * 1000,
    });

    const result = await validatePaymentRequest(uri);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'INVALID_ADDRESS');
  });

  test('Backwards compatibility with encodePaymentUri & decodePaymentUri', async () => {
    const request: PaymentRequest = {
      id: 'legacy_001',
      recipientAddress: recipient,
      amount: '15.00',
      tokenType: 'NIGHT',
      memo: 'Legacy memo',
      nonce: generateNonce(),
      commitmentHash: 'dummy',
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000,
    };

    const uri = encodePaymentUri(request);
    assert.ok(uri.startsWith('cyphra:pay?'));

    const decoded = decodePaymentUri(uri);
    assert.equal(decoded.id, 'legacy_001');
    assert.equal(decoded.amount, '15.00');
    assert.equal(decoded.tokenType, 'NIGHT');
    assert.equal(decoded.memo, 'Legacy memo');
  });
});
