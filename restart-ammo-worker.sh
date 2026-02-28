#!/bin/bash
set -e

cd ~/ammo-exchange

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22

git pull origin main
pnpm install
pnpm db:generate
pnpm --filter @ammo-exchange/worker build
pm2 restart ammo-worker
