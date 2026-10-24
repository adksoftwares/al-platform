const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeAmount,
  payHereCheckoutHash,
  payHereNotifySignature,
  safeEqualHex,
} = require('./index');

test('normalizes valid currency amounts without accepting malformed input', () => {
  assert.equal(normalizeAmount('500'), '500.00');
  assert.equal(normalizeAmount('500.0'), '500.00');
  assert.equal(normalizeAmount('500.00'), '500.00');
  assert.equal(normalizeAmount('5e2'), null);
  assert.equal(normalizeAmount('-500'), null);
  assert.equal(normalizeAmount('500.999'), null);
  assert.equal(normalizeAmount(''), null);
});

test('compares signatures without accepting mismatched values', () => {
  assert.equal(safeEqualHex('ABC123', 'ABC123'), true);
  assert.equal(safeEqualHex('ABC123', 'abc123'), false);
  assert.equal(safeEqualHex('ABC123', 'ABC12'), false);
  assert.equal(safeEqualHex(null, 'ABC123'), false);
});

test('checkout and notification signatures are deterministic and distinct', () => {
  const base = {
    merchantId: '123456',
    orderId: 'order-123',
    amount: '500.00',
    currency: 'LKR',
    secret: 'test-secret',
  };
  const checkout = payHereCheckoutHash(base);
  const notify = payHereNotifySignature({ ...base, statusCode: '2' });
  assert.match(checkout, /^[A-F0-9]{32}$/);
  assert.match(notify, /^[A-F0-9]{32}$/);
  assert.notEqual(checkout, notify);
  assert.equal(checkout, payHereCheckoutHash(base));
});
