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

# Stop Vane (port 3000)
Stop-ProcessOnPort -Port 3000 -AppName "Vane"

# Stop WorldMonitor (port 5173)
Stop-ProcessOnPort -Port 5173 -AppName "WorldMonitor"

Write-Host ""
Write-Host "All development servers stopped" -ForegroundColor Green
Write-Host ""
Write-Host "To start again, run: .\start-dev.ps1" -ForegroundColor Cyan
