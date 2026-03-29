#!/bin/bash
# One-command startup for investor demo

echo ""
echo -e "\033[36m🚀 Starting Unified Platform for Investor Demo...\033[0m"
echo ""

# Check Docker
echo -e "\033[33mChecking Docker...\033[0m"
if ! command -v docker &> /dev/null; then
    echo -e "\033[31m❌ Docker not found. Please install Docker.\033[0m"
    exit 1
fi

if ! docker ps &> /dev/null; then
    echo -e "\033[31m❌ Docker is not running. Please start Docker.\033[0m"
    exit 1
fi
echo -e "\033[32m✅ Docker is running\033[0m"
echo ""

# Stop any existing services
echo -e "\033[33mCleaning up old services...\033[0m"
docker-compose down &> /dev/null
echo -e "\033[32m✅ Cleanup complete\033[0m"
echo ""

# Start all services
echo -e "\033[33mStarting all services...\033[0m"
echo -e "\033[90m   This may take 1-3 minutes on first run...\033[0m"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "\033[31m❌ Failed to start services\033[0m"
    echo -e "\033[33m   Try: docker-compose up -d --build\033[0m"
    exit 1
fi
echo -e "\033[32m✅ Services started\033[0m"
echo ""

# Wait for services
echo -e "\033[33mWaiting for services to be ready...\033[0m"
for i in {1..45}; do
    echo -n "."
    sleep 1
done
echo ""
echo -e "\033[32m✅ Services should be ready\033[0m"
echo ""

# Test endpoints
echo -e "\033[33mTesting endpoints...\033[0m"

all_good=true

# Test Vane
if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost/" | grep -q "200"; then
    echo -e "   \033[32m✅ Vane (Home)\033[0m"
else
    echo -e "   \033[33m⚠️  Vane (Home) - May need more time\033[0m"
    all_good=false
fi

# Test Portfolio
if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost/dashboard" | grep -q "200"; then
    echo -e "   \033[32m✅ Portfolio (Dashboard)\033[0m"
else
    echo -e "   \033[33m⚠️  Portfolio (Dashboard) - May need more time\033[0m"
    all_good=false
fi

# Test Monitor
if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost/monitor" | grep -q "200"; then
    echo -e "   \033[32m✅ Monitor (Intelligence)\033[0m"
else
    echo -e "   \033[33m⚠️  Monitor (Intelligence) - May need more time\033[0m"
    all_good=false
fi

echo ""

if [ "$all_good" = true ]; then
    echo -e "\033[32m🎉 SUCCESS! Platform is ready!\033[0m"
else
    echo -e "\033[33m⚠️  Some services may need more time to start\033[0m"
    echo -e "\033[90m   Wait 30 more seconds and try accessing http://localhost\033[0m"
fi

echo ""
echo -e "\033[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo ""
echo -e "\033[37m  🌐 Access your unified platform at:\033[0m"
echo ""
echo -e "\033[36m     http://localhost\033[0m"
echo ""
echo -e "\033[37m  📍 Direct links:\033[0m"
echo -e "\033[90m     • Home (AI Search):  http://localhost/\033[0m"
echo -e "\033[90m     • Portfolio:         http://localhost/dashboard\033[0m"
echo -e "\033[90m     • Monitor:           http://localhost/monitor\033[0m"
echo ""
echo -e "\033[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo ""
echo -e "\033[33m💡 Tips:\033[0m"
echo -e "\033[90m   • All navigation works from the sidebar/top nav\033[0m"
echo -e "\033[90m   • No need to change URLs manually\033[0m"
echo -e "\033[90m   • To stop: docker-compose down\033[0m"
echo -e "\033[90m   • To view logs: docker-compose logs -f\033[0m"
echo ""

# Open browser (Linux/Mac)
if command -v xdg-open &> /dev/null; then
    read -p "Open browser now? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        xdg-open "http://localhost" &> /dev/null
    fi
elif command -v open &> /dev/null; then
    read -p "Open browser now? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        open "http://localhost"
    fi
fi

echo ""
echo -e "\033[32mReady for your investor demo! 🚀\033[0m"
echo ""
