const express = require('express');
const crypto = require('node:crypto');
const admin = require('firebase-admin');

const router = express.Router();
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function initializeFirebaseAdmin() {
  if (admin.apps.length) return true;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.FIREBASE_DB_URL || process.env.FIREBASE_DATABASE_URL;
  if (!raw || !databaseURL) return false;
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(raw)),
      databaseURL,
    });
    return true;
  } catch {
    return false;
  }
}

async function getUid(req, res) {
  const match = (req.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ error: 'Authentication required.' });
    return null;
  }
  if (!initializeFirebaseAdmin()) {
    res.status(503).json({ error: 'Redemption service is not configured.' });
    return null;
  }
  try {
    const token = await admin.auth().verifyIdToken(match[1], true);
    return token.uid;
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return null;
  }
}

router.post('/premium/redeem', async (req, res) => {
  const uid = await getUid(req, res);
  if (!uid) return;

  const code = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
  if (!/^[A-Z0-9-]{5,64}$/.test(code)) {
    return res.status(400).json({ error: 'Enter a valid access code.' });
  }

  const db = admin.database();
  const codeRef = db.ref('admin_settings/premium_codes').child(code);
  const codeResult = await codeRef.transaction((current) => {
    if (!current) return;
    if (current.isUsed === true && current.usedBy !== uid) return;
    return { ...current, isUsed: true, usedBy: uid, usedAt: current.usedAt || Date.now() };
  });

  if (!codeResult.committed || !codeResult.snapshot.exists()) {
    return res.status(400).json({ error: 'Invalid or already-used access code.' });
  }

  // Stable grant ID means retries by the same user reuse the same expiry.
  const grantId = crypto.createHash('sha256').update(code, 'utf8').digest('hex');
  const grantRef = db.ref('premium_grants').child('codes').child(grantId);
  const grantResult = await grantRef.transaction((current) => {
    if (current) return current;
    return { uid, createdAt: Date.now(), expiresAt: Date.now() + PREMIUM_DURATION_MS };
  });

  if (!grantResult.committed || !grantResult.snapshot.exists()) {
    return res.status(500).json({ error: 'Could not record the premium grant.' });
  }
  const grant = grantResult.snapshot.val();
  if (grant.uid !== uid) return res.status(409).json({ error: 'Access code has already been redeemed.' });

  const userRef = db.ref('users').child(uid);
  const userResult = await userRef.transaction((user) => {
    if (!user) return;
    const existingExpiry = Number(user.premiumExpiry || user.premiumValidUntil || 0);
    user.isPremium = true;
    user.premiumExpiry = Math.max(existingExpiry, Number(grant.expiresAt));
    return user;
  });

  if (!userResult.committed || !userResult.snapshot.exists()) {
    // The code and stable grant remain associated with this user, so retrying
    // this same code can safely finish activation without granting another term.
    return res.status(500).json({ error: 'The code was accepted but activation is pending. Retry the same code.' });
  }

  return res.status(200).json({ success: true, premiumExpiry: Number(grant.expiresAt) });
});

module.exports = router;
