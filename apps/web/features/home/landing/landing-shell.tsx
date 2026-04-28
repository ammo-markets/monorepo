"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { LandingNavbar } from "./landing-navbar";
import { LandingTicker } from "./landing-ticker";

export function LandingShell({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rootEl = root;

    function positionTicker() {
      const nav = rootEl.querySelector("nav");
      const ticker = rootEl.querySelector(".ticker-wrap");
      const hero = rootEl.querySelector(".hero");
      if (!nav || !ticker) return;

      const navH = nav.getBoundingClientRect().height;
      (ticker as HTMLElement).style.top = `${navH}px`;
      const tickerH = ticker.getBoundingClientRect().height;
      const padTop = navH + tickerH + 60;
      rootEl.style.setProperty("--landing-nav-h", `${navH}px`);
      rootEl.style.setProperty("--landing-ticker-top", `${navH}px`);
      rootEl.style.setProperty("--landing-hero-pad-top", `${padTop}px`);
      if (hero) {
        (hero as HTMLElement).style.paddingTop = `${padTop}px`;
      }
    }

    positionTicker();
    window.addEventListener("resize", positionTicker);
    return () => window.removeEventListener("resize", positionTicker);
  }, []);

  return (
    <div ref={rootRef} className="landing-page">
      <LandingNavbar />
      <LandingTicker />
      {children}
    </div>
  );
}
