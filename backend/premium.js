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

async function getUid(req, res, requireAdmin = false) {
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
    if (requireAdmin && token.admin !== true) {
      res.status(403).json({ error: 'Administrator permission required.' });
      return null;
    }
    return token.uid;
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return null;
  }
}

router.post('/premium/redeem', async (req, res) => {
  try {
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
  const userResult = await userRef.transaction((currentUser) => {
    const user = currentUser || {};
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

  return res.status(200).json({ success: true, premiumExpiry: Number(userResult.snapshot.val().premiumExpiry) });
  } catch {
    return res.status(500).json({ error: 'Could not redeem access code. Please retry the same code.' });
  }
});


router.post('/downloads/consume', async (req, res) => {
  try {
    const uid = await getUid(req, res);
    if (!uid) return;

    const userRef = admin.database().ref('users').child(uid);
    let decision = { allowed: false, count: 0 };
    const result = await userRef.transaction((user) => {
      if (!user) return;
      const now = Date.now();
      const expiry = Number(user.premiumExpiry || user.premiumValidUntil || 0);
      const premium = user.isPremium === true && (expiry > now);
      const storedCount = Number(user.freeDownloadsCount || 0);
      const count = Number.isFinite(storedCount) ? Math.max(0, Math.floor(storedCount)) : 0;

      if (premium) {
        decision = { allowed: true, count, premium: true };
        return user;
      }
      if (count >= 5) {
        decision = { allowed: false, count, premium: false };
        return user;
      }

      const nextCount = count + 1;
      decision = { allowed: true, count: nextCount, premium: false };
      return { ...user, freeDownloadsCount: nextCount };
    });

    if (!result.committed || !result.snapshot.exists()) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    if (!decision.allowed) {
      return res.status(403).json({ allowed: false, count: decision.count, error: 'Free download limit reached.' });
    }
    return res.status(200).json(decision);
  } catch {
    return res.status(500).json({ error: 'Could not verify download allowance.' });
  }
});


router.post('/admin/premium', async (req, res) => {
  try {
    const actorUid = await getUid(req, res, true);
    if (!actorUid) return;

    const targetUid = typeof req.body?.targetUid === 'string' ? req.body.targetUid.trim() : '';
    const enabled = req.body?.enabled;
    if (!/^[A-Za-z0-9:_-]{1,128}$/.test(targetUid) || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid target account or premium status.' });
    }

    const db = admin.database();
    const targetRef = db.ref('users').child(targetUid);
    const result = await targetRef.transaction((currentUser) => {
      if (!currentUser) return;
      const user = { ...currentUser };
      if (enabled) {
        const currentExpiry = Number(user.premiumExpiry || user.premiumValidUntil || 0);
        user.isPremium = true;
        user.premiumExpiry = Math.max(currentExpiry, Date.now() + PREMIUM_DURATION_MS);
      } else {
        user.isPremium = false;
        user.premiumExpiry = 0;
        user.premiumValidUntil = 0;
      }
      return user;
    });

    if (!result.committed || !result.snapshot.exists()) {
      return res.status(404).json({ error: 'Target user profile not found.' });
    }

    await db.ref('admin_audit/premium').push({
      actorUid,
      targetUid,
      action: enabled ? 'grant_30_days' : 'revoke',
      occurredAt: Date.now(),
    });

    const updated = result.snapshot.val();
    return res.status(200).json({
      success: true,
      isPremium: updated.isPremium === true,
      premiumExpiry: Number(updated.premiumExpiry || 0),
    });
  } catch {
    return res.status(500).json({ error: 'Could not update premium access.' });
  }
});

module.exports = router;
