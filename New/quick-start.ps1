# Unified Platform — Quick Start Script (PowerShell)
# This script sets up the development environment

Write-Host "🚀 Unified Platform — Quick Start" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 20+ first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path .env.local)) {
    Write-Host "📝 Creating .env.local from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env.local
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env.local with your configuration:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL (required)"
    Write-Host "   - API keys (optional, by feature)"
    Write-Host ""
    Read-Host "Press Enter to continue after editing .env.local"
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host ""

# Check if database is configured
$envContent = Get-Content .env.local -Raw
if ($envContent -match "postgresql://user:password@host:5432/database") {
    Write-Host "⚠️  Database URL not configured in .env.local" -ForegroundColor Yellow
    Write-Host "   Please update DATABASE_URL before running migrations"
    Write-Host ""
} else {
    # Run migrations
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    Write-Host ""

    # Seed database
    Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
    npx prisma db seed
    Write-Host ""
}

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Edit .env.local with your configuration"
Write-Host "   2. Run: npm run dev"
Write-Host "   3. Open: http://localhost:3000"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md — Project overview"
Write-Host "   - SETUP.md — Detailed setup guide"
Write-Host "   - MIGRATION.md — Code migration guide"
Write-Host ""
