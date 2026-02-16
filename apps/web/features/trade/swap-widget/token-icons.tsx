import type { TokenId } from "./swap-types";
import { caliberIcons } from "@/features/shared/caliber-icons";

/* ── Small SVG icons ── */

export function UsdcIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke="#2775CA"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="12" cy="12" r="11" fill="#2775CA" opacity="0.1" />
      <path
        d="M12 5.5V7M12 17v1.5"
        stroke="#2775CA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.5 15.5c0 1.1 1.12 2 2.5 2s2.5-.9 2.5-2-1.12-2-2.5-2-2.5-.9-2.5-2 1.12-2 2.5-2 2.5.9 2.5 2"
        stroke="#2775CA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UniswapLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="#FF007A"
        opacity="0.15"
        stroke="#FF007A"
        strokeWidth="1"
      />
      <path
        d="M8 9.5C8 8 10 7 12 7s4 1 4 2.5c0 2-2.5 2.5-2.5 4.5h-3C10.5 12 8 11.5 8 9.5z"
        fill="#FF007A"
        opacity="0.5"
      />
      <circle cx="12" cy="16.5" r="1" fill="#FF007A" />
    </svg>
  );
}

export function AaveLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="#B6509E"
        opacity="0.15"
        stroke="#B6509E"
        strokeWidth="1"
      />
      <path
        d="M12 6L7 18h3l1.5-4h5L18 18h3L12 6z"
        fill="#B6509E"
        opacity="0.6"
      />
      <path d="M10.8 13L12 9.5 13.2 13h-2.4z" fill="#B6509E" opacity="0.3" />
    </svg>
  );
}

export function TokenIcon({
  tokenId,
  size = 20,
}: {
  tokenId: TokenId;
  size?: number;
}) {
  if (tokenId === "USDC") return <UsdcIcon size={size} />;
  const Icon = caliberIcons[tokenId];
  return Icon ? <Icon size={size} /> : null;
}
