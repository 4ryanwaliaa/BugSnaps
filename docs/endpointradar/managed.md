# EndpointRadar managed infrastructure (not yet production-ready)

The managed API is separate from the existing browser-only importer. All server data is scoped to `/endpointRadar` in the same Firebase project as the authenticated users. The existing database root rules must deny client reads and writes, and `/endpointRadar` must remain denied to all clients. Firebase rules cascade: a child denial cannot cancel an ancestor grant. Merge and verify rules carefully; do not overwrite other applications’ rules. Only after confirming the effective rules and testing direct client access, set `ENDPOINTRADAR_DATABASE_LOCKED=true`. `dedicated-database.rules.json` is an emulator-only deny-all fixture, not a replacement for production rules.

Server-only environment: `ENDPOINTRADAR_DATABASE_URL`, `ENDPOINTRADAR_SERVICE_ACCOUNT_JSON`, and `ENDPOINTRADAR_DATABASE_LOCKED=true`. Restrict service account access and never expose those values as `NEXT_PUBLIC_*`. The service account belongs to the Firebase Auth project `mypentest-bugsnaps`; its administrative RTDB permissions are broad, and application code scopes requests to the EndpointRadar subtree. Verified Firebase email is mandatory. Workspace membership is enforced by the server. Invitations are bound to verified email and expire after seven days; administrators deliver invite codes themselves. Device secrets are generated once, stored only as SHA-256 digests, and must be installed securely on the matching machine.

Limits: 10 workspaces per account, 25 workspaces per service, 20 devices per workspace (maximum 500 total), 128 KiB request, last 10 scan records per device, 100 alerts per event stream. Only the last 10 scan IDs are retained; duplicate retained IDs are idempotent, and unique scans must have a valid, non-future capture timestamp newer than the last accepted capture. The watchdog reads a separate compact monitor record. Device records are transacted together; this bounded design is for small workspaces and needs load testing. Scans and alert contents can contain sensitive information. Local emulator HTTP tests cover basic tenant isolation, invite replay and member revocation, viewer access, device authentication and revocation, idempotent upload, concurrent upload limiting, and direct database denial. Production integration, end-to-end Windows scheduled scans, load tests and security review remain required.

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
