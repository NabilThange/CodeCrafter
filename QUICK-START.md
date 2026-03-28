# 🚀 Quick Start: Vane + WorldMonitor

## What This Is

A unified platform combining:
- **Vane** (AI Search Engine) - Your default homepage
- **WorldMonitor** (Global Intelligence Dashboard) - Accessible via sidebar

## ⚡ Fastest Setup (3 Steps)

### 1. Install Dependencies
```bash
# Install Vane
cd Vane
npm install

# Install WorldMonitor
cd ../worldmonitor
npm install
```

### 2. Start Both Apps

**Windows:**
```powershell
.\start-dev.ps1
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### 3. Open Browser
- Main App: http://localhost:3000
- Click "Monitor" in sidebar to access WorldMonitor

## 🎯 What Works Out of the Box

### Vane
- ❌ Needs AI provider setup (OpenAI, Claude, or Ollama)
- ✅ Search interface ready
- ✅ Document upload ready
- ⚠️ Requires setup wizard on first launch

### WorldMonitor
- ✅ Works immediately, no configuration needed
- ✅ All 435+ news feeds active
- ✅ All 45 map layers functional
- ✅ Real-time data streaming
- ⚠️ AI features require API keys (optional)

## 🔑 Minimum Configuration

### For Vane to Work
Create `Vane/.env.local`:
```env
# Choose ONE:
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR install Ollama (no key needed)
```

### For WorldMonitor AI Features (Optional)
Create `worldmonitor/.env.local`:
```env
VITE_GROQ_API_KEY=gsk_...
```

## 🎨 Architecture

```
┌─────────────────────────────────────┐
│   Vane (Next.js - Port 3000)        │
│   - AI Search Engine                │
│   - Default Homepage                │
│   - Sidebar Navigation              │
│   └─> "Monitor" Link ───────────┐   │
└─────────────────────────────────│───┘
                                  │
                                  ▼
┌─────────────────────────────────────┐
│ WorldMonitor (Vite - Port 5173)     │
│ - Global Intelligence Dashboard     │
│ - Real-time Data Visualization      │
│ - 3D Globe + Map Layers             │
└─────────────────────────────────────┘
```

## 🔍 Tech Stack Comparison

| Feature | Vane | WorldMonitor |
|---------|------|--------------|
| Framework | Next.js (React) | Vanilla TypeScript |
| Build Tool | Next.js | Vite |
| Database | SQLite | None (API-based) |
| AI | Multi-provider | Multi-provider |
| Primary Use | Search & Chat | Data Visualization |

## ✅ Compatibility

**YES - They work together because:**
- Both are Node.js applications
- Both support similar AI providers
- Both can run on different ports
- Navigation integrated via Vane sidebar

**NO - They can't be merged because:**
- Different frameworks (Next.js vs Vanilla)
- Different build systems
- Different rendering approaches
- Different architectural patterns

## 🎯 Recommended Workflow

1. **Start with Vane** (http://localhost:3000)
   - Use for AI-powered search
   - Ask questions, get cited answers
   - Upload documents for analysis

2. **Switch to WorldMonitor** (click "Monitor" in sidebar)
   - View real-time global intelligence
   - Track conflicts, markets, disasters
   - Explore 3D globe visualization

## 🐳 Docker Alternative

```bash
docker-compose up -d
```

Access:
- http://localhost:3000 (Vane)
- http://localhost:5173 (WorldMonitor)
- http://localhost (Nginx unified proxy)

## 🆘 Common Issues

**"Port already in use"**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**"Vane setup wizard appears"**
- Normal on first launch
- Configure at least one AI provider
- Or install Ollama for local AI

**"WorldMonitor map not loading"**
- Check internet connection
- Map tiles load from CDN
- Works offline after first load

## 📚 Full Documentation

- [Complete Setup Guide](SETUP-GUIDE.md)
- [Integration Details](Vane/README-INTEGRATION.md)
- [Vane Docs](Vane/README.md)
- [WorldMonitor Docs](worldmonitor/README.md)

## 🎉 You're Ready!

Both applications are now integrated. Vane is your default page with WorldMonitor accessible via the sidebar.
