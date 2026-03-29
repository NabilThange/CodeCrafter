# 🎯 Supabase Connection Cheatsheet

## 🚀 Quick Setup (3 Steps)

### 1️⃣ Get Connection Strings
```
Supabase Dashboard → "Connect" Button → "ORMs" Tab
```

### 2️⃣ Copy Two Strings

**Transaction Mode (Port 6543)** → `DATABASE_URL`
```
postgres://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Session Mode (Port 5432)** → `DIRECT_URL`
```
postgres://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### 3️⃣ Update .env.local
Replace `[REF]`, `[PASS]`, and `[REGION]` with your actual values.

---

## 🔑 Do I Need API Keys?

### ❌ You DON'T Need:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Project ID
- anon key
- service_role key

### ✅ You ONLY Need:
- `DATABASE_URL` (connection string with port 6543)
- `DIRECT_URL` (connection string with port 5432)

**Why?** You're using Prisma to connect directly to PostgreSQL. The API keys are only needed if you use Supabase Auth, Storage, or Realtime features.

---

## 📍 Where to Find What

| What You Need | Where to Find It |
|---------------|------------------|
| Connection Strings | Dashboard → "Connect" → "ORMs" tab |
| Database Password | Settings → Database → Reset Password |
| Project Reference | In the connection string (after `postgres.`) |
| Region | In the connection string (after `aws-0-`) |

---

## ✅ Correct Format

```bash
# ✅ CORRECT
DATABASE_URL="postgres://postgres.abcdefg:MyPass123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres.abcdefg:MyPass123@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

## ❌ Common Mistakes

```bash
# ❌ WRONG - Same port for both
DATABASE_URL="...pooler.supabase.com:5432/postgres"
DIRECT_URL="...pooler.supabase.com:5432/postgres"

# ❌ WRONG - Missing ?pgbouncer=true
DATABASE_URL="...pooler.supabase.com:6543/postgres"

# ❌ WRONG - Using db. instead of pooler.
DATABASE_URL="...@db.abcdefg.supabase.co:5432/postgres"
```

---

## 🧪 Test Your Connection

```bash
cd New
npx prisma db pull
```

**Success**: `✔ Introspected 0 models`  
**Failure**: Check password, ports, and format

---

## 🎯 Port Reference

| Port | Mode | Use For | Variable |
|------|------|---------|----------|
| 6543 | Transaction | App runtime | `DATABASE_URL` |
| 5432 | Session | Migrations | `DIRECT_URL` |

---

## 💡 Remember

1. Click **"ORMs"** tab, not "Connection String"
2. Port **6543** for `DATABASE_URL`
3. Port **5432** for `DIRECT_URL`
4. Add `?pgbouncer=true` to `DATABASE_URL`
5. Replace `[YOUR-PASSWORD]` with actual password

---

**Full Guide**: See `SUPABASE-CONNECTION-GUIDE.md`
