# Complete Setup Guide: Vane + WorldMonitor

## Prerequisites

- Node.js 18+ and npm
- Git
- (Optional) Docker and Docker Compose
- (Optional) Ollama for local AI

## Step-by-Step Setup

### 1. Install Dependencies

**Vane:**
```bash
cd Vane
npm install
```

**WorldMonitor:**
```bash
cd ../worldmonitor
npm install
```

### 2. Configure Environment Variables

**Vane** - Create `Vane/.env.local`:
```env
# Required: At least one AI provider
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR use Ollama (no API key needed)

# Optional: External SearxNG
SEARXNG_API_URL=http://localhost:8080

# Optional: Other providers
GROQ_API_KEY=gsk_...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

**WorldMonitor** - Create `worldmonitor/.env.local`:
```env
# All optional - works without any configuration
VITE_OPENROUTER_API_KEY=sk-or-...
VITE_GROQ_API_KEY=gsk_...
VITE_SENTRY_DSN=https://...
```

### 3. Start Applications

**Option A: Automated (Windows)**
```powershell
.\start-dev.ps1
```

**Option B: Automated (Linux/Mac)**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Option C: Manual**

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

### 4. Access Applications

- **Vane**: http://localhost:3000
- **WorldMonitor**: http://localhost:5173
- **Integrated**: Click "Monitor" in Vane sidebar

### 5. Initial Configuration

**Vane Setup:**
1. Open http://localhost:3000
2. Complete setup wizard
3. Choose AI provider (OpenAI, Claude, Ollama, etc.)
4. Configure search preferences

**WorldMonitor:**
- No setup required! Works immediately
- Optional: Configure AI in settings for enhanced features

## 🎨 Customization

### Change Vane Port
Edit `Vane/package.json`:
```json
"dev": "next dev --webpack -p 3001"
```

### Change WorldMonitor Port
Edit `worldmonitor/vite.config.ts`:
```typescript
server: {
  port: 5174
}
```

### Use WorldMonitor Variants
```bash
cd worldmonitor
npm run dev:tech       # Tech-focused
npm run dev:finance    # Finance-focused
npm run dev:happy      # Positive news
npm run dev:commodity  # Commodity tracking
```

## 🐳 Docker Setup

### Quick Start
```bash
docker-compose up -d
```

### Access
- Unified: http://localhost (Nginx proxy)
- Vane: http://localhost:3000
- WorldMonitor: http://localhost:5173

### Stop
```bash
docker-compose down
```

## 🔧 Troubleshooting

### Vane Issues

**"No chat model providers configured"**
- Add at least one AI provider API key in setup wizard
- Or install Ollama locally

**SearxNG connection error**
- Vane Docker image includes SearxNG
- For local dev: `docker run -d -p 8080:8080 searxng/searxng`

### WorldMonitor Issues

**Port 5173 already in use**
- Stop other Vite dev servers
- Or change port in vite.config.ts

**Map not loading**
- Check internet connection (loads tiles from CDN)
- Check browser console for errors

### General Issues

**npm install fails**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json, reinstall

**Port conflicts**
- Check what's using ports: `netstat -ano | findstr :3000`
- Kill process or change port

## 🚀 Production Deployment

### Separate Deployments (Recommended)

**Vane on Vercel:**
```bash
cd Vane
vercel deploy
```

**WorldMonitor on Vercel:**
```bash
cd worldmonitor
vercel deploy
```

### Docker Production
```bash
docker-compose -f docker-compose.yml up -d
```

### Nginx Reverse Proxy
Use the included `nginx.conf` to route:
- `/` → Vane
- `/monitor` → WorldMonitor

## 📊 Resource Usage

**Development:**
- Vane: ~500MB RAM
- WorldMonitor: ~800MB RAM (map rendering)
- Total: ~1.3GB RAM

**Production:**
- Vane: ~200MB RAM
- WorldMonitor: ~400MB RAM
- Total: ~600MB RAM

## 🔐 Security Notes

- Both apps run on localhost by default
- Vane stores data in SQLite (local)
- WorldMonitor is stateless (no database)
- API keys stored in environment variables
- Use HTTPS in production

## 📖 Next Steps

1. Explore Vane's AI search capabilities
2. Check WorldMonitor's global intelligence dashboard
3. Configure AI providers for both apps
4. Customize themes and preferences
5. Set up production deployment

## 🆘 Support

- **Vane**: [GitHub Issues](https://github.com/ItzCrazyKns/Vane/issues)
- **WorldMonitor**: [GitHub Issues](https://github.com/koala73/worldmonitor/issues)

## 📄 License

- Vane: MIT License
- WorldMonitor: AGPL-3.0 (commercial license for commercial use)
