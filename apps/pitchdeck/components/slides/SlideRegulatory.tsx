import { RESTRICTED_STATES } from "@ammo-exchange/shared";
import { SlideLayout } from "../SlideLayout";

const POINTS = [
  {
    title: "No FFL required for token trading",
    detail:
      "Ammo tokens are digital assets, not ammunition. Trading tokens does not require a Federal Firearms License.",
  },
  {
    title: "KYC at redemption only",
    detail:
      "Identity verification is required only when converting tokens to physical ammunition. Token-to-token trading is permissionless.",
  },
  {
    title: "Restricted states enforced on-chain",
    detail: `Physical delivery is blocked in restricted jurisdictions: ${RESTRICTED_STATES.join(", ")}. Token trading remains global.`,
  },
  {
    title: "Utility token classification",
    detail:
      "Ammo tokens provide commodity access (1 token = 1 round). They are utility tokens for physical goods, not securities.",
  },
];

export function SlideRegulatory() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">
        Regulatory Positioning
      </h2>
      <p className="mb-10 text-lg text-text-muted">
        Designed for compliance -- tokens are not ammunition
      </p>

      <div className="grid flex-1 grid-cols-2 gap-6">
        {POINTS.map((point) => (
          <div
            key={point.title}
            className="flex gap-4 rounded-xl border border-surface-elevated bg-surface p-6"
          >
            <span className="mt-1 shrink-0 text-2xl text-green">&#10003;</span>
            <div>
              <h3 className="text-lg font-semibold text-text">{point.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-text-secondary">
                {point.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-surface-elevated bg-surface px-6 py-4 text-center">
        <p className="text-sm text-text-muted">
          Legal review pending &middot; Regulatory framework designed with ATF
          and SEC guidance in mind
        </p>
      </div>
    </SlideLayout>
  );
}
