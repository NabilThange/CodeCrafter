# 🔧 Supabase Setup Guide for Unified Platform

## 📊 Current Setup Analysis

### ✅ What's Correct

Your Prisma schema follows most Supabase best practices:

1. **Primary Keys**: Using `uuid` with `@default(uuid())` ✅
2. **Indexes**: Good index coverage on foreign keys ✅
3. **Cascade Deletes**: Proper `onDelete: Cascade` relationships ✅
4. **Timestamps**: Using `DateTime` with `@default(now())` ✅
5. **Foreign Key Indexes**: All FK columns are indexed ✅

### ⚠️ Recommendations for Optimization

Based on Supabase best practices, here are improvements:

#### 1. Connection Pooling (CRITICAL)
Your current `DATABASE_URL` needs to use PgBouncer for connection pooling.

#### 2. Primary Key Strategy
Consider using `bigint identity` instead of `uuid` for better performance (optional).

---

## 🔑 Required Supabase API Keys

When you create a Supabase project, you'll need these keys:

### 1. DATABASE_URL (Required for Prisma)
**Format for Connection Pooling (Transaction Mode):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Format for Direct Connection (Migrations):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 2. NEXT_PUBLIC_SUPABASE_URL (Optional - if using Supabase Auth/Storage)
```
https://[PROJECT-REF].supabase.co
```

### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY (Optional - if using Supabase Auth/Storage)
This is the public anonymous key for client-side access.

### 4. SUPABASE_SERVICE_ROLE_KEY (Optional - for server-side admin operations)
This bypasses Row Level Security (RLS) - keep it secret!

---

## 📝 Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `unified-platform` (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

### Step 2: Get Your Connection Strings

After project creation, go to **Settings → Database**:

#### Connection Pooling URL (Use this for your app)
```
Host: aws-0-us-east-1.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.abcdefghijklmnop
Password: [your-password]
```

**Formatted as DATABASE_URL:**
```bash
postgresql://postgres.abcdefghijklmnop:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Direct Connection URL (Use this for migrations)
```
Host: db.abcdefghijklmnop.supabase.co
Port: 5432
```

**Formatted as DIRECT_URL:**
```bash
postgresql://postgres.abcdefghijklmnop:[PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### Step 3: Update Your Prisma Schema

Add the `directUrl` for migrations:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection
  directUrl = env("DIRECT_URL")        // Direct connection for migrations
}
```

### Step 4: Update .env.local

```bash
# Supabase Database (Connection Pooling - for app runtime)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Database (Direct Connection - for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Optional: If using Supabase Auth/Storage
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 5: Run Migrations

```bash
cd New

# Generate Prisma client
npx prisma generate

# Run migrations (uses DIRECT_URL)
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

---

## 🔧 Optimizing Your Schema for Supabase

### Option 1: Keep Current UUID Strategy (Recommended for Now)

Your current schema is fine. UUIDs work well for distributed systems.

**No changes needed** - proceed with current schema.

### Option 2: Optimize for Performance (Optional)

If you want maximum performance, switch to `bigint identity`:

```prisma
model User {
  id        BigInt   @id @default(autoincrement())
  // ... rest of fields
}
```

**Trade-offs:**
- ✅ Faster inserts (no UUID generation)
- ✅ Smaller indexes (8 bytes vs 16 bytes)
- ✅ Better cache locality
- ❌ Sequential IDs (predictable, may expose business metrics)
- ❌ Harder to merge databases

**Recommendation**: Stick with UUIDs for now. Optimize later if needed.

---

## 🚀 Connection Pooling Configuration

### Why Connection Pooling?

Without pooling:
- Each request = new connection
- 500 users = 500 connections = database crash
- Each connection uses 1-3MB RAM

With pooling (PgBouncer):
- 500 users share 10 connections
- Handles 10-100x more concurrent users

### Supabase Connection Modes

#### Transaction Mode (Recommended)
```
?pgbouncer=true
```
- Connection returned after each transaction
- Best for most applications
- Works with Prisma

#### Session Mode (Special Cases)
```
?pgbouncer=true&connection_limit=1
```
- Connection held for entire session
- Needed for: prepared statements, temp tables, advisory locks
- Use direct connection instead if you need these features

### Vercel Deployment

For Vercel, use connection pooling URL:
```bash
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## 📊 Monitoring Your Database

### Check Connection Count

```sql
SELECT count(*) FROM pg_stat_activity;
```

Should be ~10-20 connections with pooling, not 100+.

### Find Missing Indexes

```sql
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;
```

### Check Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔐 Security Best Practices

### Row Level Security (RLS)

If you want to use Supabase Auth with RLS:

```sql
-- Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can view own chats"
  ON "Chat"
  FOR SELECT
  USING (auth.uid()::text = "userId");
```

**Note**: RLS is optional. Your current setup works without it.

---

## 🎯 Quick Reference

### What You Need from Supabase Dashboard

1. **Settings → Database → Connection String**
   - Copy "Connection Pooling" URL → `DATABASE_URL`
   - Copy "Direct Connection" URL → `DIRECT_URL`

2. **Settings → API** (Optional - only if using Supabase Auth/Storage)
   - Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

### Environment Variables Summary

**Required (Minimum):**
```bash
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@db.[REF].supabase.co:5432/postgres"
```

**Optional (If using Supabase Auth/Storage):**
```bash
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
```

---

## 🐛 Troubleshooting

### Error: "prepared statement already exists"
**Solution**: You're using session mode with pooling. Switch to transaction mode:
```
?pgbouncer=true
```

### Error: "too many connections"
**Solution**: You're not using connection pooling. Use the pooler URL:
```
aws-0-[region].pooler.supabase.com:6543
```

### Error: "SSL connection required"
**Solution**: Add SSL mode to connection string:
```
?pgbouncer=true&sslmode=require
```

### Migrations are slow
**Solution**: Use `DIRECT_URL` for migrations, not pooled connection.

---

## 📚 Additional Resources

- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist

- [ ] Create Supabase project
- [ ] Copy connection pooling URL
- [ ] Copy direct connection URL
- [ ] Update `New/prisma/schema.prisma` with `directUrl`
- [ ] Update `New/.env.local` with both URLs
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npx prisma db seed`
- [ ] Test connection with `npx prisma studio`
- [ ] Deploy to Vercel with pooled URL

---

**Status**: Ready for Supabase setup  
**Next**: Create Supabase project and update environment variables  
**Last Updated**: 2026-03-29
