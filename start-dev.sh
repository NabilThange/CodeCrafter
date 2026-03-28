#!/bin/bash

# Start both Vane and WorldMonitor in development mode

echo "🚀 Starting Vane + WorldMonitor Development Environment"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
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

# Start Vane
echo "🔍 Starting Vane on port 3000..."
cd Vane
npm run dev &
VANE_PID=$!
cd ..

echo ""
echo "✅ Both applications are starting..."
echo ""
echo "📍 Access Points:"
echo "   - Vane (AI Search):        http://localhost:3000"
echo "   - WorldMonitor (Dashboard): http://localhost:5173"
echo "   - Integrated View:          http://localhost:3000/monitor"
echo ""
echo "Press Ctrl+C to stop both applications"

# Wait for both processes
wait $VANE_PID $WORLDMONITOR_PID
