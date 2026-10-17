#!/usr/bin/env node
// Safety gate: a documentation-only repository must NEVER masquerade as a deployable app.
import { existsSync, readFileSync } from "node:fs";

const oneOf = (paths) => paths.some(existsSync);
const required = [
  ["package.json", ["package.json"]],
  ["dependency lockfile", ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"]],
  ["Next.js route entry", ["app/page.tsx", "app/page.jsx", "src/app/page.tsx", "src/app/page.jsx", "pages/index.tsx", "pages/index.jsx", "src/pages/index.tsx", "src/pages/index.jsx"]],
];
const missing = required.filter(([, paths]) => !oneOf(paths)).map(([name]) => name);
if (existsSync("package.json")) {
  try {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    if (!pkg.scripts?.build) missing.push("package.json scripts.build");
    if (!pkg.dependencies?.next && !pkg.devDependencies?.next) missing.push("Next.js dependency");
  } catch {
    missing.push("valid package.json JSON");
  }
}
if (missing.length) {
  console.error("SOURCE_INCOMPLETE: production build blocked. Missing: " + missing.join(", "));
  console.error("Restore full original Next.js sources first; see docs/GITHUB-NETLIFY-GECIS.md.");
  process.exitCode = 1;
} else {
  console.log("Source readiness: core files present. This is NOT a successful build or E2E proof.");
}
