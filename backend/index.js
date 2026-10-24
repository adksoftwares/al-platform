const express = require('express');
const crypto = require('node:crypto');
const admin = require('firebase-admin');

const app = express();
app.disable('x-powered-by');
const trustedProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10);
app.set('trust proxy', Number.isInteger(trustedProxyHops) && trustedProxyHops >= 0 ? trustedProxyHops : 0);
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use(express.json({ limit: '16kb' }));

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') {
    return origin && allowedOrigins.includes(origin)
      ? res.status(204).end()
      : res.status(403).end();
  }
  return next();
});

const PREMIUM_AMOUNT = '500.00';
const PREMIUM_CURRENCY = 'LKR';
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const rateLimits = new Map();

function safeEqualHex(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left, 'utf8');
  const b = Buffer.from(right, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function normalizeAmount(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const amount = String(value).trim();
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(amount)) return null;
  return Number(amount).toFixed(2);
}

function rateLimit(req, res, next) {
  // Do not trust X-Forwarded-For unless a known proxy is explicitly configured.
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  if (rateLimits.size > 10000) {
    const cutoff = Date.now() - WINDOW_MS;
    for (const [ip, entry] of rateLimits) {
      if (entry.start < cutoff || rateLimits.size > 10000) rateLimits.delete(ip);
      if (rateLimits.size <= 8000) break;
    }
  }
  const now = Date.now();
  const previous = rateLimits.get(key);
  if (!previous || now - previous.start >= WINDOW_MS) {
    rateLimits.set(key, { start: now, count: 1 });
    return next();
  }
  previous.count += 1;
  if (previous.count > MAX_REQUESTS_PER_WINDOW) {
    res.set('Retry-After', String(Math.ceil((WINDOW_MS - (now - previous.start)) / 1000)));
    return res.status(429).json({ error: 'Too many requests. Try again shortly.' });
  }
  return next();
}

app.use(rateLimit);
app.use('/api', require('./premium'));

function initializeFirebaseAdmin() {
  if (admin.apps.length) return true;
  const serviceAccountText = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.FIREBASE_DB_URL || process.env.FIREBASE_DATABASE_URL;
  if (!serviceAccountText || !databaseURL) return false;

  try {
    const serviceAccount = JSON.parse(serviceAccountText);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
    return true;
  } catch (error) {
    console.error('Firebase Admin configuration is invalid.');
    return false;
  }
}

function requireFirebaseAdmin(res) {
  if (!initializeFirebaseAdmin()) {
    res.status(503).json({ error: 'Payment service is not configured.' });
    return null;
  }
  return admin.database();
}

async function authenticatedUid(req, res) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ error: 'Authentication required.' });
    return null;
  }
  if (!initializeFirebaseAdmin()) {
    res.status(503).json({ error: 'Authentication service is not configured.' });
    return null;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(match[1], true);
    return decoded.uid;
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return null;
  }
}

function payHereSecretHash(secret) {
  return crypto.createHash('md5').update(secret, 'utf8').digest('hex').toUpperCase();
}

function payHereNotifySignature({ merchantId, orderId, amount, currency, statusCode, secret }) {
  const hashedSecret = payHereSecretHash(secret);
  return crypto
    .createHash('md5')
    .update(merchantId + orderId + amount + currency + String(statusCode) + hashedSecret, 'utf8')
    .digest('hex')
    .toUpperCase();
}

function payHereCheckoutHash({ merchantId, orderId, amount, currency, secret }) {
  return crypto
    .createHash('md5')
    .update(merchantId + orderId + amount + currency + payHereSecretHash(secret), 'utf8')
    .digest('hex')
    .toUpperCase();
}

app.get('/', (_req, res) => {
  res.status(200).type('text/plain').send('AL Platform payment service');
});

app.get('/healthz', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    paymentConfigured: Boolean(process.env.PAYHERE_MERCHANT_ID && process.env.PAYHERE_MERCHANT_SECRET),
    firebaseConfigured: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT && (process.env.FIREBASE_DB_URL || process.env.FIREBASE_DATABASE_URL)),
  });
});

/**
 * Create a server-priced PayHere order. The client cannot choose the price,
 * currency, UID, merchant ID, or signing secret.
 */
app.post('/payhere/create-order', async (req, res) => {
  const uid = await authenticatedUid(req, res);
  if (!uid) return;

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const secret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !secret) return res.status(503).json({ error: 'Payment service is not configured.' });

  const db = requireFirebaseAdmin(res);
  if (!db) return;

  const orderId = crypto.randomUUID();
  const now = Date.now();
  const order = {
    uid,
    amount: PREMIUM_AMOUNT,
    currency: PREMIUM_CURRENCY,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.ref('payment_orders').child(orderId).set(order);
    return res.status(201).json({
      merchant_id: merchantId,
      order_id: orderId,
      amount: PREMIUM_AMOUNT,
      currency: PREMIUM_CURRENCY,
      hash: payHereCheckoutHash({ merchantId, orderId, amount: PREMIUM_AMOUNT, currency: PREMIUM_CURRENCY, secret }),
      items: 'AL Platform Premium - 30 days',
    });
  } catch (error) {
    console.error('Could not create payment order.');
    return res.status(500).json({ error: 'Could not create payment order.' });
  }
});

/**
 * PayHere server-to-server notification. Never trust custom_1 or a client
 * supplied UID; the authenticated user is taken from the server-created order.
 */
app.post('/payhere/notify', async (req, res) => {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const secret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !secret) return res.status(503).send('Payment service is not configured.');

  const {
    merchant_id: receivedMerchantId,
    order_id: orderId,
    payhere_amount: receivedAmount,
    payhere_currency: currency,
    status_code: statusCode,
    md5sig,
    payment_id: paymentId,
  } = req.body || {};

  if (
    typeof orderId !== 'string' ||
    !/^[0-9a-f-]{36}$/i.test(orderId) ||
    receivedMerchantId !== merchantId ||
    currency !== PREMIUM_CURRENCY ||
    normalizeAmount(receivedAmount) !== PREMIUM_AMOUNT
  ) {
    return res.status(400).send('Invalid payment details.');
  }

  const expectedSignature = payHereNotifySignature({
    merchantId: receivedMerchantId,
    orderId,
    amount: String(receivedAmount),
    currency,
    statusCode,
    secret,
  });
  if (!safeEqualHex(expectedSignature, md5sig)) return res.status(400).send('Invalid signature.');

  // PayHere uses status code 2 for a successful payment. Other valid statuses
  // are acknowledged but never grant premium access.
  if (String(statusCode) !== '2') return res.status(200).send('Non-success status acknowledged.');

  const db = requireFirebaseAdmin(res);
  if (!db) return;

  try {
    const orderRef = db.ref('payment_orders').child(orderId);
    const orderSnapshot = await orderRef.get();
    const order = orderSnapshot.val();
    if (!order || order.amount !== PREMIUM_AMOUNT || order.currency !== PREMIUM_CURRENCY) {
      return res.status(404).send('Unknown order.');
    }
    if (order.status === 'paid') return res.status(200).send('Payment already recorded.');
    if (order.status !== 'pending' || typeof order.uid !== 'string') {
      return res.status(409).send('Order is not payable.');
    }

    // A per-order grant record makes webhook retries idempotent, including a
    // retry after a process interruption between entitlement and order updates.
    const grantRef = db.ref('premium_grants').child(orderId);
    const grantResult = await grantRef.transaction((existing) => {
      if (existing) return existing;
      return {
        uid: order.uid,
        createdAt: Date.now(),
        expiresAt: Date.now() + PREMIUM_DURATION_MS,
        paymentId: paymentId ? String(paymentId) : null,
      };
    });
    if (!grantResult.committed || !grantResult.snapshot.exists()) {
      return res.status(500).send('Could not record entitlement grant.');
    }
    const grant = grantResult.snapshot.val();
    if (grant.uid !== order.uid) return res.status(409).send('Grant owner mismatch.');

    const userRef = db.ref('users').child(order.uid);
    const entitlementResult = await userRef.transaction((currentUser) => {
      const user = currentUser || {};
      const currentExpiry = Number(user.premiumExpiry || user.premiumValidUntil || 0);
      user.isPremium = true;
      user.premiumExpiry = Math.max(currentExpiry, Number(grant.expiresAt));
      return user;
    });
    if (!entitlementResult.committed || !entitlementResult.snapshot.exists()) {
      return res.status(500).send('Could not activate premium entitlement.');
    }

    await orderRef.update({
      status: 'paid',
      paymentId: paymentId ? String(paymentId) : null,
      paidAt: Date.now(),
      updatedAt: Date.now(),
    });
    return res.status(200).send('Payment recorded.');
  } catch (error) {
    console.error('PayHere notification processing failed.');
    return res.status(500).send('Could not process payment notification.');
  }
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => {
    console.log(`AL Platform payment service listening on port ${port}`);
  });
}

module.exports = {
  app,
  normalizeAmount,
  payHereCheckoutHash,
  payHereNotifySignature,
  safeEqualHex,
};
