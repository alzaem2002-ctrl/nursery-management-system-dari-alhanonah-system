#!/bin/bash
# Test script for preview deployment system
# This simulates what the GitHub Actions workflow will do

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🧪 Testing Preview Deployment System                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to test a step
test_step() {
    local name="$1"
    local command="$2"
    
    echo -n "Testing: $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
    fi
}

echo "📋 Step 1: Check required files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "GitHub workflow exists" "[ -f .github/workflows/auto-preview.yml ]"
test_step "Netlify config exists" "[ -f netlify.toml ]"
test_step "Vercel config exists" "[ -f vercel.json ]"
test_step "Build script exists" "[ -f build.sh ]"
test_step "Package.json has build command" "grep -q 'build.*bash build.sh' package.json"
echo ""

echo "📋 Step 2: Test build process"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "Build script is executable" "[ -x build.sh ]"
test_step "Can create dist directory" "mkdir -p test-dist && rm -rf test-dist"
test_step "Build command works" "npm run build > /dev/null 2>&1"
test_step "Dist directory created" "[ -d dist ]"
test_step "Critical files in dist" "[ -f dist/index.html ] || [ -f dist/favicon.svg ]"
echo ""

echo "📋 Step 3: Test server startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start server in background
echo "Starting server..."
nohup npm start > /tmp/test-server.log 2>&1 &
SERVER_PID=$!
sleep 5

test_step "Server process running" "ps -p $SERVER_PID > /dev/null"
test_step "Server responding on port 3000" "curl -s http://localhost:3000 > /dev/null"

echo ""
echo "📋 Step 4: Test QA routes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test critical routes
routes=("/" "/health" "/api" "/manifest.json" "/favicon.svg")

for route in "${routes[@]}"; do
    code=$(curl -o /dev/null -s -w "%{http_code}" "http://localhost:3000${route}")
    if [ "$code" = "200" ]; then
        echo -e "${GREEN}✅${NC} $route => HTTP $code"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $route => HTTP $code"
        ((FAILED++))
    fi
done

echo ""
echo "📋 Step 5: Cleanup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cleanup
kill $SERVER_PID 2>/dev/null || true
echo "✅ Server stopped"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  📊 Test Results                                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "✅ Tests Passed: ${GREEN}$PASSED${NC}"
echo -e "❌ Tests Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✨ All tests passed! Preview deployment system is ready! ✨${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}⚠️  Some tests failed. Please review and fix the issues.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
