# 🔧 SIMPLE FIX - Use Docker Compose

## ❌ Problem

You're running apps locally with `start-dev.ps1` which:
- Starts apps on wrong ports
- No PostgreSQL database
- No nginx routing
- Apps conflict with each other

## ✅ Solution: Use Docker Compose

Docker Compose is ALREADY configured and will work perfectly!

### Step 1: Stop Everything Running Now

Close all PowerShell windows running the apps, then:

```powershell
# Stop any Docker containers
docker stop justyoo-postgres nginx-proxy 2>$null
docker rm justyoo-postgres nginx-proxy 2>$null

# Kill processes on ports
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

### Step 2: Start with Docker Compose

```powershell
docker-compose up --build
```

Wait 2-3 minutes for first build, then open: **http://localhost**

---

## 🎯 Why Docker Compose?

✅ Everything configured correctly
✅ Right ports (Vane:3000, Justyoo:3001, Monitor:5173)
✅ PostgreSQL database included
✅ nginx routing included
✅ One command to start everything

---

## 🚀 Quick Commands

```powershell
# Start (first time - builds images)
docker-compose up --build

# Start (subsequent times)
docker-compose up

# Start in background
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

---

## 🌐 Access

**Main URL:** http://localhost

**Routes:**
- `/` - Vane (AI Search)
- `/dashboard` - Portfolio
- `/monitor` - WorldMonitor

---

## ⚠️ Don't Use start-dev.ps1

The old `start-dev.ps1` is for local development WITHOUT Docker.
It doesn't include nginx routing, so apps run separately.

**For investor demo, use Docker Compose!**

---

## 🐛 If Docker Compose Fails

### Port 80 in use?
```powershell
# Find what's using port 80
netstat -ano | findstr :80

# Kill it (replace PID)
taskkill /PID <PID> /F
```

### Build fails?
```powershell
# Clean everything
docker-compose down -v
docker system prune -f

# Rebuild
docker-compose up --build
```

### Database issues?
```powershell
# Reset database
docker-compose down -v
docker-compose up
```

---

## ✅ Expected Result

After `docker-compose up`:

1. PostgreSQL starts (port 5432)
2. Vane builds and starts (port 3000)
3. Justyoo builds and starts (port 3001)
4. WorldMonitor builds and starts (port 5173)
5. nginx starts (port 80)

Open http://localhost → See Vane
Click "Portfolio" → See Justyoo
Click "Monitor" → See WorldMonitor

---

**Use Docker Compose for your demo! It's the simplest solution.**
