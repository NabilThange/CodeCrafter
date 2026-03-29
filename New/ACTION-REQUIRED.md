# ⚠️ ACTION REQUIRED - Database Connection Failed

## What Happened

Your test shows: **Network connection failed**

This means your Supabase database is not accepting connections.

## Most Likely Cause

**Your Supabase project is PAUSED** (free tier pauses after inactivity)

## Quick Fix (5 minutes)

### Step 1: Resume Your Supabase Project

1. Open your browser
2. Go to: https://supabase.com/dashboard
3. Find your project: `vpxnstuahohyogfszsfh`
4. Look for a "Resume" or "Restore" button
5. Click it and wait 60 seconds

### Step 2: Test Connection Again

```powershell
.\test-db-connection.ps1
```

You should see: "OK: Network connection successful"

### Step 3: Run Migrations

```powershell
npx prisma migrate dev --name init
```

### Step 4: Seed Database

```powershell
npx prisma db seed
```

### Step 5: Start Dev Server

```powershell
npm run dev
```

### Step 6: Open Browser

http://localhost:3000

---

## Alternative: Use Local PostgreSQL

If Supabase doesn't work or you prefer local development:

### Install PostgreSQL

1. Download: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for `postgres` user

### Create Database

```powershell
# Open psql (search for "SQL Shell" in Start menu)
# Press Enter for all defaults, then enter your password

CREATE DATABASE unified_platform;
\q
```

### Update .env.local

Replace your Supabase URLs with:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unified_platform"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unified_platform"
```

(Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation)

### Run Setup

```powershell
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

---

## Verification

After fixing, you should be able to:

✅ Run `.\test-db-connection.ps1` without errors
✅ Run `npx prisma migrate dev` successfully
✅ Run `npx prisma db seed` and see "15 ETFs seeded"
✅ Run `npm run dev` and access http://localhost:3000
✅ Navigate to http://localhost:3000/portfolio
✅ Navigate to http://localhost:3000/vane

---

## Current Status

- ✅ Dependencies installed (React 18, Prisma 6)
- ✅ Prisma client generated
- ✅ Environment variables configured
- ❌ Database connection failing
- ⏳ Waiting for you to resume Supabase project

---

## Need Help?

See `TROUBLESHOOTING.md` for detailed solutions.

---

**Last Updated:** 2026-03-29
**Next Action:** Resume Supabase project at https://supabase.com/dashboard
