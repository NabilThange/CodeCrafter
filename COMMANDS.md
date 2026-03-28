# 🎮 Command Reference

## Development Commands

### Start Both Applications

**Windows:**
```powershell
.\start-dev.ps1
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Stop Both Applications

**Windows:**
```powershell
.\stop-dev.ps1
```

**Linux/Mac:**
```bash
chmod +x stop-dev.sh
./stop-dev.sh
```

### Manual Start

**Terminal 1 - WorldMonitor:**
```bash
cd worldmonitor
npm install
npm run dev
```

**Terminal 2 - Vane:**
```bash
cd Vane
npm run dev
```

### Manual Stop

Press `Ctrl+C` in each terminal window.

## Port Management

### Check What's Running

**Windows:**
```powershell
# Check port 3000 (Vane)
netstat -ano | findstr :3000

# Check port 5173 (WorldMonitor)
netstat -ano | findstr :5173
```

**Linux/Mac:**
```bash
# Check port 3000 (Vane)
lsof -ti:3000

# Check port 5173 (WorldMonitor)
lsof -ti:5173
```

### Kill Specific Port

**Windows:**
```powershell
# Find PID
netstat -ano | findstr :3000

# Kill process
taskkill /PID <pid> /F
```

**Linux/Mac:**
```bash
# Kill port 3000
lsof -ti:3000 | xargs kill -9

# Kill port 5173
lsof -ti:5173 | xargs kill -9
```

## Build Commands

### Vane

```bash
cd Vane

# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Format code
npm run format:write
```

### WorldMonitor

```bash
cd worldmonitor

# Development (default variant)
npm run dev

# Development (specific variants)
npm run dev:tech       # Tech-focused
npm run dev:finance    # Finance-focused
npm run dev:happy      # Positive news
npm run dev:commodity  # Commodity tracking

# Production build
npm run build

# Production build (specific variants)
npm run build:tech
npm run build:finance
npm run build:happy
npm run build:commodity

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

## Docker Commands

### Start with Docker
```bash
docker-compose up -d
```

### Stop Docker
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f vane
docker-compose logs -f worldmonitor
```

### Rebuild
```bash
docker-compose up -d --build
```

## Troubleshooting Commands

### Clean Install

**Vane:**
```bash
cd Vane
rm -rf node_modules package-lock.json
npm install
```

**WorldMonitor:**
```bash
cd worldmonitor
rm -rf node_modules package-lock.json
npm install
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Check Node Version
```bash
node --version  # Should be 18+
npm --version
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `.\start-dev.ps1` | Start both apps (Windows) |
| `.\stop-dev.ps1` | Stop both apps (Windows) |
| `./start-dev.sh` | Start both apps (Linux/Mac) |
| `./stop-dev.sh` | Stop both apps (Linux/Mac) |
| `docker-compose up -d` | Start with Docker |
| `docker-compose down` | Stop Docker |

## Access URLs

| Application | URL | Port |
|-------------|-----|------|
| Vane (Default) | http://localhost:3000 | 3000 |
| WorldMonitor | http://localhost:5173 | 5173 |
| Integrated | http://localhost:3000/monitor | 3000 → 5173 |
| Docker (Nginx) | http://localhost | 80 |

## Environment Files

| File | Purpose | Required? |
|------|---------|-----------|
| `Vane/.env.local` | AI provider keys | Yes |
| `worldmonitor/.env.local` | Optional AI keys | No |

## Next Steps

1. Run `.\start-dev.ps1`
2. Open http://localhost:3000
3. Configure Vane AI provider
4. Click "Monitor" to access WorldMonitor
5. Use `.\stop-dev.ps1` when done

---

**Current Status:** ✅ Ready to launch!
