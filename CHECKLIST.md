# ✅ Setup Checklist

## Pre-Setup
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Git installed (already done)
- [ ] At least 4GB RAM available
- [ ] Ports 3000 and 5173 available

## Installation
- [x] Vane dependencies installed (`cd Vane && npm install`)
- [ ] WorldMonitor dependencies installed (`cd worldmonitor && npm install`)

## Configuration
- [ ] Created `Vane/.env.local`
- [ ] Added at least one AI provider key to Vane
- [ ] (Optional) Created `worldmonitor/.env.local`

## Startup
- [ ] WorldMonitor running on port 5173
- [ ] Vane running on port 3000
- [ ] Both accessible in browser

## Verification
- [ ] Vane opens at http://localhost:3000
- [ ] Completed Vane setup wizard
- [ ] Can ask questions in Vane
- [ ] "Monitor" link visible in Vane sidebar
- [ ] Clicking "Monitor" opens WorldMonitor
- [ ] WorldMonitor shows 3D globe
- [ ] Can see news feeds in WorldMonitor
- [ ] Can navigate back to Vane

## Optional Enhancements
- [ ] Installed Ollama for local AI
- [ ] Set up Docker deployment
- [ ] Configured additional AI providers
- [ ] Enabled WorldMonitor AI features
- [ ] Customized themes

## Troubleshooting (If Needed)
- [ ] Checked port conflicts
- [ ] Verified API keys are correct
- [ ] Cleared npm cache if install failed
- [ ] Checked browser console for errors
- [ ] Restarted applications

## Production (Future)
- [ ] Planned deployment strategy
- [ ] Configured production environment variables
- [ ] Set up HTTPS
- [ ] Configured reverse proxy (if using unified domain)
- [ ] Tested production builds

---

## Quick Commands Reference

### Start Development
```powershell
# Windows
.\start-dev.ps1

# Linux/Mac
./start-dev.sh
```

### Manual Start
```bash
# Terminal 1
cd worldmonitor && npm run dev

# Terminal 2
cd Vane && npm run dev
```

### Stop Applications
- Press Ctrl+C in each terminal
- Or close PowerShell windows

### Check Ports
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Linux/Mac
lsof -ti:3000
lsof -ti:5173
```

### Clean Install
```bash
# Vane
cd Vane
rm -rf node_modules package-lock.json
npm install

# WorldMonitor
cd worldmonitor
rm -rf node_modules package-lock.json
npm install
```

---

## Status: Ready to Launch! 🚀

All integration files created. Follow the checklist above to complete setup.

**Next Step:** Run `.\start-dev.ps1` (Windows) or `./start-dev.sh` (Linux/Mac)
