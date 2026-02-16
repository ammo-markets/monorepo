import type { Metadata } from "next";
import { Suspense } from "react";
import { MintFlow } from "@/features/mint";

export const metadata: Metadata = {
  title: "Mint Tokens | Ammo Exchange",
  description:
    "Mint tokenized ammunition with USDC. Select your caliber, enter an amount, and receive warehouse-backed ammo tokens.",
};

function MintFlowLoading() {
  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      {/* Progress skeleton */}
      <div className="mb-10 flex items-center justify-between">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full shimmer" />
              <div className="h-3 w-16 rounded shimmer" />
            </div>
            {i < 3 && (
              <div className="mx-2 h-[2px] flex-1 rounded-full shimmer" />
            )}
          </div>
        ))}
      </div>
      {/* Cards skeleton */}
      <div className="h-6 w-48 rounded shimmer mb-6" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl shimmer" />
        ))}
      </div>
    </div>
  );
}

export default function MintPage() {
  return (
    <Suspense fallback={<MintFlowLoading />}>
      <MintFlow />
    </Suspense>
  );
}
