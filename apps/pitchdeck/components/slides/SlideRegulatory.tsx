import { RESTRICTED_STATES } from "@ammo-exchange/shared";
import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";

const POINTS = [
  {
    title: "No FFL required for token trading",
    detail:
      "Ammo tokens are digital assets, not ammunition. No Federal Firearms License needed.",
  },
  {
    title: "KYC at redemption only",
    detail:
      "Identity verification required only for physical delivery. Token trading is permissionless.",
  },
  {
    title: "Restricted states enforced on-chain",
    detail:
      "Physical delivery blocked in restricted jurisdictions. Token trading remains global.",
  },
  {
    title: "Utility token classification",
    detail: "1 token = 1 round. Commodity access tokens, not securities.",
  },
];

export function SlideRegulatory() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        Regulatory Positioning
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        Designed for compliance -- tokens are not ammunition
      </p>

      <StaggerContainer
        preset="magazine-load"
        className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
      >
        {POINTS.map((point) => (
          <StaggerItem key={point.title}>
            <div className="card-hover flex gap-4 rounded-none border border-surface-elevated bg-surface p-4 sm:p-6">
              <span className="mt-1 shrink-0 text-2xl text-green">
                &#10003;
              </span>
              <div>
                <h3 className="text-lg font-semibold text-text">
                  {point.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-text-secondary">
                  {point.detail}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <p className="mt-8 text-center text-xs text-text-muted">
        Restricted states: {RESTRICTED_STATES.join(", ")}
      </p>
    </SlideLayout>
  );
}
