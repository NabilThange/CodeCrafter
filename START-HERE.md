# 🎯 START HERE: Vane + WorldMonitor Setup

## ✨ What You're Building

A powerful dual-application platform:

**🔍 Vane** (Main App - Port 3000)
- AI-powered search with cited sources
- Chat with documents
- Privacy-focused
- **This is your default homepage**

**🌍 WorldMonitor** (Sub-App - Port 5173)
- Real-time global intelligence
- 3D globe with 45 data layers
- 435+ news feeds
- **Accessible via Vane's sidebar**

## 🚀 Installation (5 Minutes)

### Step 1: Install Vane
```bash
cd Vane
npm install
```
⏱️ Takes ~3-5 minutes

### Step 2: Install WorldMonitor
```bash
cd ../worldmonitor
npm install
```
⏱️ Takes ~3-5 minutes

### Step 3: Configure Vane (Required)

Create `Vane/.env.local`:

**Option A: Use OpenAI**
```env
OPENAI_API_KEY=sk-proj-...
```

**Option B: Use Claude**
```env
ANTHROPIC_API_KEY=sk-ant-...
```

**Option C: Use Ollama (Free, Local)**
```bash
# Install Ollama first: https://ollama.ai
ollama pull llama3.2
```
Then in Vane setup wizard, select Ollama.

### Step 4: Start Applications

**Windows:**
```powershell
.\start-dev.ps1
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Manual (if scripts don't work):**

Terminal 1:
```bash
cd worldmonitor
npm run dev
```

Terminal 2:
```bash
cd Vane
npm run dev
```

### Step 5: Open Browser

1. Go to http://localhost:3000
2. Complete Vane setup wizard
3. Click "Monitor" in sidebar to access WorldMonitor

## ✅ Verification Checklist

- [ ] Vane opens at http://localhost:3000
- [ ] Setup wizard appears (first time only)
- [ ] Can complete a search query
- [ ] "Monitor" link appears in sidebar
- [ ] Clicking "Monitor" opens WorldMonitor
- [ ] WorldMonitor shows 3D globe
- [ ] Can see news feeds in WorldMonitor

## 🎨 What's Been Modified

### Vane Changes
1. ✅ Added `src/app/monitor/page.tsx` - Redirect to WorldMonitor
2. ✅ Modified `src/components/Sidebar.tsx` - Added "Monitor" navigation link
3. ✅ Updated `next.config.mjs` - Added proxy rewrites (optional)

### WorldMonitor Changes
- ✅ None required! Works as-is

### New Files
- ✅ `README.md` - Main integration overview
- ✅ `QUICK-START.md` - Fast setup guide
- ✅ `SETUP-GUIDE.md` - Detailed setup instructions
- ✅ `ARCHITECTURE.md` - Technical architecture
- ✅ `START-HERE.md` - This file
- ✅ `start-dev.ps1` - Windows startup script
- ✅ `start-dev.sh` - Linux/Mac startup script
- ✅ `docker-compose.yml` - Docker deployment
- ✅ `nginx.conf` - Reverse proxy config

## 🎯 Next Steps

### Immediate
1. ✅ Install dependencies (done above)
2. ✅ Configure Vane AI provider
3. ✅ Start both applications
4. ✅ Test navigation between apps

### Optional Enhancements
- [ ] Set up Docker deployment
- [ ] Configure additional AI providers
- [ ] Add custom SearxNG instance
- [ ] Enable WorldMonitor AI features
- [ ] Set up production deployment

## 🔧 Customization

### Change Vane to Different Port
Edit `Vane/package.json`:
```json
"dev": "next dev --webpack -p 3001"
```

### Change WorldMonitor Port
Edit `worldmonitor/vite.config.ts`:
```typescript
server: { port: 5174 }
```

### Use WorldMonitor Variants
```bash
cd worldmonitor
npm run dev:tech       # Tech news focus
npm run dev:finance    # Finance focus
npm run dev:happy      # Positive news only
```

## 📊 Resource Requirements

### Minimum
- Node.js 18+
- 4GB RAM
- 2GB disk space

### Recommended
- Node.js 20+
- 8GB RAM
- 5GB disk space
- SSD for better performance

## 🆘 Troubleshooting

### Vane Won't Start
```bash
cd Vane
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### WorldMonitor Won't Start
```bash
cd worldmonitor
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Both Apps Start But Can't Navigate
- Check that both are running
- Verify ports 3000 and 5173 are accessible
- Check browser console for errors

### Setup Wizard Keeps Appearing
- Complete all required fields
- Ensure at least one AI provider is configured
- Check `Vane/data/` directory permissions

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ Vane loads at http://localhost:3000
2. ✅ Can ask questions and get AI responses
3. ✅ "Monitor" link visible in sidebar
4. ✅ Clicking "Monitor" opens WorldMonitor
5. ✅ WorldMonitor shows interactive 3D globe
6. ✅ Can see live news feeds and data

## 📞 Support

- **Vane Issues**: [GitHub](https://github.com/ItzCrazyKns/Vane/issues)
- **WorldMonitor Issues**: [GitHub](https://github.com/koala73/worldmonitor/issues)
- **Integration Issues**: Check this repository's issues

## 🎊 You're All Set!

Your integrated Vane + WorldMonitor platform is ready. Enjoy exploring AI-powered search and real-time global intelligence in one unified interface!
