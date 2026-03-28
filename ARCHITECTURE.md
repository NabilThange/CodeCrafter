# Integration Architecture: Vane + WorldMonitor

## Overview

This integration creates a unified platform where Vane serves as the main application with WorldMonitor accessible as a sub-page.

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     User Browser                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Vane (http://localhost:3000)                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Sidebar Navigation                              │  │  │
│  │  │  - Home (Chat)                                   │  │  │
│  │  │  - Discover                                      │  │  │
│  │  │  - Library                                       │  │  │
│  │  │  - Monitor ──────────────────────────┐          │  │  │
│  │  └──────────────────────────────────────│───────────┘  │  │
│  │                                          │              │  │
│  │  Main Content Area                      │              │  │
│  │  - AI Chat Interface                    │              │  │
│  │  - Search Results                       │              │  │
│  │  - Document Analysis                    │              │  │
│  └──────────────────────────────────────────│──────────────┘  │
│                                             │                 │
│                                             ▼                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  WorldMonitor (http://localhost:5173)                  │  │
│  │  - 3D Globe Visualization                              │  │
│  │  - Real-time Intelligence Dashboard                    │  │
│  │  - 45 Map Layers                                       │  │
│  │  - 435+ News Feeds                                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Vane (Port 3000)
```
Vane/
├── src/app/
│   ├── page.tsx              # Default homepage (Chat)
│   ├── discover/page.tsx     # Discover page
│   ├── library/page.tsx      # Library page
│   ├── monitor/page.tsx      # NEW: Redirects to WorldMonitor
│   └── api/                  # Next.js API routes
├── src/components/
│   ├── Sidebar.tsx           # MODIFIED: Added Monitor link
│   ├── ChatWindow.tsx        # Main chat interface
│   └── ...
└── next.config.mjs           # Next.js configuration
```

### WorldMonitor (Port 5173)
```
worldmonitor/
├── src/
│   ├── main.ts               # Entry point
│   ├── App.ts                # Main application class
│   ├── components/           # UI components
│   ├── services/             # Data services
│   └── ...
├── vite.config.ts            # Vite configuration
└── index.html                # HTML entry
```

## Data Flow

### User Journey: Vane → WorldMonitor

1. User opens http://localhost:3000 (Vane)
2. Vane loads with sidebar navigation
3. User clicks "Monitor" in sidebar
4. Browser navigates to http://localhost:5173 (WorldMonitor)
5. WorldMonitor loads independently

### Reverse: WorldMonitor → Vane

- User manually navigates back to http://localhost:3000
- Or uses browser back button
- No automatic navigation from WorldMonitor to Vane

## Technology Stack

### Vane
| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (React 18) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite (better-sqlite3) |
| ORM | Drizzle |
| AI | OpenAI, Claude, Gemini, Groq, Ollama |
| Search | SearxNG |
| Build | Next.js (Webpack) |
| Runtime | Node.js |

### WorldMonitor
| Layer | Technology |
|-------|------------|
| Framework | None (Vanilla TypeScript) |
| Language | TypeScript |
| Styling | CSS (custom) |
| Database | None (API-based) |
| Maps | globe.gl (Three.js), deck.gl (MapLibre) |
| AI | Ollama, Groq, OpenRouter |
| API | Protocol Buffers (sebuf) |
| Build | Vite |
| Runtime | Browser (SPA) |

## Communication

### Current Implementation
- **No direct communication** between apps
- Each app runs independently
- Navigation via URL redirect

### Future Enhancements (Optional)
- Shared authentication
- Cross-app state management
- Unified API gateway
- Shared AI provider configuration

## Deployment Options

### Development (Current)
```
Vane:         localhost:3000
WorldMonitor: localhost:5173
```

### Production Option 1: Separate Domains
```
Vane:         vane.yourdomain.com
WorldMonitor: monitor.yourdomain.com
```

### Production Option 2: Unified Domain
```
Main:         yourdomain.com (Vane)
Sub-path:     yourdomain.com/monitor (WorldMonitor)
```
Requires Nginx/Caddy reverse proxy (see nginx.conf)

### Production Option 3: Docker Compose
```
All services in containers
Nginx proxy on port 80
Persistent volumes for data
```

## Performance Considerations

### Resource Usage
- **Vane**: ~500MB RAM (dev), ~200MB (prod)
- **WorldMonitor**: ~800MB RAM (dev), ~400MB (prod)
- **Total**: ~1.3GB RAM (dev), ~600MB (prod)

### Network
- Vane: Minimal (API calls only)
- WorldMonitor: Moderate (map tiles, RSS feeds, real-time data)

### Storage
- Vane: SQLite database grows with chat history
- WorldMonitor: Browser cache only (no server storage)

## Security

### Vane
- SQLite database stored locally
- API keys in environment variables
- Session management via Next.js
- CORS configured for API routes

### WorldMonitor
- Stateless (no server-side storage)
- API keys in environment variables
- CSP headers in index.html
- CORS configured for API endpoints

## Scalability

### Vane
- Scales with Next.js (serverless functions)
- Database can be migrated to PostgreSQL
- Redis cache for session management

### WorldMonitor
- Scales horizontally (stateless)
- CDN for static assets
- Edge functions for API routes
- Redis cache for API responses

## Maintenance

### Updates
- Vane: `cd Vane && npm update`
- WorldMonitor: `cd worldmonitor && npm update`

### Backups
- Vane: Backup `Vane/data/` directory (SQLite)
- WorldMonitor: No backup needed (stateless)

### Monitoring
- Vane: Next.js logs
- WorldMonitor: Sentry (optional)
- Both: Browser console for client-side errors

## Future Roadmap

### Phase 1 (Current)
- ✅ Vane as main app
- ✅ WorldMonitor accessible via sidebar
- ✅ Independent operation

### Phase 2 (Planned)
- [ ] Shared authentication
- [ ] Unified settings panel
- [ ] Cross-app search (search WorldMonitor data from Vane)

### Phase 3 (Future)
- [ ] Embedded WorldMonitor widgets in Vane
- [ ] AI chat about WorldMonitor data
- [ ] Unified notification system

## Conclusion

This architecture maintains the independence and full functionality of both applications while providing seamless navigation between them. Vane serves as the main entry point, with WorldMonitor accessible as a powerful sub-application.
