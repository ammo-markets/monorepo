import { CALIBER_SPECS } from "@ammo-exchange/shared";
import { SlideLayout } from "../SlideLayout";

const calibers = Object.values(CALIBER_SPECS);

export function SlideHowItWorks() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">How It Works</h2>
      <p className="mb-8 text-lg text-text-muted">
        Two-step async flow with admin finalization
      </p>

      <div className="mb-8 grid grid-cols-2 gap-8">
        {/* Mint flow */}
        <div className="rounded-xl border border-surface-elevated bg-surface p-6">
          <h3 className="mb-4 text-xl font-semibold text-brass">Mint Flow</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass text-sm font-bold text-background">
                1
              </span>
              <p className="text-text-secondary">
                User deposits USDC and requests a caliber token
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass text-sm font-bold text-background">
                2
              </span>
              <p className="text-text-secondary">
                Admin verifies, procures physical ammo, finalizes mint
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass text-sm font-bold text-background">
                3
              </span>
              <p className="text-text-secondary">
                ERC-20 tokens minted to user wallet
              </p>
            </div>
          </div>
        </div>

        {/* Redeem flow */}
        <div className="rounded-xl border border-surface-elevated bg-surface p-6">
          <h3 className="mb-4 text-xl font-semibold text-brass">
            Redeem Flow
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass text-sm font-bold text-background">
                1
              </span>
              <p className="text-text-secondary">
                Verified US user burns tokens and requests physical delivery
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass text-sm font-bold text-background">
                2
              </span>
              <p className="text-text-secondary">
                Admin ships ammunition from warehouse to user
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass text-sm font-bold text-background">
                3
              </span>
              <p className="text-text-secondary">
                Transaction finalized, USDC returned minus fees
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Caliber tokens */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-text">
          Per-Caliber Tokens
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {calibers.map((spec) => (
            <div
              key={spec.caliber}
              className="rounded-lg border border-surface-elevated bg-surface p-4 text-center"
            >
              <p className="text-lg font-bold text-brass">{spec.name}</p>
              <p className="mt-1 text-sm text-text-muted">
                {spec.description}
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                Min: {spec.minMintRounds} rounds
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-text-muted">
          1 token = 1 round &middot; 18 decimals &middot; ERC-20 standard
        </p>
      </div>
    </SlideLayout>
  );
}
