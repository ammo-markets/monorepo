interface CaliberIconProps {
  size?: number;
  className?: string;
}

/** 9MM — compact pistol cartridge, warm copper accent */
export function Icon9MM({ size = 24, className }: CaliberIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Short, wide pistol casing */}
      <rect
        x="8"
        y="3"
        width="8"
        height="5"
        rx="1.5"
        fill="#D4956A"
        opacity="0.2"
      />
      <rect
        x="7"
        y="8"
        width="10"
        height="13"
        rx="1.5"
        fill="#D4956A"
        opacity="0.15"
      />
      <rect
        x="8"
        y="3"
        width="8"
        height="5"
        rx="1.5"
        stroke="#D4956A"
        strokeWidth="1.2"
      />
      <rect
        x="7"
        y="8"
        width="10"
        height="13"
        rx="1.5"
        stroke="#D4956A"
        strokeWidth="1.2"
      />
      {/* Primer */}
      <circle cx="12" cy="18" r="2" stroke="#D4956A" strokeWidth="1" />
    </svg>
  );
}

/** 556 — longer rifle cartridge, olive/military green */
export function Icon556({ size = 24, className }: CaliberIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Narrow pointed bullet tip */}
      <path
        d="M12 2L10 7H14L12 2Z"
        fill="#6B8E4E"
        opacity="0.2"
        stroke="#6B8E4E"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Neck */}
      <rect
        x="10"
        y="7"
        width="4"
        height="3"
        fill="#6B8E4E"
        opacity="0.1"
        stroke="#6B8E4E"
        strokeWidth="1.2"
      />
      {/* Casing body */}
      <rect
        x="8"
        y="10"
        width="8"
        height="11"
        rx="1"
        fill="#6B8E4E"
        opacity="0.15"
        stroke="#6B8E4E"
        strokeWidth="1.2"
      />
      {/* Primer */}
      <circle cx="12" cy="18" r="1.8" stroke="#6B8E4E" strokeWidth="1" />
    </svg>
  );
}

/** 22LR — small rimfire cartridge, steel blue */
export function Icon22LR({ size = 24, className }: CaliberIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Small bullet tip */}
      <path
        d="M12 5L10.5 9H13.5L12 5Z"
        fill="#5B8FAD"
        opacity="0.2"
        stroke="#5B8FAD"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Small straight casing (rimfire — no separate primer) */}
      <rect
        x="9.5"
        y="9"
        width="5"
        height="11"
        rx="1"
        fill="#5B8FAD"
        opacity="0.15"
        stroke="#5B8FAD"
        strokeWidth="1.2"
      />
      {/* Rimfire base — wider than body */}
      <rect
        x="8.5"
        y="19"
        width="7"
        height="1.5"
        rx="0.5"
        fill="#5B8FAD"
        opacity="0.2"
        stroke="#5B8FAD"
        strokeWidth="1"
      />
    </svg>
  );
}

/** 308 — thick rifle cartridge, deep bronze */
export function Icon308({ size = 24, className }: CaliberIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Pointed bullet tip */}
      <path
        d="M12 1.5L9.5 7H14.5L12 1.5Z"
        fill="#A67C52"
        opacity="0.2"
        stroke="#A67C52"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Neck */}
      <rect
        x="9.5"
        y="7"
        width="5"
        height="3"
        fill="#A67C52"
        opacity="0.1"
        stroke="#A67C52"
        strokeWidth="1.2"
      />
      {/* Wide casing body */}
      <rect
        x="7"
        y="10"
        width="10"
        height="11"
        rx="1.5"
        fill="#A67C52"
        opacity="0.15"
        stroke="#A67C52"
        strokeWidth="1.2"
      />
      {/* Primer */}
      <circle cx="12" cy="18" r="2.2" stroke="#A67C52" strokeWidth="1" />
    </svg>
  );
}

export const caliberIcons: Record<import("@ammo-exchange/shared").Caliber, React.FC<CaliberIconProps>> = {
  "9MM_PRACTICE": Icon9MM,
  "9MM_SELF_DEFENSE": Icon9MM,
  "556_SELF_DEFENSE": Icon556,
  "556_NATO_PRACTICE": Icon556,
};
