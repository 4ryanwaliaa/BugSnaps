// Read-only HTTP checks for the deployed document, assets, and provider CORS contract.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const origin = 'https://bugsnaps.in';
const checks = [];
const passed = label => { checks.push(label); console.log(`PASS ${label}`); };
async function get(url, options = {}) {
  return fetch(url, { ...options, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(20000) });
}
(async () => {
  const scripts = new Set();
  const styles = new Set();
  for (const route of ['/phishing-detector', '/phishing-detector/team']) {
    const response = await get(origin + route);
    assert.equal(response.status, 200);
    const html = await response.text();
    const csp = response.headers.get('content-security-policy') || '';
    assert.match(csp, /https:\/\/api\.destroy\.tools/);
    for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
      const url = new URL(match[1].replaceAll('&amp;', '&'), origin);
      if (url.origin === origin && url.pathname.startsWith('/_next/')) scripts.add(url.href);
    }
    for (const match of html.matchAll(/<link[^>]+href="([^"]+\.css(?:\?[^"]*)?)"/g)) {
      const url = new URL(match[1].replaceAll('&amp;', '&'), origin);
      if (url.origin === origin && url.pathname.startsWith('/_next/')) styles.add(url.href);
    }
    if (route.endsWith('/team')) {
      assert.match(html, /noindex/);
      assert.match(csp, /https:\/\/identitytoolkit\.googleapis\.com/);
      assert.match(csp, /https:\/\/\*\.firebasedatabase\.app/);
    } else {
      assert.match(html, /href="\/phishing-detector\/team"/);
      assert.match(html, /Message text \(optional\)/);
    }
    passed(`${route} document contains expected workflow and network policy`);
  }
  let bundles = '';
  assert.ok(scripts.size > 0 && styles.size > 0);
  for (const url of scripts) {
    const response = await get(url); assert.equal(response.status, 200, new URL(url).pathname);
    assert.match(response.headers.get('content-type') || '', /javascript/);
    bundles += await response.text();
  }
  for (const url of styles) {
    const response = await get(url); assert.equal(response.status, 200, new URL(url).pathname);
    assert.match(response.headers.get('content-type') || '', /css/);
  }
  passed(`${scripts.size} referenced JavaScript bundles and ${styles.size} stylesheets are available`);
  for (const text of ['Report a message', 'Save decision', 'Reports and repeated patterns', 'Provider check time', 'hostname pattern score']) {
    assert.ok(bundles.includes(text), `deployed JavaScript must include ${text}`);
  }
  passed('deployed bundles contain inbox decisions, history, and provider score/time interface');
  const response = await get('https://api.destroy.tools/v1/check?domain=example.com', { headers: { Origin: origin } });
  assert.equal(response.status, 200);
  assert.ok(['*', origin].includes(response.headers.get('access-control-allow-origin')));
  const answer = await response.json();
  assert.equal(answer.domain, 'example.com'); assert.equal(typeof answer.threat, 'boolean');
  passed('PhishDestroy permits cross-origin browser lookup from production origin');
  const firebaseResponse = await get('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=invalid-verification-key', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}',
  });
  assert.ok([400, 403].includes(firebaseResponse.status));
  assert.ok(['*', origin].includes(firebaseResponse.headers.get('access-control-allow-origin')));
  passed('Firebase authentication error responses expose CORS to production origin');
  const report = { checkedAt: new Date().toISOString(), origin, checks, browserInteraction: 'Not exercised; Work browser automation disabled.' };
  if (process.env.PHISHLENS_DEPLOYMENT_REPORT) fs.writeFileSync(process.env.PHISHLENS_DEPLOYMENT_REPORT, JSON.stringify(report, null, 2) + '\n');
  console.log(`Deployment checks passed: ${checks.length}.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
