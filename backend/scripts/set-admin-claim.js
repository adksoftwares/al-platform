const admin = require('firebase-admin');

async function main() {
  const uid = process.argv[2];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.FIREBASE_DB_URL || process.env.FIREBASE_DATABASE_URL;
  if (!uid || !/^[A-Za-z0-9:_-]{1,128}$/.test(uid)) {
    throw new Error('Usage: node scripts/set-admin-claim.js <firebase-auth-uid>');
  }
  if (!raw || !databaseURL) {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT and FIREBASE_DB_URL in the trusted operator environment.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(raw)),
    databaseURL,
  });

  const user = await admin.auth().getUser(uid);
  await admin.auth().setCustomUserClaims(uid, { ...(user.customClaims || {}), admin: true });
  console.log(`Admin custom claim assigned to UID ${uid}. The user must refresh their ID token.`);
}

main().catch((error) => {
  console.error(error.message || 'Could not assign admin claim.');
  process.exitCode = 1;
});
