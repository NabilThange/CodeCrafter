# 🚀 How to Run Your Unified Platform

## Two Ways to Run

### Option 1: Docker (Recommended for Demo) ⭐

**Pros:** Clean, isolated, production-like, one command
**Cons:** Slower first start (needs to build images)

```powershell
# Start everything
docker-compose up -d

# Wait 30-60 seconds, then open browser
# http://localhost
```

**Stop:**
```powershell
docker-compose down
```

---

### Option 2: Local Development (Faster for Development)

**Pros:** Faster hot-reload, easier debugging
**Cons:** Multiple windows, needs local setup

```powershell
# Use existing script
.\start-dev.ps1
```

**Access:**
- Vane: http://localhost:3000
- Portfolio: http://localhost:3001  
- Monitor: http://localhost:5173

**Note:** This runs apps separately. For unified access, you need nginx running:

```powershell
# Start nginx only
docker-compose up -d nginx

# Then access everything at http://localhost
```

---

## 🎯 For Investor Demo - Use Docker!

### Quick Start (3 Commands)

```powershell
# 1. Start everything
docker-compose up -d

# 2. Wait for services (30-60 seconds)
Start-Sleep -Seconds 45

# 3. Test it works
.\test-unified.ps1
```

### Open Browser
Go to: **http://localhost**

### Demo Flow
1. **Home** (/) - AI Search
2. Click **"Portfolio"** - Investment Dashboard
3. Click **"🌍 Monitor"** - Global Intelligence
4. Click **"Home"** - Back to search

---

## 🔍 Check Status

```powershell
# See all running services
docker-compose ps

# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs vane
docker-compose logs justyoo
docker-compose logs nginx
```

---

## 🛠️ Troubleshooting

### Services won't start?
```powershell
docker-compose down
docker-compose up -d --build
```

### Port 80 in use?
```powershell
# Find what's using port 80
netstat -ano | findstr :80

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change nginx port in docker-compose.yml:
# ports:
#   - "8080:80"  # Use port 8080 instead
```

### Database issues?
```powershell
# Reset everything
docker-compose down -v
docker-compose up -d
```

### Check if services are healthy
```powershell
# Test endpoints
curl http://localhost/
curl http://localhost/dashboard
curl http://localhost/monitor
```

---

## 📊 What's Running

When you run `docker-compose up -d`, you get:

| Service | Port | Purpose |
|---------|------|---------|
| nginx | 80 | Unified gateway (main entry) |
| vane | 3000 | AI Search (internal) |
| justyoo | 3001 | Portfolio (internal) |
| worldmonitor | 5173 | Intelligence (internal) |
| postgres | 5432 | Database (internal) |

**You only access port 80** - nginx routes everything internally.

---

## 🎬 Complete Demo Setup

```powershell
# 1. Make sure Docker Desktop is running
# Check: docker ps

# 2. Start all services
docker-compose up -d

# 3. Wait for startup
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

# 4. Test everything
.\test-unified.ps1

# 5. Open browser
Start-Process "http://localhost"

# 6. You're ready! 🎉
```

---

## 💡 Pro Tips

1. **Start Docker Desktop first** - Wait for it to fully load
2. **First run takes 3-5 minutes** - Subsequent runs are 30-60 seconds
3. **Test before demo** - Run `.\test-unified.ps1` to verify
4. **Keep logs open** - Run `docker-compose logs -f` in another window
5. **Have backup** - Record a demo video just in case

---

## 🚦 Quick Commands Reference

```powershell
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Test
.\test-unified.ps1
```

---

## ✅ Pre-Demo Checklist

- [ ] Docker Desktop is running
- [ ] Run `docker-compose up -d`
- [ ] Wait 45 seconds
- [ ] Run `.\test-unified.ps1` - all green checkmarks
- [ ] Open http://localhost - Vane loads
- [ ] Click "Portfolio" - Dashboard loads
- [ ] Click "Monitor" - WorldMonitor loads
- [ ] Navigation works smoothly
- [ ] No console errors (F12)

---

**You're ready for your investor demo! 🚀**

Need help? Check logs: `docker-compose logs -f`
