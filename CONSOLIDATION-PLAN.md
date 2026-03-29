# 🎯 Project Consolidation Plan

## Executive Summary

Consolidating three separate projects into a single Next.js application deployable to Vercel with Supabase PostgreSQL.

**Current State:**
- **Justyoo**: Next.js 14 + PostgreSQL (Portfolio Management)
- **Vane**: Next.js 16 + SQLite (AI Search)
- **WorldMonitor**: Vite + TypeScript (Intelligence Dashboard)

**Target State:**
- Single Next.js 15 monorepo in `/New` folder
- Supabase PostgreSQL for all data
- Vercel deployment ready
- Unified authentication and navigation

---

## 📊 Project Analysis

### Justyoo (Kuberaa)
- **Purpose**: ETF-based portfolio management with risk profiling
- **Tech**: Next.js 14, Prisma, PostgreSQL, MUI
- **Database**: 10 tables (User, Portfolio, ETF, Transaction, etc.)
- **APIs**: 15+ endpoints for portfolio management
- **Status**: ✅ Production-ready

### Vane
- **Purpose**: AI-powered search engine with multi-provider support
- **Tech**: Next.js 16, Drizzle ORM, SQLite, Headless UI
- **Database**: 4 tables (Chat, Message, Provider, Settings)
- **APIs**: 10+ endpoints for AI chat and search
- **Status**: ✅ Production-ready

### WorldMonitor
- **Purpose**: Real-time global intelligence dashboard
- **Tech**: Vanilla TypeScript, Vite, globe.gl, deck.gl
- **Database**: None (API-based with Convex for registration)
- **APIs**: 22 Protocol Buffer services
- **Status**: ✅ Production-ready, but needs Next.js conversion

---

## 🏗️ Consolidation Strategy

### Phase 1: Infrastructure Setup ✅ COMPLETE
- [x] Create Next.js 15 project structure
- [x] Unified Prisma schema
- [x] Merged package.json dependencies
- [x] Environment variable template
- [x] Documentation (README, SETUP, MIGRATION, ARCHITECTURE)
- [x] Docker configuration

**Location**: `/New` folder

### Phase 2: Database Migration (Week 1)
**Goal**: Single Supabase PostgreSQL instance for all data

#### 2.1 Supabase Setup
- [ ] Create Supabase project
- [ ] Get connection string
- [ ] Configure connection pooling (PgBouncer)
- [ ] Set up environment variables

#### 2.2 Migrate Justyoo Data
- [ ] Run Prisma migrations on Supabase
- [ ] Seed ETF data (15 ETFs + correlations)
- [ ] Test Prisma client connection
- [ ] Verify all queries work

#### 2.3 Migrate Vane Data
- [ ] Convert Drizzle schema to Prisma
- [ ] Export SQLite data
- [ ] Import to Supabase
- [ ] Update queries from Drizzle to Prisma

### Phase 3: Vane Migration (Week 1-2)
**Goal**: Copy Vane features into unified app

#### 3.1 Business Logic
Copy from `Vane/src/lib/` to `New/lib/vane/`:
- [ ] AI provider integrations (OpenAI, Anthropic, Groq, Ollama)
- [ ] Search functionality (SearxNG integration)
- [ ] Chat logic and streaming
- [ ] Model management
- [ ] Document processing

#### 3.2 API Routes
Copy from `Vane/src/app/api/` to `New/app/api/vane/`:
- [ ] `/api/vane/chat` — AI chat endpoint
- [ ] `/api/vane/search` — Web search
- [ ] `/api/vane/models` — Available models
- [ ] `/api/vane/images` — Image search
- [ ] `/api/vane/videos` — Video search

#### 3.3 UI Components
Copy from `Vane/src/` to `New/app/(vane)/`:
- [ ] Chat interface
- [ ] Message components
- [ ] Sidebar navigation
- [ ] Settings panel
- [ ] Search interface

#### 3.4 Testing
- [ ] Test AI chat with all providers
- [ ] Test web search
- [ ] Test model switching
- [ ] Test streaming responses

### Phase 4: Justyoo Migration (Week 2)
**Goal**: Copy Justyoo features into unified app

#### 4.1 Business Logic
Copy from `justyoo/lib/` to `New/lib/kuberaa/`:
- [ ] Allocation engine
- [ ] Rebalancing logic
- [ ] ETF selection
- [ ] Risk scoring
- [ ] Currency conversion
- [ ] Portfolio metrics

#### 4.2 API Routes
Copy from `justyoo/app/api/kuberaa/` to `New/app/api/kuberaa/`:
- [ ] Portfolio CRUD
- [ ] ETF data and suggestions
- [ ] Rebalancing engine
- [ ] Transaction history
- [ ] Profile management
- [ ] Onboarding flow

#### 4.3 UI Components
Copy from `justyoo/app/kuberaa/` to `New/app/portfolio/`:
- [ ] Dashboard
- [ ] ETF browser
- [ ] Allocation view
- [ ] Rebalancing interface
- [ ] Transactions view
- [ ] Onboarding flow
- [ ] Profile page

#### 4.4 Testing
- [ ] Test portfolio creation
- [ ] Test ETF suggestions
- [ ] Test rebalancing
- [ ] Test transactions
- [ ] Test onboarding flow

### Phase 5: WorldMonitor Migration (Week 3-4)
**Goal**: Convert WorldMonitor from Vite to Next.js

#### 5.1 Business Logic
Copy from `worldmonitor/server/` to `New/lib/worldmonitor/`:
- [ ] Conflict data (ACLED, UCDP)
- [ ] Aviation tracking
- [ ] Market data
- [ ] Fire detection (NASA FIRMS)
- [ ] Internet outages
- [ ] Vessel tracking
- [ ] Economic data

#### 5.2 API Routes
Create new Next.js API routes in `New/app/api/worldmonitor/`:
- [ ] `/api/worldmonitor/conflicts` — Conflict data
- [ ] `/api/worldmonitor/aviation` — Flight tracking
- [ ] `/api/worldmonitor/market` — Market data
- [ ] `/api/worldmonitor/fires` — Fire detection
- [ ] `/api/worldmonitor/outages` — Internet outages
- [ ] `/api/worldmonitor/vessels` — Ship tracking

#### 5.3 UI Components
Convert from `worldmonitor/src/` to `New/app/monitor/`:
- [ ] Map component (globe.gl + deck.gl)
- [ ] Layer controls
- [ ] Data panels
- [ ] Timeline
- [ ] Filters
- [ ] Settings

**Challenge**: WorldMonitor uses Vite + vanilla TypeScript. Need to:
- Convert to React components
- Adapt globe.gl for Next.js SSR
- Handle client-side only rendering
- Optimize bundle size

#### 5.4 Testing
- [ ] Test conflict data display
- [ ] Test aviation tracking
- [ ] Test market data
- [ ] Test fire detection
- [ ] Test map interactions

### Phase 6: Integration (Week 4)
**Goal**: Unify features and polish

#### 6.1 Shared Components
Create in `New/components/shared/`:
- [ ] Navigation component
- [ ] Button component
- [ ] Card component
- [ ] Modal component
- [ ] Loading component
- [ ] Error boundary

#### 6.2 Authentication (Optional)
- [ ] Set up Clerk or NextAuth
- [ ] Create auth middleware
- [ ] Add login/logout
- [ ] Protect routes
- [ ] Link User table to features

#### 6.3 Cross-Feature Integration
- [ ] Navigation between features
- [ ] Shared user context
- [ ] Consistent styling
- [ ] Error handling
- [ ] Loading states

#### 6.4 Testing
- [ ] Test navigation between features
- [ ] Test authentication flow
- [ ] Test shared components
- [ ] Test error handling

### Phase 7: Deployment (Week 5)
**Goal**: Deploy to Vercel

#### 7.1 Preparation
- [ ] Configure environment variables on Vercel
- [ ] Set up Supabase connection pooling
- [ ] Configure Redis (Upstash)
- [ ] Test build locally
- [ ] Fix TypeScript errors
- [ ] Fix ESLint errors

#### 7.2 Staging Deployment
- [ ] Deploy to Vercel staging
- [ ] Test all features
- [ ] Check performance
- [ ] Verify database
- [ ] Test API endpoints

#### 7.3 Production Deployment
- [ ] Deploy to production
- [ ] Monitor errors (Sentry)
- [ ] Check performance
- [ ] Verify all features
- [ ] Set up analytics

---

## 🗂️ File Migration Map

### Vane → New
```
Vane/src/lib/providers/          → New/lib/vane/providers/
Vane/src/lib/searxng.ts          → New/lib/vane/search.ts
Vane/src/app/api/chat/           → New/app/api/vane/chat/
Vane/src/components/Chat.tsx     → New/app/(vane)/vane/components/Chat.tsx
```

### Justyoo → New
```
justyoo/lib/allocation/          → New/lib/kuberaa/allocation.ts
justyoo/lib/rebalance/           → New/lib/kuberaa/rebalance.ts
justyoo/app/api/kuberaa/         → New/app/api/kuberaa/
justyoo/app/kuberaa/dashboard/   → New/app/portfolio/dashboard/
```

### WorldMonitor → New
```
worldmonitor/server/acled.ts     → New/lib/worldmonitor/conflicts.ts
worldmonitor/api/aviation.ts     → New/app/api/worldmonitor/aviation/route.ts
worldmonitor/src/components/     → New/app/monitor/components/
```

---

## 🔧 Technical Decisions

### Database: Supabase PostgreSQL
**Why:**
- Managed PostgreSQL (no ops)
- Free tier available
- Connection pooling (PgBouncer)
- Good performance
- Easy migration from existing PostgreSQL

**Migration:**
- Justyoo: Already uses PostgreSQL → Direct migration
- Vane: SQLite → Export/import to PostgreSQL
- WorldMonitor: No database → N/A

### ORM: Prisma
**Why:**
- Type-safe
- Excellent migration system
- Already used by Justyoo
- Better than Drizzle for PostgreSQL

**Migration:**
- Justyoo: Already uses Prisma → No change
- Vane: Drizzle → Convert to Prisma
- WorldMonitor: N/A

### Caching: Upstash Redis
**Why:**
- Serverless Redis
- Free tier available
- Edge-compatible
- Low latency

**Usage:**
- WorldMonitor API caching
- Rate limiting
- Session storage

### Framework: Next.js 15
**Why:**
- Latest features (App Router, Server Components)
- Built-in API routes
- Excellent TypeScript support
- Easy Vercel deployment

**Migration:**
- Vane: Next.js 16 → Next.js 15 (minor downgrade)
- Justyoo: Next.js 14 → Next.js 15 (upgrade)
- WorldMonitor: Vite → Next.js 15 (major rewrite)

---

## 🚀 Deployment Architecture

```
vercel.yourdomain.com
├── / (Vane - AI Search)
│   ├── /api/vane/chat
│   ├── /api/vane/search
│   └── /api/vane/models
├── /portfolio (Justyoo)
│   ├── /api/kuberaa/portfolio
│   ├── /api/kuberaa/etfs
│   └── /api/kuberaa/rebalance
└── /monitor (WorldMonitor)
    ├── /api/worldmonitor/conflicts
    ├── /api/worldmonitor/aviation
    └── /api/worldmonitor/market

External Services:
├── Supabase PostgreSQL (database)
├── Upstash Redis (caching)
├── Vercel Edge Functions (API routes)
└── Various API providers (Groq, Finnhub, ACLED, etc.)
```

---

## 📋 Environment Variables

### Required
- `DATABASE_URL` — Supabase PostgreSQL connection
- `NEXT_PUBLIC_APP_URL` — Application URL

### AI Providers (choose one or more)
- `OPENAI_API_KEY` — OpenAI
- `ANTHROPIC_API_KEY` — Claude
- `GROQ_API_KEY` — Groq (recommended for dev)
- `OLLAMA_API_URL` — Ollama (self-hosted)

### Market Data
- `FINNHUB_API_KEY` — Stock quotes
- `POLYGON_API_KEY` — ETF prices

### Intelligence Data
- `ACLED_EMAIL` + `ACLED_PASSWORD` — Conflict data
- `AVIATIONSTACK_API` — Flight tracking
- `NASA_FIRMS_API_KEY` — Fire detection

### Caching
- `UPSTASH_REDIS_REST_URL` — Redis URL
- `UPSTASH_REDIS_REST_TOKEN` — Redis token

---

## ⚠️ Challenges & Solutions

### Challenge 1: WorldMonitor Framework Mismatch
**Problem**: WorldMonitor uses Vite + vanilla TypeScript, not React
**Solution**: 
- Convert to React components
- Use `'use client'` directive for client-only code
- Lazy load heavy libraries (globe.gl, deck.gl)
- Use dynamic imports with `ssr: false`

### Challenge 2: Database Migration
**Problem**: Vane uses SQLite, Justyoo uses PostgreSQL
**Solution**:
- Migrate both to Supabase PostgreSQL
- Convert Vane's Drizzle ORM to Prisma
- Export SQLite data, import to PostgreSQL

### Challenge 3: Different Next.js Versions
**Problem**: Vane (16), Justyoo (14), Target (15)
**Solution**:
- Use Next.js 15 as middle ground
- Test all features after migration
- Update deprecated APIs

### Challenge 4: Bundle Size
**Problem**: WorldMonitor has large dependencies (globe.gl, deck.gl)
**Solution**:
- Code splitting
- Lazy loading
- Dynamic imports
- Separate chunks for each feature

---

## 📊 Progress Tracking

### Overall Progress
- [x] Phase 1: Infrastructure (100%)
- [ ] Phase 2: Database Migration (0%)
- [ ] Phase 3: Vane Migration (0%)
- [ ] Phase 4: Justyoo Migration (0%)
- [ ] Phase 5: WorldMonitor Migration (0%)
- [ ] Phase 6: Integration (0%)
- [ ] Phase 7: Deployment (0%)

**Total: 14% complete (1/7 phases)**

---

## 🎯 Success Criteria

### Functional
- [ ] All Vane features work (AI chat, search)
- [ ] All Justyoo features work (portfolio, rebalancing)
- [ ] All WorldMonitor features work (map, data layers)
- [ ] Navigation between features works
- [ ] Database operations work
- [ ] API endpoints respond correctly

### Performance
- [ ] Page load < 3 seconds
- [ ] API response < 1 second
- [ ] Database queries < 500ms
- [ ] No memory leaks
- [ ] Lighthouse score > 90

### Deployment
- [ ] Builds successfully on Vercel
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] No runtime errors
- [ ] Monitoring set up

---

## 📚 Documentation

### Created
- [x] README.md — Project overview
- [x] SETUP.md — Setup instructions
- [x] MIGRATION.md — Migration guide
- [x] ARCHITECTURE.md — System design
- [x] CHECKLIST.md — Implementation tracking
- [x] PROJECT-SUMMARY.md — What was created
- [x] CONSOLIDATION-PLAN.md — This file

### To Create
- [ ] API.md — API documentation
- [ ] DEPLOYMENT.md — Deployment guide
- [ ] TROUBLESHOOTING.md — Common issues
- [ ] CONTRIBUTING.md — Contribution guidelines

---

## 🚀 Next Steps

### Immediate (Today)
1. Set up Supabase PostgreSQL instance
2. Configure environment variables
3. Run Prisma migrations
4. Seed database

### This Week
1. Migrate Vane business logic
2. Migrate Vane API routes
3. Migrate Vane UI components
4. Test Vane features

### Next Week
1. Migrate Justyoo business logic
2. Migrate Justyoo API routes
3. Migrate Justyoo UI components
4. Test Justyoo features

### Following Weeks
1. Convert WorldMonitor to Next.js
2. Integrate all features
3. Polish UI/UX
4. Deploy to Vercel

---

## 📞 Support

- **Setup Issues**: See SETUP.md
- **Migration Help**: See MIGRATION.md
- **Architecture Questions**: See ARCHITECTURE.md
- **Deployment Help**: See DEPLOYMENT.md (to be created)

---

**Last Updated**: 2026-03-29
**Status**: Phase 1 Complete, Ready for Phase 2
