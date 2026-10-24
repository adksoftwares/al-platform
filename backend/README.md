# AL Platform backend operations

## Required environment

Configure these values in the hosting provider's secret/environment settings. Do not commit service-account JSON or merchant secrets.

- `PORT`: HTTP port supplied by the platform (defaults to `3000`).
- `CORS_ALLOWED_ORIGINS`: exact comma-separated HTTPS origin(s) for the deployed web app; wildcard origins are not accepted.
- `TRUST_PROXY_HOPS`: leave `0` unless your hosting provider's trusted reverse-proxy chain is known; set the exact number of trusted hops only after confirming the host configuration.
- `FIREBASE_DB_URL`: Realtime Database URL for the AL Platform Firebase project.
- `FIREBASE_SERVICE_ACCOUNT`: the complete Firebase service-account JSON as a single-line secret.
- `PAYHERE_MERCHANT_ID`: merchant ID from the PayHere dashboard.
- `PAYHERE_MERCHANT_SECRET`: merchant secret from the PayHere dashboard.

The service fails closed for authentication, premium redemption, and payments when required secrets are missing. `GET /healthz` reports configuration presence only; it never returns secret values.

## Endpoints

- `POST /api/downloads/consume`: requires a Firebase ID token and atomically checks the five-free-download limit before incrementing it.
- `POST /api/premium/redeem`: requires `Authorization: Bearer <Firebase ID token>` and JSON `{"code":"..." }`. The server validates and atomically claims the code, creates a stable grant record, and writes premium status through Firebase Admin SDK.
- `POST /payhere/create-order`: requires a Firebase ID token. The server fixes the plan price to LKR 500.00 for 30 days, creates a pending order, and returns PayHere checkout fields and a signature.
- `POST /payhere/notify`: PayHere server-to-server notification endpoint. It validates merchant ID, order, amount, currency, signature, and server-created order state before activating premium. It ignores client-provided user IDs.
- `GET /healthz`: non-sensitive service health/configuration indicator.

Register `https://YOUR_DEPLOYED_HOST/payhere/notify` as the PayHere notification URL. The web build must have `VITE_BACKEND_BASE_URL=https://YOUR_DEPLOYED_HOST` (see `web/.env.example`). The Android build must be configured with the public HTTPS API origin using the Gradle property `backendBaseUrl`, for example:

```sh
./gradlew assembleRelease -PbackendBaseUrl=https://YOUR_DEPLOYED_HOST
```

Do not ship a blank backend URL or an HTTP URL. The app intentionally refuses to redeem access codes if its backend URL is not HTTPS.

## Firebase authorization / rollout order

1. Deploy the backend with its secrets and verify `/healthz`.
2. Assign the `admin: true` Firebase custom claim to the trusted administrator UID from a secure operator environment:
   ```sh
   FIREBASE_SERVICE_ACCOUNT='...' FIREBASE_DB_URL='https://...' node scripts/set-admin-claim.js FIREBASE_AUTH_UID
   ```
   Run this only from a trusted machine/CI secret context. Never place service-account JSON in source control or in the mobile app. The admin must refresh the Firebase ID token after the claim is assigned.
3. Review and deploy `AlApp/database.rules.json` to the correct Realtime Database instance. The rules now use the trusted `auth.token.admin` claim; legacy email allowlists and client-editable `isAdmin` fields are not authorization.
4. Build the Android app with `-PbackendBaseUrl=https://YOUR_DEPLOYED_HOST`.
5. Test with a non-admin account that it cannot write `isPremium`, `premiumExpiry`, `premiumValidUntil`, `isAdmin`, `freeDownloadsCount`, or `admin_settings/premium_codes`.

**Important migration notes**

- New web accounts authenticate with the actual user password via Firebase Authentication; passwords are no longer written to Realtime Database. Legacy accounts can migrate on login only if the old stored password matches the password the user provides. Remove any historical plaintext password values after validating account recovery and migration.
- Password reset uses Firebase's verified email recovery flow. The old client-provided phone + new-password reset flow is intentionally not trusted.
- The current client UI asks the backend to consume a download allowance before opening/downloading a file. This protects the counter from direct client writes, but files hosted at public URLs can still be fetched outside the app; strict enforcement requires a backend proxy or private, short-lived download URLs.
- The Android manual access-code screen now uses the backend endpoint. Configure the backend URL before release.
- PayHere order creation is exposed server-side, but the Android PayHere SDK checkout handoff still needs to be connected to these returned fields and verified on a real PayHere sandbox account before enabling paid checkout in production.
- Premium expiry is written by the trusted backend. Do not reintroduce client writes to entitlement fields.
- After deploying the rules, old hard-coded email admins will lose admin access until a trusted operator assigns custom claims. Confirm the UID and recovery path before deploying to a live project.

## Tests

Run:

```sh
npm install
npm test
```

Tests cover amount normalization, signature generation, and constant-time signature comparison. They do not replace a PayHere sandbox transaction, Firebase Emulator rules tests, Android release build, or production smoke test.
