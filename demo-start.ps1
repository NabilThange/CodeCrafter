#!/usr/bin/env pwsh
# One-command startup for investor demo

Write-Host ""
Write-Host "🚀 Starting Unified Platform for Investor Demo..." -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

if (-not (docker ps 2>$null)) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Stop any existing services
Write-Host "Cleaning up old services..." -ForegroundColor Yellow
docker-compose down 2>$null | Out-Null
Write-Host "✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Start all services
Write-Host "Starting all services..." -ForegroundColor Yellow
Write-Host "   This may take 1-3 minutes on first run..." -ForegroundColor Gray
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    Write-Host "   Try: docker-compose up -d --build" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Services started" -ForegroundColor Green
Write-Host ""

# Wait for services
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
$dots = ""
for ($i = 0; $i -lt 45; $i++) {
    Start-Sleep -Seconds 1
    $dots += "."
    Write-Host "`r   $dots" -NoNewline -ForegroundColor Gray
}
Write-Host ""
Write-Host "✅ Services should be ready" -ForegroundColor Green
Write-Host ""

# Test endpoints
Write-Host "Testing endpoints..." -ForegroundColor Yellow

$allGood = $true

# Test Vane
try {
    $response = Invoke-WebRequest -Uri "http://localhost/" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Vane (Home)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Vane (Home) - May need more time" -ForegroundColor Yellow
    $allGood = $false
}

# Test Portfolio
try {
    $response = Invoke-WebRequest -Uri "http://localhost/dashboard" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Portfolio (Dashboard)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Portfolio (Dashboard) - May need more time" -ForegroundColor Yellow
    $allGood = $false
}

# Test Monitor
try {
    $response = Invoke-WebRequest -Uri "http://localhost/monitor" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Monitor (Intelligence)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Monitor (Intelligence) - May need more time" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

if ($allGood) {
    Write-Host "🎉 SUCCESS! Platform is ready!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some services may need more time to start" -ForegroundColor Yellow
    Write-Host "   Wait 30 more seconds and try accessing http://localhost" -ForegroundColor Gray
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🌐 Access your unified platform at:" -ForegroundColor White
Write-Host ""
Write-Host "     http://localhost" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📍 Direct links:" -ForegroundColor White
Write-Host "     • Home (AI Search):  http://localhost/" -ForegroundColor Gray
Write-Host "     • Portfolio:         http://localhost/dashboard" -ForegroundColor Gray
Write-Host "     • Monitor:           http://localhost/monitor" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • All navigation works from the sidebar/top nav" -ForegroundColor Gray
Write-Host "   • No need to change URLs manually" -ForegroundColor Gray
Write-Host "   • To stop: docker-compose down" -ForegroundColor Gray
Write-Host "   • To view logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host ""

# Open browser
$openBrowser = Read-Host "Open browser now? (Y/n)"
if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
    Write-Host "Opening browser..." -ForegroundColor Green
    Start-Process "http://localhost"
}

Write-Host ""
Write-Host "Ready for your investor demo! 🚀" -ForegroundColor Green
Write-Host ""
