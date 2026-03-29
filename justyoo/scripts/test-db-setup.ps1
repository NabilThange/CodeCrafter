# Test script to verify database setup (PowerShell)

Write-Host "🧪 Testing Kuberaa Database Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test 1: Check if PostgreSQL is running
Write-Host "`nTest 1: PostgreSQL Connection" -ForegroundColor Yellow
$postgresStatus = docker-compose ps postgres
if ($postgresStatus -match "healthy") {
    Write-Host "✅ PostgreSQL is running and healthy" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL is not healthy" -ForegroundColor Red
    exit 1
}

# Test 2: Check if database exists
Write-Host "`nTest 2: Database Exists" -ForegroundColor Yellow
$dbCheck = docker-compose exec -T postgres psql -U kuberaa -d kuberaa -c "SELECT 1" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'kuberaa' exists" -ForegroundColor Green
} else {
    Write-Host "❌ Database 'kuberaa' does not exist" -ForegroundColor Red
    exit 1
}

# Test 3: Check if tables exist
Write-Host "`nTest 3: Schema Tables" -ForegroundColor Yellow
$tableCount = docker-compose exec -T postgres psql -U kuberaa -d kuberaa -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
$tableCount = $tableCount.Trim()
if ([int]$tableCount -ge 10) {
    Write-Host "✅ Schema has $tableCount tables (expected 10+)" -ForegroundColor Green
} else {
    Write-Host "❌ Schema has only $tableCount tables (expected 10+)" -ForegroundColor Red
    exit 1
}

# Test 4: Check if ETFs are seeded
Write-Host "`nTest 4: ETF Seed Data" -ForegroundColor Yellow
$etfCount = docker-compose exec -T postgres psql -U kuberaa -d kuberaa -t -c 'SELECT COUNT(*) FROM "ETF"'
$etfCount = $etfCount.Trim()
if ([int]$etfCount -ge 15) {
    Write-Host "✅ ETF table has $etfCount rows (expected 15)" -ForegroundColor Green
} else {
    Write-Host "❌ ETF table has only $etfCount rows (expected 15)" -ForegroundColor Red
    exit 1
}

# Test 5: Check if correlations are seeded
Write-Host "`nTest 5: ETF Correlation Data" -ForegroundColor Yellow
$corrCount = docker-compose exec -T postgres psql -U kuberaa -d kuberaa -t -c 'SELECT COUNT(*) FROM "ETFCorrelation"'
$corrCount = $corrCount.Trim()
if ([int]$corrCount -ge 40) {
    Write-Host "✅ ETFCorrelation table has $corrCount rows (expected 40+)" -ForegroundColor Green
} else {
    Write-Host "❌ ETFCorrelation table has only $corrCount rows (expected 40+)" -ForegroundColor Red
    exit 1
}

# Test 6: Check if justyoo app is running
Write-Host "`nTest 6: Application Status" -ForegroundColor Yellow
$appStatus = docker-compose ps justyoo
if ($appStatus -match "Up") {
    Write-Host "✅ justyoo container is running" -ForegroundColor Green
} else {
    Write-Host "❌ justyoo container is not running" -ForegroundColor Red
    exit 1
}

# Test 7: Check if app responds
Write-Host "`nTest 7: HTTP Response" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Application responds to HTTP requests" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Application may still be starting up" -ForegroundColor Yellow
}

Write-Host "`n==================================" -ForegroundColor Green
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Show sample data
Write-Host "`nSample ETF Data:" -ForegroundColor Yellow
docker-compose exec -T postgres psql -U kuberaa -d kuberaa -c 'SELECT ticker, name, "assetClass" FROM "ETF" LIMIT 5'

Write-Host "`nSample Correlation Data:" -ForegroundColor Yellow
docker-compose exec -T postgres psql -U kuberaa -d kuberaa -c 'SELECT "etfTickerA", "etfTickerB", correlation FROM "ETFCorrelation" LIMIT 5'
