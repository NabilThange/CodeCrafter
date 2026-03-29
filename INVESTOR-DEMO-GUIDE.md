# 🚀 Investor Demo - Quick Start Guide

## ✅ What We Fixed

Your 3 separate apps (Vane, Justyoo, WorldMonitor) now run as **ONE UNIFIED PLATFORM** accessible from a single URL.

## 🎯 How to Run (2 Steps)

### Step 1: Start Everything

**Windows PowerShell:**
```powershell
.\start-dev.ps1
```

**Linux/Mac/Git Bash:**
```bash
./start-dev.sh
```

This will:
- Start PostgreSQL database
- Start Vane (AI Search)
- Start Justyoo (Portfolio)
- Start WorldMonitor (Intelligence)
- Start nginx (Unified Gateway)

Wait 30-60 seconds for all services to start.

### Step 2: Open Your Browser

Go to: **http://localhost**

That's it! 🎉

## 🧪 Test It Works

**Windows:**
```powershell
.\test-unified.ps1
```

**Linux/Mac:**
```bash
./test-unified.sh
```

This checks all services are running and accessible.

## 🎭 Demo Flow for Investors

### 1. Start at Home (Vane AI Search)
- URL: **http://localhost**
- Show: AI-powered search, chat interface
- Say: "This is our AI search engine with multi-provider support"

### 2. Navigate to Portfolio
- Click "Portfolio" in sidebar OR go to **http://localhost/dashboard**
- Show: Investment dashboard, ETF selection, allocation engine
- Say: "This is our portfolio management system with automated rebalancing"

### 3. Navigate to Monitor
- Click "🌍 Monitor" in top nav OR go to **http://localhost/monitor**
- Show: 3D globe, real-time intelligence, news feeds
- Say: "This is our global intelligence platform with 435+ data sources"

### 4. Navigate Back
- Click "Home" in sidebar
- Show: Seamless navigation, no port changes
- Say: "Notice how everything is integrated - one platform, one experience"

## 🌐 What URLs Work

All these work from **http://localhost**:

| Feature | URL | What It Shows |
|---------|-----|---------------|
| Home | `/` | Vane AI Search |
| Discover | `/discover` | News discovery |
| Library | `/library` | Saved chats |
| Portfolio | `/portfolio` or `/dashboard` | Investment dashboard |
| ETF Selection | `/kuberaa/etfs` | ETF marketplace |
| Transactions | `/kuberaa/transactions` | Transaction history |
| Monitor | `/monitor` | Global intelligence |

## 🔧 Troubleshooting

### Services won't start?
```powershell
# Stop everything
.\stop-dev.ps1

# Start again
.\start-dev.ps1
```

### Port 80 already in use?
```powershell
# Check what's using port 80
netstat -ano | findstr :80

# Stop the process or change nginx port in docker-compose.yml
```

### Database issues?
```powershell
# Reset database
docker-compose down -v
docker-compose up -d postgres
# Wait 10 seconds
docker-compose up -d
```

### Check logs
```powershell
# All services
docker-compose logs

# Specific service
docker-compose logs vane
docker-compose logs justyoo
docker-compose logs worldmonitor
docker-compose logs nginx
```

## 📊 Architecture Overview

```
                    http://localhost (Port 80)
                              |
                         [nginx Proxy]
                              |
        +-----------------+---+---+------------------+
        |                 |       |                  |
    [Vane:3000]    [Justyoo:3001]  [Monitor:5173]  [PostgreSQL:5432]
   AI Search       Portfolio        Intelligence     Database
```

## 🎨 Key Selling Points

1. **Unified Experience** - One URL, seamless navigation
2. **AI-Powered** - Search, chat, and intelligence
3. **Financial Tools** - Portfolio management and rebalancing
4. **Global Intelligence** - Real-time data from 435+ sources
5. **Modern Stack** - Next.js, React, TypeScript, Docker
6. **Production Ready** - Containerized, scalable architecture

## 📝 Technical Details (If Asked)

- **Frontend**: Next.js 16 (Vane), Next.js 14 (Justyoo), Vite (WorldMonitor)
- **Backend**: Node.js API routes, PostgreSQL database
- **Infrastructure**: Docker Compose, nginx reverse proxy
- **AI Providers**: OpenAI, Claude, Gemini, Groq, Ollama
- **Data Sources**: 435+ news feeds, 30+ APIs, real-time tracking

## ⏱️ Startup Time

- First time (with build): 3-5 minutes
- Subsequent starts: 30-60 seconds

## 🛑 Stop Everything

**Windows:**
```powershell
.\stop-dev.ps1
```

**Linux/Mac:**
```bash
./stop-dev.sh
```

## 🚀 Production Deployment

For production, you'll need:
1. Domain name (e.g., yourapp.com)
2. SSL certificate (Let's Encrypt)
3. Update nginx.conf with your domain
4. Set production environment variables
5. Deploy to cloud (AWS, GCP, Azure, or DigitalOcean)

## 💡 Pro Tips

- Keep Docker Desktop running
- Use Chrome/Edge for best experience
- Have backup demo video ready
- Test everything 30 minutes before demo
- Have this guide open during demo

## ✨ Success Checklist

- [ ] Docker Desktop is running
- [ ] All services started successfully
- [ ] http://localhost shows Vane
- [ ] Can navigate to Portfolio
- [ ] Can navigate to Monitor
- [ ] Can navigate back to Home
- [ ] All navigation is smooth
- [ ] No console errors

---

**You're ready! Good luck with your investor demo! 🎉**
