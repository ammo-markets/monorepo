import { CALIBER_SPECS } from "@ammo-exchange/shared";
import { SlideLayout } from "../SlideLayout";

const caliberCount = Object.keys(CALIBER_SPECS).length;

export function SlideCover() {
  return (
    <SlideLayout className="items-center justify-center text-center">
      <h1 className="mb-6 text-8xl font-bold tracking-tight text-brass">
        Ammo Exchange
      </h1>
      <p className="mb-4 text-3xl font-light text-text">
        Make Your Ammo Liquid
      </p>
      <p className="mb-8 text-xl text-text-secondary">
        Tokenized ammunition trading on Avalanche
      </p>
      <p className="mb-10 text-lg text-text-muted">
        The first DeFi protocol for ammunition price exposure
      </p>
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <span className="rounded-full bg-surface-elevated px-4 py-1.5">
          {caliberCount} calibers
        </span>
        <span className="rounded-full bg-surface-elevated px-4 py-1.5">
          DeFi protocol
        </span>
        <span className="rounded-full bg-surface-elevated px-4 py-1.5">
          Avalanche C-Chain
        </span>
      </div>
    </SlideLayout>
  );
}
