# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd New
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

**Required:**
- `DATABASE_URL` — PostgreSQL connection string (Supabase recommended)
- `NEXT_PUBLIC_APP_URL` — Your app URL (e.g., `http://localhost:3000`)

**Optional (by feature):**
- AI: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`
- Market: `FINNHUB_API_KEY`, `POLYGON_API_KEY`
- Cache: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Setup (Supabase)

### Option A: Supabase Cloud (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Add to `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
   ```

### Option B: Local PostgreSQL

1. Install PostgreSQL
2. Create database:
   ```bash
   createdb unified_platform
   ```
3. Add to `.env.local`:
   ```
   DATABASE_URL="postgresql://localhost:5432/unified_platform"
   ```

## Redis Setup (Upstash)

1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy REST URL and token
4. Add to `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL="https://..."
   UPSTASH_REDIS_REST_TOKEN="..."
   ```

## API Keys

### AI Providers (choose one or more)

**OpenAI** (recommended for production)
- Get key: [platform.openai.com](https://platform.openai.com)
- Add: `OPENAI_API_KEY="sk-..."`

**Groq** (recommended for development — free tier)
- Get key: [console.groq.com](https://console.groq.com)
- Add: `GROQ_API_KEY="gsk_..."`

**Anthropic Claude**
- Get key: [console.anthropic.com](https://console.anthropic.com)
- Add: `ANTHROPIC_API_KEY="sk-ant-..."`

**Ollama** (self-hosted)
- Install: [ollama.ai](https://ollama.ai)
- Add: `OLLAMA_API_URL="http://localhost:11434"`

### Market Data (for Portfolio features)

**Finnhub** (free tier available)
- Get key: [finnhub.io](https://finnhub.io)
- Add: `FINNHUB_API_KEY="..."`

**Polygon.io** (optional)
- Get key: [polygon.io](https://polygon.io)
- Add: `POLYGON_API_KEY="..."`

### Intelligence Data (for WorldMonitor features)

**ACLED** (conflict data — free for researchers)
- Register: [acleddata.com](https://acleddata.com)
- Add:
  ```
  ACLED_EMAIL="your@email.com"
  ACLED_PASSWORD="your_password"
  ```

**AviationStack** (flight tracking)
- Get key: [aviationstack.com](https://aviationstack.com)
- Add: `AVIATIONSTACK_API="..."`

**NASA FIRMS** (fire detection)
- Get key: [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov)
- Add: `NASA_FIRMS_API_KEY="..."`

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database commands
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio
npm run db:generate   # Generate Prisma client
```

## Project Structure

```
New/
├── app/                    # Next.js App Router
│   ├── (vane)/            # Vane AI search (route group)
│   ├── portfolio/         # Portfolio management
│   ├── monitor/           # WorldMonitor
│   ├── api/               # API routes
│   │   ├── vane/         # Vane APIs
│   │   ├── kuberaa/      # Portfolio APIs
│   │   └── worldmonitor/ # Monitor APIs
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── lib/                   # Business logic
│   ├── vane/             # Vane logic
│   ├── kuberaa/          # Portfolio logic
│   ├── worldmonitor/     # Monitor logic
│   └── db.ts             # Database client
├── components/            # React components
│   └── shared/           # Shared components
├── prisma/               # Database
│   ├── schema.prisma     # Schema definition
│   └── seed.ts           # Seed script
└── public/               # Static files
```

## Next Steps

1. **Implement Vane Chat**
   - Add AI provider integrations in `lib/vane/chat.ts`
   - Create chat UI in `app/(vane)/vane/page.tsx`
   - Implement streaming in `app/api/vane/chat/route.ts`

2. **Implement Portfolio Management**
   - Add allocation logic in `lib/kuberaa/allocation.ts`
   - Create portfolio UI in `app/portfolio/`
   - Implement API routes in `app/api/kuberaa/`

3. **Implement WorldMonitor**
   - Add data fetching in `lib/worldmonitor/`
   - Create dashboard UI in `app/monitor/`
   - Implement API routes in `app/api/worldmonitor/`

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

### Prisma Client Issues

```bash
# Regenerate client
npx prisma generate

# Clear cache
rm -rf node_modules/.prisma
npm install
```

### Port Already in Use

```bash
# Use different port
PORT=3001 npm run dev
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t unified-platform .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e OPENAI_API_KEY="..." \
  unified-platform
```

## Support

- Vane: [Vane Documentation]
- Justyoo: [Justyoo Documentation]
- WorldMonitor: [WorldMonitor Documentation]
