# 📸 Visual Integration Guide

## Before Integration

```
┌─────────────┐     ┌──────────────────┐
│    Vane     │     │  WorldMonitor    │
│  (Separate) │     │   (Separate)     │
│             │     │                  │
│  Port 3000  │     │   Port 5173      │
└─────────────┘     └──────────────────┘
     ❌ No connection between apps
```

## After Integration

```
┌────────────────────────────────────────────────┐
│  Vane (Main App - Port 3000)                   │
│  ┌──────────┐  ┌──────────────────────────┐   │
│  │ Sidebar  │  │  Main Content            │   │
│  │          │  │                          │   │
│  │ 🏠 Home  │  │  AI Chat Interface       │   │
│  │ 🔍 Disc  │  │  Search Results          │   │
│  │ 📚 Lib   │  │  Document Analysis       │   │
│  │ 🌍 Mon ──┼──┼─> Redirects to...       │   │
│  │          │  │                          │   │
│  └──────────┘  └──────────────────────────┘   │
└────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────┐
│  WorldMonitor (Sub-App - Port 5173)            │
│  ┌──────────────────────────────────────────┐ │
│  │  🌍 3D Globe Visualization               │ │
│  │  📊 Real-time Intelligence Dashboard     │ │
│  │  📰 435+ News Feeds                      │ │
│  │  🗺️ 45 Map Layers                        │ │
│  │  ✈️ Flight Tracking                      │ │
│  │  🚢 Ship Tracking                        │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

## User Flow

### Step 1: Landing Page (Vane)
```
┌─────────────────────────────────────────┐
│  Vane - AI Search Engine                │
│  ┌───────────────────────────────────┐  │
│  │  "Ask me anything..."             │  │
│  │  [Search Input Box]               │  │
│  └───────────────────────────────────┘  │
│                                          │
│  Sidebar:                                │
│  🏠 Home    ← You are here               │
│  🔍 Discover                             │
│  📚 Library                              │
│  🌍 Monitor  ← Click to access dashboard │
└─────────────────────────────────────────┘
```

### Step 2: Click Monitor
```
┌─────────────────────────────────────────┐
│  Redirecting to World Monitor...        │
│                                          │
│         [Loading Spinner]                │
│                                          │
│  If not redirected, click here          │
└─────────────────────────────────────────┘
```

### Step 3: WorldMonitor Dashboard
```
┌─────────────────────────────────────────┐
│  WorldMonitor - Global Intelligence     │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │        🌍 3D Globe                │  │
│  │     [Interactive Map]             │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                          │
│  📊 Live Data Panels:                    │
│  ├─ 📰 Breaking News                     │
│  ├─ 💹 Market Data                       │
│  ├─ ⚠️ Conflict Zones                    │
│  ├─ ✈️ Military Flights                  │
│  └─ 🚢 Ship Tracking                     │
└─────────────────────────────────────────┘
```

## Sidebar Navigation (Vane)

### Before
```
┌──────────┐
│ Sidebar  │
│          │
│ 🏠 Home  │
│ 🔍 Disc  │
│ 📚 Lib   │
│          │
│ ⚙️ Set   │
└──────────┘
```

### After
```
┌──────────┐
│ Sidebar  │
│          │
│ 🏠 Home  │
│ 🔍 Disc  │
│ 📚 Lib   │
│ 🌍 Mon   │ ← NEW!
│          │
│ ⚙️ Set   │
└──────────┘
```

## File Structure

### Root Directory
```
.
├── Vane/                    # Main app (Next.js)
│   ├── src/app/
│   │   ├── page.tsx         # Default homepage
│   │   ├── monitor/
│   │   │   └── page.tsx     # NEW: Redirect to WorldMonitor
│   │   └── ...
│   ├── src/components/
│   │   ├── Sidebar.tsx      # MODIFIED: Added Monitor link
│   │   └── ...
│   └── next.config.mjs      # MODIFIED: Added rewrites
│
├── worldmonitor/            # Sub-app (Vite)
│   ├── src/
│   │   ├── main.ts          # Entry point
│   │   └── ...
│   └── vite.config.ts
│
├── README.md                # NEW: Main overview
├── QUICK-START.md           # NEW: Fast setup
├── SETUP-GUIDE.md           # NEW: Detailed guide
├── ARCHITECTURE.md          # NEW: Technical docs
├── START-HERE.md            # NEW: Getting started
├── INTEGRATION-SUMMARY.md   # NEW: This file
├── start-dev.ps1            # NEW: Windows script
├── start-dev.sh             # NEW: Linux/Mac script
├── docker-compose.yml       # NEW: Docker config
└── nginx.conf               # NEW: Proxy config
```

## Port Mapping

```
┌──────────────────────────────────────┐
│  Your Computer                       │
│                                      │
│  Port 3000 → Vane                    │
│  ├─ /          → Chat (default)      │
│  ├─ /discover  → Discover page       │
│  ├─ /library   → Library page        │
│  └─ /monitor   → Redirect to 5173    │
│                                      │
│  Port 5173 → WorldMonitor            │
│  └─ /          → Dashboard           │
└──────────────────────────────────────┘
```

## Docker Architecture

```
┌────────────────────────────────────────────┐
│  Docker Network: app-network               │
│                                            │
│  ┌──────────────┐  ┌──────────────────┐   │
│  │  Vane        │  │  WorldMonitor    │   │
│  │  Container   │  │  Container       │   │
│  │  Port 3000   │  │  Port 5173       │   │
│  └──────┬───────┘  └────────┬─────────┘   │
│         │                   │              │
│         └───────┬───────────┘              │
│                 │                          │
│         ┌───────▼────────┐                 │
│         │  Nginx Proxy   │                 │
│         │  Port 80       │                 │
│         └───────┬────────┘                 │
└─────────────────┼──────────────────────────┘
                  │
                  ▼
         User Browser (localhost)
```

## Data Flow

### Vane Search Query
```
User Input
    ↓
Vane Frontend (React)
    ↓
Next.js API Routes
    ↓
AI Provider (OpenAI/Claude/Ollama)
    ↓
SearxNG Search Engine
    ↓
Response with Citations
    ↓
User sees results
```

### WorldMonitor Data Stream
```
External APIs (RSS, ADS-B, AIS, etc.)
    ↓
Vite Dev Server / Edge Functions
    ↓
Protocol Buffer API (sebuf)
    ↓
WorldMonitor Frontend (Vanilla TS)
    ↓
3D Globe / Map Visualization
    ↓
User sees real-time data
```

## Integration Benefits

### ✅ Advantages
1. **Full Functionality** - Both apps work 100%
2. **Independence** - Can deploy separately
3. **Modularity** - Easy to maintain
4. **Flexibility** - Can update independently
5. **Performance** - No overhead from integration
6. **Simplicity** - Clean separation of concerns

### ⚠️ Trade-offs
1. **Separate Configs** - Each app has own settings
2. **No Shared Auth** - Independent login (if added)
3. **Different Ports** - Two dev servers required
4. **Navigation** - URL redirect (not seamless)

## 🎯 Recommended Usage

### For AI Search & Research
→ Use **Vane** (default page)
- Ask questions
- Get cited answers
- Upload documents
- Search the web

### For Real-time Intelligence
→ Use **WorldMonitor** (via Monitor link)
- Track global events
- Monitor markets
- View conflict zones
- Explore 3D globe

### For Combined Workflow
1. Start in Vane
2. Research topic with AI
3. Switch to WorldMonitor
4. View real-time data
5. Return to Vane for more questions

## 🎊 Summary

**Integration Status:** ✅ Complete

**What You Have:**
- Vane as main application (port 3000)
- WorldMonitor as sub-application (port 5173)
- Seamless navigation via sidebar
- Full functionality of both apps
- Easy deployment options

**What You Need:**
- Configure Vane AI provider
- Start both applications
- Open http://localhost:3000

**You're all set!** 🚀
