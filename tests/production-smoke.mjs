// Read-only production smoke. Never submits credentials, creates accounts,
// requests email, or accesses any authenticated health record.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const origin=process.env.PAKI_TEST_BASE_URL||'https://pakidiyabet.netlify.app';
const output=process.env.PAKI_TEST_OUTPUT||path.resolve('test-results');
const report={kind:'production-read-only-smoke',origin,date:new Date().toISOString(),checks:[]};
async function check(name,route,expected,verify,headers={}){
 const item={name,path:route,expected,status:'failed'};report.checks.push(item);
 try{
  const r=await fetch(origin+route,{redirect:'manual',signal:AbortSignal.timeout(25000),headers});
  item.httpStatus=r.status;item.cacheControl=r.headers.get('cache-control');item.contentType=r.headers.get('content-type');
  assert.equal(r.status,expected);const body=await r.text();if(verify)await verify(body,r);item.status='passed';console.log('PASS '+name+' HTTP '+r.status);return body;
 }catch(e){item.error=e.message;console.log('FAIL '+name+' '+e.message);}
}
const home=await check('Public dashboard','/',200,b=>assert.match(b,/PAKİ|Paki|paki/));
await check('Login and signup page','/giris',200,b=>assert.match(b,/Paki hesabınıza giriş yapın/));
await check('Logout page','/cikis',200,b=>assert.match(b,/Hesaptan çıkış/));
await check('Identity email provider enabled; confirmation required','/.netlify/identity/settings',200,b=>{const s=JSON.parse(b);assert.equal(s.external.email,true);assert.equal(s.disable_signup,false);assert.equal(s.autoconfirm,false);});
await check('Database health','/api/status',200,b=>assert.equal(JSON.parse(b).ok,true));
for(const route of ['/api/session','/api/records','/api/journal','/api/documents','/api/backup','/api/shares','/api/sync-context']){
 await check('Anonymous '+route,route,401,(b,r)=>{assert.match(r.headers.get('cache-control')||'',/no-store/);if(route==='/api/session')assert.equal(JSON.parse(b).authenticated,false);});
}
await check('Forged Sites headers stay unauthorized','/api/records',401,null,{'oai-authenticated-user-id':'synthetic-user','oai-authenticated-user-email':'virtual@example.invalid'});
await check('Malformed JWT stays unauthorized','/api/session',401,null,{cookie:'nf_jwt=synthetic.invalid.token'});
const manifest=await check('Web manifest','/manifest.webmanifest',200,b=>{const m=JSON.parse(b);assert.ok(m.icons?.length);});
await check('Service worker contains offline fallback and auth-route exclusions','/sw.js',200,b=>{assert.match(b,/offline\.html/);assert.match(b,/giris/);assert.match(b,/cikis/);});
await check('Offline page','/offline.html',200,b=>assert.match(b,/html/i));
if(manifest)for(const icon of JSON.parse(manifest).icons){const url=new URL(icon.src,origin+'/manifest.webmanifest');assert.equal(url.origin,origin);await check('Manifest app icon '+icon.sizes,url.pathname,200,null);}
if(home){const assets=[...new Set([...home.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+\.(?:js|css)(?:\?[^" ]*)?)"/g)].map(m=>m[1].replaceAll('&amp;','&')))];for(const asset of assets)await check('Static '+(asset.endsWith('.css')?'CSS':'JavaScript'),asset,200);report.staticAssetCount=assets.length;}
report.passed=report.checks.filter(c=>c.status==='passed').length;report.failed=report.checks.filter(c=>c.status==='failed').length;report.finishedAt=new Date().toISOString();fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'production-smoke.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
