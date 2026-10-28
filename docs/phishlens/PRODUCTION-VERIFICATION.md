# Production verification — 28 October 2026

Application release tested: `12f29d5` at `https://bugsnaps.in`.

The live acceptance run passed 37 checks against the deployed pages, real
Firebase Authentication, the production Realtime Database rules, and the live
PhishDestroy API. Six additional read-only deployment checks passed. These
checks establish the results below; they do not replace browser interaction or
load testing.

## Verified against production

- Three temporary accounts could register and sign in: administrator, employee
  and an unrelated team administrator.
- Administrators could create isolated teams and add an employee. Anonymous
  users, outsiders and employees awaiting membership could not read the team.
- An employee could submit two synthetic messages. The saved message text,
  sender, domain and server timestamps remained available after a fresh read.
- Only administrators could set suspicious, legitimate and unresolved decisions.
  Updated action notes and reviewer identity were visible to the employee.
- An employee could neither promote themselves nor change decisions or delete
  reports. Even the administrator could not rewrite submitted message evidence.
- Administrator deletion removed a report from saved history. Membership removal
  blocked subsequent employee reads and submissions. The team owner could not
  be accidentally removed.
- Production rules matched the tested rules fragment, with root read and write
  access denied.
- The public inspector, team route and privacy policy returned HTTP 200. The team
  route supplied `noindex, nofollow` and the required Firebase CSP origins.
- All 17 referenced JavaScript bundles and three stylesheets were available.
  The deployed bundles contained the team workflow, decision controls, history
  summary and provider score/time interface.
- PhishDestroy permitted cross-origin requests from the production origin.
  Firebase authentication errors also returned compatible CORS headers.
- The live provider returned an unlisted result without a numerical score for
  `example.com`, a 15-point heuristic for an unlisted synthetic hostname, and a
  65/100 risk score for a currently listed domain. Missing scores remained absent;
  lookup and response times were present. No submitted destination was visited.

All three temporary accounts and both generated test teams were deleted, and
their absence was verified. No existing customer accounts or teams were used.

## Observed limits

- Browser interaction was deferred at the user's request because Work browser
  automation was disabled. Actual form clicks, browser hydration, responsive
  layout and account-switch interactions still need a browser acceptance run.
- PhishDestroy reported **degraded** freshness during the live checks. The app
  displays that state. Successful API connectivity does not establish current
  threat coverage or detection accuracy.
- Team history retains each report and its latest decision/action note. It is
  not an append-only audit trail of every decision change.
- No traffic-volume, large-team, cross-browser or device compatibility claim is
  made by these acceptance checks.

## Repeatable checks

Read-only deployed document, asset and CORS checks:

```powershell
node scripts/verify-phishlens-deployment.cjs
```

Explicit live acceptance test, which creates and deletes disposable production
accounts and test teams:

```powershell
node scripts/verify-phishlens-production.cjs --run-live
```

The live test needs the owner's existing Firebase CLI authorization to inspect
rules and remove only its generated test teams. It never modifies production
rules. `FIREBASE_TOOLS_LIB` can override the local Firebase CLI library path.
`PHISHLENS_VERIFICATION_REPORT` and `PHISHLENS_DEPLOYMENT_REPORT` optionally select
local JSON report paths. Reports omit passwords and authentication tokens.
