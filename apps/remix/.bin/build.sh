#!/usr/bin/env bash

# Exit on error.
set -e

SCRIPT_DIR="$(readlink -f "$(dirname "$0")")"
WEB_APP_DIR="$SCRIPT_DIR/.."

# Store the original directory
ORIGINAL_DIR=$(pwd)

# Set up trap to ensure we return to original directory
trap 'cd "$ORIGINAL_DIR"' EXIT

cd "$WEB_APP_DIR"

start_time=$(date +%s)

echo "[Build]: Extracting and compiling translations"
cd ../../ && yarn translate && cd "$WEB_APP_DIR"

echo "[Build]: Building app"
yarn build:app

# Copy over all web.js translations into the server build
if [ -d "build/server" ]; then
  mkdir -p build/server/packages/lib/translations
  cp -r ../../packages/lib/translations/. build/server/packages/lib/translations/
fi

# Time taken
end_time=$(date +%s)

echo "[Build]: Done in $((end_time - start_time)) seconds"
