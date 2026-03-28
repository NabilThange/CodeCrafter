# PowerShell script to start both Vane and WorldMonitor in development mode with Cloudflare Tunnel

Write-Host "Starting Vane + WorldMonitor Development Environment" -ForegroundColor Cyan
Write-Host ""

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm is not installed. Please install Node.js and npm first." -ForegroundColor Red
    exit 1
}

# Check if docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

# Check if cloudflared is installed
$cloudflaredInstalled = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflaredInstalled) {
    Write-Host "WARNING: cloudflared is not installed. Tunnel will not be available." -ForegroundColor Yellow
    Write-Host "   Install with: winget install --id Cloudflare.cloudflared" -ForegroundColor Gray
}

# Start SearXNG container
Write-Host "Starting SearXNG search engine..." -ForegroundColor Yellow
$searxngContainer = docker ps -q -f name=searxng-dev
if ($searxngContainer) {
    Write-Host "   SearXNG already running (container: $searxngContainer)" -ForegroundColor Gray
} else {
    # Check if searxng-dev-settings.yml exists
    if (Test-Path "searxng-dev-settings.yml") {
        docker run -d --name searxng-dev -p 8080:8080 `
            -v "${PWD}/searxng-dev-settings.yml:/etc/searxng/settings.yml:ro" `
            searxng/searxng | Out-Null
    } else {
        docker run -d --name searxng-dev -p 8080:8080 `
            -e SEARXNG_LIMITER=false `
            searxng/searxng | Out-Null
    }
    Write-Host "   SearXNG started on http://localhost:8080" -ForegroundColor Green
}

# Wait for SearXNG to be ready
Write-Host "   Waiting for SearXNG to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 3
$counter = 0
$maxTries = 15
$searxngReady = $false
while ($counter -lt $maxTries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $searxngReady = $true
            break
        }
    } catch {
        # Continue waiting
    }
    $counter++
    Start-Sleep -Seconds 1
}

if ($searxngReady) {
    Write-Host "   SearXNG is ready" -ForegroundColor Green
} else {
    Write-Host "   WARNING: SearXNG may not be fully ready" -ForegroundColor Yellow
}

# Start WorldMonitor in background
Write-Host "Starting WorldMonitor on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd worldmonitor; npm install; npm run dev" -WindowStyle Normal

# Wait a bit for WorldMonitor to start
Start-Sleep -Seconds 3

# Start Justyoo (Portfolio) in background
Write-Host "Starting Justyoo (Portfolio) on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd justyoo; npm run dev" -WindowStyle Normal

# Wait a bit for Justyoo to start
Start-Sleep -Seconds 3

# Start Vane in background
Write-Host "Starting Vane on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Vane; npm run dev" -WindowStyle Normal

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Start Cloudflare Tunnels if available
$vaneUrl = "http://localhost:3000"
$worldmonitorUrl = "http://localhost:5173"

if ($cloudflaredInstalled) {
    Write-Host "Starting Cloudflare Tunnels..." -ForegroundColor Yellow
    
    # Start Vane tunnel
    $vaneTunnelLogFile = "$env:TEMP\cloudflared-vane-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
    $vaneTunnelJob = Start-Job -ScriptBlock {
        param($logFile)
        cloudflared tunnel --url http://localhost:3000 2>&1 | Tee-Object -FilePath $logFile
    } -ArgumentList $vaneTunnelLogFile
    
    # Start WorldMonitor tunnel
    $worldmonitorTunnelLogFile = "$env:TEMP\cloudflared-worldmonitor-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
    $worldmonitorTunnelJob = Start-Job -ScriptBlock {
        param($logFile)
        cloudflared tunnel --url http://localhost:5173 2>&1 | Tee-Object -FilePath $logFile
    } -ArgumentList $worldmonitorTunnelLogFile
    
    # Wait for tunnels to initialize and extract URLs
    Write-Host "   Waiting for tunnel URLs..." -ForegroundColor Gray
    
    $vaneTunnelUrl = $null
    $worldmonitorTunnelUrl = $null
    $attempts = 0
    
    while ($attempts -lt 20) {
        Start-Sleep -Seconds 1
        
        # Check Vane tunnel
        if (-not $vaneTunnelUrl -and (Test-Path $vaneTunnelLogFile)) {
            $logContent = Get-Content $vaneTunnelLogFile -Raw -ErrorAction SilentlyContinue
            if ($logContent -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
                $vaneTunnelUrl = $matches[0]
            }
        }
        
        # Check WorldMonitor tunnel
        if (-not $worldmonitorTunnelUrl -and (Test-Path $worldmonitorTunnelLogFile)) {
            $logContent = Get-Content $worldmonitorTunnelLogFile -Raw -ErrorAction SilentlyContinue
            if ($logContent -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
                $worldmonitorTunnelUrl = $matches[0]
            }
        }
        
        # Break if both URLs found
        if ($vaneTunnelUrl -and $worldmonitorTunnelUrl) {
            break
        }
        
        $attempts++
    }
    
    # Update environment files with tunnel URLs
    if ($vaneTunnelUrl) {
        Write-Host "   Vane Tunnel: $vaneTunnelUrl" -ForegroundColor Green
        $vaneUrl = $vaneTunnelUrl
        
        # Update Vane .env.local
        if (Test-Path "Vane/.env.local") {
            $vaneEnv = Get-Content "Vane/.env.local" -Raw
            $vaneEnv = $vaneEnv -replace 'NEXT_PUBLIC_VANE_URL=.*', "NEXT_PUBLIC_VANE_URL=$vaneTunnelUrl"
            Set-Content "Vane/.env.local" -Value $vaneEnv -NoNewline
        }
    }
    
    if ($worldmonitorTunnelUrl) {
        Write-Host "   WorldMonitor Tunnel: $worldmonitorTunnelUrl" -ForegroundColor Green
        $worldmonitorUrl = $worldmonitorTunnelUrl
        
        # Update Vane .env.local with WorldMonitor URL
        if (Test-Path "Vane/.env.local") {
            $vaneEnv = Get-Content "Vane/.env.local" -Raw
            $vaneEnv = $vaneEnv -replace 'NEXT_PUBLIC_WORLDMONITOR_URL=.*', "NEXT_PUBLIC_WORLDMONITOR_URL=$worldmonitorTunnelUrl"
            Set-Content "Vane/.env.local" -Value $vaneEnv -NoNewline
        }
        
        # Update WorldMonitor .env.local
        if (Test-Path "worldmonitor/.env.local") {
            $worldmonitorEnv = Get-Content "worldmonitor/.env.local" -Raw
            $worldmonitorEnv = $worldmonitorEnv -replace 'VITE_VANE_URL=.*', "VITE_VANE_URL=$vaneTunnelUrl"
            Set-Content "worldmonitor/.env.local" -Value $worldmonitorEnv -NoNewline
        }
    }
    
    # Save tunnel info for stop script
    @{
        VaneJobId = $vaneTunnelJob.Id
        VaneLogFile = $vaneTunnelLogFile
        VaneUrl = $vaneTunnelUrl
        WorldMonitorJobId = $worldmonitorTunnelJob.Id
        WorldMonitorLogFile = $worldmonitorTunnelLogFile
        WorldMonitorUrl = $worldmonitorTunnelUrl
    } | ConvertTo-Json | Set-Content "$env:TEMP\cloudflared-tunnel-info.json"
    
    if (-not $vaneTunnelUrl -or -not $worldmonitorTunnelUrl) {
        Write-Host "   WARNING: Could not extract all tunnel URLs" -ForegroundColor Yellow
        Write-Host "   Vane log: $vaneTunnelLogFile" -ForegroundColor Gray
        Write-Host "   WorldMonitor log: $worldmonitorTunnelLogFile" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "SUCCESS: All services are starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "Local Access:" -ForegroundColor Cyan
Write-Host "   - Vane (AI Search):         http://localhost:3000"
Write-Host "   - Justyoo (Portfolio):      http://localhost:3001"
Write-Host "   - WorldMonitor (Dashboard): http://localhost:5173"
Write-Host "   - Integrated View:          http://localhost:3000/portfolio or http://localhost:3000/monitor"
Write-Host "   - SearXNG (Search Engine):  http://localhost:8080"

if ($cloudflaredInstalled -and ($vaneTunnelUrl -or $worldmonitorTunnelUrl)) {
    Write-Host ""
    Write-Host "Public Access (Cloudflare Tunnels):" -ForegroundColor Magenta
    if ($vaneTunnelUrl) {
        Write-Host "   - Vane:         $vaneTunnelUrl" -ForegroundColor White
    }
    if ($worldmonitorTunnelUrl) {
        Write-Host "   - WorldMonitor: $worldmonitorTunnelUrl" -ForegroundColor White
    }
    Write-Host "   Share these URLs with your team!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   NOTE: Tunnel URLs change each restart. Env files updated automatically." -ForegroundColor Yellow
} elseif ($cloudflaredInstalled) {
    Write-Host ""
    Write-Host "WARNING: Cloudflare Tunnels started but URLs not detected yet" -ForegroundColor Yellow
    if ($vaneTunnelLogFile) {
        Write-Host "   Vane log: $vaneTunnelLogFile" -ForegroundColor Gray
    }
    if ($worldmonitorTunnelLogFile) {
        Write-Host "   WorldMonitor log: $worldmonitorTunnelLogFile" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Close the PowerShell windows to stop the applications" -ForegroundColor Gray
