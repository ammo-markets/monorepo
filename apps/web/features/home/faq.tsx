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
      "Ammo Exchange is a DeFi protocol for tokenized ammunition on Avalanche. Deposit USDC, receive ERC20 tokens backed 1:1 by physical rounds stored in insured, ATF-compliant facilities.",
  },
  {
    question: "How are ammo tokens backed?",
    answer:
      "Each token represents 1 round of ammunition stored in ATF-compliant, insured facilities managed by Ammo Squared. Tokens are standard ERC20 on Avalanche, freely transferable and tradeable.",
  },
  {
    question: "Who can mint and trade?",
    answer:
      "Anyone with USDC and an Avalanche wallet can mint and trade ammo tokens. No KYC is required for minting or trading on decentralized exchanges.",
  },
  {
    question: "Who can redeem for physical ammo?",
    answer:
      "Only verified U.S. residents in allowed states can redeem tokens for physical ammunition. KYC verification is required. You must be 18+ for rifle ammo and 21+ for handgun ammo. Some states are restricted (CA, NY, IL, DC, NJ).",
  },
  {
    question: "What are the fees?",
    answer:
      "1.5% on minting and 1.5% on redemption. There are no protocol fees for trading tokens on decentralized exchanges.",
  },
  {
    question: "What calibers are supported?",
    answer:
      "9mm Luger (115gr FMJ), 5.56 NATO (55gr FMJ), .22 LR (40gr), and .308 Winchester (147gr FMJ). All factory-new ammunition from reputable manufacturers.",
  },
  {
    question: "How does the 2-step settlement work?",
    answer:
      "You initiate a mint or redeem order on-chain. The protocol admin verifies and finalizes the order. For mints, ammunition is purchased and stored. For redemptions, ammunition is shipped to your door via UPS Ground.",
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
