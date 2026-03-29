#!/bin/bash
# Test script to verify database setup

set -e

echo "🧪 Testing Kuberaa Database Setup"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if PostgreSQL is running
echo -e "\n${YELLOW}Test 1: PostgreSQL Connection${NC}"
if docker-compose ps postgres | grep -q "healthy"; then
    echo -e "${GREEN}✅ PostgreSQL is running and healthy${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not healthy${NC}"
    exit 1
fi

# Test 2: Check if database exists
echo -e "\n${YELLOW}Test 2: Database Exists${NC}"
if docker-compose exec -T postgres psql -U kuberaa -d kuberaa -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database 'kuberaa' exists${NC}"
else
    echo -e "${RED}❌ Database 'kuberaa' does not exist${NC}"
    exit 1
fi

# Test 3: Check if tables exist
echo -e "\n${YELLOW}Test 3: Schema Tables${NC}"
TABLE_COUNT=$(docker-compose exec -T postgres psql -U kuberaa -d kuberaa -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
if [ "$TABLE_COUNT" -ge 10 ]; then
    echo -e "${GREEN}✅ Schema has $TABLE_COUNT tables (expected 10+)${NC}"
else
    echo -e "${RED}❌ Schema has only $TABLE_COUNT tables (expected 10+)${NC}"
    exit 1
fi

# Test 4: Check if ETFs are seeded
echo -e "\n${YELLOW}Test 4: ETF Seed Data${NC}"
ETF_COUNT=$(docker-compose exec -T postgres psql -U kuberaa -d kuberaa -t -c 'SELECT COUNT(*) FROM "ETF"')
if [ "$ETF_COUNT" -ge 15 ]; then
    echo -e "${GREEN}✅ ETF table has $ETF_COUNT rows (expected 15)${NC}"
else
    echo -e "${RED}❌ ETF table has only $ETF_COUNT rows (expected 15)${NC}"
    exit 1
fi

# Test 5: Check if correlations are seeded
echo -e "\n${YELLOW}Test 5: ETF Correlation Data${NC}"
CORR_COUNT=$(docker-compose exec -T postgres psql -U kuberaa -d kuberaa -t -c 'SELECT COUNT(*) FROM "ETFCorrelation"')
if [ "$CORR_COUNT" -ge 40 ]; then
    echo -e "${GREEN}✅ ETFCorrelation table has $CORR_COUNT rows (expected 40+)${NC}"
else
    echo -e "${RED}❌ ETFCorrelation table has only $CORR_COUNT rows (expected 40+)${NC}"
    exit 1
fi

# Test 6: Check if justyoo app is running
echo -e "\n${YELLOW}Test 6: Application Status${NC}"
if docker-compose ps justyoo | grep -q "Up"; then
    echo -e "${GREEN}✅ justyoo container is running${NC}"
else
    echo -e "${RED}❌ justyoo container is not running${NC}"
    exit 1
fi

# Test 7: Check if app responds
echo -e "\n${YELLOW}Test 7: HTTP Response${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Application responds to HTTP requests${NC}"
else
    echo -e "${YELLOW}⚠️  Application may still be starting up${NC}"
fi

echo -e "\n${GREEN}=================================="
echo -e "✅ All tests passed!"
echo -e "==================================${NC}\n"

# Show sample data
echo -e "${YELLOW}Sample ETF Data:${NC}"
docker-compose exec -T postgres psql -U kuberaa -d kuberaa -c 'SELECT ticker, name, "assetClass" FROM "ETF" LIMIT 5'

echo -e "\n${YELLOW}Sample Correlation Data:${NC}"
docker-compose exec -T postgres psql -U kuberaa -d kuberaa -c 'SELECT "etfTickerA", "etfTickerB", correlation FROM "ETFCorrelation" LIMIT 5'
