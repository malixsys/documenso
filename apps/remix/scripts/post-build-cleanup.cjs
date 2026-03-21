/**
 * Post-build cleanup for Vercel serverless function size.
 *
 * Removes large native binaries and unused heavy packages AFTER the
 * vite build completes, but BEFORE Vercel's NFT traces dependencies.
 * Keeps package.json/type declarations so cached builds can typecheck.
 * Keeps linux-x64 binaries that Vercel actually needs at runtime.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');

function rmDir(rel) {
  const dir = path.join(root, rel);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log('Removed ' + rel);
  }
}

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
  if (removed > 0) console.log('Removed ' + removed + ' files from ' + path.relative(root, dir));
}

// Remove native binaries from packages not needed at runtime on Vercel
removeByPattern(path.join(root, 'node_modules/@napi-rs/canvas'), /\.(node|exe|dll|so|dylib)$/);
removeByPattern(path.join(root, 'node_modules/playwright'), /\.(node|exe|dll|so|dylib)$/);
removeByPattern(path.join(root, 'node_modules/playwright-core'), /\.(node|exe|dll|so|dylib)$/);
removeByPattern(path.join(root, 'node_modules/@playwright'), /\.(node|exe|dll|so|dylib)$/);
removeByPattern(path.join(root, 'node_modules/@libsql'), /\.(node|exe|dll|so|dylib)$/);

// Remove non-linux sharp platform packages (Vercel runs linux-x64)
// Keep @img/sharp-linux-x64 and @img/sharp-libvips-linux-x64
const imgDir = path.join(root, 'node_modules/@img');
if (fs.existsSync(imgDir)) {
  for (const entry of fs.readdirSync(imgDir, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.includes('linux-x64')) {
      const full = path.join(imgDir, entry.name);
      fs.rmSync(full, { recursive: true, force: true });
      console.log('Removed @img/' + entry.name);
    }
  }
}

// Remove inngest (not used on Vercel)
rmDir('node_modules/inngest');

// Remove playwright browser downloads
rmDir('node_modules/playwright-core/.local-browsers');

console.log('Post-build cleanup complete');
