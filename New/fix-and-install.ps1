# Fix and Install Script for Windows
# This script fixes dependency issues and sets up the project

Write-Host "🔧 Fixing Unified Platform Dependencies..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean existing installation
Write-Host "Step 1: Cleaning existing installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  Removing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Write-Host "  Removing package-lock.json..." -ForegroundColor Gray
    Remove-Item package-lock.json -ErrorAction SilentlyContinue
}
Write-Host "  ✅ Clean complete" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "Step 2: Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Installation failed!" -ForegroundColor Red
    Write-Host "  Try running: npm install --legacy-peer-deps --force" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Check environment file
Write-Host "Step 3: Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "  ⚠️  .env.local not found!" -ForegroundColor Yellow
    Write-Host "  Creating from .env.example..." -ForegroundColor Gray
    Copy-Item .env.example .env.local
    Write-Host "  ✅ Created .env.local - PLEASE EDIT IT WITH YOUR API KEYS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Required variables:" -ForegroundColor Cyan
    Write-Host "    - DATABASE_URL (PostgreSQL connection)" -ForegroundColor Gray
    Write-Host "    - DIRECT_URL (Direct PostgreSQL connection)" -ForegroundColor Gray
    Write-Host "    - GROQ_API_KEY or OPENAI_API_KEY (for AI features)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "  ✅ .env.local exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Generate Prisma client
Write-Host "Step 4: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Prisma generation failed!" -ForegroundColor Red
    Write-Host "  Check your DATABASE_URL in .env.local" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Step 5: Check database connection
Write-Host "Step 5: Checking database connection..." -ForegroundColor Yellow
$env:DATABASE_URL = (Get-Content .env.local | Select-String "^DATABASE_URL=" | ForEach-Object { $_ -replace "DATABASE_URL=", "" } | Select-Object -First 1)
if ([string]::IsNullOrWhiteSpace($env:DATABASE_URL)) {
    Write-Host "  ⚠️  DATABASE_URL not set in .env.local" -ForegroundColor Yellow
    Write-Host "  You will need to set it before running migrations" -ForegroundColor Gray
} else {
    Write-Host "  ✅ DATABASE_URL configured" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure your database:" -ForegroundColor Yellow
Write-Host "   Edit .env.local and set DATABASE_URL and DIRECT_URL" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Run database migrations:" -ForegroundColor Yellow
Write-Host "   npx prisma migrate dev --name init" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Seed the database:" -ForegroundColor Yellow
Write-Host "   npx prisma db seed" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start the development server:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Open your browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed instructions, see QUICK-START-WINDOWS.md" -ForegroundColor Cyan
Write-Host ""
