#!/bin/bash
# Start Cloudflare Tunnel for Vane + WorldMonitor
# Make sure to edit cloudflared-config.yml with your tunnel ID and credentials path

echo "Starting Cloudflare Tunnel..."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "cloudflared not found. Please install it first:"
    echo "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
    exit 1
fi

# Run the tunnel
cloudflared tunnel --config cloudflared-config.yml run vane-monitor
