# 🎯 INVESTOR DEMO - READY IN 5 MINUTES

## 🚨 STOP! Read This First

You have 3 apps that need to work as ONE platform. Here's the ONLY way to do it properly:

---

## ✅ THE RIGHT WAY: Docker Compose

### Step 1: Clean Up (30 seconds)

Close ALL PowerShell windows, then run:

```powershell
# Stop everything
docker-compose down
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean Docker
docker stop $(docker ps -aq) 2>$null
docker rm $(docker ps -aq) 2>$null
```

### Step 2: Start Everything (2-3 minutes)

```powershell
docker-compose up --build
```

**Wait for these messages:**
```
vane            | ✓ Ready in X.Xs
justyoo         | ✓ Ready in X.Xs  
worldmonitor    | ➜  Local:   http://localhost:5173/
nginx-proxy     | (no errors)
```

### Step 3: Open Browser

Go to: **http://localhost**

You should see Vane (AI Search).

### Step 4: Test Navigation

- Click "Portfolio" → Should go to portfolio dashboard
- Click "🌍 Monitor" → Should go to WorldMonitor
- Click "Home" → Should go back to Vane

---

## 🎭 Demo Flow (2 Minutes)

1. **Start at http://localhost**
   - "This is our AI search engine with multi-provider support"
   - Show search, chat interface

2. **Click "Portfolio" in sidebar**
   - "This is our portfolio management system"
   - Show dashboard, ETF selection

3. **Click "🌍 Monitor" in top nav**
   - "This is our global intelligence platform"
   - Show 3D globe, news feeds

4. **Click "Home" in sidebar**
   - "Notice how everything is integrated seamlessly"

---

## ❌ Common Mistakes

### DON'T use `start-dev.ps1`
- That's for local development
- Doesn't include nginx
- Apps run on separate ports
- Won't work for unified demo

### DON'T run apps manually
- Port conflicts
- No database
- No routing
- Messy

### DO use `docker-compose up`
- Everything configured
- All services included
- One command
- Works perfectly

---

## 🐛 Troubleshooting

### "Port 80 is already in use"

```powershell
# Find what's using it
netstat -ano | findstr :80

# Kill it (replace 1234 with actual PID)
taskkill /PID 1234 /F

# Try again
docker-compose up
```

### "Cannot connect to database"

```powershell
# Reset everything
docker-compose down -v
docker-compose up --build
```

### "404 Not Found" on /monitor

This means nginx isn't running or configured wrong.

```powershell
# Check nginx is running
docker ps | findstr nginx

# If not, restart
docker-compose restart nginx
```

### Vane shows "Onboarding" page

This means you're hitting Justyoo instead of Vane.
nginx routing is broken.

```powershell
# Restart nginx
docker-compose restart nginx

# Check logs
docker-compose logs nginx
```

---

## 📊 What's Running

After `docker-compose up`, you have:

| Service | Port | Access |
|---------|------|--------|
| nginx | 80 | http://localhost (MAIN ENTRY) |
| Vane | 3000 | Internal only |
| Justyoo | 3001 | Internal only |
| WorldMonitor | 5173 | Internal only |
| PostgreSQL | 5432 | Internal only |

**You ONLY access port 80.** nginx routes everything internally.

---

## ✅ Pre-Demo Checklist

30 minutes before investors arrive:

- [ ] Docker Desktop is running
- [ ] Run `docker-compose down` to clean
- [ ] Run `docker-compose up --build`
- [ ] Wait for all services to start (2-3 min)
- [ ] Open http://localhost
- [ ] Test: Home → Portfolio → Monitor → Home
- [ ] Check browser console (F12) - no errors
- [ ] Practice demo flow 2-3 times
- [ ] Have backup: record demo video

---

## 🎬 Final Commands

```powershell
# Clean start
docker-compose down -v
docker-compose up --build

# Background mode (recommended)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🚀 You're Ready!

**Command:** `docker-compose up --build`
**URL:** http://localhost
**Time:** 2-3 minutes

**Good luck with your investors! 🎉**
