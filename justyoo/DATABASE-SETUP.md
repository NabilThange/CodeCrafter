# Kuberaa Database Setup Guide

## Overview

Kuberaa uses PostgreSQL 16 with Prisma ORM for data persistence. This guide covers both local development and Docker deployment.

## Architecture

- **Database**: PostgreSQL 16 (Alpine)
- **ORM**: Prisma with `@prisma/adapter-pg`
- **Connection Pooling**: `pg` library
- **Schema**: 10 tables (User, InvestorProfile, Portfolio, etc.)
- **Seed Data**: 15 ETFs + 40+ correlation pairs

## Local Development Setup

### 1. Install PostgreSQL

**Windows:**
```bash
# Using Chocolatey
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux:**
```bash
sudo apt-get install postgresql-16
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create user and database
CREATE USER kuberaa WITH PASSWORD 'kuberaa_dev_pass';
CREATE DATABASE kuberaa OWNER kuberaa;
GRANT ALL PRIVILEGES ON DATABASE kuberaa TO kuberaa;
\q
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env - ensure DATABASE_URL uses localhost
DATABASE_URL="postgresql://kuberaa:kuberaa_dev_pass@localhost:5432/kuberaa?schema=public"
```

### 4. Run Migrations & Seed

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed

# Verify setup
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
# App runs on http://localhost:3001
```

## Docker Deployment

### Using docker-compose (Recommended)

The root `docker-compose.yml` orchestrates all services including PostgreSQL.

```bash
# From project root
docker-compose up -d postgres
docker-compose up -d justyoo

# Check logs
docker-compose logs -f justyoo

# Stop services
docker-compose down
```

### Database Initialization Flow

1. **PostgreSQL starts** with health check (`pg_isready`)
2. **justyoo waits** for postgres to be healthy
3. **entrypoint.sh runs**:
   - Waits for database connection
   - Runs `prisma migrate deploy`
   - Runs `prisma db seed`
   - Starts Next.js server

### Environment Variables in Docker

```yaml
# docker-compose.yml
justyoo:
  environment:
    # Use service name 'postgres' instead of 'localhost'
    DATABASE_URL: postgresql://kuberaa:kuberaa_dev_pass@postgres:5432/kuberaa?schema=public
    NEXT_PUBLIC_APP_URL: http://localhost:3001
```

## Database Schema

### Core Tables

1. **User** - User accounts
2. **InvestorProfile** - Risk profile, goals, preferences
3. **Portfolio** - User portfolios
4. **PortfolioHolding** - Individual ETF holdings
5. **ETF** - Master ETF list (15 ETFs)
6. **ETFCorrelation** - Correlation matrix (40+ pairs)
7. **Transaction** - Buy/sell history
8. **RebalancingLog** - Rebalancing events
9. **PriceSnapshot** - Historical ETF prices
10. **CurrencySnapshot** - USD/INR exchange rates

### Seed Data

**15 ETFs across 5 asset classes:**
- Equities: SPY, QQQ, VTI, VEA, VWO, ESGU
- Bonds: BND, AGG, BNDX, TIP
- Real Estate: VNQ
- Commodities: GLD, IAU, DJP
- Cash: SHV

**40+ correlation pairs** with realistic values (e.g., SPY-VTI: 0.99, SPY-BND: -0.12)

## Troubleshooting

### "DATABASE_URL not set"

```bash
# Ensure .env file exists
cat .env

# Verify DATABASE_URL is set
echo $DATABASE_URL
```

### "Connection refused"

```bash
# Check PostgreSQL is running
# Local:
pg_isready -h localhost -p 5432

# Docker:
docker-compose ps postgres
docker-compose logs postgres
```

### "Relation does not exist"

```bash
# Run migrations
npx prisma migrate deploy

# Or reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### "ETF master list not seeded"

```bash
# Run seed script
npm run db:seed

# Verify
npx prisma studio
# Check ETF table has 15 rows
```

### Docker: "Seed failed"

```bash
# Check logs
docker-compose logs justyoo

# Common issues:
# 1. tsx not installed - fixed in package.json
# 2. DATABASE_URL wrong - check docker-compose.yml
# 3. Migrations not run - check entrypoint.sh
```

## Useful Commands

```bash
# Prisma Studio (GUI)
npx prisma studio

# View migrations
npx prisma migrate status

# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name description

# Reset database (dev only)
npx prisma migrate reset

# Seed database
npm run db:seed

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

## Database Validation

The app includes automatic validation on startup:

```typescript
// lib/db-init.ts
import { validateDatabase } from './lib/db-init';

// In API route or layout
await validateDatabase();
// ✅ Database ready: 15 ETFs, 40 correlations loaded
```

## Performance Considerations

- **Connection Pooling**: Enabled via `pg` Pool
- **Singleton Pattern**: Prevents connection exhaustion in dev
- **Indexes**: Added on frequently queried columns
- **Decimal Precision**: Financial data uses `Decimal` type

## Security

- **Credentials**: Never commit `.env` file
- **Production**: Use strong passwords and SSL connections
- **Docker**: Postgres data persists in named volume
- **Migrations**: Version-controlled in `prisma/migrations/`

## Next Steps

1. ✅ Database setup complete
2. ✅ Migrations applied
3. ✅ Seed data loaded
4. 🔄 Build onboarding flow
5. 🔄 Implement allocation engine
6. 🔄 Add portfolio tracking

## Support

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Kuberaa PRD: `./Kuberaa_PRD.md`
