# PowerShell script to stop both Vane and WorldMonitor development servers

Write-Host "Stopping Vane + WorldMonitor Development Servers" -ForegroundColor Cyan
Write-Host ""

# Function to kill processes on a specific port
function Stop-ProcessOnPort {
    param (
        [int]$Port,
        [string]$AppName
    )
    
    Write-Host "Checking for $AppName on port $Port..." -ForegroundColor Yellow
    
    # Find processes using the port
    $connections = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"
    
    if ($connections) {
        $processIds = @()
        foreach ($connection in $connections) {
            $parts = $connection.ToString() -split '\s+' | Where-Object { $_ -ne '' }
            $processId = $parts[-1]
            if ($processId -and $processId -match '^\d+$') {
                $processIds += $processId
            }
        }
        
        $processIds = $processIds | Select-Object -Unique
        
        foreach ($processId in $processIds) {
            try {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  Stopping process $($process.ProcessName) (PID: $processId)" -ForegroundColor Gray
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                }
            } catch {
                # Process might have already stopped
            }
        }
        
        Write-Host "  $AppName stopped" -ForegroundColor Green
    } else {
        Write-Host "  No process found on port $Port" -ForegroundColor Gray
    }
}

# Stop Cloudflare Tunnels
Write-Host "Stopping Cloudflare Tunnels..." -ForegroundColor Yellow

# Check for tunnel info file
$tunnelInfoFile = "$env:TEMP\cloudflared-tunnel-info.json"
if (Test-Path $tunnelInfoFile) {
    $tunnelInfo = Get-Content $tunnelInfoFile | ConvertFrom-Json
    
    # Stop Vane tunnel job
    if ($tunnelInfo.VaneJobId) {
        $job = Get-Job -Id $tunnelInfo.VaneJobId -ErrorAction SilentlyContinue
        if ($job) {
            Stop-Job -Id $tunnelInfo.VaneJobId -ErrorAction SilentlyContinue
            Remove-Job -Id $tunnelInfo.VaneJobId -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped Vane tunnel job" -ForegroundColor Gray
        }
    }
    
    # Stop WorldMonitor tunnel job
    if ($tunnelInfo.WorldMonitorJobId) {
        $job = Get-Job -Id $tunnelInfo.WorldMonitorJobId -ErrorAction SilentlyContinue
        if ($job) {
            Stop-Job -Id $tunnelInfo.WorldMonitorJobId -ErrorAction SilentlyContinue
            Remove-Job -Id $tunnelInfo.WorldMonitorJobId -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped WorldMonitor tunnel job" -ForegroundColor Gray
        }
    }
    
    # Clean up log files
    if ($tunnelInfo.VaneLogFile -and (Test-Path $tunnelInfo.VaneLogFile)) {
        Remove-Item $tunnelInfo.VaneLogFile -Force -ErrorAction SilentlyContinue
    }
    if ($tunnelInfo.WorldMonitorLogFile -and (Test-Path $tunnelInfo.WorldMonitorLogFile)) {
        Remove-Item $tunnelInfo.WorldMonitorLogFile -Force -ErrorAction SilentlyContinue
    }
    
    # Remove info file
    Remove-Item $tunnelInfoFile -Force -ErrorAction SilentlyContinue
}

# Also kill any cloudflared processes
$tunnelProcesses = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcesses) {
    foreach ($proc in $tunnelProcesses) {
        Write-Host "  Stopping cloudflared (PID: $($proc.Id))" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  Cloudflare Tunnels stopped" -ForegroundColor Green
} else {
    Write-Host "  No cloudflared tunnels found" -ForegroundColor Gray
}

# Clean up any remaining tunnel log files
Remove-Item "$env:TEMP\cloudflared-*.log" -Force -ErrorAction SilentlyContinue

# Stop SearXNG container
Write-Host "Stopping SearXNG container..." -ForegroundColor Yellow
$searxngContainer = docker ps -q -f name=searxng-dev
if ($searxngContainer) {
    docker stop searxng-dev | Out-Null
    docker rm searxng-dev | Out-Null
    Write-Host "  SearXNG container stopped" -ForegroundColor Green
} else {
    Write-Host "  No SearXNG container found" -ForegroundColor Gray
}

# Stop Vane (port 3000)
Stop-ProcessOnPort -Port 3000 -AppName "Vane"

# Stop WorldMonitor (port 5173)
Stop-ProcessOnPort -Port 5173 -AppName "WorldMonitor"

Write-Host ""
Write-Host "All development servers stopped" -ForegroundColor Green
Write-Host ""
Write-Host "To start again, run: .\start-dev.ps1" -ForegroundColor Cyan
