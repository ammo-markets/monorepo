import { SlideLayout } from "../SlideLayout";

export function SlideClose() {
  return (
    <SlideLayout className="items-center justify-center text-center">
      <h1 className="mb-6 text-7xl font-bold tracking-tight text-brass">
        Make Your Ammo Liquid
      </h1>
      <p className="mb-4 text-2xl font-light text-text">
        The first DeFi protocol for ammunition price exposure
      </p>
      <p className="mb-10 text-lg text-text-muted">
        Global price exposure &middot; Tokenized trading &middot; Optional physical
        delivery
      </p>
      <div className="rounded-lg bg-surface-elevated px-8 py-4">
        <p className="text-text-muted">
          <span className="font-semibold text-brass">hello@ammo.exchange</span>
        </p>
      </div>
    </SlideLayout>
  );
}
