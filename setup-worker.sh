#!/bin/bash
# One-time setup for the Ammo Exchange worker on a fresh DigitalOcean droplet.
# Prerequisites: Node 22 (via nvm), pnpm, git clone of the repo.
#
# Usage: bash setup-worker.sh
set -e

echo "==> Installing system dependencies (Xvfb + Playwright deps)..."
apt-get update
apt-get install -y xvfb

echo "==> Loading nvm..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22

cd ~/ammo-exchange

echo "==> Installing node dependencies..."
pnpm install

echo "==> Installing Playwright Chromium with system deps..."
cd apps/worker
npx playwright install --with-deps chromium
cd ~/ammo-exchange

echo "==> Building worker (includes db:generate + db:build via Turbo)..."
pnpm --filter @ammo-exchange/worker build

echo "==> Running database migrations..."
pnpm --filter @ammo-exchange/db exec prisma migrate deploy

echo "==> Setting up PM2..."
pm2 delete ammo-worker 2>/dev/null || true
pm2 start "xvfb-run --auto-servernum pnpm --filter @ammo-exchange/worker start" \
  --name ammo-worker \
  --cwd ~/ammo-exchange
pm2 save

echo "==> Done! Worker is running. Check logs with: pm2 logs ammo-worker"
