# Quick Start Guide - Windows

## Fixes Applied

1. **React Version**: Downgraded from 19 to 18 to match next-themes requirements
2. **Prisma Version**: Downgraded from 7.6.0 to 6.x to avoid breaking schema changes
3. **Next.js Security**: Note that Next.js 15.1.6 has a security vulnerability (will upgrade after testing)

## Step-by-Step Setup

### 0. Quick Fix (Recommended)

Run the automated fix script:

```powershell
cd New
.\fix-and-install.ps1
```

This will:
- Clean old installations
- Install dependencies with correct flags
- Generate Prisma client
- Check your environment setup

**OR** follow the manual steps below:

### 1. Install Dependencies

```powershell
cd New

# Clean install (recommended)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
- Handles peer dependency resolution for next-themes
- Prevents ERESOLVE errors
- Safe to use for this project

### 2. Set Up Environment Variables

```powershell
# Copy example file
Copy-Item .env.example .env.local

# Edit with your favorite editor
notepad .env.local
```

**Minimum Required Variables:**
```env
# Database (required)
DATABASE_URL="postgresql://postgres:password@localhost:5432/unified_platform"
DIRECT_URL="postgresql://postgres:password@localhost:5432/unified_platform"

# App URL (required)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Provider (choose one)
GROQ_API_KEY="gsk_..."  # Free tier available
# OR
OPENAI_API_KEY="sk-..."

# Market Data (for portfolio features)
FINNHUB_API_KEY="..."  # Free tier available
```

### 3. Set Up Database

**Option A: Use Supabase (Recommended)**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```

**Option B: Use Local PostgreSQL**

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Create database:
   ```powershell
   psql -U postgres
   CREATE DATABASE unified_platform;
   \q
   ```
3. Update `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/unified_platform"
   DIRECT_URL="postgresql://postgres:password@localhost:5432/unified_platform"
   ```

### 4. Initialize Database

```powershell
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with ETF data
npx prisma db seed
```

### 5. Start Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What to Test

### Test Justyoo (Portfolio) - 100% Ready ✅

1. Visit: http://localhost:3000/portfolio
2. Complete onboarding questionnaire
3. View ETF suggestions
4. Create a portfolio
5. Check rebalancing recommendations

### Test Vane (AI Chat) - 95% Ready ⚠️

1. Visit: http://localhost:3000/vane
2. Send a chat message
3. Try web search
4. Note: Some features may have errors (missing support files)

## Common Issues

### Issue: "npm install" fails

**Solution 1**: Use legacy peer deps
```powershell
npm install --legacy-peer-deps
```

**Solution 2**: Clear cache and retry
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

### Issue: Prisma 7 schema errors

**Already Fixed**: Downgraded to Prisma 6 to avoid breaking changes
```powershell
# If you see Prisma 7 errors, reinstall
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

### Issue: "Prisma Client not found"

**Solution**: Regenerate Prisma client
```powershell
npx prisma generate
```

### Issue: Database connection fails

**Solution**: Check your DATABASE_URL
```powershell
# Test connection
npx prisma db pull
```

### Issue: Port 3000 already in use

**Solution**: Use different port
```powershell
$env:PORT=3001; npm run dev
```

### Issue: Build fails with TypeScript errors

**Solution**: Check for missing types
```powershell
npm install --save-dev @types/node @types/react @types/react-dom --legacy-peer-deps
```

## Next Steps

1. **Get API Keys** (optional but recommended):
   - Groq (free): [console.groq.com](https://console.groq.com)
   - Finnhub (free): [finnhub.io](https://finnhub.io)
   - Supabase (free): [supabase.com](https://supabase.com)

2. **Test Features**:
   - Portfolio management (fully working)
   - AI chat (mostly working)
   - Check for any errors in console

3. **Deploy** (when ready):
   - Push to GitHub
   - Deploy to Vercel
   - Add environment variables
   - Run migrations in production

## Useful Commands

```powershell
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:generate      # Generate Prisma client

# Utilities
npm run lint             # Lint code
```

## Project Structure

```
New/
├── app/                    # Next.js pages
│   ├── (vane)/            # AI chat (Vane)
│   ├── portfolio/         # Portfolio management (Justyoo)
│   ├── monitor/           # WorldMonitor (not migrated yet)
│   └── api/               # API routes
├── lib/                   # Business logic
│   ├── vane/             # AI chat logic
│   ├── kuberaa/          # Portfolio logic
│   └── worldmonitor/     # Monitor logic
├── components/            # React components
├── prisma/               # Database schema & migrations
└── public/               # Static files
```

## Support

- Check `FINAL-MIGRATION-STATUS.md` for detailed status
- Check `SETUP.md` for detailed setup instructions
- Check `ARCHITECTURE.md` for system design

## Success Criteria

✅ npm install completes without errors
✅ Database migrations run successfully
✅ Dev server starts on http://localhost:3000
✅ Can access portfolio page
✅ Can access Vane chat page
✅ No critical errors in browser console

---

**Last Updated**: 2026-03-29
**Status**: Ready to Run
**Next Action**: `npm install --legacy-peer-deps`
