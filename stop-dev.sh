#!/bin/bash

# Stop both Vane and WorldMonitor development servers

echo "Stopping Vane + WorldMonitor Development Servers"
echo ""

# Function to kill processes on a specific port
stop_port() {
    local port=$1
    local app_name=$2
    
    echo "Checking for $app_name on port $port..."
    
    # Find and kill processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "  Stopping processes: $pids"
        kill -9 $pids 2>/dev/null
        echo "  $app_name stopped"
    else
        echo "  No process found on port $port"
    fi
}

# Stop Vane (port 3000)
stop_port 3000 "Vane"

# Stop WorldMonitor (port 5173)
stop_port 5173 "WorldMonitor"

echo ""
echo "All development servers stopped"
echo ""
echo "To start again, run: ./start-dev.sh"
