# Unified Platform

A consolidated Next.js 15 application combining three powerful features:

- **Vane** — AI-powered search and chat interface
- **Justyoo (Kuberaa)** — Intelligent ETF portfolio management
- **WorldMonitor** — Real-time global intelligence dashboard

## Project Structure

```
New/
├── app/
│   ├── (vane)/              # AI search features (route group)
│   ├── portfolio/           # Justyoo portfolio features
│   ├── monitor/             # WorldMonitor features
│   ├── api/
│   │   ├── vane/           # Vane API routes
│   │   ├── kuberaa/        # Justyoo API routes
│   │   └── worldmonitor/   # WorldMonitor API routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── lib/
│   ├── vane/               # Vane business logic
│   ├── kuberaa/            # Justyoo business logic
│   └── worldmonitor/       # WorldMonitor business logic
├── components/
│   └── shared/             # Shared UI components
├── prisma/
│   ├── schema.prisma       # Unified database schema
│   └── seed.ts             # Database seeding
└── public/                 # Static assets
```

## Features by Module

### Vane (AI Search)
- Multi-provider AI chat (OpenAI, Anthropic, Groq, Ollama)
- Web search integration
- Document analysis
- Real-time streaming responses

### Justyoo (Portfolio)
- Risk-based ETF allocation
- Automated rebalancing
- Multi-currency support
- Transaction tracking
- Performance analytics

### WorldMonitor
- Real-time conflict tracking
- Aviation intelligence
- Market monitoring
- Satellite fire detection
- Internet outage tracking

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Caching**: Upstash Redis
- **AI**: OpenAI, Anthropic, Groq, Ollama
- **Charts**: Lightweight Charts, MUI X-Charts

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase recommended)
- Redis instance (Upstash recommended)

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

3. Initialize the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

The unified schema includes:

- **User** — Unified authentication
- **InvestorProfile** — Portfolio risk profiles
- **Portfolio** — ETF holdings and allocations
- **ETF** — ETF master data
- **Transaction** — Trade history
- **Chat** — Vane conversation history
- **Message** — Chat messages

## API Routes

### Vane APIs (`/api/vane/*`)
- `/api/vane/chat` — AI chat endpoint
- `/api/vane/search` — Web search
- `/api/vane/models` — Available AI models

### Justyoo APIs (`/api/kuberaa/*`)
- `/api/kuberaa/portfolio` — Portfolio management
- `/api/kuberaa/etfs` — ETF data and suggestions
- `/api/kuberaa/rebalance` — Rebalancing engine
- `/api/kuberaa/transactions` — Trade execution

### WorldMonitor APIs (`/api/worldmonitor/*`)
- `/api/worldmonitor/conflicts` — ACLED conflict data
- `/api/worldmonitor/aviation` — Flight tracking
- `/api/worldmonitor/market` — Market data
- `/api/worldmonitor/fires` — NASA FIRMS fire data

## Environment Variables

See `.env.example` for all required and optional environment variables.

### Required
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` — Application base URL

### Optional (by feature)
- AI providers: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`
- Market data: `FINNHUB_API_KEY`, `POLYGON_API_KEY`
- Intelligence: `ACLED_EMAIL`, `ACLED_PASSWORD`, `AVIATIONSTACK_API`
- Caching: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t unified-platform .
docker run -p 3000:3000 unified-platform
```

## License

- **Vane**: MIT
- **Justyoo**: Proprietary
- **WorldMonitor**: AGPL-3.0

## Contributing

This is a consolidated project. Refer to individual module documentation for contribution guidelines.
