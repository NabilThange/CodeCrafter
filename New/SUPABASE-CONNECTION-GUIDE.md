# 🔌 Supabase Connection Guide - Complete Setup

## 📍 Where to Find Your Connection Strings in Supabase

### Step 1: Go to Your Supabase Dashboard
1. Open [supabase.com](https://supabase.com)
2. Select your project
3. Click the **"Connect"** button at the top of the page

### Step 2: Navigate to the Right Tab
You'll see a modal with multiple tabs. Click on **"ORMs"** tab (not "Connection String" tab!)

### Step 3: Copy the Connection Strings

You'll see two connection strings:

#### 🔵 Session Mode (Port 5432) - Use for DIRECT_URL
```
postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```
**Purpose**: Direct connection for migrations  
**Port**: 5432  
**Use in**: `DIRECT_URL`

#### 🟢 Transaction Mode (Port 6543) - Use for DATABASE_URL
```
postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```
**Purpose**: Pooled connection for your app  
**Port**: 6543  
**Use in**: `DATABASE_URL`

---

## 🔑 Understanding Supabase Keys

### Keys You'll See in Supabase Dashboard

When you go to **Settings → API**, you'll see:

1. **Project URL** (e.g., `https://abcdefg.supabase.co`)
2. **anon public** key (starts with `eyJhbGci...`)
3. **service_role** key (starts with `eyJhbGci...`)

### ❓ Which Keys Do You Need?

**For Database-Only Access (Your Case):**
- ✅ **Connection Strings** (from "Connect" button → "ORMs" tab)
- ❌ **NOT** the anon key
- ❌ **NOT** the service_role key
- ❌ **NOT** the Project URL

**When You Need the API Keys:**
- Only if using Supabase Auth (authentication)
- Only if using Supabase Storage (file uploads)
- Only if using Supabase Realtime (websockets)

**Since you're using Prisma directly, you DON'T need the API keys!**

---

## 📝 How to Update Your .env.local

### Step 1: Get Your Database Password
If you forgot your database password:
1. Go to **Settings → Database**
2. Click **"Reset database password"**
3. Copy the new password

### Step 2: Get Your Connection Strings
1. Click **"Connect"** button at top
2. Click **"ORMs"** tab
3. You'll see two strings with placeholders like `[YOUR-PASSWORD]`

### Step 3: Replace Placeholders
Replace `[YOUR-PASSWORD]` with your actual database password in both strings.

### Step 4: Update .env.local

```bash
# Connection Pooling URL (Transaction Mode - Port 6543)
DATABASE_URL="postgres://postgres.abcdefghijklmnop:[YOUR-ACTUAL-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection URL (Session Mode - Port 5432)
DIRECT_URL="postgres://postgres.abcdefghijklmnop:[YOUR-ACTUAL-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Important**: 
- DATABASE_URL uses port **6543** with `?pgbouncer=true`
- DIRECT_URL uses port **5432** without `?pgbouncer=true`

---

## 🎯 Real Example

Let's say:
- Your project ref: `abcdefghijklmnop`
- Your region: `us-east-1`
- Your password: `MySecurePassword123!`

Your .env.local would look like:

```bash
DATABASE_URL="postgres://postgres.abcdefghijklmnop:MySecurePassword123!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgres://postgres.abcdefghijklmnop:MySecurePassword123!@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

---

## 🔍 How to Identify Your Values

### Project Reference (PROJECT-REF)
- Found in your connection string
- Usually 20 random characters
- Example: `abcdefghijklmnop`
- Location: After `postgres.` in the connection string

### Region
- Found in your connection string
- Example: `us-east-1`, `eu-west-1`, `ap-southeast-1`
- Location: After `aws-0-` in the connection string

### Password
- The password you set when creating the project
- If forgotten, reset it in Settings → Database

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong: Using "Connection String" Tab
The default "Connection String" tab shows a direct connection that may not work with Prisma.

### ✅ Correct: Using "ORMs" Tab
The "ORMs" tab shows Prisma-specific connection strings that work properly.

### ❌ Wrong: Using Same Port for Both
```bash
# WRONG - both using 5432
DATABASE_URL="...pooler.supabase.com:5432/postgres"
DIRECT_URL="...pooler.supabase.com:5432/postgres"
```

### ✅ Correct: Different Ports
```bash
# CORRECT - different ports
DATABASE_URL="...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="...pooler.supabase.com:5432/postgres"
```

### ❌ Wrong: Forgetting ?pgbouncer=true
```bash
# WRONG - missing pgbouncer parameter
DATABASE_URL="...pooler.supabase.com:6543/postgres"
```

### ✅ Correct: Including ?pgbouncer=true
```bash
# CORRECT - has pgbouncer parameter
DATABASE_URL="...pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## 🧪 Testing Your Connection

After updating .env.local, test your connection:

```bash
cd New

# Test connection
npx prisma db pull

# If successful, you'll see:
# ✔ Introspected 0 models and wrote them into prisma/schema.prisma
```

If you get an error:
- Check your password is correct
- Check you're using port 6543 for DATABASE_URL
- Check you're using port 5432 for DIRECT_URL
- Check you have `?pgbouncer=true` on DATABASE_URL

---

## 📊 Visual Guide

```
Supabase Dashboard
    ↓
Click "Connect" Button (top of page)
    ↓
Click "ORMs" Tab (not "Connection String")
    ↓
See Two Connection Strings:
    ↓
┌─────────────────────────────────────────────┐
│ Session Mode (Port 5432)                    │
│ → Use for DIRECT_URL                        │
│ → For migrations                            │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Transaction Mode (Port 6543)                │
│ → Use for DATABASE_URL                      │
│ → For your app runtime                      │
│ → Has ?pgbouncer=true                       │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Checklist

- [ ] Created Supabase project
- [ ] Clicked "Connect" button
- [ ] Clicked "ORMs" tab (not "Connection String")
- [ ] Copied Session Mode string (port 5432) → DIRECT_URL
- [ ] Copied Transaction Mode string (port 6543) → DATABASE_URL
- [ ] Replaced [YOUR-PASSWORD] with actual password
- [ ] Verified DATABASE_URL has `?pgbouncer=true`
- [ ] Verified DIRECT_URL uses port 5432
- [ ] Verified DATABASE_URL uses port 6543
- [ ] Updated New/.env.local
- [ ] Tested with `npx prisma db pull`

---

## 💡 Pro Tips

1. **Password Special Characters**: If your password has special characters, you may need to URL-encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`

2. **Copy-Paste Carefully**: Don't copy extra spaces or line breaks

3. **Keep Passwords Secret**: Never commit .env.local to git (it's already in .gitignore)

4. **Test Early**: Test your connection before running migrations

---

## 🆘 Still Having Issues?

### Error: "Connection refused"
→ Check your project is running in Supabase dashboard

### Error: "Password authentication failed"
→ Reset your password in Settings → Database

### Error: "Prepared statement already exists"
→ Make sure DATABASE_URL has `?pgbouncer=true`

### Error: "Too many connections"
→ Make sure you're using the pooler URL (port 6543), not direct connection

---

**Last Updated**: 2026-03-29  
**Source**: [Supabase Official Docs](https://supabase.com/docs/guides/database/prisma)
