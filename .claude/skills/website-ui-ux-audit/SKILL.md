---
name: website-ui-ux-audit
description: Conduct structured UI/UX audits of websites and landing pages — single page, full site, prototype-vs-live comparison, competitive benchmark, or multi-market batch. Use this skill whenever the user wants to audit, review, score, critique, or benchmark a website's design and usability. Triggers include phrases like "audit this homepage," "UX review," "UI review," "design review," "usability evaluation," "heuristic evaluation," "scorecard," "benchmark against competitors," "compare to [competitor]," "compare live site vs prototype," "review this landing page," "what are competitors doing better," or "why isn't this page converting." Also use when the user shares a URL, screenshot, or Figma link and asks for friction points, improvement ideas, comparison analysis, or design recommendations — even if they don't use the word "audit." The skill includes optional layers for competitor benchmarking (against named direct competitors) and best-practice precedent citations (supporting specific findings with real-world examples). Especially useful for fintech, SaaS, and B2B sites where the audit must tie design findings to conversion outcomes.
---

# Website UI/UX Audit

A UI/UX audit's job is to find the *right* things to fix — not every thing. Treat it as a diagnosis, not a checklist. Connect each finding to a user goal or business metric, prioritize ruthlessly, and deliver an action list the team can ship from. Long reports die in spreadsheets; ranked findings get built.

## Pre-flight: prepare the page before you evaluate it

Most audit mistakes happen because the agent evaluated a half-rendered page. Before scoring anything, ensure you're looking at the real experience:

- **Dismiss cookie/consent banners** — accept or close them so they're not obscuring the hero. Note their presence as a finding (banner copy, friction level, persistence) but don't score the page through them.
- **Handle geo-redirects** — if the URL redirects based on location, confirm you landed on the intended market (e.g., `/sg/` for Singapore). For multi-market audits, pin the locale explicitly.
- **Trigger lazy-loaded content** — scroll the full page once to load below-the-fold images, animations, and dynamic sections before screenshotting.
- **Wait for animation/carousel default state** — capture each carousel, tab, or accordion's default state. Note dynamic elements separately rather than scoring a single frame.
- **Capture both viewports cleanly** — 1440×900 for desktop, 375×812 for mobile. Use full-page screenshots, not just the fold, so you see what the user scrolls through.
- **Confirm the page actually loaded** — a 4xx, 5xx, or stuck loading state isn't an audit, it's a bug report. Surface it and stop.

If pre-flight reveals the page is broken (won't load, infinite redirect, fully blocked by consent), that's the finding. Don't proceed as if everything is fine.

## Step 1: Capture context before auditing anything

Don't open the page and start critiquing. Ask the user (or extract from conversation) the following first. If any are missing, ask before proceeding — the audit's quality depends on this context.

- **What is being audited?** URL, screenshot, prototype link, Figma file. Single page or full site?
- **Who is the audience?** B2B enterprise, SMB, consumer, specific persona, geographic market.
- **What is the primary conversion goal?** Signup, demo request, purchase, lead form, account creation.
- **What KPIs matter?** Conversion rate, bounce rate, demo requests, time-on-page, search visibility.
- **What kind of audit is this?**
  - *Standalone*: evaluate one site/page on its own merits
  - *Comparison*: live vs prototype, version A vs version B
  - *Competitive benchmark*: this site vs 2–5 competitors
  - *Localization*: how the page performs across markets/languages
- **What baseline data exists?** Analytics, heatmaps, session recordings, prior audits.
- **What's the deliverable?** Scorecard, executive summary, detailed findings, prioritized backlog, or all of the above.

If the user has provided a URL, fetch it. If they've shared a screenshot or Figma, examine it visually. Never audit from memory of what the page "probably looks like."

## Step 2: Run the audit in layers

Work from strategic clarity → heuristics → page sections → conversion flow → accessibility & interaction. Stop and report at whichever layer surfaces the headline issue — don't grind through all five if Layer 1 already exposes a fatal problem.

### Layer 1 — Strategic clarity (the 5-second test)

Look at the page for 5 seconds. Then answer:

- **Value proposition**: What does this product/service do? Who is it for? Is that visible without scrolling?
- **Primary action**: What is the desired user action? Is there one obvious CTA, or is it competing with three others?
- **Trust**: Why should a stranger believe this? Logos, testimonials, security badges, regulatory mentions.
- **Differentiation**: What makes this distinct from competitors? Is it stated, or implied through generic claims?

If Layer 1 fails, that's the headline finding. Everything else is decoration on a broken foundation. Report this first, even if other layers find more issues — fixing decoration on a confused page doesn't move metrics.

### Layer 2 — Heuristic evaluation

Apply Nielsen's 10 usability heuristics as a *lens*, not a checklist. For each, note specific violations with location and severity:

1. **Visibility of system status** — Does the user know what's happening? (loading states, form validation, progress indicators)
2. **Match between system and real world** — Is the language familiar? Industry jargon, made-up product names, internal terminology?
3. **User control and freedom** — Can users undo, exit, or back out? Forced flows, autoplay video, dark patterns?
4. **Consistency and standards** — Do buttons, links, terminology, and patterns behave the same way across the site?
5. **Error prevention** — Can errors be prevented before they happen? (good defaults, confirmation for destructive actions)
6. **Recognition rather than recall** — Are options visible, or does the user need to remember them from another page?
7. **Flexibility and efficiency of use** — Are there shortcuts for power users, or only beginner paths?
8. **Aesthetic and minimalist design** — Does every element earn its place, or is the page cluttered?
9. **Help users recognize, diagnose, and recover from errors** — Are error messages plain-language and constructive?
10. **Help and documentation** — When help is needed, is it findable and useful?

**Severity scale**: Cosmetic (1) → Minor (2) → Major (3) → Catastrophic (4). Anything Major or higher goes into the priority list.

### Layer 3 — Page-section walkthrough

Walk the page top-to-bottom on **both desktop and mobile**. For each section, note specific friction points:

- **Above-the-fold / Hero** — value prop visible, CTA prominent, no fold-line clipping critical content
- **Navigation / Header** — clear IA, max 7 top-level items, search if site is content-heavy
- **Value proposition section** — outcome-focused, not feature-listed
- **Social proof / Trust signals** — credible (named customers, specific stats), placed where decisions happen
- **Product / Feature explanation** — scannable, uses visuals to compress text, addresses "what's in it for me"
- **Pricing** (if shown) — clear tiers, transparent inclusions, anchored to value
- **Forms / CTAs** — minimum fields, inline validation, clear next step
- **FAQ / Objection handling** — anticipates the top 3 reasons people leave
- **Footer** — secondary nav, compliance links, contact

For each section, score 1–5 (see Step 4) and capture 1–2 specific observations. Avoid generic notes like "could be cleaner."

### Layer 4 — Conversion path analysis

Trace the user's path from entry to conversion goal as if you were a new visitor:

- Where do users land? (organic, paid, direct, referral — each has different intent)
- How many steps from entry to conversion?
- What information must the user supply, and when?
- Where are the likely drop-off points? (form length, surprise costs, missing trust signals at decision moments)
- Are there trust gates *before* the ask? (testimonials, security badges, recognizable logos near the CTA)

Map this as a simple flow: Entry → Step 1 → Step 2 → … → Conversion. Flag each transition with a confidence rating: *Likely converts*, *Could lose users here*, *Drop-off risk*.

### Layer 5 — Accessibility & interaction quality

Accessibility is part of user interaction — if users can't reach an element, click it, or read it, the design doesn't work for them. Keep this layer focused on what affects visual design and interactability:

- **Color contrast** — WCAG AA minimum (4.5:1 for body text, 3:1 for large text and UI components). Check brand colors against their actual backgrounds, not idealized swatches. Low-contrast CTAs are a recurring fintech sin.
- **Focus states** — visible, distinct focus indicators on every interactive element. If you can't see where you are when tabbing through, the page fails for keyboard users.
- **Keyboard navigation** — can a user complete the primary conversion goal without a mouse? Tab order logical? No keyboard traps?
- **Form labels** — properly associated with inputs, not placeholder-only. Placeholders disappear on focus and leave users guessing what field they're in.
- **Image alt text** — present on meaningful images, empty (`alt=""`) on decorative ones. Generic alt text ("image1") is worse than none.
- **Touch target size** — at least 44×44px on mobile. Cramped tap targets are the most common mobile interaction failure.
- **Motion and animation** — does the page respect `prefers-reduced-motion`? Aggressive parallax and autoplay video without controls are accessibility *and* attention concerns.

If the audit is specifically for accessibility compliance, this becomes a full WCAG 2.1 AA pass and the rest of the audit takes a back seat.

## Step 3: Score it (when a scorecard is requested)

Use this 5-point scale across categories. Resist the urge to add a 6th point — five forces a real judgment.

| Score | Label | Definition |
|---|---|---|
| 5 | Excellent | Best-in-class; competitors should study this |
| 4 | Strong | Solid execution, minor refinements possible |
| 3 | Adequate | Functional but underperforming its potential |
| 2 | Weak | Significant friction or unclear messaging |
| 1 | Broken | Actively blocks conversion or trust |

**Standard categories** (adapt for the specific audit):

- Clarity of value proposition
- Visual hierarchy & scannability
- Information architecture & navigation
- CTA prominence and clarity
- Trust and credibility signals
- Mobile experience
- Accessibility & interaction quality
- Brand consistency
- Localization quality (multi-market sites only)

For comparisons (live vs prototype, or vs competitors), score every option on the same rubric and add a brief observation column. Don't average scores into a single number — it hides the pattern.

## Step 4: Competitive benchmarking (optional — only when explicitly invoked)

**When to run this layer:**
- User explicitly asks: "benchmark against competitors," "compare to [named competitor]," "how does this stack up against X"
- User provides competitor URLs alongside the primary audit target
- User asks "what are competitors doing that we're not"
- The audit is for a redesign or major launch where competitive context is decision-grade input

**When NOT to run it:**
- Routine audits of internal pages where the user just wants to know what to fix
- Quick reviews under tight time pressure — competitive analysis triples audit length
- When the user hasn't asked. Don't add competitor scans to make the audit feel more thorough; that's noise.

If unsure whether to run it, ask the user: *"Do you want me to benchmark against named competitors, or is this audit standalone?"* One question, no decision tree.

### Selecting competitors (if running this layer)

1. **Pick 3–5 *direct* competitors** — same audience, same conversion goal. Not aspirational brands from another category. For B2B fintech, that's Wise, Airwallex, Revolut Business, Payoneer, OFX — not Apple or Stripe's consumer marketing.
2. **Confirm the list with the user before fetching anything.** A wrong competitor list wastes the whole layer.
3. **Distinguish *direct* from *adjacent*** — direct competitors compete for the same conversion; adjacent ones share design patterns but different audiences. Score direct, observe adjacent.

### Running the benchmark

1. Apply the same pre-flight, layer 1–5 audit, and rubric to each competitor as you did to the primary site. Don't deep-audit competitors; surface-audit them so the comparison is meaningful at the categories that matter.
2. Score each on the same rubric.
3. For each scoring category, note what the winner does that others don't — in one sentence per category, not a paragraph.
4. **Flag patterns the audited site executes *well* that competitors miss** — these are differentiators, not just gaps. Equally important as gap analysis.
5. **Don't copy.** Interpret *why* a competitor pattern works (the underlying principle), then recommend an original execution. A direct copy signals weakness and creates brand confusion.

### Comparison parity rules

When comparing two or more pages, control for everything except the design itself:

- **Viewport parity** — same dimensions for desktop captures, same for mobile.
- **Scroll parity** — capture the same scroll positions (top, mid, bottom) on each.
- **Locale parity** — same country setting, language, and currency. Use a VPN or set Playwright's geolocation if needed.
- **Auth parity** — both logged out, or both logged in with comparable accounts.
- **Time-of-day parity** — for sites with dynamic content (live counters, social proof feeds), capture within the same window.
- **Consent parity** — both with cookies accepted, or both rejected. Different consent states change which scripts load and what's visible.

When parity isn't possible (e.g., a competitor requires a paid account), say so explicitly in the scorecard rather than scoring blind.

### Competitive benchmark deliverable

Add to the standard audit outputs:

- `competitive-scorecard.md` and `competitive-scorecard.csv` — your site + 3-5 competitors as columns, rubric categories as rows, scores in cells, brief observation column
- `competitive-patterns.md` — a short list (max 5) of the most material pattern differences, each with: what the competitor does, why it works, how your site could solve the same problem in an original way

Do not produce a "competitor inspiration gallery." That's a different deliverable for a different request.

## Step 5: Best-practice precedents (optional — supports findings, doesn't generate them)

**The rule:** identify the finding first using the audit layers. *Then*, if a finding genuinely benefits from a real-world precedent — because the recommendation is novel, contested, or hard to visualize — reference one. Don't surf the web looking for findings to suggest.

**When to add a precedent to a finding:**
- The recommendation involves a pattern the team may not be familiar with
- Leadership pushback is likely and a strong precedent makes the case
- The recommendation is unusual enough that "trust me, this works" isn't sufficient

**When to skip precedents:**
- The finding is grounded in a well-established heuristic (Nielsen, WCAG, common UX literature) — cite the principle, not a precedent
- The recommendation is small and obvious (e.g., "increase contrast to meet WCAG AA")
- You'd be reaching to find a precedent — that's a signal the finding might not be strong enough

**Hard caps:**
- Maximum **3 precedents** per audit. If you have a 4th, replace your weakest one or drop it.
- Each precedent must be tied to a *specific finding*, not floating in an appendix.
- Each precedent gets one sentence on what the company does, one on why it works as a principle.

**Where to source precedents:**
- **Direct or adjacent companies** the user has named, or that the agent can confidently identify as relevant
- **Recognized design pattern libraries** — Mobbin, Page Flows, Land-book, Refero, SaaSPages, Really Good Emails (for email patterns)
- **Published case studies** with attributable outcomes — Baymard Institute, NN/g articles, vendor blogs (Stripe, Linear, Shopify design posts)
- **Web search** when none of the above suffice — use the search tool, but verify the source is credible (not Pinterest, not random Dribbble shots without context)

**Precedent format inside a finding:**

```
**Precedent**: [Company / source] does [specific pattern]. The principle:
[1 sentence on *why* it works — what user behavior or design rule it leverages].
Don't replicate the visual; apply the principle.
```

**Anti-patterns to avoid:**
- Citing a precedent for every finding (turns the audit into a comparison shopping list)
- Citing consumer brands for B2B problems (or vice versa) without explaining the cross-application
- Pinterest, Behance, or Dribbble screenshots without business context — pretty designs without conversion data are aesthetic, not strategic
- "Apple does this" — true for almost any pattern, useful for almost none

## Step 6: Localization audit (for multi-market sites)

When auditing a site that runs across multiple markets/languages, evaluate:

- **Translation vs localization** — Is the copy adapted for tone, idiom, and regional norms, or is it a literal string-by-string translation?
- **CTA conventions** — Local conventions differ ("Get a quote" vs "Request pricing" vs region-specific verbs).
- **Local social proof** — Customer logos, testimonials, case studies relevant to the market.
- **Compliance and regulatory mentions** — Appropriate to the jurisdiction (e.g., FCA, MAS, FinCEN references in financial services), placed visibly where trust matters.
- **Formatting** — Currency, date format, phone numbers, addresses rendered in local conventions.
- **Imagery** — Culturally appropriate, locally relevant. Stock imagery of the wrong region undermines trust instantly.
- **Typography & layout for the language** — does the design accommodate longer German words, RTL scripts, denser CJK characters? Buttons that fit "Sign up" may break with "Registrieren".

Flag inconsistencies where the global template forces a pattern that doesn't fit a specific market.

## Step 7: Multi-market batch audit (when auditing the same design across many markets)

For sites operating across many country/language variants (e.g., `/uk/`, `/sg/`, `/au/`, `/eu/`), don't audit each one in isolation. The point of a batch audit is to surface *visual and design inconsistencies* — where the same template renders differently, where brand application drifts, and where the user interaction patterns diverge market to market.

**Process:**

1. **List the URLs** in scope. Confirm with the user which markets matter most — auditing 20 markets equally is rarely the right call; usually 3–5 strategic markets carry most of the traffic and design decisions.
2. **Lock the rubric** before running. Use the same categories, the same scoring scale, and the same viewport across every market. Inconsistencies in the audit itself will swamp inconsistencies in the sites.
3. **Run sequentially**, not in parallel, to ensure pre-flight (cookie/geo handling) is consistent. Save artifacts to `./audits/<batch-name>/<market-code>/`.
4. **Aggregate into a single matrix** — markets as columns, audit categories as rows, scores in the cells. This makes outliers visible at a glance.
5. **Surface inconsistency patterns**, not just per-market findings:
   - *Template drift*: same module renders with different spacing, typography, or hierarchy across markets
   - *Brand inconsistency*: logo placement, color usage, button styling, or imagery treatment varies without intent
   - *Component fragmentation*: hero CTA is a button in some markets, a form in others, with no clear reason
   - *Localization debt*: market X has the updated visual treatment, market Y still uses last year's design
   - *Trust signal gaps*: regulatory mentions, customer logos, or testimonials present in some markets but missing in others
6. **Recommend at the template level**, not the market level, when the issue is systemic. "Fix the hero CTA pattern in the global component" beats "update SG hero, then UK hero, then AU hero."

For teams running 20+ sites, this batch view is where the audit becomes actionable. One visual inconsistency across 20 markets is 20 tickets if handled locally, or one ticket if handled at the template.

## Step 8: Prioritize ruthlessly with Effort × Impact

Plot every finding on a 2×2 grid:

| | **Low effort** | **High effort** |
|---|---|---|
| **High impact** | ✅ **Quick wins** — do first | 📅 **Major projects** — plan & resource |
| **Low impact** | 🟡 **Fill-ins** — do if convenient | ❌ **Time sinks** — skip |

Rules:
- Quick wins ship this sprint.
- Major projects need a brief, a resource estimate, and a target metric.
- Fill-ins go in a "while you're in there" list.
- Time sinks get dropped — and if leadership asks why, the matrix shows the math.

Don't deliver an unranked list of 30 findings. A long unranked list paralyzes the team. If a finding doesn't make the prioritized cut, leave it in an appendix or omit it entirely.

## Step 9: Package the deliverable for the audience

Different audiences need different artifacts. Build the ones the user needs, not one monolithic report.

### Executive summary (1 page, for leadership)
- Top 3 findings, each with business impact in their language (revenue, churn, conversion rate)
- Recommended priority order
- Expected outcome if addressed
- No design jargon

### Detailed findings (for product, design, content)

For each finding, use this template:

```
**Issue**: [One sentence — what's wrong]
**Location**: [URL, section, viewport — be specific]
**Evidence**: [Heuristic violated, analytics signal, or observed user behavior]
**Business impact**: [Which metric this affects and roughly how]
**Recommendation**: [Specific fix — not "improve the X"]
**Precedent** (optional, only when warranted per Step 5): [Company/source does pattern. Why it works.]
**Effort**: S / M / L
**Priority**: P0 / P1 / P2
```

### Scorecard (for comparisons)

A table with categories as rows, options as columns, scores as cells, and a brief observation column. Highlight category winners. Add 2–3 sentences of summary per option below the table.

### Engineering / QA spec (for implementation handoff)
When findings translate into specific changes, write them as user stories or acceptance criteria, not design opinions. "Hero CTA contrast ratio must meet 4.5:1 against background" beats "make the CTA pop more."

### Output formats — pick by audience

- **Markdown** (`findings.md`, `executive-summary.md`) — default; works everywhere, easy to diff in git
- **CSV** (`scorecard.csv`, `findings.csv`) — when the recipient needs to sort, filter, or import to Sheets/Notion/Jira
- **HTML** (`report.html`) — single-file, shareable with leadership without Markdown rendering; embed screenshots inline
- **PDF** — when the audit goes to external stakeholders or formal documentation; export from HTML
- **Annotated screenshots** (`hero-annotated.png`) — overlay findings directly on the screenshot with arrows and labels; the most persuasive format for design conversations

Always include the raw screenshots alongside the report. Stakeholders trust what they can see.

## Patterns to flag specifically

These show up in nearly every audit — call them out by name rather than burying them in general observations:

- Hero copy describing **features**, not **user outcomes**
- Generic CTAs ("Learn more," "Get started") with no context about what comes next
- Multiple competing CTAs in the hero without clear hierarchy
- Stock photos that decorate but don't communicate
- "We" language ("We help businesses…") instead of "you" language ("Send money to your suppliers in…")
- Walls of text with no scannable structure (no subheads, bullets, or visual breaks)
- Forms requesting fields the business doesn't need at this stage
- Trust signals that aren't credible — vague stats with no source, made-up awards
- Missing or weak above-the-fold value statement
- Inconsistent button styles, link colors, typography across pages
- Mobile experience that feels like a shrunken desktop rather than designed for the device
- Pop-ups that interrupt within the first 5 seconds
- Footer-heavy navigation when users scan top-first
- Pricing pages with no anchor (users can't tell if $99 is cheap or expensive)
- FAQs that answer the company's questions, not the user's objections

## Anti-patterns in audits themselves

Avoid these when writing the audit:

- **Listing every minor thing** — buries the critical findings under noise
- **Stating opinions without principles** — "I don't like the green" vs "Brand green has 3.2:1 contrast on white, below WCAG AA"
- **Recommendations without specificity** — "Make it cleaner" is not a recommendation
- **Ignoring business context** — what works for B2C consumer fashion fails for B2B enterprise sales
- **Treating heuristics as a checkbox** — they're a lens, not a quiz
- **Skipping prioritization** — handing over a flat list is handing over the work of prioritizing
- **One deliverable for every audience** — executives don't read 50-page reports; engineers can't ship from a one-pager

## Bias toward execution

A good audit produces a prioritized action list, not a research paper. If you find yourself adding a 50th observation, stop and rank what you have. The team receiving this needs to ship fixes, not read more findings.

If the user wants to keep going deeper after the initial pass, ask: *"Which 1–2 findings are blocking us from shipping this week?"* Help them act, then return to the broader audit if it's still warranted. Audits are cheap to redo; missed shipping windows are not.

A useful test before sending: **"If the team only had time to fix three things from this audit, would those three things be visible at the top?"** If not, restructure.
