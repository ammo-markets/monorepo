import type { Metadata } from "next";
import { Suspense } from "react";
import { RedeemFlow } from "@/features/redeem";

export const metadata: Metadata = {
  title: "Redeem Tokens | Ammo Exchange",
  description:
    "Redeem your ammo tokens for physical ammunition delivery. Burn tokens, enter shipping details, and receive real rounds at your door.",
};

function RedeemFlowLoading() {
  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      {/* Progress skeleton */}
      <div className="mb-10 flex items-center justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full shimmer" />
              <div className="h-3 w-14 rounded shimmer" />
            </div>
            {i < 4 && (
              <div className="mx-1.5 h-[2px] flex-1 rounded-full shimmer sm:mx-2" />
            )}
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="h-6 w-52 rounded shimmer mb-2" />
      <div className="h-4 w-72 rounded shimmer mb-6" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl shimmer" />
        ))}
      </div>
    </div>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<RedeemFlowLoading />}>
      <RedeemFlow />
    </Suspense>
  );
}
