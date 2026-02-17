# Feature Landscape: Ammo Exchange Pitch Deck

**Domain:** Investor/Partner pitch deck for a DeFi + RWA tokenization protocol (ammunition)
**Researched:** 2026-02-17
**Context:** Standalone pitch deck app added to existing Ammo Exchange monorepo. The core protocol (smart contracts, dashboard, admin, event indexer, landing page, SIWE auth) already exists. This milestone focuses exclusively on the pitch deck as a web-based presentation.

---

## 1. Table Stakes (Must Have or Deck Feels Incomplete)

Features investors and partners expect in any serious DeFi/RWA protocol pitch deck. Missing any of these signals the team is not fundraise-ready.

### 1.1 Cover Slide with Protocol Identity

**What:** Protocol name, tagline ("Make Your Ammo Liquid"), logo, and one-line value proposition. Sets the visual tone immediately.
**Why Expected:** First 10 seconds determine whether an investor keeps reading. Every funded crypto startup deck opens with a clear identity slide. Investors review hundreds of decks; yours needs instant recognition.
**Complexity:** Low
**Dependencies:** Existing brand assets (logo, color palette from landing page)
**Notes:** Tagline should be non-technical. "Tokenized ammunition trading on Avalanche" is worse than "The first liquid market for ammunition."

### 1.2 Problem Slide

**What:** 3-4 bullet points establishing that ammunition is a ~$8B annual market with no liquid secondary exchange, no financial instrument for price exposure, and high friction in buying/selling. Include the price volatility data (9mm went from $0.20/rd to $0.80/rd during 2020-2021).
**Why Expected:** Investors need to understand the gap before they care about the solution. This is the most important slide -- if the problem does not resonate, nothing else matters. DeFi investors are specifically trained to look for "what market inefficiency does this solve?"
**Complexity:** Low
**Dependencies:** None. Content is in the whitepaper sections 1.1-1.3.
**Notes:** Lead with dollar amounts and volatility numbers, not blockchain jargon. The comparison table (AmmoSeek, AmmoSquared, forums -- what they do vs. what they lack) is powerful here.

### 1.3 Solution Slide

**What:** "USDC in, tokens out. Tokens tradeable on DEX. Burn tokens, get physical ammo shipped." The mint-trade-redeem loop visualized simply. One diagram, three steps.
**Why Expected:** Must immediately follow the problem. Investors need to understand the mechanism in under 15 seconds. The 1:1 physical backing is the core trust proposition -- it must be front and center.
**Complexity:** Low
**Dependencies:** None. Content is in whitepaper section 2.1.
**Notes:** Do NOT lead with smart contract architecture. Lead with the user flow. The visual should be intuitive enough that a non-crypto person gets it.

### 1.4 Market Opportunity Slide

**What:** TAM/SAM/SOM breakdown. TAM: global ammunition market ($25-30B+ globally, ~$8B U.S.). SAM: U.S. civilian ammunition market accessible via tokenization. SOM: 1% penetration = ~$80M volume. Include the "26.2M first-time gun buyers since 2020" stat and political demand drivers.
**Why Expected:** Every investor deck requires market sizing. For DeFi/RWA, investors specifically want to see the real-world market size (not just "DeFi TVL"). The ammunition market is uniquely compelling because it is large, volatile, and has zero existing financial instruments.
**Complexity:** Low
**Dependencies:** None. Content is in whitepaper section 8.
**Notes:** Use the range from research: estimates vary from $24B to $80B globally depending on scope (military vs. civilian). Be honest about which number you are using and why. Conservative SOM is more credible than inflated TAM.

### 1.5 How It Works / Protocol Mechanics Slide

**What:** Deeper dive into the mint/redeem flow. Show the two-step async pattern (user initiates on-chain, keeper finalizes after physical verification). Explain why this design exists (decouples financial layer from physical logistics). Show per-caliber tokens (9MM, 556, 22LR, 308).
**Why Expected:** DeFi investors need to understand the mechanism well enough to evaluate its soundness. Partner audiences (warehouses, suppliers) need to see where they fit in the chain. This is where you earn technical credibility.
**Complexity:** Low-Medium
**Dependencies:** None. Content is in whitepaper sections 2 and 3.
**Notes:** This can be 1-2 slides. One for the user-facing flow, one for the backend/keeper flow. Keep it visual -- flow diagrams, not paragraphs.

### 1.6 Revenue Model Slide

**What:** Fee structure table (mint fee 1-2%, redeem fee 1-2%, wholesale spread 5-15%, shipping at cost). Revenue projections (conservative: $60K Y1, $240K Y2, $1.2M Y3). Highlight that the real margin is the wholesale spread, not the mint fee.
**Why Expected:** Investors need to see how you make money. "We charge fees" is not enough -- they need to see the unit economics. The wholesale spread story (buy at $0.16/rd, mint at $0.20/rd = 25% gross margin) is unusually compelling for a DeFi protocol because most DeFi revenue models are thin.
**Complexity:** Low
**Dependencies:** None. Content is in whitepaper section 5.
**Notes:** Do NOT inflate projections. Conservative numbers with clear assumptions are more credible than hockey sticks. Show "if X% of market, then Y revenue" sensitivity.

### 1.7 Competitive Landscape Slide

**What:** 2x2 matrix or comparison table showing Ammo Exchange vs. AmmoSeek (price discovery only), AmmoSquared (stored inventory, no liquid market), forums/classifieds (fragmented, no standardization), PAXG/XAUT (commodity tokens but different asset class). Position Ammo Exchange in the "liquid + digital + standardized" quadrant.
**Why Expected:** Investors always ask "who else is doing this?" The answer for ammunition tokenization is essentially "nobody" -- but you need to show you understand the adjacent players and why they are not sufficient.
**Complexity:** Low
**Dependencies:** None. Content is in whitepaper section 1.3 and 11.
**Notes:** The strongest framing is "PAXG for ammunition" -- investors immediately understand the model. Acknowledge PAXG/XAUT as the pattern, then explain why ammunition is a better opportunity (higher volatility, no existing financial instrument, cultural demand drivers).

### 1.8 Team Slide

**What:** Founder(s) and key team members with relevant credentials. Photo, name, role, 1-2 lines of relevant background. Advisors if applicable.
**Why Expected:** 60% of investors say trustworthiness is the top factor. For a protocol that will custody physical assets, the team's credibility is paramount. DeFi investors look for: technical capability (can you build this?), domain knowledge (do you understand ammunition/firearms?), and operational experience (can you run warehouse logistics?).
**Complexity:** Low
**Dependencies:** Team bios and photos.
**Notes:** Do not list every advisory board member without context. Focus on the people who will actually build and operate. If the team lacks firearms/logistics experience, acknowledge it and explain how you plan to fill the gap (advisors, partnerships).

### 1.9 The Ask Slide

**What:** What you are raising, what it will be used for (broken into categories: development, warehouse setup, initial liquidity seeding, legal/compliance, operations), and what milestones the funding unlocks. Clear next steps / call to action.
**Why Expected:** Every investor deck must end with a clear ask. For DeFi protocols, investors also want to know about token allocation (or in this case, the deliberate absence of a governance token and the Primers system). The "no token yet" positioning is actually a differentiator -- it signals discipline.
**Complexity:** Low
**Dependencies:** Fundraising strategy decisions.
**Notes:** Include a timeline: "With $X, we reach [milestone] in [months]." Be specific about how liquidity seeding works (protocol-seeded Uniswap pools).

### 1.10 Regulatory Positioning Slide

**What:** Brief overview of federal ammunition law (no FFL required, online sales legal), state restrictions (CA, NY, IL handled via dealer partnerships), token classification rationale (commodity receipt, not security), and KYC policy (permissionless trading, KYC at redemption only).
**Why Expected:** This is table stakes specifically for RWA + ammunition. Investors WILL ask about regulatory risk. Addressing it proactively signals maturity. The ammunition angle introduces unique regulatory questions that gold/real estate tokenization does not face. Failing to address this is a red flag.
**Complexity:** Low-Medium
**Dependencies:** None. Content is in whitepaper section 7.
**Notes:** Do not oversimplify. "We've retained legal counsel" is more credible than "there are no regulatory issues." Acknowledge the novel nature of the asset class.

---

## 2. Differentiators (Features That Make the Deck Stand Out)

These features separate a forgettable pitch deck from one that investors share internally and discuss. Not every deck has them, but the ones that get funded typically do.

### 2.1 Live Protocol Demo Embed

**What:** An interactive section within the pitch deck that links to or embeds the actual working protocol. "Click here to try minting on Fuji testnet." Show the real UI, not mockups. This is the existing dashboard on Fuji -- wallet connect, mint flow, portfolio view.
**Why Valuable:** Interactive pitch decks get 2.3x more internal sharing (Storydoc data). For a DeFi protocol, showing a working product is the ultimate credibility signal. Most DeFi startups pitch with mockups or Figma prototypes. Showing a deployed, functional testnet app is a massive differentiator.
**Complexity:** Low (the app already exists on Fuji testnet)
**Dependencies:** Existing dashboard deployed and accessible. Fuji testnet faucet for test USDC.
**Notes:** Include a "Try It" button that opens the dashboard in a new tab with testnet instructions. Do NOT try to embed the full dApp inside the deck -- just link to it with context.

### 2.2 Live Data / Proof of Concept Metrics

**What:** Real-time or near-real-time data pulled from on-chain: total tokens minted, current oracle prices, number of transactions processed, TVL in contracts. Even if numbers are small (testnet or early mainnet), showing live data signals the protocol is real and operational.
**Why Valuable:** 2026 pitch deck standards emphasize live, uneditable data over static claims. A slide that says "We've processed 500 test mints on Fuji" with a live counter is infinitely more credible than a slide that says "We plan to process mints." For RWA protocols specifically, showing live proof-of-reserves data (token supply = warehouse inventory) is the trust killer feature.
**Complexity:** Medium. Requires API endpoint to serve on-chain stats, and the pitch deck to fetch and display them.
**Dependencies:** Deployed contracts (Fuji). API route or direct RPC read from the pitch deck app.
**Notes:** Even testnet data is valuable. Frame it as "live on testnet, mainnet launch in [timeline]."

### 2.3 Animated Protocol Flow Visualization

**What:** Step-by-step animated walkthrough of the mint-trade-redeem cycle. User sends USDC (animation), contract emits event (animation), warehouse receives ammo (animation), keeper finalizes (animation), tokens appear in wallet (animation). Not a static diagram -- a sequenced, timed visual narrative.
**Why Valuable:** Complex two-step async flows are hard to explain in static slides. Animation makes the mechanism intuitive. This is particularly important for partner audiences (warehouse operators, suppliers) who are not DeFi-native. It also signals engineering sophistication.
**Complexity:** Medium-High. Requires building animated SVG or motion components (Framer Motion or CSS animations).
**Dependencies:** None beyond design assets.
**Notes:** Keep it under 30 seconds. Auto-play on slide entry, with manual step-through option. This replaces the static "How It Works" diagram for the web version while the static version remains for PDF export.

### 2.4 Ammunition Price Volatility Interactive Chart

**What:** Interactive chart showing historical 9mm ammunition prices (2019-2025) with annotations for key events: COVID-19 panic buying, 2020 election, January 6th, supply chain recovery. Overlay with "if you could have traded this" narrative showing theoretical P&L from buying at $0.20 and selling at $0.80.
**Why Valuable:** This tells the investment thesis story visually. The 4x price swing in 9mm is the single most compelling data point in the entire pitch. Making it interactive (hover for prices, click events for context) transforms a static chart into a narrative device. No other pitch deck in the RWA space can show this kind of volatility in their underlying asset.
**Complexity:** Medium. Lightweight charting library (e.g., Recharts, already in Next.js ecosystem) with historical price data hardcoded or fetched.
**Dependencies:** Historical ammunition price data (available from AmmoSeek/AmmoStats archives).
**Notes:** This is the "wow" slide. It should be visually striking and immediately communicate "this asset moves, and there was no way to trade it until now."

### 2.5 PDF / Static Export Option

**What:** Ability to export the deck as a static PDF for email distribution. Investors often want to forward decks internally, and many VCs still review PDFs. The web version is primary, but PDF availability is expected.
**Why Valuable:** Practical necessity. Some investors will not click a link. Some will want to annotate. Some will forward to partners who prefer PDF. Not having a PDF version is a friction point in the fundraising process.
**Complexity:** Low-Medium. Can be a pre-rendered PDF hosted alongside the web version (does not need dynamic generation).
**Dependencies:** None.
**Notes:** The PDF does not need interactive features. It is the static fallback. Include a prominent "View interactive version at [URL]" on the PDF cover.

### 2.6 Investor-Specific Personalization

**What:** URL parameters or a simple gate that personalizes the deck: "Prepared for [Investor Name / Firm]" on the cover slide. Optional: highlight slides most relevant to the investor's thesis (e.g., for a commodities fund, emphasize the market data; for a crypto fund, emphasize the DeFi mechanics).
**Why Valuable:** Personalized decks signal effort and respect for the investor's time. Dynamic variables (investor name, firm) are a 2025-2026 pitch deck best practice. Even simple personalization ("Prepared for Paradigm") increases engagement.
**Complexity:** Low. URL parameter parsing, conditional rendering on cover slide.
**Dependencies:** None.
**Notes:** Keep it simple. Name on cover + optional section emphasis. Do not over-engineer segmentation.

### 2.7 Deck Analytics / View Tracking

**What:** Track when the deck is opened, how long each slide is viewed, and whether the viewer reached the end. Report this back to the founder. Use simple analytics (no heavy third-party tools -- a lightweight event tracker posting to your own API).
**Why Valuable:** Knowing that an investor spent 3 minutes on your deck vs. 30 seconds is actionable intel. Knowing they spent the most time on the revenue model slide tells you what to emphasize in the follow-up. Professional pitch deck tools (Slidebean, DocSend) all provide this -- building it in shows sophistication.
**Complexity:** Medium. Event tracking on slide transitions, API endpoint to record events, simple dashboard or email notification to founder.
**Dependencies:** API route for event storage. Notification mechanism.
**Notes:** Privacy-conscious implementation. Track slide views and time, not PII. Use the URL parameter from 2.6 to associate views with specific investors.

---

## 3. Anti-Features (Things to Deliberately NOT Build)

### 3.1 DO NOT Build a Full Presentation Editor / CMS

**Why Avoid:** The pitch deck content changes infrequently (quarterly at most). Building a WYSIWYG editor or CMS to edit slides is massive over-engineering. The content lives in code (React components or MDX). Edit the code when content changes.
**What to Do Instead:** Hardcode slide content in well-structured components. Use a clear file-per-slide pattern so content updates are simple code changes.

### 3.2 DO NOT Build Slide Transitions / Presenter Mode / Speaker Notes

**Why Avoid:** This is a web-based pitch deck, not a presentation tool. Investors read it on their own (asynchronously), not in a live presentation setting. Building presenter mode, slide transitions, keyboard navigation, and speaker notes is building a PowerPoint competitor for no reason.
**What to Do Instead:** Simple scroll-based or click-to-advance navigation. If a live presentation is needed, use the actual slides as visual aids while speaking -- no speaker notes needed in the app itself.

### 3.3 DO NOT Embed the Full dApp Inside the Deck

**Why Avoid:** Embedding wallet connection, transaction execution, and full dApp functionality inside the pitch deck creates security concerns, maintenance burden, and UX confusion. The deck is for reading, not transacting.
**What to Do Instead:** Link to the live testnet app with clear CTAs ("Try it on testnet"). Keep the deck and the dApp as separate experiences with a bridge between them.

### 3.4 DO NOT Build Multi-Language Support

**Why Avoid:** The primary audience is English-speaking U.S. and international crypto investors. Translation adds complexity with near-zero ROI at this stage. The protocol itself is U.S.-focused (ammunition shipping is U.S.-only).
**What to Do Instead:** Write excellent English copy. If international partners are a target, translate manually for specific outreach (not in the app).

### 3.5 DO NOT Include Tokenomics / Governance Token Details

**Why Avoid:** The whitepaper explicitly defers governance tokens to post-PMF. Including speculative tokenomics in the pitch deck invites securities classification scrutiny and undermines the disciplined "no token yet" positioning. Investors who see premature tokenomics get nervous, not excited.
**What to Do Instead:** Mention the Primers loyalty program briefly. State that a governance token is a future consideration contingent on PMF. This signals maturity and regulatory awareness.

### 3.6 DO NOT Build Complex Animation / 3D / WebGL Effects

**Why Avoid:** Heavy animations increase load time, break on mobile, and distract from content. Investors spend an average of 3 minutes per deck -- every second of loading or animation is a second not spent reading. The ammunition/DeFi audience values substance over flash.
**What to Do Instead:** Clean, fast-loading design. Subtle CSS transitions. One standout animated element (the protocol flow visualization, 2.3) is enough. Everything else should be crisp static content.

### 3.7 DO NOT Build a Separate Backend for the Pitch Deck

**Why Avoid:** The pitch deck is a static or near-static web app. It does not need its own database, auth system, or API layer. If live data is needed (2.2), read directly from on-chain via RPC or use existing API routes from the main app.
**What to Do Instead:** Build as a static Next.js route or separate lightweight app within the monorepo. Use client-side RPC reads for any live data. Analytics (2.7) can post to a simple serverless function or existing API.

---

## 4. Recommended Slide Order and Content

Based on research into funded DeFi/RWA protocol decks, the following narrative flow optimizes for investor engagement.

### Narrative Arc: Problem-first, then Solution, then Why Us, then Why Now, then Ask

| Slide # | Slide Name | Content Focus | Time Budget |
|---------|-----------|---------------|-------------|
| 1 | **Cover** | Name, tagline, logo. "The first liquid market for ammunition." | 5 sec |
| 2 | **The Problem** | $8B market, no secondary exchange, no financial instrument, high friction. Price volatility chart teaser. | 30 sec |
| 3 | **Price Volatility** | Interactive 9mm price chart 2019-2025. 4x swing. "If you could have traded this..." | 30 sec |
| 4 | **The Solution** | USDC in, tokens out, trade on DEX, redeem for physical. One visual diagram. | 20 sec |
| 5 | **How It Works** | Two-step async flow. Per-caliber tokens. Keeper model. Visual flow animation. | 30 sec |
| 6 | **Market Opportunity** | TAM/SAM/SOM. 26.2M new gun buyers. Political demand drivers. | 20 sec |
| 7 | **Competitive Landscape** | Comparison table. "PAXG for ammunition." No one else does this. | 20 sec |
| 8 | **Revenue Model** | Fee structure. Wholesale spread. Conservative projections. Unit economics. | 20 sec |
| 9 | **Traction / Live Demo** | What is built today (testnet deployment, working app). Link to try it. Protocol stats if available. | 20 sec |
| 10 | **Regulatory** | No FFL needed. Legal at federal level. KYC at redemption. Token classification rationale. | 15 sec |
| 11 | **Roadmap** | Phase 1-4 timeline from whitepaper. Where funding accelerates progress. | 15 sec |
| 12 | **Team** | Founders, key team, relevant credentials. | 15 sec |
| 13 | **The Ask** | Raise amount, use of funds breakdown, milestones unlocked, contact info. | 15 sec |

**Total estimated read time:** ~4 minutes (within the 3-5 minute range investors typically spend)

### Why This Order

1. **Problem before solution** -- anchors the investor in market reality before introducing blockchain. Avoids the crypto startup trap of leading with technology.
2. **Volatility chart early (slide 3)** -- this is the "hook." A 4x price swing with no way to trade it is immediately compelling. It makes the solution feel obvious.
3. **Revenue model before traction** -- investors need to understand the business model before they can evaluate whether early traction matters.
4. **Regulatory after revenue** -- address it proactively but do not lead with it. Leading with regulatory signals defensiveness.
5. **Team near the end** -- for DeFi protocols, the mechanism and market matter more than team pedigree in initial screening. Team becomes critical in follow-up conversations.
6. **Ask last** -- standard. After building the case, make the request.

---

## 5. Feature Dependencies

```
1.1 Cover ─── (standalone, no deps)
1.2 Problem ── (standalone)
1.3 Solution ── (standalone)
1.4 Market ── (standalone)
1.5 How It Works ── (standalone)
1.6 Revenue ── (standalone)
1.7 Competitive ── (standalone)
1.8 Team ── (standalone, needs bios)
1.9 Ask ── (needs fundraising strategy decisions)
1.10 Regulatory ── (standalone)

2.1 Live Demo ── depends on: existing dashboard deployed on Fuji
2.2 Live Data ── depends on: deployed contracts, RPC access
2.3 Animated Flow ── depends on: design assets, animation library
2.4 Price Chart ── depends on: historical price data
2.5 PDF Export ── depends on: all slides finalized
2.6 Personalization ── depends on: slide routing/URL params
2.7 Analytics ── depends on: slide navigation system, API endpoint
```

**Key insight:** All table-stakes slides are independent of each other and can be built in parallel. Differentiators have light dependencies, mostly on the base slide system being in place.

---

## 6. MVP Recommendation

**Prioritize (ship first):**

1. All 13 table-stakes slides (1.1-1.10 + roadmap, regulatory, team) -- these ARE the deck
2. 2.4 Price volatility interactive chart -- this is the single most compelling visual element
3. 2.1 Live demo link -- costs almost nothing since the app already exists
4. 2.5 PDF export -- practical necessity for distribution
5. 2.6 Personalization -- low effort, high perceived value

**Defer:**

- 2.3 Animated protocol flow: Medium-high complexity for a nice-to-have. A well-designed static diagram serves 90% of the purpose. Build this only if the team has time after the core slides are done.
- 2.2 Live data: Valuable but requires API work. Can be added post-launch. Static "as of [date]" numbers work fine initially.
- 2.7 Analytics: Useful but not blocking. Can use a lightweight third-party (Plausible, PostHog) initially instead of building custom.

---

## 7. Complexity Summary

| Feature | Complexity | New Code | Existing Assets to Leverage |
|---------|-----------|----------|---------------------------|
| 1.1 Cover | Low | One component | Logo, brand from landing page |
| 1.2 Problem | Low | One component | Whitepaper content |
| 1.3 Solution | Low | One component + diagram | Whitepaper flow diagram |
| 1.4 Market | Low | One component | Whitepaper TAM data |
| 1.5 How It Works | Low-Med | 1-2 components + visuals | Whitepaper sections 2-3 |
| 1.6 Revenue | Low | One component + table | Whitepaper section 5 |
| 1.7 Competitive | Low | One component + matrix | Whitepaper section 1.3 |
| 1.8 Team | Low | One component | Team bios (need to collect) |
| 1.9 The Ask | Low | One component | Fundraising decisions needed |
| 1.10 Regulatory | Low-Med | One component | Whitepaper section 7 |
| 2.1 Live Demo Link | Low | CTA button + URL | Existing Fuji dashboard |
| 2.2 Live Data | Medium | API read + display component | Deployed contracts on Fuji |
| 2.3 Animated Flow | Med-High | Animation components | Design assets needed |
| 2.4 Price Chart | Medium | Chart component + data | Historical price data needed |
| 2.5 PDF Export | Low-Med | Pre-rendered PDF or print CSS | All slide content |
| 2.6 Personalization | Low | URL param parsing | None |
| 2.7 Analytics | Medium | Event tracking + API endpoint | None |

---

## 8. Sources

- [Ink Narrates - DeFi Pitch Deck Guide](https://www.inknarrates.com/post/defi-pitch-deck) -- slide structure, common mistakes
- [Viktori - Crypto Token Pitch Deck Template](https://viktori.co/crypto-token-pitch-deck-template/) -- 13-slide template structure
- [Failory - Top Blockchain Startup Pitch Decks](https://www.failory.com/pitch-deck/blockchain) -- real-world examples from funded startups
- [Flexe.io - Crypto Pitch Deck Trends 2025](https://flexe.io/blog/crypto-pitch-deck/) -- investor expectations
- [Waveup - Pitch Deck Mistakes](https://waveup.com/blog/pitch-deck-mistakes-and-how-to-avoid-them/) -- anti-patterns
- [Storydoc - Best Pitch Deck Software](https://www.storydoc.com/blog/best-pitch-deck-software) -- interactive deck engagement data (2.3x sharing)
- [Nerdbot - Pitch Deck 2026 Rules](https://nerdbot.com/2025/11/07/what-are-the-5-new-rules-for-designing-a-pitch-deck-in-2026/) -- live data, mobile-first trends
- [IMARC Group - Ammunition Market Size](https://www.imarcgroup.com/ammunition-market) -- $26.7B in 2025
- [Grand View Research - Ammunition Market](https://www.grandviewresearch.com/industry-analysis/ammunition-market) -- $80.86B estimate (broader scope)
- [Markets and Markets - Ammunition Market](https://www.marketsandmarkets.com/Market-Reports/ammunition-market-923.html) -- $29B in 2025
- [Tekedia - RWA Opportunity](https://www.tekedia.com/real-world-assets-tokenized-finance-opportunity-vs-hype/) -- hype vs. durable value in RWA pitches

---

## 9. Quality Gate Checklist

- [x] Categories clear (table stakes vs differentiators vs anti-features)
- [x] Complexity noted for each feature
- [x] Dependencies between features identified (Section 5)
- [x] Recommended slide order with content guidance and time budgets (Section 4)
- [x] Build order / MVP recommendation provided (Section 6)
- [x] Anti-features justified with clear reasoning and alternatives
- [x] Existing codebase assets identified for reuse
