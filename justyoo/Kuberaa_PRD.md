# Kuberaa — Product Requirements Document

> **Kuberaa** is named after Kubera (कुबेर), the Hindu god of wealth and treasurer of the gods. A portfolio manager for individual investors — thoughtful, transparent, and algorithmically driven.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Context & Background](#2-context--background)
3. [Target Users](#3-target-users)
4. [Tech Stack](#4-tech-stack)
5. [External APIs & Services](#5-external-apis--services)
6. [Product Scope](#6-product-scope)
7. [Feature Requirements](#7-feature-requirements)
   - 7.1 Onboarding Flow
   - 7.2 Risk Profiling Algorithm
   - 7.3 Asset Allocation Engine
   - 7.4 ETF Selection Engine
   - 7.5 Portfolio Construction
   - 7.6 Expected Return & Risk Calculation
   - 7.7 Portfolio Tracking & Performance
   - 7.8 Currency Conversion
   - 7.9 Rebalancing Engine
   - 7.10 Paper Trading Simulation
   - 7.11 Market Analysis & Charts
8. [Database Schema](#8-database-schema)
9. [Backend Architecture](#9-backend-architecture)
10. [Rule-Based Algorithms](#10-rule-based-algorithms)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Integration with Main Platform](#12-integration-with-main-platform)
13. [Out of Scope](#13-out-of-scope)
14. [Open Questions](#14-open-questions)

---

## 1. Product Overview

Kuberaa is a **rule-based, algorithmic portfolio manager** built for individual investors. It guides users from knowing nothing about investing to having a fully constructed, tracked, and periodically rebalanced investment portfolio — all without requiring any prior financial knowledge.

Kuberaa is:

- **A standalone web application** built with Next.js, React, and TypeScript
- **A module** within a larger financial intelligence platform that already provides live market news, trends, and analysis
- **Paper trading only** in its first version — no real money, no brokerage integration
- **AI-free** — every decision is driven by transparent, explainable rule-based algorithms and mathematical formulas
- **User-controlled** — the system makes suggestions, but the investor has full control to edit, override, or customize every decision

---

## 2. Context & Background

### The Problem

Making good investment decisions requires synthesizing information from dozens of sources simultaneously: earnings reports, analyst notes, macroeconomic news, regulatory filings, competitor moves, and more. Today this information lives in completely separate, incompatible systems. Even when an investor has good data, constructing a portfolio that accounts for their specific risk tolerance, tax situation, time horizon, and goals simultaneously is beyond what simple tools handle.

### Where Kuberaa Fits

Kuberaa solves the **portfolio construction and management** layer. The larger platform (Part 1) already handles live market news, trends, and analysis. Kuberaa is Part 2 — it takes the investor from "I want to invest" to "I have a portfolio" and keeps it healthy over time.

### Design Philosophy

- **Don't assume the user.** Collect enough context upfront to personalize the experience immediately. Never show a generic interface.
- **Transparency over magic.** Every recommendation the system makes should be explainable in plain language.
- **User in control.** Suggestions are starting points, not mandates. Every output is editable.
- **No AI.** All logic is rule-based and formula-driven. This keeps the system auditable, predictable, and cost-free to run.

---

## 3. Target Users

### Primary User: Individual Retail Investor

- Investing for personal wealth growth, income generation, or a specific financial goal
- Experience ranges from complete beginner to intermediate
- Investing in USD, with the option to view values in INR
- Not a finance professional — needs plain language explanations alongside every action

### User Journey Summary

1. Signs up / logs in via the main platform
2. Goes through Kuberaa onboarding (cold-start profile creation)
3. Reviews and confirms their investor profile
4. Gets a recommended asset allocation
5. Reviews and customizes ETF selection
6. Confirms and creates their portfolio
7. Tracks performance over time via dashboard
8. Receives rebalancing suggestions periodically
9. Views live market trends and charts alongside their portfolio

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Frontend | React |
| Styling | Tailwind CSS (inherited from main platform) |
| Charts | MUI X Charts (`@mui/x-charts`) — **mandatory** |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Shared with main platform (SSO / session sharing) |
| Hosting | Same infrastructure as main platform |
| Package Manager | npm or pnpm |

### Chart Library — MUI X Charts (Mandatory)

All data visualizations in Kuberaa must use `@mui/x-charts`. This is a hard requirement.

Key components to use:

- `<LineChart />` — portfolio value over time, market trends
- `<BarChart />` — sector exposure, ETF weight comparison
- `<PieChart />` — asset allocation breakdown
- `<SparkLineChart />` — mini performance indicators in cards

Install: `npm install @mui/x-charts`

---

## 5. External APIs & Services

| Purpose | Service | Notes |
|---|---|---|
| Live ETF & stock prices | Polygon.io or Alpha Vantage | Free tier sufficient for paper trading |
| USD ↔ INR exchange rate | ExchangeRate-API | Cache hourly, do not call on every request |
| ETF metadata | Static JSON seeded into DB | Historical return, volatility, expense ratio, sector |
| Market charts & trends | Already provided by Part 1 of main platform | Do not rebuild — consume existing data |

---

## 6. Product Scope

### In Scope (Version 1)

- Onboarding flow with investor profile creation
- Investor profile confirmation screen
- Rule-based risk profiling (Conservative / Balanced / Aggressive)
- Dynamic asset allocation calculation (unique percentages per investor)
- ETF selection engine with user editing capability
- Portfolio construction and confirmation
- Paper trading simulation (virtual cash, buy/sell transactions)
- Portfolio performance tracking (current value, gain/loss, return %)
- Expected return and risk calculation (Sharpe ratio)
- Correlation-aware portfolio risk display
- Rebalancing engine (drift detection + suggested trades, user approval required)
- Currency toggle: USD ↔ INR (single click)
- Market trends display using MUI X Charts (live data from main platform)
- Portfolio analytics dashboard with charts

### Out of Scope (Version 1)

- Real brokerage integration or live trade execution
- AI-generated insights or recommendations
- Tax optimization
- Options, futures, or derivatives
- Social / community features
- Mobile app (web only)
- Multiple portfolios per user

---

## 7. Feature Requirements

### 7.1 Onboarding Flow

The onboarding flow is the most critical part of Kuberaa. It solves the cold-start problem — by the end of onboarding, the system knows enough about the investor to immediately personalize their experience.

**Principle:** Never assume the user. Collect context explicitly. Do not skip steps or pre-fill answers on behalf of the user.

**Step 1 — Basic Information**
- Full name
- Country / location (used for jurisdiction context)
- Age (affects time horizon and risk suggestions)

**Step 2 — Experience Level**
- Options: Complete beginner / Some experience / Actively investing
- Plain language descriptions for each option

**Step 3 — Investment Goal**
- Options: Grow wealth over time / Generate regular income / Save for a specific goal / Preserve capital
- If "specific goal" selected: text field for goal description and target date

**Step 4 — Time Horizon**
- How long do you plan to keep this money invested?
- Options: Less than 2 years / 2–5 years / 5–10 years / More than 10 years

**Step 5 — Capital**
- How much are you starting with? (USD)
- Number input with USD/INR toggle
- Minimum: $100 (below this, ETF diversification is not meaningful)

**Step 6 — Risk Tolerance Questions**
- 4 scenario-based questions (see Risk Profiling Algorithm section)
- One question per screen for clarity
- No financial jargon

**Step 7 — Constraints & Preferences**
- Asset classes to exclude (e.g. commodities, real estate)
- ESG / ethical investing preference (yes/no)
- Sector exclusions (e.g. tobacco, weapons, fossil fuels)
- Any additional notes (free text, optional)

**Step 8 — Profile Confirmation**
- Full summary of all inputs collected
- Investor can go back and edit any step
- Displays the computed risk profile (Conservative / Balanced / Aggressive) with explanation
- Investor can manually override the computed profile
- Confirm button proceeds to portfolio construction

**Onboarding UX Rules:**
- Progress bar visible at all times
- Back navigation always available
- No data is saved until final confirmation
- All inputs stored in local state until confirmation, then persisted to DB

---

### 7.2 Risk Profiling Algorithm

Runs after onboarding confirmation. Computes a score out of 100 and maps it to a profile.

**Scoring Breakdown:**

**Risk Tolerance Questions — 40 points max (4 questions × 10 points)**

| Question | Conservative (2pts) | Balanced (6pts) | Aggressive (10pts) |
|---|---|---|---|
| Portfolio drops 20% — you: | Sell everything | Hold and wait | Buy more |
| Primary concern is: | Not losing money | Balance of both | Maximum growth |
| Have you invested before? | Never | A little | Yes, actively |
| High-risk investment could 3x — you: | Skip it | Invest a small amount | Go all in |

**Time Horizon — 25 points max**

| Timeline | Score |
|---|---|
| Less than 2 years | 5 |
| 2–5 years | 10 |
| 5–10 years | 18 |
| More than 10 years | 25 |

**Investment Goal — 20 points max**

| Goal | Score |
|---|---|
| Capital preservation | 5 |
| Income generation | 10 |
| Balanced growth | 15 |
| Maximum growth | 20 |

**Capital Amount — 15 points max**

| Capital (USD) | Score |
|---|---|
| Under $5,000 | 5 |
| $5,000 – $25,000 | 8 |
| $25,000 – $100,000 | 11 |
| Over $100,000 | 15 |

**Profile Mapping:**

| Total Score | Profile |
|---|---|
| 0 – 35 | Conservative |
| 36 – 65 | Balanced |
| 66 – 100 | Aggressive |

The numeric score is stored alongside the profile label. All subsequent calculations use the raw score, not just the label — this is what makes the allocation unique to each investor.

---

### 7.3 Asset Allocation Engine

Takes the numeric risk score and computes exact allocation percentages for each asset class.

**Formulas:**

```
equityPct    = 20 + (score × 0.7)
bondPct      = 70 − (score × 0.55)
altPct       = 100 − equityPct − bondPct
```

**Example outputs:**

| Score | Equities | Bonds | Alternatives |
|---|---|---|---|
| 20 (Conservative) | 34% | 59% | 7% |
| 50 (Balanced) | 55% | 45% | 0% |
| 80 (Aggressive) | 76% | 26% | −2% → clamped to 0, redistributed |

**Constraint Adjustments (applied after formula):**

- If `altPct < 0`: clamp to 0, add remainder to bonds
- If user excluded commodities: set commodities sub-allocation to 0, redistribute to real estate or bonds
- If user selected ESG only: flag all non-ESG ETFs as ineligible
- If capital < $5,000: force `altPct = 0` (too small to diversify into alternatives meaningfully)
- If time horizon < 2 years: cap `equityPct` at 40% regardless of score

**User Editing:**
After the system generates the allocation, the user sees sliders for each asset class. Adjusting one automatically adjusts others to maintain 100% total. Live preview of how changes affect expected risk and return is shown alongside the sliders.

---

### 7.4 ETF Selection Engine

**Master ETF List**

Maintained as a seeded table in PostgreSQL. Minimum 20 ETFs covering all asset classes.

| Field | Description |
|---|---|
| `ticker` | e.g. SPY |
| `name` | Full fund name |
| `assetClass` | Equities / Bonds / Real Estate / Commodities / Cash |
| `subCategory` | US Large Cap / International / Emerging Markets / etc. |
| `historicalAnnualReturn` | % (decimal, e.g. 0.105 for 10.5%) |
| `historicalVolatility` | % annualized standard deviation |
| `expenseRatio` | % annual fee |
| `esgEligible` | Boolean |
| `minimumInvestment` | USD |
| `currency` | USD |

**Suggested ETF List (Default)**

| Ticker | Name | Asset Class | Sub-Category |
|---|---|---|---|
| SPY | SPDR S&P 500 ETF | Equities | US Large Cap |
| QQQ | Invesco Nasdaq 100 ETF | Equities | US Tech |
| VTI | Vanguard Total Stock Market | Equities | US Total Market |
| VEA | Vanguard Developed Markets | Equities | International Developed |
| VWO | Vanguard Emerging Markets | Equities | Emerging Markets |
| ESGU | iShares MSCI USA ESG ETF | Equities | US ESG |
| BND | Vanguard Total Bond Market | Bonds | US Total Bond |
| AGG | iShares US Aggregate Bond | Bonds | US Aggregate |
| BNDX | Vanguard International Bond | Bonds | International Bond |
| TIP | iShares TIPS Bond ETF | Bonds | Inflation Protected |
| VNQ | Vanguard Real Estate ETF | Real Estate | US REITs |
| GLD | SPDR Gold Shares | Commodities | Gold |
| IAU | iShares Gold Trust | Commodities | Gold |
| DJP | iPath Bloomberg Commodity | Commodities | Broad Commodities |
| SHV | iShares Short Treasury | Cash | Short-Term Treasury |

**Selection Logic:**

Within each asset class bucket, score ETFs by:

```
selectionScore = (historicalReturn × 0.5) − (volatility × 0.3) − (expenseRatio × 0.2)
```

Select top 2–3 per bucket as the default suggestion. Apply eligibility filters (ESG, exclusions) before ranking.

**User Control:**
- Remove any suggested ETF
- Add any ETF from the master list
- Adjust weight of each ETF within its asset class bucket
- Weights within a bucket must sum to that bucket's allocated percentage
- System validates totals in real time and shows errors if weights don't balance

---

### 7.5 Portfolio Construction

After ETF selection is confirmed:

1. Create a `Portfolio` record in the database
2. Create `PortfolioHolding` records for each ETF with target weight and initial units
3. Calculate initial units: `units = (allocationPct × capitalAmount) / currentETFPrice`
4. Set virtual cash balance to: `virtualCash = capitalAmount`
5. Execute virtual buy orders for each holding (deducts from virtual cash, logs to `Transaction`)
6. Show portfolio confirmation screen with full summary before finalizing

---

### 7.6 Expected Return & Risk Calculation

Calculated at portfolio creation and refreshed whenever holdings change.

**Expected Annual Return:**

```
expectedReturn = Σ (weight_i × historicalAnnualReturn_i)
```

**Portfolio Variance (accounts for correlation):**

```
portfolioVariance = Σ Σ (weight_i × weight_j × volatility_i × volatility_j × correlation_ij)
portfolioVolatility = √portfolioVariance
```

A **correlation matrix** is pre-seeded in the database for the master ETF list. Values sourced from historical data. This table is static and does not update in real time.

**Sharpe Ratio:**

```
sharpeRatio = (expectedReturn − riskFreeRate) / portfolioVolatility
riskFreeRate = 0.045  (4.5% — approximate US T-bill rate, hardcoded, reviewable)
```

**Display to User:**

- Expected annual return: e.g. "~8.1% per year"
- Portfolio volatility: e.g. "±12% typical annual swing"
- Sharpe ratio with plain language interpretation:
  - Below 1: "Below average risk-adjusted return"
  - 1–2: "Good"
  - Above 2: "Excellent"

---

### 7.7 Portfolio Tracking & Performance

**Live Price Fetching:**

- Fetch current ETF prices from Polygon.io or Alpha Vantage on dashboard load
- Cache prices for 15 minutes to avoid excessive API calls
- Store daily price snapshots in `PriceSnapshot` table for historical charting

**Calculated Metrics (per holding):**

```
currentValue   = units × currentPrice
gainLoss       = currentValue − (units × averagePurchasePrice)
returnPct      = gainLoss / (units × averagePurchasePrice)
currentWeight  = currentValue / totalPortfolioValue
```

**Calculated Metrics (portfolio level):**

```
totalValue     = Σ currentValue_i + virtualCash
totalGainLoss  = totalValue − initialCapital
totalReturnPct = totalGainLoss / initialCapital
```

**Charts (all using MUI X Charts):**

- Portfolio value over time — `<LineChart />`
- Asset allocation breakdown — `<PieChart />`
- Sector exposure — `<BarChart />`
- Individual ETF performance — `<SparkLineChart />` in holding cards
- Gain/loss over time — `<LineChart />` with reference line at 0

---

### 7.8 Currency Conversion

**Behavior:**
- All internal calculations and storage use USD
- A single toggle button converts all displayed values to INR
- Toggle state is stored in user preferences (persists across sessions)

**Implementation:**
- Fetch USD/INR rate from ExchangeRate-API on first load and cache in `CurrencySnapshot` table with timestamp
- Cache TTL: 60 minutes
- On toggle: multiply all displayed USD values by cached rate
- Rate displayed to user: "1 USD = ₹83.42 (updated 23 min ago)"
- Do not call the exchange rate API more than once per hour

---

### 7.9 Rebalancing Engine

**Trigger:**
- Runs automatically on a weekly schedule (cron job)
- Also runs on demand when user clicks "Check Rebalancing" on dashboard

**Step 1 — Calculate Current Weights:**

```
currentWeight_i = currentValue_i / totalPortfolioValue
```

**Step 2 — Calculate Drift:**

```
drift_i = currentWeight_i − targetWeight_i
```

**Step 3 — Flag if Threshold Exceeded:**

```
if |drift_i| > threshold → flag for rebalancing
```

Default threshold: 5% (0.05). User can configure this between 2% and 10%.

**Step 4 — Generate Rebalancing Plan:**

```
if drift_i > 0 → sell (drift_i × totalPortfolioValue) of ETF_i
if drift_i < 0 → buy  (|drift_i| × totalPortfolioValue) of ETF_i
```

**Step 5 — User Approval:**
- Show rebalancing plan as a list of proposed trades
- User can approve all, approve individual trades, or modify amounts
- Never execute rebalancing without explicit user confirmation
- After approval, execute as paper trades and log to `RebalancingLog`

---

### 7.10 Paper Trading Simulation

**Virtual Cash:**
- Initialized at onboarding capital amount
- Debited on buy orders, credited on sell orders

**Buy Order:**

```
if virtualCash >= (units × currentPrice):
  virtualCash    -= units × currentPrice
  holding.units  += units
  log Transaction (type: BUY, units, price, timestamp, reason)
else:
  return error: "Insufficient virtual cash"
```

**Sell Order:**

```
if holding.units >= units:
  virtualCash    += units × currentPrice
  holding.units  -= units
  log Transaction (type: SELL, units, price, timestamp, reason)
else:
  return error: "Insufficient units"
```

**Transaction Reason Field:**
- MANUAL — user initiated
- REBALANCE — triggered by rebalancing engine
- INITIAL — portfolio creation

**Transaction log powers:**
- Portfolio performance history
- Gain/loss calculation
- Charts showing portfolio value over time

---

### 7.11 Market Analysis & Charts

**Source:** Live market data already provided by Part 1 of the main platform. Kuberaa does not rebuild this — it consumes the existing data feed.

**Displayed in Kuberaa dashboard:**
- Major index performance (S&P 500, NASDAQ, Dow Jones) — `<LineChart />`
- ETFs in the user's portfolio — price chart for each — `<LineChart />`
- Market sector heatmap — `<BarChart />`
- Volatility indicator (VIX or equivalent) — `<SparkLineChart />`

**All charts mandatory via `@mui/x-charts`.**

---

## 8. Database Schema

### Tables

**User**
```
id            String   @id @default(uuid())
email         String   @unique
name          String
createdAt     DateTime @default(now())
```
*(Synced from main platform's auth — do not duplicate auth logic)*

**InvestorProfile**
```
id                String    @id @default(uuid())
userId            String    @unique
location          String
age               Int
experienceLevel   String    // BEGINNER | SOME | ACTIVE
goal              String    // GROW | INCOME | SPECIFIC | PRESERVE
goalDescription   String?
targetDate        DateTime?
timeHorizon       String    // LT2 | 2TO5 | 5TO10 | GT10
capitalUSD        Decimal
riskScore         Int       // 0–100
riskProfile       String    // CONSERVATIVE | BALANCED | AGGRESSIVE
profileOverride   Boolean   @default(false)
esgOnly           Boolean   @default(false)
excludedSectors   String[]
excludedAssets    String[]
rebalanceThreshold Decimal  @default(0.05)
currencyPreference String   @default("USD")
createdAt         DateTime  @default(now())
updatedAt         DateTime  @updatedAt
```

**Portfolio**
```
id              String    @id @default(uuid())
userId          String    @unique
profileId       String
virtualCash     Decimal
totalValue      Decimal
initialCapital  Decimal
createdAt       DateTime  @default(now())
updatedAt       DateTime  @updatedAt
```

**PortfolioHolding**
```
id                   String   @id @default(uuid())
portfolioId          String
etfTicker            String
targetWeight         Decimal
currentWeight        Decimal
units                Decimal
averagePurchasePrice Decimal
currentPrice         Decimal
currentValue         Decimal
gainLoss             Decimal
returnPct            Decimal
updatedAt            DateTime @updatedAt
```

**ETF (Master List)**
```
ticker                 String   @id
name                   String
assetClass             String
subCategory            String
historicalAnnualReturn Decimal
historicalVolatility   Decimal
expenseRatio           Decimal
esgEligible            Boolean
minimumInvestment      Decimal
```

**ETFCorrelation**
```
etfTickerA   String
etfTickerB   String
correlation  Decimal
@@id([etfTickerA, etfTickerB])
```

**Transaction**
```
id          String   @id @default(uuid())
portfolioId String
etfTicker   String
type        String   // BUY | SELL
units       Decimal
price       Decimal
totalValue  Decimal
reason      String   // MANUAL | REBALANCE | INITIAL
createdAt   DateTime @default(now())
```

**RebalancingLog**
```
id            String   @id @default(uuid())
portfolioId   String
triggeredAt   DateTime
trades        Json
approvedAt    DateTime?
status        String   // PENDING | APPROVED | REJECTED
```

**PriceSnapshot**
```
id        String   @id @default(uuid())
ticker    String
price     Decimal
currency  String   @default("USD")
takenAt   DateTime @default(now())
```

**CurrencySnapshot**
```
id        String   @id @default(uuid())
fromCcy   String
toCcy     String
rate      Decimal
takenAt   DateTime @default(now())
```

---

## 9. Backend Architecture

### API Routes (Next.js App Router)

```
POST   /api/kuberaa/onboarding/complete       — Save profile, run risk algorithm
GET    /api/kuberaa/profile                   — Get investor profile
PATCH  /api/kuberaa/profile                   — Update profile / override risk

GET    /api/kuberaa/allocation                — Get computed allocation
PATCH  /api/kuberaa/allocation                — User-edited allocation

GET    /api/kuberaa/etfs                      — Get master ETF list
GET    /api/kuberaa/etfs/suggest              — Get suggested ETFs for profile
POST   /api/kuberaa/portfolio/create          — Create portfolio from confirmed ETF selection
GET    /api/kuberaa/portfolio                 — Get portfolio with live values
GET    /api/kuberaa/portfolio/performance     — Get historical performance data

POST   /api/kuberaa/trade                     — Execute paper trade (buy/sell)
GET    /api/kuberaa/transactions              — Get transaction history

GET    /api/kuberaa/rebalance/check           — Run rebalancing check
POST   /api/kuberaa/rebalance/approve         — Approve rebalancing plan

GET    /api/kuberaa/currency/rate             — Get cached USD/INR rate
GET    /api/kuberaa/market/trends             — Proxy to Part 1 market data
```

### Background Jobs (Cron)

```
Weekly  — rebalancing drift check for all portfolios
Hourly  — USD/INR rate refresh
Every 15 min — ETF price snapshot for active portfolios
```

---

## 10. Rule-Based Algorithms

All algorithms are rule-based. No AI or ML models are used anywhere in Kuberaa.

| Algorithm | Input | Output | Location |
|---|---|---|---|
| Risk scoring | Onboarding answers | Score 0–100 + profile label | `lib/risk/scorer.ts` |
| Asset allocation | Risk score + constraints | Equity/Bond/Alt percentages | `lib/allocation/engine.ts` |
| ETF selection | Allocation + filters | Ranked ETF list per bucket | `lib/etf/selector.ts` |
| Expected return | Weights + historical returns | Portfolio expected return % | `lib/portfolio/metrics.ts` |
| Portfolio variance | Weights + volatilities + correlations | Volatility % | `lib/portfolio/metrics.ts` |
| Sharpe ratio | Return + volatility | Sharpe score | `lib/portfolio/metrics.ts` |
| Drift detection | Current vs target weights | Drift per holding | `lib/rebalance/engine.ts` |
| Rebalancing plan | Drift values + portfolio value | Buy/sell amounts | `lib/rebalance/engine.ts` |
| Paper trade execution | Buy/sell order | Updated holdings + cash | `lib/trading/executor.ts` |

---

## 11. Non-Functional Requirements

- **No AI anywhere** — all logic is deterministic and rule-based
- **User always in control** — no automatic execution of trades or rebalancing without user approval
- **Transparency** — every system recommendation must include a plain-language explanation of why
- **USD-first** — all internal storage and calculation in USD; INR is display-only
- **Paper trading only** — no real money, no brokerage API integration
- **Charts mandatory via MUI X Charts** — no other charting library
- **TypeScript strict mode** — no `any` types in financial calculation logic
- **Shared auth with main platform** — no separate login flow

---

## 12. Integration with Main Platform

- **Auth:** Kuberaa reads the existing session from the main platform. If the user is logged in on the main site, they are automatically logged in on Kuberaa.
- **UI:** Kuberaa borrows its UI components, design tokens, and layout system from the main platform. No separate design system.
- **Market data:** The market trends and live price charts in Kuberaa consume data already provided by Part 1. Kuberaa does not independently source this data.
- **Routing:** Kuberaa lives at `/kuberaa` or `/portfolio` within the main platform's domain. It is a Next.js route group, not a separate deployment.

---

## 13. Out of Scope

The following are explicitly not part of Version 1:

- Real brokerage integration or live trade execution
- AI-generated insights, recommendations, or summaries
- Tax loss harvesting or tax optimization
- Options, futures, crypto, or other non-ETF instruments
- Multiple portfolios per user
- Social or community features
- Mobile application
- Professional / fund manager accounts
- Client management features
- Notifications (email, push, SMS)
- PDF export of portfolio reports

---

## 14. Open Questions

| Question | Status |
|---|---|
| Which specific market data endpoint from Part 1 does Kuberaa consume? | To be confirmed with main platform team |
| What is the ETF price API rate limit on the chosen plan? | Confirm before launch |
| Should the correlation matrix be updateable by an admin? | Deferred to v2 |
| What is the rebalancing cron schedule — weekly or monthly? | Weekly (default), user-configurable |
| Should paper trading history persist if user resets their portfolio? | To be decided — lean toward yes for learning value |
| INR conversion — round to nearest rupee or show paise? | To be decided |

---

*Document version: 1.0 | Last updated: March 2026 | Product: Kuberaa | Owner: TBD*
