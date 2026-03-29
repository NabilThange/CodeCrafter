#!/usr/bin/env pwsh
# Start all apps locally with correct ports for unified access

Write-Host ""
Write-Host "🚀 Starting Unified Platform (Local Development)" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found. Install Node.js first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker not found. Install Docker Desktop first." -ForegroundColor Red
    exit 1
}

if (-not (docker ps 2>$null)) {
    Write-Host "❌ Docker is not running. Start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites OK" -ForegroundColor Green
Write-Host ""

# Stop any existing processes on these ports
Write-Host "Cleaning up ports..." -ForegroundColor Yellow
$ports = @(3000, 3001, 5173, 5432, 80)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Write-Host "   Stopping process on port $port..." -ForegroundColor Gray
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
}
Write-Host "✅ Ports cleaned" -ForegroundColor Green
Write-Host ""

# Start PostgreSQL in Docker
Write-Host "Starting PostgreSQL database..." -ForegroundColor Yellow
$pgContainer = docker ps -q -f name=justyoo-postgres
if ($pgContainer) {
    Write-Host "   PostgreSQL already running" -ForegroundColor Gray
} else {
    docker run -d --name justyoo-postgres `
        -p 5432:5432 `
        -e POSTGRES_USER=kuberaa `
        -e POSTGRES_PASSWORD=kuberaa_dev_pass `
        -e POSTGRES_DB=kuberaa `
        postgres:16-alpine | Out-Null
    
    Write-Host "   Waiting for PostgreSQL to be ready..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}
Write-Host "✅ PostgreSQL ready" -ForegroundColor Green
Write-Host ""

# Start nginx in Docker
Write-Host "Starting nginx reverse proxy..." -ForegroundColor Yellow
$nginxContainer = docker ps -q -f name=nginx-proxy
if ($nginxContainer) {
    Write-Host "   nginx already running" -ForegroundColor Gray
} else {
    # Stop old container if exists
    docker rm -f nginx-proxy 2>$null | Out-Null
    
    # Start nginx with local config
    docker run -d --name nginx-proxy `
        -p 80:80 `
        -v "${PWD}/nginx-local.conf:/etc/nginx/nginx.conf:ro" `
        nginx:alpine | Out-Null
    
    Start-Sleep -Seconds 2
}
Write-Host "✅ nginx ready" -ForegroundColor Green
Write-Host ""

# Start Vane on port 3000
Write-Host "Starting Vane (AI Search) on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Vane; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

# Start Justyoo on port 3001
Write-Host "Starting Justyoo (Portfolio) on port 3001..." -ForegroundColor Yellow
$env:PORT = "3001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PORT='3001'; cd justyoo; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

# Start WorldMonitor on port 5173
Write-Host "Starting WorldMonitor (Intelligence) on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd worldmonitor; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "⏳ Waiting for services to start (30 seconds)..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    Write-Host "." -NoNewline -ForegroundColor Gray
    Start-Sleep -Seconds 1
}
Write-Host ""
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ✅ Unified Platform Started!" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Access at: http://localhost" -ForegroundColor White
Write-Host ""
Write-Host "  📍 Individual services:" -ForegroundColor White
Write-Host "     • Vane:         http://localhost:3000" -ForegroundColor Gray
Write-Host "     • Portfolio:    http://localhost:3001" -ForegroundColor Gray
Write-Host "     • Monitor:      http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "  📍 Unified access (via nginx):" -ForegroundColor White
Write-Host "     • Home:         http://localhost/" -ForegroundColor Cyan
Write-Host "     • Portfolio:    http://localhost/dashboard" -ForegroundColor Cyan
Write-Host "     • Monitor:      http://localhost/monitor" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • Close PowerShell windows to stop apps" -ForegroundColor Gray
Write-Host "   • Stop database: docker stop justyoo-postgres" -ForegroundColor Gray
Write-Host "   • Stop nginx: docker stop nginx-proxy" -ForegroundColor Gray
Write-Host ""

# Open browser
$openBrowser = Read-Host "Open browser now? (Y/n)"
if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
    Write-Host "Opening browser..." -ForegroundColor Green
    Start-Process "http://localhost"
}

Write-Host ""
Write-Host "Ready for demo! 🚀" -ForegroundColor Green
Write-Host ""
