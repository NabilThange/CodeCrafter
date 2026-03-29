# Unified Platform Setup - Quick Start for Investors

## What Changed

Your 3 apps now run as ONE unified platform through nginx reverse proxy:

- **Port 80** (http://localhost) - Single entry point for everything
- All navigation uses relative paths
- Seamless experience across all features

## Architecture

```
User visits http://localhost → nginx routes to:
├── /                    → Vane (AI Search) - port 3000
├── /discover            → Vane
├── /library             → Vane
├── /portfolio           → Justyoo (Portfolio) - port 3001
├── /dashboard           → Justyoo
├── /onboarding          → Justyoo
├── /kuberaa/*           → Justyoo
└── /monitor             → WorldMonitor - port 5173
```

## Quick Start

### 1. Start All Services

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

**Linux/Mac:**
```bash
./start-dev.sh
```

### 2. Access the Unified Platform

Open your browser to: **http://localhost**

That's it! All three apps are now accessible from one URL.

## Navigation Flow

1. **Landing Page** (/) - Vane AI Search
   - Click "Portfolio" → Goes to /portfolio (Justyoo)
   - Click "Monitor" → Goes to /monitor (WorldMonitor)

2. **Portfolio** (/portfolio, /dashboard)
   - Click "🔍 Vane" → Goes to / (Vane)
   - Click "🌍 Monitor" → Goes to /monitor (WorldMonitor)

3. **Monitor** (/monitor)
   - Click "Home" → Goes to / (Vane)
   - Click "Portfolio" → Goes to /portfolio (Justyoo)

## Files Modified

1. **nginx.conf** - Added routing for all 3 apps
2. **Vane/src/components/Sidebar.tsx** - Fixed missing import
3. **justyoo/app/components/TopNav.tsx** - Changed to relative paths
4. **worldmonitor/src/components/VaneNavigation.ts** - Changed to relative paths

## Testing Checklist

- [ ] Visit http://localhost - Should show Vane
- [ ] Click "Portfolio" - Should go to portfolio dashboard
- [ ] Click "🔍 Vane" from portfolio - Should go back to Vane
- [ ] Click "Monitor" - Should show WorldMonitor
- [ ] Click "Home" from monitor - Should go back to Vane
- [ ] All navigation works without changing ports

## For Investors Demo

**Key Points:**
- Single URL (http://localhost or your domain)
- Seamless navigation between features
- No visible port changes
- Professional unified experience

**Demo Flow:**
1. Start at Vane (AI Search) - Show search capabilities
2. Navigate to Portfolio - Show investment management
3. Navigate to Monitor - Show global intelligence
4. Navigate back to Home - Show seamless integration

## Troubleshooting

**If nginx doesn't start:**
```bash
docker-compose restart nginx
```

**If a service is down:**
```bash
docker-compose ps
docker-compose logs [service-name]
```

**To rebuild everything:**
```bash
docker-compose down
docker-compose up --build
```

## Production Deployment

For production, replace `localhost` in nginx.conf with your actual domain:

```nginx
server_name yourdomain.com;
```

Add SSL certificate for HTTPS:

```nginx
listen 443 ssl;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
```

## Time to Complete

- Setup: Already done! ✅
- Testing: 5-10 minutes
- Total: Ready for demo now!
