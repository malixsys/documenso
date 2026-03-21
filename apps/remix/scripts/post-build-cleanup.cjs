/**
 * Post-build cleanup for Vercel serverless function size.
 *
 * Removes large native binaries and unused heavy packages AFTER the
 * vite build completes, but BEFORE Vercel's NFT traces dependencies.
 * Only deletes binary/data files — keeps package.json and type
 * declarations so cached builds can still typecheck.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');

// Glob-like removal of files matching patterns within a directory
function removeByPattern(dir, pattern) {
  if (!fs.existsSync(dir)) return;
  let removed = 0;

  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (pattern.test(entry.name)) {
        fs.unlinkSync(full);
        removed++;
      }
    }
  }

  walk(dir);
  if (removed > 0) console.log(`Removed ${removed} files from ${path.relative(root, dir)} matching ${pattern}`);
}

// Remove all .node binary files from heavy native packages
const nativePackageDirs = [
  'node_modules/@napi-rs/canvas',
  'node_modules/playwright',
  'node_modules/playwright-core',
  'node_modules/@playwright',
  'node_modules/@libsql',
];

for (const rel of nativePackageDirs) {
  const dir = path.join(root, rel);
  removeByPattern(dir, /\.(node|exe|dll|so|dylib)$/);
}

// Remove entire chromium browser downloads (playwright)
const playwrightBrowsers = path.join(root, 'node_modules', 'playwright-core', '.local-browsers');
if (fs.existsSync(playwrightBrowsers)) {
  fs.rmSync(playwrightBrowsers, { recursive: true, force: true });
  console.log('Removed playwright browsers');
}


console.log('Post-build cleanup complete');
