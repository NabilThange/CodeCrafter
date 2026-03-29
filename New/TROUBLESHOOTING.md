# Troubleshooting Guide

## Current Status

✅ Dependencies installed (Prisma 6, React 18)
✅ Prisma client generated
❌ Database connection failing (ECONNREFUSED)

## Issue: Database Connection Refused

### Error Message
```
code: 'ECONNREFUSED'
```

This means the database server is not accepting connections.

### Possible Causes & Solutions

#### 1. Supabase Project Paused (Most Likely)

**Symptom:** Free tier Supabase projects pause after inactivity

**Solution:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Find your project: `vpxnstuahohyogfszsfh`
3. Click "Resume" or "Restore" if paused
4. Wait 30-60 seconds for database to start
5. Try again: `npx prisma migrate dev --name init`

#### 2. Wrong Connection String

**Check your connection strings:**

Your current `.env.local`:
```
DATABASE_URL="postgresql://postgres.vpxnstuahohyogfszsfh:Nabil.44625@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.vpxnstuahohyogfszsfh:Nabil.44625@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

**Verify in Supabase:**
1. Go to Supabase Dashboard
2. Click "Connect" button (top right)
3. Select "ORMs" tab
4. Copy both connection strings
5. Replace `[YOUR-PASSWORD]` with your actual password

**Common mistakes:**
- Using port 6543 for DIRECT_URL (should be 5432)
- Missing `?pgbouncer=true` on DATABASE_URL
- Wrong password
- Wrong region (should match your project)

#### 3. Firewall or Network Issue

**Test connection:**
```powershell
# Test if you can reach Supabase
Test-NetConnection -ComputerName aws-1-ap-south-1.pooler.supabase.com -Port 5432
```

**If connection fails:**
- Check your firewall settings
- Try from a different network
- Check if your ISP blocks PostgreSQL ports

#### 4. Use Local PostgreSQL Instead

If Supabase isn't working, use local PostgreSQL:

**Install PostgreSQL:**
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Remember the password you set

**Create database:**
```powershell
# Open psql
psql -U postgres

# Create database
CREATE DATABASE unified_platform;
\q
```

**Update `.env.local`:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unified_platform"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unified_platform"
```

**Run migrations:**
```powershell
npx prisma migrate dev --name init
npx prisma db seed
```

## Step-by-Step Recovery

### Option A: Fix Supabase Connection (Recommended)

```powershell
# 1. Resume your Supabase project
# Go to supabase.com/dashboard and click "Resume"

# 2. Wait 60 seconds for database to start

# 3. Test connection
npx prisma db pull

# 4. If successful, run migrations
npx prisma migrate dev --name init

# 5. Seed database
npx prisma db seed

# 6. Start dev server
npm run dev
```

### Option B: Use Local PostgreSQL

```powershell
# 1. Install PostgreSQL (if not installed)
# Download from postgresql.org

# 2. Create database
psql -U postgres
CREATE DATABASE unified_platform;
\q

# 3. Update .env.local with local connection
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unified_platform"
# DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unified_platform"

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed database
npx prisma db seed

# 6. Start dev server
npm run dev
```

### Option C: Create New Supabase Project

```powershell
# 1. Go to supabase.com/dashboard
# 2. Click "New Project"
# 3. Choose region: ap-south-1 (Mumbai) or closest to you
# 4. Set database password (save it!)
# 5. Wait for project to be created (2-3 minutes)

# 6. Get connection strings
# Click "Connect" → "ORMs" tab
# Copy both connection strings

# 7. Update .env.local with new connection strings

# 8. Run migrations
npx prisma migrate dev --name init

# 9. Seed database
npx prisma db seed

# 10. Start dev server
npm run dev
```

## Verification Commands

### Test Database Connection
```powershell
# Quick test
npx prisma db pull

# Should output: "Prisma schema loaded from prisma\schema.prisma"
# If it fails, connection is not working
```

### Check Prisma Client
```powershell
# Regenerate if needed
npx prisma generate
```

### Check Environment Variables
```powershell
# View current DATABASE_URL (PowerShell)
Get-Content .env.local | Select-String "DATABASE_URL"
Get-Content .env.local | Select-String "DIRECT_URL"
```

### Test Seed Script
```powershell
# Run seed manually
npx tsx prisma/seed.ts
```

## Common Error Messages

### "Environment variable not found: DIRECT_URL"
**Solution:** Add DIRECT_URL to `.env.local`

### "ECONNREFUSED"
**Solution:** Database not running or wrong connection string

### "Authentication failed"
**Solution:** Wrong password in connection string

### "Database does not exist"
**Solution:** Create database first or check database name

### "Too many connections"
**Solution:** Use pooled connection (port 6543) for app, direct (port 5432) for migrations

## Next Steps After Fix

Once database connection works:

```powershell
# 1. Run migrations
npx prisma migrate dev --name init

# 2. Seed database
npx prisma db seed

# 3. Start dev server
npm run dev

# 4. Test in browser
# http://localhost:3000
# http://localhost:3000/portfolio
# http://localhost:3000/vane
```

## Still Having Issues?

### Check Logs
```powershell
# Enable Prisma debug logs
$env:DEBUG="prisma:*"
npx prisma migrate dev --name init
```

### Verify Supabase Status
1. Go to [status.supabase.com](https://status.supabase.com)
2. Check if there are any outages

### Contact Support
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- Prisma Discord: [pris.ly/discord](https://pris.ly/discord)

## Summary

**Most likely issue:** Supabase project is paused
**Quick fix:** Resume project in Supabase dashboard
**Alternative:** Use local PostgreSQL

---

**Last Updated:** 2026-03-29
**Status:** Database connection troubleshooting
