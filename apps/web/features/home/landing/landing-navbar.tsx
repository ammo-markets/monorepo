import Link from "next/link";
import { APP_LAUNCH_HREF, DOCS_URL } from "./landing-content";

export function LandingNavbar() {
  return (
    <nav>
      <ul className="nav-links">
        <li>
          <a href="#how">How It Works</a>
        </li>
        <li>
          <a href="#tokens">Tokens</a>
        </li>
        <li>
          <a href="#faq">FAQ</a>
        </li>
        <li>
          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            Docs
          </a>
        </li>
        <li>
          <Link href={APP_LAUNCH_HREF} className="btn-launch">
            Launch App
          </Link>
        </li>
      </ul>
    </nav>
  );
}
