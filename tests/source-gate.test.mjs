import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const verifier = resolve('scripts/verify-source.mjs');
const requiredPaths = [
  'package-lock.json','tsconfig.json','app/page.tsx','db/raw.ts',
  'netlify/database/migrations/001_initial-schema/migration.sql',
  'app/chatgpt-auth.ts','app/api/session/route.ts','app/session-reconciler.ts',
  'lib/backup.ts','lib/documents.ts','lib/health.ts','lib/journal.ts',
  'lib/return-path.ts','lib/server-journal.ts','lib/shares.ts'
];
const scripts = {
  build:'next build',lint:'eslint .',typecheck:'tsc --noEmit',
  test:'node --test', 'test:e2e':'playwright test'
};
function withFixture(callback) {
  const dir = mkdtempSync(join(tmpdir(),'paki-source-gate-'));
  const add = (p,c='') => {
    const full=join(dir,p);
    mkdirSync(dirname(full),{recursive:true});
    writeFileSync(full,c,'utf8');
  };
  try {callback({dir,add});}
  finally {rmSync(dir,{recursive:true,force:true});}
}
function run(cwd){return spawnSync(process.execPath,[verifier],{cwd,encoding:'utf8'});}

test('empty directory cannot pass and reports missing critical files',()=>{
  withFixture(({dir})=>{
    const r=run(dir);
    assert.equal(r.status,1);
    assert.match(r.stderr,/SOURCE_INCOMPLETE/);
    assert.match(r.stderr,/package.json/);
  });
});

test('tampered or incomplete app cannot pass source gate',()=>{
  withFixture(({dir,add})=>{
    add('package.json',JSON.stringify({scripts:{build:'next build'},dependencies:{next:'15.0.0'}}));
    requiredPaths.forEach(p=>add(p));
    const r=run(dir);
    assert.equal(r.status,1);
    assert.match(r.stderr,/package script: test:e2e/);
  });
});

test('pnpm lockfile alone cannot pass an npm-ci workflow',()=>{
  withFixture(({dir,add})=>{
    add('package.json',JSON.stringify({scripts,dependencies:{next:'15.0.0'}}));
    add('pnpm-lock.yaml','lockfileVersion: 9.0');
    requiredPaths.filter(p=>p!=='package-lock.json').forEach(p=>add(p));
    const r=run(dir);
    assert.equal(r.status,1);
    assert.match(r.stderr,/npm lockfile/);
  });
});

test('complete synthetic source inventory passes readiness only',()=>{
  withFixture(({dir,add})=>{
    add('package.json',JSON.stringify({scripts,dependencies:{next:'15.0.0'}}));
    requiredPaths.forEach(p=>add(p));
    const r=run(dir);
    assert.equal(r.status,0,'stdout: '+r.stdout+' stderr: '+r.stderr);
    assert.match(r.stdout,/SOURCE_GATE_OK/);
    assert.match(r.stdout,/tests still required/);
  });
});
