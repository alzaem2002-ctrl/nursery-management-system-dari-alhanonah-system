#!/bin/bash

################################################################################
# Production Monitoring & Uptime Automation Script
# Project: Nursery Management System - Dari Alhanonah
# Purpose: Automated 12-hour monitoring cycle
# Usage: ./monitor-automation.sh
################################################################################

set -e

# Configuration
DEPLOY_URL="${DEPLOY_URL:-https://dari-system.netlify.app}"
LOCAL_URL="${LOCAL_URL:-http://localhost:3000}"
ALERT_EMAIL="${ALERT_EMAIL:-maintainer@domain.com}"
LOG_DIR=".monitor/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_FILE="${LOG_DIR}/monitor-report-${TIMESTAMP}.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$REPORT_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$REPORT_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$REPORT_FILE"
}

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$REPORT_FILE"
}

# Start monitoring report
{
    echo "════════════════════════════════════════════════════════════════"
    echo "🔍 AUTOMATED PRODUCTION MONITORING"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📅 Date: $(date)"
    echo "🌐 Target: $DEPLOY_URL"
    echo "📊 Report: $REPORT_FILE"
    echo ""
} | tee -a "$REPORT_FILE"

# Function to check uptime
check_uptime() {
    log_info "Checking uptime for $1..."
    
    local url=$1
    local name=$2
    local status=$(curl -o /dev/null -s -w "%{http_code}" -L --max-time 10 "$url" 2>/dev/null)
    local time=$(curl -o /dev/null -s -w "%{time_total}" -L --max-time 10 "$url" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
        log "✅ $name is UP (HTTP $status) - Response: ${time}s"
        echo "$status|$time|UP"
    else
        log_error "❌ $name is DOWN or UNREACHABLE (HTTP $status)"
        echo "$status|$time|DOWN"
    fi
}

# Function to measure detailed performance
measure_performance() {
    log_info "Measuring detailed performance metrics..."
    
    local url=$1
    local metrics=$(curl -w @- -o /dev/null -s -L "$url" <<'EOF'
DNS:%{time_namelookup}|TCP:%{time_connect}|TLS:%{time_appconnect}|TTFB:%{time_starttransfer}|TOTAL:%{time_total}|STATUS:%{http_code}
EOF
)
    
    log "📊 Performance Metrics: $metrics"
    echo "$metrics"
}

# Function to test endpoints
test_endpoints() {
    log_info "Testing critical endpoints..."
    
    local base_url=$1
    local endpoints=("/" "/health" "/api" "/reports")
    local failed=0
    
    for endpoint in "${endpoints[@]}"; do
        local status=$(curl -o /dev/null -s -w "%{http_code}" -L --max-time 10 "${base_url}${endpoint}" 2>/dev/null)
        local time=$(curl -o /dev/null -s -w "%{time_total}" -L --max-time 10 "${base_url}${endpoint}" 2>/dev/null)
        
        if [ "$status" = "200" ]; then
            log "  ✅ $endpoint - OK ($status) ${time}s"
        else
            log_error "  ❌ $endpoint - FAILED ($status)"
            failed=$((failed + 1))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        log "✅ All endpoints operational"
        return 0
    else
        log_error "❌ $failed endpoint(s) failed"
        return 1
    fi
}

# Function to calculate performance score
calculate_score() {
    local response_time=$1
    local status=$2
    
    if [ "$status" != "200" ]; then
        echo "0"
        return
    fi
    
    # Convert to milliseconds (multiply by 1000)
    local ms=$(awk "BEGIN {printf \"%.0f\", $response_time * 1000}")
    
    if [ "$ms" -lt 200 ]; then
        echo "100"
    elif [ "$ms" -lt 500 ]; then
        echo "95"
    elif [ "$ms" -lt 1000 ]; then
        echo "85"
    elif [ "$ms" -lt 2000 ]; then
        echo "70"
    else
        echo "50"
    fi
}

# Function to send alert
send_alert() {
    local subject=$1
    local message=$2
    
    log_warning "Alert triggered: $subject"
    
    # Write alert to file (in production, this would send email)
    {
        echo "════════════════════════════════════════════════════════════════"
        echo "🚨 PRODUCTION ALERT"
        echo "════════════════════════════════════════════════════════════════"
        echo ""
        echo "Subject: $subject"
        echo "Time: $(date)"
        echo ""
        echo "Message:"
        echo "$message"
        echo ""
        echo "Report: $REPORT_FILE"
        echo ""
        echo "════════════════════════════════════════════════════════════════"
    } >> "${LOG_DIR}/alert-${TIMESTAMP}.txt"
    
    log_warning "Alert saved to ${LOG_DIR}/alert-${TIMESTAMP}.txt"
    
    # In production, uncomment to send email:
    # echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
}

# Main monitoring logic
main() {
    log "Starting automated monitoring cycle..."
    
    # Check primary deployment
    {
        echo ""
        echo "────────────────────────────────────────────────────────────────"
        echo "🌐 PRIMARY DEPLOYMENT CHECK"
        echo "────────────────────────────────────────────────────────────────"
    } | tee -a "$REPORT_FILE"
    
    result=$(check_uptime "$DEPLOY_URL" "Netlify Deployment")
    status=$(echo $result | cut -d'|' -f1)
    time=$(echo $result | cut -d'|' -f2)
    state=$(echo $result | cut -d'|' -f3)
    
    if [ "$state" != "UP" ]; then
        send_alert "🚨 Primary Deployment DOWN" "The primary deployment at $DEPLOY_URL is not responding. Status: $status"
    fi
    
    # Measure performance
    {
        echo ""
        echo "────────────────────────────────────────────────────────────────"
        echo "⚡ PERFORMANCE MEASUREMENT"
        echo "────────────────────────────────────────────────────────────────"
    } | tee -a "$REPORT_FILE"
    
    measure_performance "$DEPLOY_URL"
    
    # Test endpoints
    {
        echo ""
        echo "────────────────────────────────────────────────────────────────"
        echo "🔍 ENDPOINT TESTING"
        echo "────────────────────────────────────────────────────────────────"
    } | tee -a "$REPORT_FILE"
    
    if ! test_endpoints "$DEPLOY_URL"; then
        send_alert "⚠️ Endpoint Test Failures" "Some endpoints are not responding correctly on $DEPLOY_URL"
    fi
    
    # Calculate and report score
    score=$(calculate_score "$time" "$status")
    
    {
        echo ""
        echo "────────────────────────────────────────────────────────────────"
        echo "📊 MONITORING SUMMARY"
        echo "────────────────────────────────────────────────────────────────"
        echo "Overall Score: $score/100"
        echo "Status: $state"
        echo "Response Time: ${time}s"
        echo ""
    } | tee -a "$REPORT_FILE"
    
    if [ "$score" -lt 70 ]; then
        log_warning "Performance score below threshold: $score/100"
        send_alert "⚠️ Performance Degradation" "Performance score dropped to $score/100. Response time: ${time}s"
    else
        log "✅ Monitoring cycle completed successfully. Score: $score/100"
    fi
    
    {
        echo "════════════════════════════════════════════════════════════════"
        echo "✅ Monitoring Complete"
        echo "📄 Full report: $REPORT_FILE"
        echo "⏰ Next check: $(date -d '+12 hours' 2>/dev/null || date -v+12H 2>/dev/null || echo 'in 12 hours')"
        echo "════════════════════════════════════════════════════════════════"
    } | tee -a "$REPORT_FILE"
}

# Run main monitoring
main

# Create summary symlink for latest report
ln -sf "monitor-report-${TIMESTAMP}.txt" "${LOG_DIR}/latest.txt"

log "Report symlinked to ${LOG_DIR}/latest.txt"

exit 0
