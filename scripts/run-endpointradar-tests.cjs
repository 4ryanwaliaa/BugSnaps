const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const server = spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), 'dev', '-p', '3018'], {env:{...process.env,ENDPOINTRADAR_ALLOW_EMULATOR:'true',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:19099',FIREBASE_DATABASE_EMULATOR_HOST:'127.0.0.1:19100'}});
let log = '';
for (const stream of [server.stdout,server.stderr]) stream.on('data', data => { log = (log + data).slice(-12000); });
async function main() {
  let ready = false;
  for (let i=0;i<90;i++) {
    if (server.exitCode !== null) break;
    try { const r = await fetch('http://127.0.0.1:3018/endpointradar/managed',{signal:AbortSignal.timeout(10000)}); if(r.status === 200) {ready=true;break;} } catch {}
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  if(!ready) throw new Error('Local Next.js test server failed to start.\n'+log);
  const result = spawnSync(process.execPath,['scripts/check-endpointradar-managed.cjs'],{stdio:'inherit',timeout:180000});
  if(result.status !== 0) throw new Error('Managed integration tests failed.\n'+log);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>server.kill());
