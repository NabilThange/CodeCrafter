# Quick test script for unified platform
Write-Host "Testing Unified Platform..." -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n1. Checking Docker..." -ForegroundColor Yellow
docker ps > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Docker is running" -ForegroundColor Green

# Check if services are running
Write-Host "`n2. Checking services..." -ForegroundColor Yellow
$services = @("nginx-proxy", "vane", "justyoo", "worldmonitor", "justyoo-postgres")
$allRunning = $true

foreach ($service in $services) {
    $status = docker ps --filter "name=$service" --format "{{.Status}}" 2>$null
    if ($status -match "Up") {
        Write-Host "   ✅ $service is running" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $service is not running" -ForegroundColor Red
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host "`n   Run './start-dev.ps1' to start all services" -ForegroundColor Yellow
    exit 1
}

# Test endpoints
Write-Host "`n3. Testing endpoints..." -ForegroundColor Yellow

$endpoints = @{
    "Vane (Home)" = "http://localhost/"
    "Portfolio" = "http://localhost/dashboard"
    "Monitor" = "http://localhost/monitor"
}

foreach ($name in $endpoints.Keys) {
    $url = $endpoints[$name]
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $name ($url)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $name ($url) - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ $name ($url) - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✨ Unified Platform Status:" -ForegroundColor Cyan
Write-Host "   🌐 Access at: http://localhost" -ForegroundColor White
Write-Host "   📊 Portfolio: http://localhost/dashboard" -ForegroundColor White
Write-Host "   🌍 Monitor: http://localhost/monitor" -ForegroundColor White
Write-Host "`n   Ready for investor demo! 🚀" -ForegroundColor Green
