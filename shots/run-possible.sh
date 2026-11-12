#!/bin/sh
set -eu
npm ci
npm install --no-save playwright
npx playwright install chromium
npm run build -w @possible/catalog
NEXT_PUBLIC_CONVEX_URL=https://reminiscent-lark-333.convex.cloud NEXT_PUBLIC_CONVEX_SITE_URL=https://reminiscent-lark-333.convex.site npm run build -w @possible/web
python3 -m http.server 8765 --directory apps/web/out > /dev/null 2>&1 &
server_pid=$!
trap 'kill "$server_pid"' EXIT
node shots/shoot.mjs
