#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════
#  نظام نشر إنتاجي مع مراقبة ذاتية (بدون systemd)
#  Production Deployment with Self-Healing (No systemd)
# ═══════════════════════════════════════════════════════════

PORT=${PORT:-3001}
HOSTNAME=${HOSTNAME:-}
TUNNEL_NAME=${TUNNEL_NAME:-nursery-prod}
WORKDIR=${WORKDIR:-"$(pwd)"}
RUNDIR=${RUNDIR:-/opt/nursery-runtime}
LOGDIR="$RUNDIR/logs"
URL_FILE="$RUNDIR/CURRENT_URL.txt"
REPORT_JSON="$RUNDIR/last-deploy.json"
PIDDIR="$RUNDIR/pids"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

info(){ printf "\033[1;36m[INFO]\033[0m %s\n" "$*"; }
ok(){   printf "\033[1;32m[ OK ]\033[0m %s\n" "$*"; }
warn(){ printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
err(){  printf "\033[1;31m[ERR ]\033[0m %s\n" "$*" >&2; }

# إنشاء المجلدات
mkdir -p "$RUNDIR" "$LOGDIR" "$PIDDIR"

ok "cloudflared: $(cloudflared --version)"

# كاشف أمر التشغيل
detect_start(){
  if [ -f "$WORKDIR/package.json" ]; then
    grep -q '"start"' "$WORKDIR/package.json" 2>/dev/null && { echo "npm run start"; return; }
    grep -q '"start-prod"' "$WORKDIR/package.json" 2>/dev/null && { echo "npm run start-prod"; return; }
  fi
  for f in server.js index.js app.js; do
    [ -f "$WORKDIR/$f" ] && { echo "node $f"; return; }
  done
  echo "node index.js"
}
START_CMD="$(detect_start)"
ok "أمر التشغيل: $START_CMD"

# إيقاف العمليات القديمة
info "إيقاف العمليات القديمة..."
pkill -9 -f "production-monitor.sh" 2>/dev/null || true
pkill -9 -f "node server.js" 2>/dev/null || true
pkill -9 -f "cloudflared tunnel" 2>/dev/null || true
sleep 2

# حفظ الإعدادات
cat > "$RUNDIR/.env" <<EOF
PORT=$PORT
HOSTNAME="$HOSTNAME"
TUNNEL_NAME="$TUNNEL_NAME"
START_CMD="$START_CMD"
WORKDIR="$WORKDIR"
URL_FILE="$URL_FILE"
REPORT_JSON="$REPORT_JSON"
SLACK_WEBHOOK="$SLACK_WEBHOOK"
LOGDIR="$LOGDIR"
PIDDIR="$PIDDIR"
EOF
ok "الإعدادات: $RUNDIR/.env"

# سكربت تشغيل التطبيق
cat > "$RUNDIR/start-app.sh" <<'APPEOF'
#!/bin/bash
set -euo pipefail
source "/opt/nursery-runtime/.env"
cd "$WORKDIR"
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting app: $START_CMD" >> "$LOGDIR/app.log"
eval "PORT=\"$PORT\" NODE_ENV=production $START_CMD" >> "$LOGDIR/app.log" 2>&1 &
echo $! > "$PIDDIR/app.pid"
APPEOF
chmod +x "$RUNDIR/start-app.sh"

# سكربت تشغيل النفق
cat > "$RUNDIR/start-tunnel.sh" <<'TUNEOF'
#!/bin/bash
set -euo pipefail
source "/opt/nursery-runtime/.env"
CFG_DIR="$HOME/.cloudflared"
mkdir -p "$CFG_DIR"

CRED_FILE=$(ls "$CFG_DIR"/*.json 2>/dev/null | head -n1 || true)

if [ -n "$HOSTNAME" ] && [ -n "$CRED_FILE" ]; then
  # النفق الدائم
  cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME" || \
    cloudflared tunnel create "$TUNNEL_NAME" >> "$LOGDIR/cloudflared.log" 2>&1 || true
  
  cat > "$CFG_DIR/config.yml" <<YML
tunnel: $TUNNEL_NAME
credentials-file: $CRED_FILE
ingress:
  - hostname: $HOSTNAME
    service: http://localhost:$PORT
  - service: http_status:404
YML
  cloudflared tunnel route dns "$TUNNEL_NAME" "$HOSTNAME" >> "$LOGDIR/cloudflared.log" 2>&1 || true
  echo "https://$HOSTNAME" > "$URL_FILE"
  cloudflared tunnel --config "$CFG_DIR/config.yml" run "$TUNNEL_NAME" >> "$LOGDIR/cloudflared.log" 2>&1 &
else
  # TryCloudflare
  cloudflared tunnel --url "http://localhost:$PORT" --loglevel info >> "$LOGDIR/cloudflared.log" 2>&1 &
  sleep 6
  grep -oE "https?://[a-z0-9-]+\.trycloudflare\.com" "$LOGDIR/cloudflared.log" | tail -n1 > "$URL_FILE" || true
fi

echo $! > "$PIDDIR/tunnel.pid"
TUNEOF
chmod +x "$RUNDIR/start-tunnel.sh"

# سكربت المراقبة الذاتية
cat > "$RUNDIR/production-monitor.sh" <<'MONEOF'
#!/bin/bash
set -euo pipefail
source "/opt/nursery-runtime/.env"

ts(){ date -u +"%Y-%m-%dT%H:%M:%SZ"; }

notify(){
  local msg="$1"
  echo "$(ts) :: $msg" >> "$LOGDIR/monitor.log"
  [ -n "$SLACK_WEBHOOK" ] && \
    curl -s -X POST -H "Content-type: application/json" \
    --data "{\"text\":\"🚨 Nursery Alert: $msg\"}" "$SLACK_WEBHOOK" >/dev/null || true
}

check_and_restart_app(){
  if [ -f "$PIDDIR/app.pid" ]; then
    PID=$(cat "$PIDDIR/app.pid")
    if ! kill -0 $PID 2>/dev/null; then
      notify "App process died (PID $PID). Restarting..."
      "$RUNDIR/start-app.sh"
    fi
  else
    notify "App PID file missing. Starting app..."
    "$RUNDIR/start-app.sh"
  fi
}

check_and_restart_tunnel(){
  if [ -f "$PIDDIR/tunnel.pid" ]; then
    PID=$(cat "$PIDDIR/tunnel.pid")
    if ! kill -0 $PID 2>/dev/null; then
      notify "Tunnel process died (PID $PID). Restarting..."
      "$RUNDIR/start-tunnel.sh"
    fi
  else
    notify "Tunnel PID file missing. Starting tunnel..."
    "$RUNDIR/start-tunnel.sh"
  fi
}

check_health(){
  URL=""
  [ -s "$URL_FILE" ] && URL="$(cat "$URL_FILE")"
  [ -z "$URL" ] && [ -n "$HOSTNAME" ] && URL="https://$HOSTNAME"
  
  if [ -z "$URL" ]; then
    return
  fi
  
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL/health" || echo 000)
  
  if [[ "$CODE" != 2* ]]; then
    notify "Health check FAILED (HTTP $CODE). Restarting services..."
    pkill -9 -f "cloudflared tunnel" 2>/dev/null || true
    pkill -9 -f "node server.js" 2>/dev/null || true
    sleep 2
    "$RUNDIR/start-app.sh"
    sleep 3
    "$RUNDIR/start-tunnel.sh"
  fi
  
  # تقرير JSON
  cat > "$REPORT_JSON" <<JSON
{
  "timestamp": "$(ts)",
  "url": "$URL",
  "port": $PORT,
  "health_code": "$CODE",
  "status": "$( [[ "$CODE" == 2* ]] && echo "OK" || echo "FAIL" )",
  "mode": "$( [ -n "$HOSTNAME" ] && echo "persistent" || echo "trycloudflare" )"
}
JSON
}

# حلقة المراقبة الرئيسية
while true; do
  check_and_restart_app
  check_and_restart_tunnel
  check_health
  sleep 60
done
MONEOF
chmod +x "$RUNDIR/production-monitor.sh"

# بدء التطبيق
info "بدء التطبيق..."
"$RUNDIR/start-app.sh"
sleep 3

# بدء النفق
info "بدء النفق..."
"$RUNDIR/start-tunnel.sh"
sleep 6

# بدء المراقب في الخلفية
info "بدء المراقب الذاتي..."
nohup "$RUNDIR/production-monitor.sh" >> "$LOGDIR/monitor.log" 2>&1 &
echo $! > "$PIDDIR/monitor.pid"

# انتظار واستخراج الرابط
sleep 3
URL=""
[ -s "$URL_FILE" ] && URL="$(cat "$URL_FILE")"
[ -z "$URL" ] && URL="${HOSTNAME:+https://$HOSTNAME}"

echo ""
echo "════════════════════════════════════════════════════════"
ok "🚀 تم النشر الإنتاجي بنجاح!"
echo "════════════════════════════════════════════════════════"
echo ""
ok "🌐 الرابط: ${URL:-"(قيد الاستخراج...)"}"
echo "📂 السجلات: $LOGDIR"
echo "📊 التقرير: $REPORT_JSON"
echo ""
echo "🔎 عرض السجلات:"
echo "   tail -f $LOGDIR/app.log"
echo "   tail -f $LOGDIR/cloudflared.log"
echo "   tail -f $LOGDIR/monitor.log"
echo ""
echo "🛠️ إدارة العمليات:"
echo "   ps -p \$(cat $PIDDIR/*.pid)"
echo "   kill \$(cat $PIDDIR/app.pid) \$(cat $PIDDIR/tunnel.pid) \$(cat $PIDDIR/monitor.pid)"
echo ""
echo "🔄 إعادة التشغيل:"
echo "   ./production-deploy.sh"
echo "════════════════════════════════════════════════════════"
