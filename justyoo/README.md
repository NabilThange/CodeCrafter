# Kuberaa — Portfolio Management Platform

> Named after Kubera (कुबेर), the Hindu god of wealth and treasurer of the gods.

Kuberaa is a rule-based, algorithmic portfolio manager for individual investors. It guides users from knowing nothing about investing to having a fully constructed, tracked, and periodically rebalanced investment portfolio.

## Features

- 🎯 Risk profiling & investor onboarding
- 📊 Asset allocation engine (rule-based, no AI)
- 💼 ETF selection & portfolio construction
- 📈 Portfolio tracking & performance metrics
- 🔄 Automated rebalancing suggestions
- 💱 Multi-currency support (USD/INR)
- 📉 Paper trading simulation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Styling**: Tailwind CSS + Material-UI
- **Charts**: MUI X-Charts

## Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Setup PostgreSQL (see DATABASE-SETUP.md)
# Create database: kuberaa
# Create user: kuberaa / kuberaa_dev_pass

# 3. Configure environment
cp .env.example .env
# Edit DATABASE_URL in .env

# 4. Run migrations & seed
npx prisma migrate deploy
npm run db:seed

# 5. Start dev server
npm run dev
# Open http://localhost:3001
```

### Docker Deployment

```bash
# From project root
docker-compose up -d postgres
docker-compose up -d justyoo

# Check logs
docker-compose logs -f justyoo
```

## Database Setup

Kuberaa uses PostgreSQL with Prisma ORM. The database includes:

- 10 tables (User, Portfolio, ETF, etc.)
- 15 pre-seeded ETFs across 5 asset classes
- 40+ correlation pairs for portfolio optimization

**Full setup guide**: See [DATABASE-SETUP.md](./DATABASE-SETUP.md)

## Project Structure

```
justyoo/
├── app/                    # Next.js App Router
│   ├── kuberaa/           # Main app routes
│   │   ├── dashboard/     # Portfolio dashboard
│   │   ├── onboarding/    # Risk profiling
│   │   ├── allocation/    # Asset allocation
│   │   ├── etfs/          # ETF selection
│   │   ├── rebalance/     # Rebalancing
│   │   └── profile/       # User profile
│   └── api/               # API routes
├── lib/                   # Core business logic
│   ├── allocation/        # Allocation engine
│   ├── rebalance/         # Rebalancing engine
│   ├── risk/              # Risk scoring
│   ├── etf/               # ETF selection
│   ├── portfolio/         # Portfolio metrics
│   ├── currency/          # Currency conversion
│   └── db.ts              # Prisma client
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed data
│   └── migrations/        # Migration history
└── Dockerfile             # Production build
```

## Key Algorithms

### 1. Risk Profiling
- 10-question questionnaire
- Weighted scoring (0-100)
- Maps to Conservative/Balanced/Aggressive

### 2. Asset Allocation
- Rule-based allocation by risk profile
- Considers time horizon, goals, ESG preferences
- Outputs target weights per asset class

### 3. ETF Selection
- Filters by asset class, ESG, expense ratio
- Ranks by historical return, volatility
- Considers correlation matrix

### 4. Rebalancing
- Monitors drift from target allocation
- Triggers when threshold exceeded (default 5%)
- Generates buy/sell recommendations

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://kuberaa:kuberaa_dev_pass@localhost:5432/kuberaa?schema=public"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Optional: Live price APIs
POLYGON_API_KEY=""
ALPHA_VANTAGE_API_KEY=""
```

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:migrate   # Run migrations (dev)
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Docker Configuration

The app includes a multi-stage Dockerfile optimized for production:

1. **deps**: Install dependencies
2. **builder**: Generate Prisma Client + build Next.js
3. **runner**: Minimal production image with entrypoint script

**Entrypoint script** (`entrypoint.sh`):
- Waits for PostgreSQL
- Runs migrations
- Seeds database
- Starts application

## Integration with Main Platform

Kuberaa is part of a larger financial intelligence platform:

- **Vane** (Port 3000): AI search engine
- **Kuberaa** (Port 3001): Portfolio manager
- **WorldMonitor** (Port 5173): Global intelligence dashboard

Cross-app navigation is handled via environment variables:
```env
NEXT_PUBLIC_PORTFOLIO_URL=http://localhost:3001
NEXT_PUBLIC_WORLDMONITOR_URL=http://localhost:5173
```

## Product Requirements

Full product specification: [Kuberaa_PRD.md](./Kuberaa_PRD.md)

Key principles:
- **Transparency**: Every recommendation is explainable
- **User Control**: All outputs are editable
- **No AI**: Rule-based algorithms only
- **Paper Trading**: No real money in v1

## Roadmap

- [x] Database schema & migrations
- [x] Seed data (ETFs + correlations)
- [x] Docker setup
- [ ] Onboarding flow
- [ ] Risk profiling algorithm
- [ ] Asset allocation engine
- [ ] ETF selection engine
- [ ] Portfolio construction
- [ ] Dashboard & tracking
- [ ] Rebalancing engine
- [ ] Currency conversion
- [ ] Market charts integration

## Troubleshooting

### Database Issues

```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1"

# View logs
docker-compose logs postgres

# Reset database (dev only)
npx prisma migrate reset
```

### Docker Issues

```bash
# Rebuild image
docker-compose build justyoo

# Check entrypoint logs
docker-compose logs justyoo | grep "🔄\|✅\|❌"

# Access container
docker exec -it justyoo sh
```

See [DATABASE-SETUP.md](./DATABASE-SETUP.md) for detailed troubleshooting.

## Contributing

This is a portfolio project. Contributions welcome!

1. Fork the repo
2. Create feature branch
3. Make changes
4. Test locally + Docker
5. Submit PR

## License

MIT

## Support

- Documentation: See `/docs` folder
- Issues: GitHub Issues
- PRD: `Kuberaa_PRD.md`
- Database Guide: `DATABASE-SETUP.md`
