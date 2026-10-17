#!/usr/bin/env node
// Source-readiness safety gate. Must pass before ANY production build.
// It is deliberately stricter than a Next.js starter: this is an existing
// health-data application that must not be replaced by an incomplete clone.
import { existsSync, readFileSync } from 'node:fs';

const hasOne = (paths) => paths.some(existsSync);
const requirements = [
  ['package.json', ['package.json']],
  ['npm lockfile (CI uses npm ci)', ['package-lock.json', 'npm-shrinkwrap.json']],
  ['Next.js page entry', [
    'app/page.tsx', 'app/page.jsx', 'app/page.js',
    'src/app/page.tsx', 'src/app/page.jsx', 'src/app/page.js',
    'pages/index.tsx', 'pages/index.jsx', 'pages/index.js',
    'src/pages/index.tsx', 'src/pages/index.jsx', 'src/pages/index.js',
  ]],
  ['TypeScript configuration', ['tsconfig.json']],
  ['database interface', ['db/raw.ts','db/raw.js']],
  ['baseline PostgreSQL migration', ['netlify/database/migrations/001_initial-schema/migration.sql']],
  ['auth handler', ['app/chatgpt-auth.ts','app/chatgpt-auth.js']],
  ['authenticated API session', ['app/api/session/route.ts','app/api/session/route.js']],
  ['session reconciliation', ['app/session-reconciler.ts','app/session-reconciler.tsx','app/session-reconciler.js']],
  ['backup support', ['lib/backup.ts','lib/backup.tsx','lib/backup.js']],
  ['documents support', ['lib/documents.ts','lib/documents.tsx','lib/documents.js']],
  ['health records support', ['lib/health.ts','lib/health.tsx','lib/health.js']],
  ['journal support', ['lib/journal.ts','lib/journal.tsx','lib/journal.js']],
  ['safe return path', ['lib/return-path.ts','lib/return-path.js']],
  ['server journal support', ['lib/server-journal.ts','lib/server-journal.js']],
  ['shares support', ['lib/shares.ts','lib/shares.tsx','lib/shares.js']],
];
const missing = requirements.filter(([,candidates]) => !hasOne(candidates)).map(([label]) => label);
if (existsSync('package.json')) {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const script of ['build','lint','typecheck','test','test:e2e']) {
      if (!pkg.scripts?.[script]) missing.push('package script: '+script);
    }
    if (!pkg.dependencies?.next && !pkg.devDependencies?.next) missing.push('Next.js dependency');
  } catch {
    missing.push('valid package.json JSON');
  }
}
if (missing.length) {
  console.error('SOURCE_INCOMPLETE: refusing production build. Missing:\n - '+missing.join('\n - '));
  console.error('Restore the full, verified original application; see docs/GITHUB-NETLIFY-GECIS.md.');
  process.exit(1);
}
console.log('SOURCE_GATE_OK: mandatory source inventory present; build/tests still required.');
