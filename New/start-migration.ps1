# Project Consolidation - Quick Start Script
# This script helps you set up the unified platform

Write-Host "🎯 Unified Platform - Quick Start" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the New directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the New/ directory" -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Check for .env.local
Write-Host "🔧 Step 2: Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "📝 Please edit .env.local with your configuration:" -ForegroundColor Cyan
    Write-Host "   - DATABASE_URL (Supabase PostgreSQL)" -ForegroundColor Cyan
    Write-Host "   - OPENAI_API_KEY or GROQ_API_KEY (AI provider)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Enter after you've configured .env.local..." -ForegroundColor Yellow
    Read-Host
} else {
    Write-Host "✅ .env.local found" -ForegroundColor Green
}
Write-Host ""

# Step 3: Database setup
Write-Host "🗄️  Step 3: Setting up database..." -ForegroundColor Yellow
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

Write-Host "Running database migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "   Make sure DATABASE_URL is correct in .env.local" -ForegroundColor Yellow
    exit 1
}

Write-Host "Seeding database..." -ForegroundColor Cyan
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Failed to seed database (this is optional)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Database seeded" -ForegroundColor Green
}
Write-Host ""

# Step 4: Ready to start
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start development server: npm run dev" -ForegroundColor White
Write-Host "2. Open http://localhost:3000" -ForegroundColor White
Write-Host "3. Follow MIGRATION.md to copy code from existing projects" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  npm run dev          - Start development server" -ForegroundColor White
Write-Host "  npm run build        - Build for production" -ForegroundColor White
Write-Host "  npm run db:studio    - Open Prisma Studio" -ForegroundColor White
Write-Host "  npm run db:migrate   - Run database migrations" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  README.md            - Project overview" -ForegroundColor White
Write-Host "  SETUP.md             - Detailed setup guide" -ForegroundColor White
Write-Host "  MIGRATION.md         - Code migration guide" -ForegroundColor White
Write-Host "  CHECKLIST.md         - Implementation tracking" -ForegroundColor White
Write-Host ""

# Ask if user wants to start dev server
$response = Read-Host "Would you like to start the development server now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Green
    npm run dev
}
