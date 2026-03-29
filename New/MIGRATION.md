# Migration Guide

This guide helps you migrate code from the three separate projects (Vane, Justyoo, WorldMonitor) into the unified platform.

## Overview

The unified platform uses a modular structure that keeps each feature isolated while sharing common infrastructure:

- **Shared**: Database, authentication, UI components
- **Isolated**: Business logic, API routes, feature-specific pages

## Migration Strategy

### Phase 1: Infrastructure (Complete)
✅ Next.js 15 setup
✅ Unified Prisma schema
✅ Shared configuration files
✅ Folder structure

### Phase 2: Copy Feature Code
- Copy business logic to `lib/`
- Copy API routes to `app/api/`
- Copy UI components to `app/` and `components/`

### Phase 3: Integration
- Update imports
- Unify authentication
- Share UI components
- Test cross-feature navigation

## Vane Migration

### 1. Business Logic
Copy from `Vane/src/lib/` to `New/lib/vane/`:

```bash
# Example files to migrate:
Vane/src/lib/providers/openai.ts → New/lib/vane/providers/openai.ts
Vane/src/lib/providers/anthropic.ts → New/lib/vane/providers/anthropic.ts
Vane/src/lib/providers/groq.ts → New/lib/vane/providers/groq.ts
Vane/src/lib/searxng.ts → New/lib/vane/search.ts
```

### 2. API Routes
Copy from `Vane/src/app/api/` to `New/app/api/vane/`:

```bash
Vane/src/app/api/chat/ → New/app/api/vane/chat/
Vane/src/app/api/models/ → New/app/api/vane/models/
Vane/src/app/api/search/ → New/app/api/vane/search/
```

### 3. UI Components
Copy from `Vane/src/components/` to `New/app/(vane)/`:

```bash
Vane/src/components/Chat.tsx → New/app/(vane)/vane/components/Chat.tsx
Vane/src/components/Sidebar.tsx → New/app/(vane)/vane/components/Sidebar.tsx
Vane/src/components/MessageBox.tsx → New/app/(vane)/vane/components/MessageBox.tsx
```

### 4. Update Imports
Change database imports:
```typescript
// Old (Vane)
import { db } from '@/lib/db';

// New (Unified)
import { prisma } from '@/lib/db';
```

Update schema references:
```typescript
// Old
await db.query.chats.findMany();

// New
await prisma.chat.findMany();
```

## Justyoo Migration

### 1. Business Logic
Copy from `justyoo/lib/` to `New/lib/kuberaa/`:

```bash
justyoo/lib/allocation/engine.ts → New/lib/kuberaa/allocation.ts
justyoo/lib/rebalance/engine.ts → New/lib/kuberaa/rebalance.ts
justyoo/lib/etf/selector.ts → New/lib/kuberaa/etf.ts
justyoo/lib/risk/scorer.ts → New/lib/kuberaa/risk.ts
```

### 2. API Routes
Copy from `justyoo/app/api/kuberaa/` to `New/app/api/kuberaa/`:

```bash
# Already matches structure, direct copy:
justyoo/app/api/kuberaa/ → New/app/api/kuberaa/
```

### 3. UI Components
Copy from `justyoo/app/kuberaa/` to `New/app/portfolio/`:

```bash
justyoo/app/kuberaa/dashboard/ → New/app/portfolio/dashboard/
justyoo/app/kuberaa/etfs/ → New/app/portfolio/etfs/
justyoo/app/kuberaa/allocation/ → New/app/portfolio/allocation/
```

### 4. Update Imports
Database client is already Prisma, minimal changes needed:
```typescript
// Old
import { prisma } from '@/lib/db';

// New (same)
import { prisma } from '@/lib/db';
```

## WorldMonitor Migration

### 1. Business Logic
Copy from `worldmonitor/server/` to `New/lib/worldmonitor/`:

```bash
# Example files:
worldmonitor/server/acled.ts → New/lib/worldmonitor/conflicts.ts
worldmonitor/server/aviation.ts → New/lib/worldmonitor/aviation.ts
worldmonitor/server/market.ts → New/lib/worldmonitor/market.ts
worldmonitor/server/fires.ts → New/lib/worldmonitor/fires.ts
```

### 2. API Routes
Create new API routes in `New/app/api/worldmonitor/`:

```bash
# Convert Vite API routes to Next.js:
worldmonitor/api/acled.ts → New/app/api/worldmonitor/conflicts/route.ts
worldmonitor/api/aviation.ts → New/app/api/worldmonitor/aviation/route.ts
```

### 3. UI Components
Copy from `worldmonitor/src/` to `New/app/monitor/`:

```bash
worldmonitor/src/components/ → New/app/monitor/components/
worldmonitor/src/layers/ → New/app/monitor/layers/
```

### 4. Update Imports
Convert Vite imports to Next.js:
```typescript
// Old (Vite)
import { API_URL } from '@/config';

// New (Next.js)
const API_URL = process.env.NEXT_PUBLIC_APP_URL;
```

## Common Updates

### 1. Environment Variables
Update all environment variable references:

```typescript
// Old (various formats)
process.env.VITE_API_KEY
process.env.REACT_APP_API_KEY

// New (Next.js)
process.env.API_KEY // Server-side
process.env.NEXT_PUBLIC_API_KEY // Client-side
```

### 2. Navigation
Update cross-app navigation:

```typescript
// Old (separate apps)
window.location.href = 'http://localhost:3001/portfolio';

// New (unified)
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/portfolio');
```

### 3. API Calls
Update API endpoints:

```typescript
// Old (Vane)
fetch('/api/chat', { ... });

// New (Unified)
fetch('/api/vane/chat', { ... });
```

### 4. Shared Components
Move common components to `components/shared/`:

```bash
# If multiple apps use similar components:
*/components/Button.tsx → New/components/shared/Button.tsx
*/components/Card.tsx → New/components/shared/Card.tsx
*/components/Modal.tsx → New/components/shared/Modal.tsx
```

## Testing After Migration

### 1. Database
```bash
# Test database connection
npx prisma db pull

# Run migrations
npx prisma migrate dev

# Seed data
npx prisma db seed
```

### 2. API Routes
Test each API endpoint:
```bash
# Vane
curl http://localhost:3000/api/vane/models

# Justyoo
curl http://localhost:3000/api/kuberaa/portfolio

# WorldMonitor
curl http://localhost:3000/api/worldmonitor/conflicts
```

### 3. UI Pages
Visit each page:
- http://localhost:3000/ (home)
- http://localhost:3000/vane (AI chat)
- http://localhost:3000/portfolio (portfolio)
- http://localhost:3000/monitor (intelligence)

## Checklist

### Vane
- [ ] Copy business logic to `lib/vane/`
- [ ] Copy API routes to `app/api/vane/`
- [ ] Copy UI components to `app/(vane)/`
- [ ] Update database imports
- [ ] Test chat functionality

### Justyoo
- [ ] Copy business logic to `lib/kuberaa/`
- [ ] Copy API routes to `app/api/kuberaa/`
- [ ] Copy UI components to `app/portfolio/`
- [ ] Test portfolio features
- [ ] Verify ETF data

### WorldMonitor
- [ ] Copy business logic to `lib/worldmonitor/`
- [ ] Create API routes in `app/api/worldmonitor/`
- [ ] Copy UI components to `app/monitor/`
- [ ] Convert Vite to Next.js
- [ ] Test data fetching

### Integration
- [ ] Unified navigation
- [ ] Shared authentication
- [ ] Cross-feature links
- [ ] Consistent styling
- [ ] Error handling

## Troubleshooting

### Import Errors
```bash
# Regenerate types
npx prisma generate
npm run build
```

### Database Errors
```bash
# Reset database
npx prisma migrate reset
npx prisma db seed
```

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

## Next Steps

After migration:
1. Test all features thoroughly
2. Update documentation
3. Configure CI/CD
4. Deploy to staging
5. Monitor for issues
