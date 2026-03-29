# 🚀 Supabase Quick Start

## What You Need from Supabase

### 1. Create Project
Go to [supabase.com](https://supabase.com) → New Project

### 2. Get Connection Strings
**Settings → Database → Connection String**

#### Copy These Two URLs:

**Connection Pooling (for your app):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```
→ Put in `DATABASE_URL`

**Direct Connection (for migrations):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```
→ Put in `DIRECT_URL`

### 3. Optional: If Using Supabase Auth/Storage
**Settings → API**

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## 📝 Update Your .env.local

```bash
# Required
DATABASE_URL="postgresql://postgres.abcdefg:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abcdefg:[PASSWORD]@db.abcdefg.supabase.co:5432/postgres"

# Optional (only if using Supabase Auth/Storage)
NEXT_PUBLIC_SUPABASE_URL="https://abcdefg.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
```

---

## 🎯 Run Setup

```bash
cd New

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed

# Start dev server
npm run dev
```

---

## ✅ What's Already Configured

Your project is already set up with Supabase best practices:

- ✅ Connection pooling configured in Prisma schema
- ✅ Proper indexes on all foreign keys
- ✅ UUID primary keys for distributed systems
- ✅ Cascade deletes configured
- ✅ Timestamps on all tables

---

## 🔑 API Keys Summary

### Minimum Required (Just Database)
- `DATABASE_URL` - Pooled connection
- `DIRECT_URL` - Direct connection for migrations

### Optional (If Using Supabase Features)
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key for client
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key for server

**For this project, you only need the two database URLs.**

---

## 🐛 Common Issues

### "Too many connections"
→ Make sure you're using the **pooler** URL (port 6543), not direct (port 5432)

### "Prepared statement already exists"
→ Make sure your URL has `?pgbouncer=true`

### Migrations fail
→ Make sure `DIRECT_URL` is set (migrations need direct connection)

---

## 📚 Full Guide

See `SUPABASE-SETUP-GUIDE.md` for detailed explanations and troubleshooting.

---

**Next Step**: Create Supabase project and copy the two connection URLs!
