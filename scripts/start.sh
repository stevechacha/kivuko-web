#!/usr/bin/env sh
set -e

if [ ! -f dist/index.html ]; then
  echo "Building web app..."
  npm run build
fi

exec node server.js
