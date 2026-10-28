# EndpointRadar managed infrastructure (not yet production-ready)

The managed API is separate from the existing browser-only importer. All server data is scoped to `/endpointRadar` in the same Firebase project as the authenticated users. The existing database root rules must deny client reads and writes, and `/endpointRadar` must remain denied to all clients. Firebase rules cascade: a child denial cannot cancel an ancestor grant. Merge and verify rules carefully; do not overwrite other applications’ rules. Only after confirming the effective rules and testing direct client access, set `ENDPOINTRADAR_DATABASE_LOCKED=true`. `dedicated-database.rules.json` is an emulator-only deny-all fixture, not a replacement for production rules.

Server-only environment: `ENDPOINTRADAR_DATABASE_URL`, `ENDPOINTRADAR_SERVICE_ACCOUNT_JSON`, and `ENDPOINTRADAR_DATABASE_LOCKED=true`. Restrict service account access and never expose those values as `NEXT_PUBLIC_*`. The service account belongs to the Firebase Auth project `mypentest-bugsnaps`; its administrative RTDB permissions are broad, and application code scopes requests to the EndpointRadar subtree. Verified Firebase email is mandatory. Workspace membership is enforced by the server. Invitations are bound to verified email and expire after seven days; administrators deliver invite codes themselves. Device secrets are generated once, stored only as SHA-256 digests, and must be installed securely on the matching machine.

Limits: 10 workspaces per account, 25 workspaces per service, 20 devices per workspace (maximum 500 total), 128 KiB request, last 10 scan records per device, 100 alerts per event stream. Only the last 10 scan IDs are retained; duplicate retained IDs are idempotent, and unique scans must have a valid, non-future capture timestamp newer than the last accepted capture. Completing a review saves an independent snapshot per device for future reports; it survives scan-history rotation and is replaced by the next completed review. Reports reject mixed review revisions. The watchdog reads a separate compact monitor record. Device records are transacted together; this bounded design is for small workspaces and needs load testing. Scans and alert contents can contain sensitive information. Local emulator HTTP tests cover basic tenant isolation, invite replay and member revocation, viewer access, device authentication and revocation, schedules and retest requests, persistent review comparisons, idempotent upload, concurrent upload limiting, and direct database denial. Production integration, end-to-end Windows scheduled scans, load tests and security review remain required.

## Emulator integration test (PowerShell)

Requires Java 21 and Firebase CLI (`firebase`) and installs from `npm ci`. Start the emulators in one terminal:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
firebase emulators:start --config docs/endpointradar/firebase.test.json --project demo-endpointradar --only auth,database
```

In another terminal, set the emulator endpoints for the Next.js process only:

```powershell
$env:ENDPOINTRADAR_ALLOW_EMULATOR='true'
$env:FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:19099'
$env:FIREBASE_DATABASE_EMULATOR_HOST='127.0.0.1:19100'
node node_modules/next/dist/bin/next dev -p 3018
```

Then run `node scripts/check-endpointradar-managed.cjs`. Emulator data persists for that emulator session; start with fresh emulator state if capacity limits are hit. The test creates temporary accounts and workspace records in the emulator only. The `ENDPOINTRADAR_ALLOW_EMULATOR` bypass is ignored by production builds.

## Production setup

The project pins Node 22 and Firebase Admin 13.10.0. The newer SDK's ESM dependency failed under Vercel's runtime loader even after a successful build; CI explicitly checks server imports with `require(ESM)` disabled. Dashboard entry links load a new document so Firebase receives the managed page's CSP.

1. Sign in to a Vercel account with access to the `4ryanwaliaa` team and `bug-snaps` project using `vercel login --global-config <directory>`. The current account username is `4ryanwalia-4917`; the setup script verifies the project ID and linked GitHub repository.
2. Confirm Firebase CLI authentication to `mypentest-bugsnaps`. Run `node scripts/configure-endpointradar.cjs <directory>`. This checks project access and current rules before creating an EndpointRadar service account/key, sends the key directly to encrypted Vercel production environment variables, and sets the GitHub scheduler secret. It never writes the key to disk or enables billing. The runtime service account has Firebase Auth viewer and Realtime Database admin roles; application access is scoped to `/endpointRadar`.
3. Build and deploy the reviewed commit. The managed page shows a setup message until `ENDPOINTRADAR_DATABASE_LOCKED=true` is set at build time.
4. Run the watchdog workflow manually and verify it succeeds. GitHub requests it every 15 minutes (best effort); the Vercel daily cron is a backup. Both use the same random secret. Alerts are in-app; no email service is configured.
5. With separate verified test accounts, create two client workspaces and verify viewer isolation, invitation acceptance, and revocation on the live service. Enroll an authorized Windows device, verify a scheduled report and retest request, and inspect an exported client PDF.

The Windows helper runs under the signed-in installing account with limited privileges. It cannot run while that account is signed out. The scanner GitHub Windows self-scan and Linux/Windows matrix passed at revision `1cf2f97`. Local scheduled-task installation and local endpoint execution remain unverified: automatic approval review blocked the attempted local scan and ACL test, stating only `blocked by policy`. A user-run enrollment check is required before operational claims.
