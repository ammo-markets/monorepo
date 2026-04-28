"use client";

import { useCallback, useState } from "react";
import { getLandingFaqItems } from "./landing-content";
import { RevealSection } from "./reveal-section";

export function LandingFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqItems = getLandingFaqItems();

  const toggle = useCallback((i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  }, []);

  return (
    <RevealSection className="faq-section" id="faq">
      <h2 className="section-title" style={{ textAlign: "center" }}>
        FAQ
      </h2>
      <div className="faq-list">
        {faqItems.map((f, i) => {
          const open = openIndex === i;
          return (
            <div key={f.question} className="faq-item">
              <button
                type="button"
                className="faq-q"
                onClick={() => toggle(i)}
                aria-expanded={open}
              >
                {f.question}
                <span className={`faq-plus${open ? " open" : ""}`.trim()}>
                  +
                </span>
              </button>
              <div className={`faq-a${open ? " open" : ""}`.trim()}>{f.answer}</div>
            </div>
          );
        })}
      </div>
    </RevealSection>
  );
}
