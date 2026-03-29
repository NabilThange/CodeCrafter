# Test Database Connection Script

Write-Host "Testing Database Connection..." -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local not found!" -ForegroundColor Red
    Write-Host "   Create it from .env.example first" -ForegroundColor Yellow
    exit 1
}

# Extract DATABASE_URL
$databaseUrl = (Get-Content .env.local | Select-String "^DATABASE_URL=" | ForEach-Object { $_ -replace 'DATABASE_URL="', '' -replace '".*', '' } | Select-Object -First 1)
$directUrl = (Get-Content .env.local | Select-String "^DIRECT_URL=" | ForEach-Object { $_ -replace 'DIRECT_URL="', '' -replace '".*', '' } | Select-Object -First 1)

Write-Host "Configuration Check:" -ForegroundColor Yellow
Write-Host ""

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "ERROR: DATABASE_URL not set" -ForegroundColor Red
} else {
    Write-Host "OK: DATABASE_URL configured" -ForegroundColor Green
    # Extract host and port
    if ($databaseUrl -match '@([^:]+):(\d+)') {
        $dbHost = $matches[1]
        $port = $matches[2]
        Write-Host "   Host: $dbHost" -ForegroundColor Gray
        Write-Host "   Port: $port" -ForegroundColor Gray
        
        if ($port -ne "6543") {
            Write-Host "   WARNING: DATABASE_URL should use port 6543 (pooled)" -ForegroundColor Yellow
        }
        if ($databaseUrl -notmatch '\?pgbouncer=true') {
            Write-Host "   WARNING: DATABASE_URL should have ?pgbouncer=true" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

if ([string]::IsNullOrWhiteSpace($directUrl)) {
    Write-Host "ERROR: DIRECT_URL not set" -ForegroundColor Red
} else {
    Write-Host "OK: DIRECT_URL configured" -ForegroundColor Green
    # Extract host and port
    if ($directUrl -match '@([^:]+):(\d+)') {
        $dbHost = $matches[1]
        $port = $matches[2]
        Write-Host "   Host: $dbHost" -ForegroundColor Gray
        Write-Host "   Port: $port" -ForegroundColor Gray
        
        if ($port -ne "5432") {
            Write-Host "   WARNING: DIRECT_URL should use port 5432 (direct)" -ForegroundColor Yellow
        }
        if ($directUrl -match '\?pgbouncer=true') {
            Write-Host "   WARNING: DIRECT_URL should NOT have ?pgbouncer=true" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test network connectivity
Write-Host "Network Test:" -ForegroundColor Yellow
Write-Host ""

if ($directUrl -match '@([^:]+):(\d+)') {
    $dbHost = $matches[1]
    $port = [int]$matches[2]
    
    Write-Host "Testing connection to ${dbHost}:${port}..." -ForegroundColor Gray
    
    try {
        $result = Test-NetConnection -ComputerName $dbHost -Port $port -WarningAction SilentlyContinue
        
        if ($result.TcpTestSucceeded) {
            Write-Host "OK: Network connection successful" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Network connection failed" -ForegroundColor Red
            Write-Host ""
            Write-Host "Possible causes:" -ForegroundColor Yellow
            Write-Host "  1. Supabase project is paused (most common)" -ForegroundColor Gray
            Write-Host "  2. Firewall blocking connection" -ForegroundColor Gray
            Write-Host "  3. Wrong host or port" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Solutions:" -ForegroundColor Yellow
            Write-Host "  1. Go to supabase.com/dashboard and resume your project" -ForegroundColor Gray
            Write-Host "  2. Check firewall settings" -ForegroundColor Gray
            Write-Host "  3. Verify connection string in Supabase dashboard" -ForegroundColor Gray
        }
    } catch {
        Write-Host "ERROR: Network test failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Prisma connection
Write-Host "Prisma Connection Test:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Running: npx prisma db pull" -ForegroundColor Gray
Write-Host ""

npx prisma db pull 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Prisma can connect to database!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. npx prisma migrate dev --name init" -ForegroundColor Gray
    Write-Host "  2. npx prisma db seed" -ForegroundColor Gray
    Write-Host "  3. npm run dev" -ForegroundColor Gray
} else {
    Write-Host "ERROR: Prisma cannot connect to database" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  1. Resume Supabase project: supabase.com/dashboard" -ForegroundColor Gray
    Write-Host "  2. Check password in connection string" -ForegroundColor Gray
    Write-Host "  3. Use local PostgreSQL instead" -ForegroundColor Gray
    Write-Host ""
    Write-Host "See TROUBLESHOOTING.md for detailed help" -ForegroundColor Cyan
}

Write-Host ""
