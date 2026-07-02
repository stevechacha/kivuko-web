#!/usr/bin/env sh
set -e
PORT="${PORT:-3000}"
exec npx serve dist -s -l "tcp://0.0.0.0:${PORT}"
