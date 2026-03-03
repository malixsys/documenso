#!/usr/bin/env bash
set -e

echo "=== VERCEL BUILD START ==="
echo "Node version: $(node --version)"

echo "=== Running turbo build ==="
turbo run build --filter=@documenso/remix --output-logs=errors-only

echo "=== Build artifacts ==="
ls -la api/
ls -la apps/remix/build/server/vercel.js
du -sh apps/remix/build/server/

echo "=== Copying static files ==="
mkdir -p public
cp -r apps/remix/build/client/. public/

echo "=== VERCEL BUILD COMPLETE ==="
