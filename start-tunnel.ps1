# Start Cloudflare Tunnel for Vane + WorldMonitor
# Make sure to edit cloudflared-config.yml with your tunnel ID and credentials path

Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Green

# Check if cloudflared is installed
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host "cloudflared not found. Installing..." -ForegroundColor Yellow
    winget install --id Cloudflare.cloudflared
}

# Run the tunnel
cloudflared tunnel --config cloudflared-config.yml run vane-monitor
