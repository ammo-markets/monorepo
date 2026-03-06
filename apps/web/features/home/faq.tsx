"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-12 text-center lg:mb-16">
      <h2
        className="text-xs font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </h2>
      <div
        className="mx-auto mt-3 h-px w-12"
        style={{ backgroundColor: "var(--brass)" }}
        aria-hidden="true"
      />
    </div>
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What is Ammo Exchange?",
    answer:
      "Ammo Exchange is a DeFi protocol on Avalanche that lets you tokenize physical ammunition. Deposit USDT to mint ERC-20 tokens backed 1:1 by factory-new rounds stored in insured, ATF-compliant facilities.",
  },
  {
    question: "How are ammo tokens backed?",
    answer:
      "Each token represents one physical round stored in a climate-controlled, insured warehouse. Token supply is verifiable on-chain, and reserves are audited by third parties.",
  },
  {
    question: "Who can mint and trade?",
    answer:
      "Anyone with USDT and an Avalanche wallet can mint tokens. No KYC is required for minting or trading on decentralized exchanges. International users can hold and trade tokens freely.",
  },
  {
    question: "Who can redeem for physical ammo?",
    answer:
      "Only verified U.S. residents in eligible states. KYC and age verification are required — 18+ for rifle ammo, 21+ for handgun ammo. Restricted states: CA, NY, IL, DC, and NJ.",
  },
  {
    question: "What are the fees?",
    answer:
      "1.5% on minting and 1.5% on redemption. Shipping costs are passed through at cost. No storage fees — ever.",
  },
  {
    question: "What calibers are supported?",
    answer:
      "9mm Practice (115gr FMJ), 9mm Self Defense (124gr JHP), 5.56 NATO Practice (55gr FMJ), and 5.56 Self Defense (62gr). All factory-new from reputable manufacturers.",
  },
  {
    question: "Is there a minimum order?",
    answer:
      "Yes — 50 rounds per caliber for minting. There is no minimum for trading tokens on secondary markets.",
  },
  {
    question: "How does shipping work?",
    answer:
      "Physical ammo ships via UPS Ground to the 48 contiguous U.S. states. No international shipments. Shipping costs are at-cost plus handling, charged at redemption.",
  },
  {
    question: "Is this on mainnet?",
    answer:
      "Ammo Exchange is currently live on Avalanche Fuji testnet. Mainnet deployment is planned after full protocol validation and audit.",
  },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid var(--border-default)" }}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {item.question}
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && (
        <div
          className="pb-5 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {item.answer}
        </div>
      )}
    </div>
  );
}

export function Faq() {
  return (
    <section
      id="faq"
      className="px-4 py-24 lg:py-32"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="mx-auto max-w-3xl">
        <SectionTitle>Frequently Asked Questions</SectionTitle>

        <div>
          {faqItems.map((item) => (
            <FaqAccordionItem key={item.question} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
