#!/bin/bash
set -e

cd ~/ammo-exchange

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22

git pull origin main
pnpm install
pnpm --filter @ammo-exchange/worker build

# Restart with xvfb-run for Playwright (headless: false needs a virtual display)
pm2 delete ammo-worker 2>/dev/null || true
pm2 start "xvfb-run --auto-servernum pnpm --filter @ammo-exchange/worker start" \
  --name ammo-worker \
  --cwd ~/ammo-exchange
pm2 save
