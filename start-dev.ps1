# PowerShell script to start both Vane and WorldMonitor in development mode

Write-Host "Starting Vane + WorldMonitor Development Environment" -ForegroundColor Cyan
Write-Host ""

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm is not installed. Please install Node.js and npm first." -ForegroundColor Red
    exit 1
}

# Start WorldMonitor in background
Write-Host "Starting WorldMonitor on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd worldmonitor; npm install; npm run dev" -WindowStyle Normal

# Wait a bit for WorldMonitor to start
Start-Sleep -Seconds 3

# Start Vane in background
Write-Host "Starting Vane on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Vane; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "SUCCESS: Both applications are starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "   - Vane (AI Search):         http://localhost:3000"
Write-Host "   - WorldMonitor (Dashboard): http://localhost:5173"
Write-Host "   - Integrated View:          http://localhost:3000/monitor"
Write-Host ""
Write-Host "Close the PowerShell windows to stop the applications" -ForegroundColor Gray
