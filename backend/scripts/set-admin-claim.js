const admin = require('firebase-admin');

async function main() {
  const revoke = process.argv[2] === '--revoke';
  const uid = process.argv[revoke ? 3 : 2];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.FIREBASE_DB_URL || process.env.FIREBASE_DATABASE_URL;
  if (!uid || !/^[A-Za-z0-9:_-]{1,128}$/.test(uid)) {
    throw new Error('Usage: node scripts/set-admin-claim.js [--revoke] <firebase-auth-uid>');
  }
  if (!raw || !databaseURL) {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT and FIREBASE_DB_URL in the trusted operator environment.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(raw)),
    databaseURL,
  });

  const user = await admin.auth().getUser(uid);
  const claims = { ...(user.customClaims || {}) };
  if (revoke) {
    delete claims.admin;
  } else {
    claims.admin = true;
  }
  await admin.auth().setCustomUserClaims(uid, claims);
  await admin.database().ref('users').child(uid).update({ isAdmin: !revoke });

  console.log(`Admin custom claim ${revoke ? 'revoked from' : 'assigned to'} UID ${uid}. The user must refresh their ID token.`);
}

main().catch((error) => {
  console.error(error.message || 'Could not update admin claim.');
  process.exitCode = 1;
});
