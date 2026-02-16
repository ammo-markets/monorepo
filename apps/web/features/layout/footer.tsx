"use client";

import { AmmoLogo } from "./logo";

const productLinks = [
  { label: "Launch App", href: "/dashboard" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

const resourceLinks = [
  { label: "Whitepaper", href: "#" },
  { label: "Docs", href: "#" },
  { label: "GitHub", href: "#" },
];

const socialLinks = [{ label: "X / Twitter", href: "#" }];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4
        className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </h4>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      className="px-4 py-12 lg:py-16"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderTop: "1px solid var(--border-default)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Top section */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          {/* Logo + copyright */}
          <div className="flex flex-col gap-4">
            <AmmoLogo size="small" />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              &copy; 2026 Ammo Exchange
            </span>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-8 sm:gap-16">
            <FooterColumn title="Product" links={productLinks} />
            <FooterColumn title="Resources" links={resourceLinks} />
            <FooterColumn title="Social" links={socialLinks} />
          </div>
        </div>

        {/* Legal disclaimer */}
        <div
          className="mt-12 border-t pt-6"
          style={{ borderColor: "var(--border-default)" }}
        >
          <p
            className="max-w-3xl text-[11px] leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Not financial advice. Tokens represent claims on physical ammunition
            stored by licensed third parties. Redemption restricted to eligible
            U.S. states. Must be 18+ for rifle ammo, 21+ for handgun ammo. Ammo
            Exchange does not sell firearms. All tokenized ammunition is stored
            in ATF-compliant, insured facilities. Trading involves risk of loss.
          </p>
        </div>
      </div>
    </footer>
  );
}
