import { CALIBER_SPECS } from "@ammo-exchange/shared";

const caliberCount = Object.keys(CALIBER_SPECS).length;

export function SlideCover() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-12">
      <h1 className="mb-6 text-7xl font-bold text-brass">Ammo Exchange</h1>
      <p className="mb-4 text-2xl text-text-secondary">
        Make your ammo liquid
      </p>
      <p className="mb-8 text-lg text-text-muted">
        Tokenized ammunition trading on Avalanche
      </p>
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <span className="rounded-full bg-surface-elevated px-4 py-1">
          {caliberCount} calibers
        </span>
        <span className="rounded-full bg-surface-elevated px-4 py-1">
          DeFi protocol
        </span>
        <span className="rounded-full bg-surface-elevated px-4 py-1">
          Avalanche C-Chain
        </span>
      </div>
    </div>
  );
}
