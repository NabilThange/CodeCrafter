#!/bin/bash

# Start both Vane and WorldMonitor in development mode with Cloudflare Tunnel

echo "🚀 Starting Vane + WorldMonitor Development Environment"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if cloudflared is installed
CLOUDFLARED_INSTALLED=false
if command -v cloudflared &> /dev/null; then
    CLOUDFLARED_INSTALLED=true
else
    echo "⚠️  cloudflared is not installed. Tunnel will not be available."
    echo "   Install from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
fi

# Start SearXNG container
echo "🔍 Starting SearXNG search engine..."
SEARXNG_CONTAINER=$(docker ps -q -f name=searxng-dev)
if [ -n "$SEARXNG_CONTAINER" ]; then
    echo "   SearXNG already running (container: $SEARXNG_CONTAINER)"
else
    # Check if searxng-dev-settings.yml exists, otherwise use default
    if [ -f "searxng-dev-settings.yml" ]; then
        docker run -d --name searxng-dev -p 8080:8080 \
            -v "$(pwd)/searxng-dev-settings.yml:/etc/searxng/settings.yml:ro" \
            searxng/searxng > /dev/null
    else
        docker run -d --name searxng-dev -p 8080:8080 \
            -e SEARXNG_LIMITER=false \
            searxng/searxng > /dev/null
    fi
    echo "   SearXNG started on http://localhost:8080"
fi

# Wait for SearXNG to be ready
echo "   Waiting for SearXNG to be ready..."
sleep 3
COUNTER=0
MAX_TRIES=15
until curl -s http://localhost:8080 > /dev/null 2>&1; do
    COUNTER=$((COUNTER+1))
    if [ $COUNTER -ge $MAX_TRIES ]; then
        echo "   ⚠️  SearXNG health check timeout, but continuing..."
        break
    fi
    sleep 1
done

if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "   ✅ SearXNG is ready"
else
    echo "   ⚠️  SearXNG may not be fully ready"
fi

# Start WorldMonitor in background
echo "📊 Starting WorldMonitor on port 5173..."
cd worldmonitor
npm install > /dev/null 2>&1 &
npm run dev &
WORLDMONITOR_PID=$!
cd ..

# Wait a bit for WorldMonitor to start
sleep 3

# Start Justyoo (Portfolio) in background
echo "💼 Starting Justyoo (Portfolio) on port 3001..."
cd justyoo
npm run dev &
JUSTYOO_PID=$!
cd ..

# Wait a bit for Justyoo to start
sleep 3

# Start Vane
echo "🔍 Starting Vane on port 3000..."
cd Vane
npm run dev &
VANE_PID=$!
cd ..

# Start Cloudflare Tunnel if available
TUNNEL_URL=""
if [ "$CLOUDFLARED_INSTALLED" = true ]; then
    echo "🌐 Starting Cloudflare Tunnel..."
    
    # Start cloudflared in background and capture output
    TUNNEL_LOG="/tmp/cloudflared-tunnel-$$.log"
    cloudflared tunnel --url http://localhost:3000 > "$TUNNEL_LOG" 2>&1 &
    TUNNEL_PID=$!
    
    # Wait for tunnel URL to appear in logs
    echo "   Waiting for tunnel URL..."
    sleep 5
    
    ATTEMPTS=0
    while [ $ATTEMPTS -lt 10 ]; do
        if [ -f "$TUNNEL_LOG" ]; then
            TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -1)
            if [ -n "$TUNNEL_URL" ]; then
                break
            fi
        fi
        sleep 1
        ATTEMPTS=$((ATTEMPTS+1))
    done
    
    # Update environment files with tunnel URL
    if [ -n "$TUNNEL_URL" ]; then
        # Update Vane .env.local
        sed -i "s|NEXT_PUBLIC_VANE_URL=.*|NEXT_PUBLIC_VANE_URL=$TUNNEL_URL|" Vane/.env.local
        
        # Update WorldMonitor .env.local
        sed -i "s|VITE_VANE_URL=.*|VITE_VANE_URL=$TUNNEL_URL|" worldmonitor/.env.local
    fi
fi

echo ""
echo "✅ All services are starting..."
echo ""
echo "📍 Access Points:"
echo "   - Vane (AI Search):         http://localhost:3000"
echo "   - Justyoo (Portfolio):      http://localhost:3001"
echo "   - WorldMonitor (Dashboard): http://localhost:5173"
echo "   - Integrated View:          http://localhost:3000/portfolio or http://localhost:3000/monitor"
echo "   - SearXNG (Search Engine):  http://localhost:8080"

if [ -n "$TUNNEL_URL" ]; then
    echo ""
    echo "🌍 Public Access (Cloudflare Tunnel):"
    echo "   $TUNNEL_URL"
    echo "   Share this URL with your team!"
elif [ "$CLOUDFLARED_INSTALLED" = true ]; then
    echo ""
    echo "🌐 Cloudflare Tunnel is starting... Check logs for URL"
    echo "   Log file: $TUNNEL_LOG"
fi

echo ""
echo "Press Ctrl+C to stop all applications"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $VANE_PID $JUSTYOO_PID $WORLDMONITOR_PID 2>/dev/null
    if [ -n "$TUNNEL_PID" ]; then
        kill $TUNNEL_PID 2>/dev/null
    fi
    docker stop searxng-dev 2>/dev/null
    docker rm searxng-dev 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Wait for all processes
wait $VANE_PID $JUSTYOO_PID $WORLDMONITOR_PID

