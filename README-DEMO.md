# 🎯 INVESTOR DEMO - QUICK START

## ⚡ Fastest Way to Run (One Command)

### Windows PowerShell:
```powershell
.\demo-start.ps1
```

### Linux/Mac:
```bash
./demo-start.sh
```

**That's it!** The script will:
1. ✅ Check Docker is running
2. ✅ Start all services (Vane, Portfolio, Monitor, Database, nginx)
3. ✅ Wait for everything to be ready
4. ✅ Test all endpoints
5. ✅ Open your browser to http://localhost

---

## 🌐 Access Your Platform

**Main URL:** http://localhost

**All Features:**
- **/** - AI Search (Vane)
- **/discover** - News Discovery
- **/library** - Saved Chats
- **/dashboard** - Portfolio Dashboard
- **/portfolio** - Portfolio Builder
- **/kuberaa/etfs** - ETF Selection
- **/monitor** - Global Intelligence

---

## 🎭 Demo Flow (2 Minutes)

### 1. Start at Home (AI Search)
- URL: http://localhost
- Show: "This is our AI-powered search with multiple providers"
- Demo: Type a search query, show results

### 2. Navigate to Portfolio
- Click: "Portfolio" in sidebar
- Show: "This is our investment management platform"
- Demo: Show dashboard, ETF selection, allocation

### 3. Navigate to Monitor
- Click: "🌍 Monitor" in top nav
- Show: "This is our global intelligence dashboard"
- Demo: Show 3D globe, news feeds, real-time data

### 4. Navigate Back
- Click: "Home" in sidebar
- Show: "Notice the seamless integration - one platform"

---

## 🛑 Stop Everything

```powershell
docker-compose down
```

---

## 🔧 If Something Goes Wrong

### Services won't start?
```powershell
docker-compose down
docker-compose up -d --build
```

### Check what's running:
```powershell
docker-compose ps
```

### View logs:
```powershell
docker-compose logs -f
```

### Test manually:
```powershell
.\test-unified.ps1
```

---

## ✅ Pre-Demo Checklist (5 Minutes Before)

1. [ ] Docker Desktop is running
2. [ ] Run `.\demo-start.ps1`
3. [ ] Wait for "SUCCESS!" message
4. [ ] Open http://localhost
5. [ ] Test navigation: Home → Portfolio → Monitor → Home
6. [ ] Check browser console (F12) - no errors
7. [ ] Close unnecessary browser tabs
8. [ ] Have this guide open on second screen

---

## 📊 What You're Showing

### Technical Stack
- **Frontend:** Next.js 16, React 18, TypeScript
- **Backend:** Node.js, PostgreSQL
- **Infrastructure:** Docker, nginx reverse proxy
- **AI:** OpenAI, Claude, Gemini, Groq, Ollama

### Key Features
1. **AI Search** - Multi-provider search with chat
2. **Portfolio Management** - Automated allocation & rebalancing
3. **Global Intelligence** - 435+ data sources, real-time tracking
4. **Unified Platform** - Seamless navigation, single URL

### Selling Points
- ✨ Modern, professional UI
- 🚀 Production-ready architecture
- 🔒 Secure, containerized deployment
- 📈 Scalable infrastructure
- 🌍 Global data coverage

---

## 💡 Pro Tips

1. **Practice the demo flow** - Do it 2-3 times before investors arrive
2. **Have backup** - Record a demo video just in case
3. **Keep it simple** - Don't dive too deep into technical details unless asked
4. **Focus on value** - Show how it solves problems, not just features
5. **Be confident** - You built something impressive!

---

## 🚨 Emergency Backup Plan

If Docker fails during demo:

1. **Use existing start-dev.ps1** (runs locally without Docker)
2. **Show recorded demo video**
3. **Walk through screenshots**
4. **Focus on architecture diagrams**

---

## 📞 Quick Commands Reference

```powershell
# Start
.\demo-start.ps1

# Stop
docker-compose down

# Restart
docker-compose restart

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test
.\test-unified.ps1

# Rebuild
docker-compose up -d --build
```

---

## 🎉 You're Ready!

Your platform is now:
- ✅ Unified under one URL
- ✅ Professional navigation
- ✅ Production-ready
- ✅ Easy to demo

**Good luck with your investor presentation! 🚀**

---

## 📚 Additional Documentation

- **INVESTOR-DEMO-GUIDE.md** - Detailed demo guide
- **START-UNIFIED.md** - Complete startup instructions
- **UNIFIED-SETUP.md** - Technical setup details
- **ARCHITECTURE.md** - System architecture

---

**Questions? Check logs:** `docker-compose logs -f`
