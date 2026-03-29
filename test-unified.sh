#!/bin/bash
# Quick test script for unified platform

echo -e "\033[36mTesting Unified Platform...\033[0m"

# Check if Docker is running
echo -e "\n\033[33m1. Checking Docker...\033[0m"
if ! docker ps > /dev/null 2>&1; then
    echo -e "   \033[31m❌ Docker is not running. Please start Docker.\033[0m"
    exit 1
fi
echo -e "   \033[32m✅ Docker is running\033[0m"

# Check if services are running
echo -e "\n\033[33m2. Checking services...\033[0m"
services=("nginx-proxy" "vane" "justyoo" "worldmonitor" "justyoo-postgres")
all_running=true

for service in "${services[@]}"; do
    if docker ps --filter "name=$service" --format "{{.Status}}" 2>/dev/null | grep -q "Up"; then
        echo -e "   \033[32m✅ $service is running\033[0m"
    else
        echo -e "   \033[31m❌ $service is not running\033[0m"
        all_running=false
    fi
done

if [ "$all_running" = false ]; then
    echo -e "\n   \033[33mRun './start-dev.sh' to start all services\033[0m"
    exit 1
fi

# Test endpoints
echo -e "\n\033[33m3. Testing endpoints...\033[0m"

test_endpoint() {
    local name=$1
    local url=$2
    
    if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" | grep -q "200"; then
        echo -e "   \033[32m✅ $name ($url)\033[0m"
    else
        echo -e "   \033[31m❌ $name ($url)\033[0m"
    fi
}

test_endpoint "Vane (Home)" "http://localhost/"
test_endpoint "Portfolio" "http://localhost/dashboard"
test_endpoint "Monitor" "http://localhost/monitor"

echo -e "\n\033[36m✨ Unified Platform Status:\033[0m"
echo -e "   🌐 Access at: http://localhost"
echo -e "   📊 Portfolio: http://localhost/dashboard"
echo -e "   🌍 Monitor: http://localhost/monitor"
echo -e "\n   \033[32mReady for investor demo! 🚀\033[0m"
