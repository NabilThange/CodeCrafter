# 🚀 Deployment Strategy - Vercel + Backend Services

## 📊 Current Status

### ✅ What's Complete (Infrastructure - 85%)
- Next.js 15 project structure
- Unified Prisma schema
- Merged dependencies
- Environment variables template
- Documentation
- Docker setup

### ❌ What's Missing (Features - 0%)
- Business logic implementations (all stubs)
- UI components (all placeholders)
- API implementations (all stubs)
- Authentication
- Testing setup

**Verdict**: The "New" folder is a **well-structured skeleton** ready for code migration, but has **no actual features implemented yet**.

---

## 🎯 Can We Deploy to Vercel?

### ✅ YES - These Components Work on Vercel

**1. Vane (AI Chat)** - 100% Vercel Compatible
- ✅ AI provider integrations (OpenAI, Anthropic, Groq)
- ✅ Streaming responses (Next.js 15 supports this)
- ✅ Web search
- ✅ Chat history (PostgreSQL)
- ✅ No background processes needed

**2. Justyoo (Portfolio)** - 100% Vercel Compatible
- ✅ Portfolio management
- ✅ ETF allocation engine
- ✅ Rebalancing (on-demand or Vercel Cron)
- ✅ Transaction tracking
- ✅ Market data fetching (API calls)
- ✅ No background processes needed

**3. WorldMonitor (Dashboard - Read-Only)** - 80% Vercel Compatible
- ✅ Display conflict data (fetch from API)
- ✅ Display market data (fetch from API)
- ✅ Display fire detection (fetch from API)
- ✅ Static map visualization
- ✅ Periodic data updates (Vercel Cron)

### ❌ NO - These Components Need Separate Backend

**WorldMonitor Real-Time Features:**

1. **WebSocket Server** ❌ Cannot run on Vercel
   - **Why**: Vercel functions are stateless and short-lived (max 60s)
   - **What it does**: Maintains persistent connections for real-time updates
   - **Solution**: Deploy on Railway/Render/AWS

2. **Telegram OSINT Poller** ❌ Cannot run on Vercel
   - **Why**: Long-running background process (runs 24/7)
   - **What it does**: Continuously polls Telegram channels for OSINT data
   - **Solution**: Deploy as separate service with cron job

3. **AIS/OpenSky Data Relay** ❌ Cannot run on Vercel
   - **Why**: Requires continuous polling and WebSocket connections
   - **What it does**: Fetches real-time vessel and aircraft positions
   - **Solution**: Deploy as separate relay server

4. **RSS Feed Aggregator** ⚠️ Possible but not ideal
   - **Why**: 435+ feeds need frequent polling
   - **What it does**: Aggregates news from 435 sources
   - **Solution**: Use Vercel Cron (limited) or separate service

---

## 🏗️ Recommended Architecture

### Option 1: Hybrid (Vercel + Render) - RECOMMENDED

```
┌─────────────────────────────────────────────────────────┐
│ Vercel (Next.js App) - FREE TIER                        │
│ ├─ Vane AI Chat ✅                                      │
│ ├─ Portfolio Management ✅                              │
│ └─ WorldMonitor Dashboard (read-only) ✅                │
└─────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
    ┌────────────┐    ┌──────────────┐    ┌──────────────┐
    │ Supabase   │    │ Upstash      │    │ External     │
    │ PostgreSQL │    │ Redis        │    │ APIs         │
    │ FREE TIER  │    │ FREE TIER    │    │ (various)    │
    └────────────┘    └──────────────┘    └──────────────┘
         ↓
    ┌──────────────────────────────────────────────────────┐
    │ Render.com (Backend Services) - FREE TIER            │
    │ ├─ WebSocket Server (Node.js)                        │
    │ ├─ Telegram Poller (Cron job)                        │
    │ ├─ AIS/OpenSky Relay (Background worker)             │
    │ └─ RSS Aggregator (Cron job)                         │
    └──────────────────────────────────────────────────────┘
```

**Cost**: $0/month (all free tiers)

**Pros**:
- ✅ All features work
- ✅ Real-time updates
- ✅ Scalable
- ✅ Free tier available

**Cons**:
- ⚠️ More complex setup
- ⚠️ Two deployments to manage

---

### Option 2: Vercel Only (Simplified)

```
┌─────────────────────────────────────────────────────────┐
│ Vercel (Next.js App) - FREE TIER                        │
│ ├─ Vane AI Chat ✅                                      │
│ ├─ Portfolio Management ✅                              │
│ └─ WorldMonitor Dashboard (polling only) ⚠️             │
│    - No real-time updates                               │
│    - Periodic refresh (5-15 min intervals)              │
│    - No WebSocket support                               │
└─────────────────────────────────────────────────────────┘
         ↓                    ↓
    ┌────────────┐    ┌──────────────┐
    │ Supabase   │    │ Upstash      │
    │ PostgreSQL │    │ Redis        │
    │ FREE TIER  │    │ FREE TIER    │
    └────────────┘    └──────────────┘
```

**Cost**: $0/month

**Pros**:
- ✅ Simple deployment
- ✅ Single platform
- ✅ Easy to manage

**Cons**:
- ❌ No real-time updates
- ❌ Limited WorldMonitor features
- ❌ Polling only (slower)

---

## 📋 Deployment Plan

### Phase 1: Migrate Code (2-3 weeks)

**Week 1: Vane + Justyoo**
1. Copy Vane business logic → `New/lib/vane/`
2. Copy Vane UI components → `New/app/(vane)/`
3. Copy Justyoo business logic → `New/lib/kuberaa/`
4. Copy Justyoo UI components → `New/app/portfolio/`
5. Test locally

**Week 2: WorldMonitor (Basic)**
1. Copy WorldMonitor data fetching → `New/lib/worldmonitor/`
2. Copy WorldMonitor UI (static) → `New/app/monitor/`
3. Implement API routes for data fetching
4. Test locally

**Week 3: Integration**
1. Unified navigation
2. Shared components
3. Error handling
4. Loading states
5. Polish UI/UX

### Phase 2: Deploy to Vercel (2-3 days)

**Day 1: Setup**
1. Create Vercel project
2. Connect GitHub repository
3. Configure environment variables
4. Set up Supabase database
5. Set up Upstash Redis

**Day 2: Deploy & Test**
1. Deploy to staging
2. Run database migrations
3. Test all features
4. Fix issues

**Day 3: Production**
1. Deploy to production
2. Monitor errors
3. Verify all features work
4. Set up analytics

### Phase 3: Backend Services (Optional - 1 week)

**Only if you want real-time WorldMonitor features**

1. Create Render.com account
2. Deploy WebSocket server
3. Deploy Telegram poller
4. Deploy AIS/OpenSky relay
5. Connect to Vercel app
6. Test real-time updates

---

## 🔑 Environment Variables Needed

### Required (Minimum for Vane + Portfolio)

```bash
# Database
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# AI (choose one)
OPENAI_API_KEY="sk-..."
# OR
GROQ_API_KEY="gsk_..."

# Market Data (for Portfolio)
FINNHUB_API_KEY="..."

# Cache (recommended)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Optional (For Full WorldMonitor)

```bash
# Intelligence APIs
ACLED_EMAIL="..."
ACLED_PASSWORD="..."
AVIATIONSTACK_API="..."
NASA_FIRMS_API_KEY="..."
EIA_API_KEY="..."
FRED_API_KEY="..."

# Backend Services
WS_RELAY_URL="https://your-render-app.onrender.com"
RELAY_SHARED_SECRET="..."
```

---

## 💰 Cost Breakdown

### Free Tier (Recommended for MVP)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Hobby | $0 | 100GB bandwidth, unlimited requests |
| Supabase | Free | $0 | 500MB database, 2GB bandwidth |
| Upstash | Free | $0 | 10K commands/day |
| Render | Free | $0 | 750 hours/month (sleeps after 15min) |
| **Total** | | **$0/month** | Good for MVP/demo |

### Paid Tier (For Production)

| Service | Plan | Cost | Benefits |
|---------|------|------|----------|
| Vercel | Pro | $20/month | More bandwidth, team features |
| Supabase | Pro | $25/month | 8GB database, better performance |
| Upstash | Pay-as-you-go | ~$5/month | More commands |
| Render | Starter | $7/month | No sleep, better performance |
| **Total** | | **$57/month** | Production-ready |

---

## 🎯 Recommended Approach

### For MVP/Demo (Start Here)

**Deploy to Vercel Only (Option 2)**
- ✅ Vane AI Chat (full features)
- ✅ Portfolio Management (full features)
- ⚠️ WorldMonitor (basic, no real-time)

**Why**: 
- Fastest to deploy
- $0 cost
- 80% of features work
- Good for testing/demo

**Timeline**: 2-3 weeks

### For Production (Later)

**Add Backend Services (Option 1)**
- ✅ All features
- ✅ Real-time updates
- ✅ Full WorldMonitor

**Why**:
- Complete feature set
- Better user experience
- Still affordable ($0-57/month)

**Timeline**: +1 week after MVP

---

## 📝 Step-by-Step Deployment

### 1. Prepare Code

```bash
cd New

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# Set up database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Test locally
npm run dev
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add OPENAI_API_KEY
# ... add all other variables

# Deploy to production
vercel --prod
```

### 3. Set Up Backend Services (Optional)

**On Render.com:**

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `node server/websocket.js`
5. Add environment variables
6. Deploy

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error**: "Module not found"
→ Check all imports use correct paths
→ Run `npm run build` locally first

**Error**: "Prisma client not generated"
→ Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Issues

**Error**: "Too many connections"
→ Use connection pooling URL (port 6543)
→ Check `DATABASE_URL` has `?pgbouncer=true`

**Error**: "Migration failed"
→ Use `DIRECT_URL` for migrations
→ Run migrations manually: `npx prisma migrate deploy`

### API Timeouts

**Error**: "Function execution timed out"
→ Vercel functions have 10s limit (free) or 60s (pro)
→ Move long-running tasks to background service

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All code migrated from three projects
- [ ] All imports updated
- [ ] Local build succeeds: `npm run build`
- [ ] TypeScript check passes: `npx tsc --noEmit`
- [ ] ESLint passes: `npm run lint`
- [ ] Database migrations ready
- [ ] Environment variables documented

### Vercel Setup
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Environment variables added
- [ ] Build settings configured
- [ ] Custom domain (optional)

### Database Setup
- [ ] Supabase project created
- [ ] Connection strings copied
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Database seeded
- [ ] Connection pooling enabled

### Testing
- [ ] Staging deployment works
- [ ] All pages load
- [ ] All API routes respond
- [ ] Database queries work
- [ ] AI chat works
- [ ] Portfolio features work
- [ ] WorldMonitor displays data

### Production
- [ ] Deploy to production
- [ ] Verify all features
- [ ] Monitor errors (Sentry)
- [ ] Set up analytics
- [ ] Document deployment

---

## 🎉 Summary

**Current State**: Infrastructure complete, features need migration

**Can Deploy to Vercel**: YES, but with limitations
- ✅ Vane: 100% compatible
- ✅ Portfolio: 100% compatible
- ⚠️ WorldMonitor: 80% compatible (no real-time)

**Recommended Path**:
1. Start with Vercel-only deployment (MVP)
2. Add backend services later (production)

**Timeline**:
- MVP: 2-3 weeks
- Production: +1 week

**Cost**:
- MVP: $0/month
- Production: $0-57/month

**Next Step**: Start migrating code from the three original projects!
