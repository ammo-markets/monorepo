import Link from "next/link";
import {
  APP_LAUNCH_HREF,
  DOCS_URL,
  GITHUB_URL,
  X_URL,
} from "./landing-content";

const productLinks = [
  { label: "Launch App", href: APP_LAUNCH_HREF },
  { label: "How It Works", href: "#how" },
  { label: "Tokens", href: "#tokens" },
  { label: "FAQ", href: "#faq" },
];

const resourceLinks = [
  { label: "Docs", href: DOCS_URL, external: true },
  { label: "GitHub", href: GITHUB_URL, external: true },
];

const socialLinks = [{ label: "X / Twitter", href: X_URL }];

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">Ammo Markets</div>
          <p className="footer-tagline">
            Tokenized ammunition on the blockchain. Buy, trade, and redeem
            physical rounds with the security of DeFi.
          </p>
        </div>
        <div>
          <div className="footer-col-head">Product</div>
          <ul className="footer-links">
            {productLinks.map((l) => (
              <li key={l.label}>
                {l.href.startsWith("#") ? (
                  <a href={l.href}>{l.label}</a>
                ) : (
                  <Link href={l.href}>{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="footer-col-head">Resources</div>
          <ul className="footer-links">
            {resourceLinks.map((l) => (
              <li key={l.label}>
                {l.href === "#" ? (
                  <a href={l.href}>{l.label}</a>
                ) : l.external ? (
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ) : (
                  <Link href={l.href}>{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="footer-col-head">Social</div>
          <ul className="footer-links">
            {socialLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-legal">
          Not financial advice. Trading involves risk of loss. U.S. addresses
          only for physical redemption. Ammo Markets does not sell firearms.
        </p>
        <div className="footer-copy">© 2026 AmmoMarkets</div>
      </div>
    </footer>
  );
}
