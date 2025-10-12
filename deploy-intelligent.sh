#!/bin/bash
set -euo pipefail

### إعدادات قابلة للتعديل (اختياري)
PORT=${PORT:-3001}                          # منفذ تطبيقك المحلي
HOSTNAME=${HOSTNAME:-}                      # مثال: app.example.com (اتركه فارغًا إن لم تملك نطاقًا على Cloudflare الآن)
TUNNEL_NAME=${TUNNEL_NAME:-nursery-prod}    # اسم النفق الدائم
LOGDIR=.autodeploy_logs
REPORT_HTML=deploy-report.html
REPORT_JSON=deploy-report.json
mkdir -p "$LOGDIR"

info(){ printf "\033[1;36m[INFO]\033[0m %s\n" "$*"; }
warn(){ printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
err(){  printf "\033[1;31m[ERR ]\033[0m %s\n" "$*" >&2; }

### 1) تثبيت cloudflared إن لزم
if ! command -v cloudflared >/dev/null 2>&1; then
  info "تثبيت cloudflared..."
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL -o /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i /tmp/cloudflared.deb || sudo apt-get -f install -y
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL -o /tmp/cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
    sudo rpm -Uvh /tmp/cloudflared.rpm || sudo yum install -y /tmp/cloudflared.rpm
  elif command -v brew >/dev/null 2>&1; then
    brew install cloudflared
  else
    err "لا يوجد مدير حزم مدعوم تلقائيًا. ثبّت cloudflared يدويًا."; exit 1
  fi
fi
info "cloudflared: $(cloudflared --version)"

### 2) تشغيل التطبيق محليًا (اكتشاف ذكي)
detect_start(){
  if [ -f package.json ] && grep -q '"start"' package.json 2>/dev/null; then
    echo "npm run start"
  elif [ -f package.json ] && grep -q '"start-prod"' package.json 2>/dev/null; then
    echo "npm run start-prod"
  elif [ -f server.js ]; then echo "node server.js"
  elif [ -f index.js ]; then echo "node index.js"
  elif [ -f app.js ]; then echo "node app.js"
  elif [ -f dist/server.js ]; then echo "node dist/server.js"
  elif [ -f dist/index.js ]; then echo "node dist/index.js"
  else echo "node index.js"; fi
}
START_CMD="$(detect_start)"
info "أمر التشغيل: $START_CMD"

# إيقاف العمليات القديمة
info "إيقاف العمليات القديمة..."
pkill -9 -f "node server.js" 2>/dev/null || true
pkill -9 -f "cloudflared tunnel" 2>/dev/null || true
sleep 2

PORT=$PORT NODE_ENV=production $START_CMD >"$LOGDIR/server.log" 2>&1 &
NODE_PID=$!
info "بدء الخادم، PID: $NODE_PID"

# انتظار جاهزية المنفذ
info "انتظار جاهزية المنفذ $PORT..."
for i in $(seq 1 30); do
  if command -v nc >/dev/null 2>&1; then
    nc -z 127.0.0.1 $PORT 2>/dev/null && break
  else
    (echo >/dev/tcp/127.0.0.1/$PORT) >/dev/null 2>&1 && break
  fi
  sleep 1
  if [ "$i" -eq 30 ]; then
    err "الخادم لم يستمع على المنفذ $PORT"
    tail -n 80 "$LOGDIR/server.log" || true
    exit 2
  fi
done
info "الخادم جاهز على المنفذ $PORT ✓"

### 3) محاولة إنشاء/تشغيل نفق دائم (إن توفر HOSTNAME وتسجيل الدخول سابقًا)
PUBLIC_URL=""
CFG_DIR="$HOME/.cloudflared"
CRED_FILE=$(ls "$CFG_DIR"/*.json 2>/dev/null | head -n1 || true)

if [ -n "$HOSTNAME" ] && [ -n "$CRED_FILE" ]; then
  info "تشغيل نفق دائم باسم $TUNNEL_NAME إلى http://localhost:$PORT على $HOSTNAME"
  # إنشاء النفق إذا لم يوجد
  if ! cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
    cloudflared tunnel create "$TUNNEL_NAME" >"$LOGDIR/tunnel-create.log" 2>&1 || true
  fi
  # إنشاء/تحديث config.yml
  mkdir -p "$CFG_DIR"
  cat > "$CFG_DIR/config.yml" <<YML
tunnel: $TUNNEL_NAME
credentials-file: $CRED_FILE
ingress:
  - hostname: $HOSTNAME
    service: http://localhost:$PORT
  - service: http_status:404
YML

  # توجيه DNS (يتطلب صلاحية Cloudflare للحساب/النطاق)
  cloudflared tunnel route dns "$TUNNEL_NAME" "$HOSTNAME" >/dev/null 2>&1 || true

  # تشغيل النفق الدائم في الخلفية
  cloudflared tunnel --config "$CFG_DIR/config.yml" run "$TUNNEL_NAME" >"$LOGDIR/cloudflared.log" 2>&1 &
  CLOUD_PID=$!
  sleep 3
  PUBLIC_URL="https://$HOSTNAME"
  info "نفق دائم جاهز على $PUBLIC_URL"
fi

### 4) إن لم يتوفر نطاق/اعتماد—فعّل TryCloudflare تلقائيًا (ضمان رابط مباشر)
if [ -z "$PUBLIC_URL" ]; then
  warn "لم يُكتشف إعداد نفق دائم (HOSTNAME/اعتماد). تفعيل TryCloudflare المؤقت لضمان رابط مباشر."
  cloudflared tunnel --url "http://localhost:$PORT" --loglevel info >"$LOGDIR/cloudflared.log" 2>&1 &
  CLOUD_PID=$!
  info "PID النفق: $CLOUD_PID"
  sleep 6
  PUBLIC_URL=$(grep -oE "https?://[a-z0-9-]+\.trycloudflare\.com" "$LOGDIR/cloudflared.log" | head -n1 || true)
  if [ -z "$PUBLIC_URL" ]; then
    err "تعذّر استخراج رابط TryCloudflare."
    tail -n 80 "$LOGDIR/cloudflared.log" || true
    kill $NODE_PID $CLOUD_PID 2>/dev/null || true
    exit 3
  fi
  info "TryCloudflare جاهز: $PUBLIC_URL ✓"
fi

### 5) فحوصات نهائية + تقارير
info "إجراء الفحوصات..."
ROOT_PATH=${ROOT_PATH:-/}
HEALTH_PATH=${HEALTH_PATH:-/health}
ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$PUBLIC_URL$ROOT_PATH" || echo 000)
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$PUBLIC_URL$HEALTH_PATH" || echo 000)
STATUS="FAILED"
[[ "$HEALTH_CODE" == 2* ]] && STATUS="SUCCESS"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MODE="trycloudflare"
[ -n "$HOSTNAME" ] && [ -n "$CRED_FILE" ] && MODE="persistent"

cat >"$REPORT_JSON" <<JSON
{
  "status": "$STATUS",
  "timestamp": "$TIMESTAMP",
  "url": "$PUBLIC_URL",
  "port": $PORT,
  "root_code": "$ROOT_CODE",
  "health_code": "$HEALTH_CODE",
  "logs_dir": "$LOGDIR",
  "node_pid": $NODE_PID,
  "cloudflared_pid": ${CLOUD_PID:-0},
  "mode": "$MODE",
  "tunnel_name": "$TUNNEL_NAME",
  "hostname": "${HOSTNAME:-none}"
}
JSON

cat >"$REPORT_HTML" <<'HTMLSTART'
<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير النشر والإتاحة الذكي</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #0b0f14 0%, #1a1f2e 100%);
  color: #e8f0f8;
  padding: 24px;
  min-height: 100vh;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(30, 40, 60, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
h1 {
  color: #66ffff;
  margin-bottom: 24px;
  font-size: 2em;
  text-align: center;
}
.status-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  margin: 16px 0;
}
.ok { background: #10b981; color: white; }
.bad { background: #ef4444; color: white; }
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
}
td, th {
  padding: 12px 16px;
  text-align: right;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
th {
  background: rgba(0, 0, 0, 0.4);
  font-weight: 600;
  width: 180px;
}
td { background: rgba(255, 255, 255, 0.02); }
a {
  color: #66ffff;
  text-decoration: none;
  transition: color 0.3s;
}
a:hover { color: #99ffff; }
.code-block {
  background: rgba(0, 0, 0, 0.5);
  padding: 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  margin: 16px 0;
  border-left: 3px solid #66ffff;
  overflow-x: auto;
}
.footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  opacity: 0.7;
  font-size: 0.9em;
}
</style>
</head><body><div class="container">
<h1>📡 تقرير النشر والإتاحة الذكي</h1>
HTMLSTART

cat >>"$REPORT_HTML" <<HTMLBODY
<div style="text-align: center;">
  <span class="status-badge $([ "$STATUS" = "SUCCESS" ] && echo "ok" || echo "bad")">
    $([ "$STATUS" = "SUCCESS" ] && echo "✅" || echo "❌") $STATUS
  </span>
</div>

<table>
<tr><th>⏰ الوقت</th><td>$TIMESTAMP</td></tr>
<tr><th>🌍 الرابط العام</th><td><a href="$PUBLIC_URL" target="_blank">$PUBLIC_URL</a></td></tr>
<tr><th>🏠 رمز الجذر</th><td>HTTP $ROOT_CODE</td></tr>
<tr><th>💓 رمز الصحة</th><td>HTTP $HEALTH_CODE</td></tr>
<tr><th>🔌 المنفذ</th><td>$PORT</td></tr>
<tr><th>🖥️ PID الخادم</th><td>$NODE_PID</td></tr>
<tr><th>🌐 PID النفق</th><td>${CLOUD_PID:-N/A}</td></tr>
<tr><th>📂 السجلات</th><td>$LOGDIR</td></tr>
<tr><th>⚙️ الوضع</th><td>$([ "$MODE" = "persistent" ] && echo "نفق دائم (Persistent)" || echo "TryCloudflare (مؤقت)")</td></tr>
<tr><th>🎯 اسم النفق</th><td>$TUNNEL_NAME</td></tr>
</table>

<h3 style="margin-top: 24px; color: #66ffff;">🔗 روابط سريعة:</h3>
<div class="code-block">
🏠 الرئيسية: <a href="$PUBLIC_URL/" target="_blank">$PUBLIC_URL/</a><br>
💓 الصحة: <a href="$PUBLIC_URL/health" target="_blank">$PUBLIC_URL/health</a><br>
📡 API: <a href="$PUBLIC_URL/api" target="_blank">$PUBLIC_URL/api</a>
</div>

<h3 style="margin-top: 24px; color: #66ffff;">🧹 إيقاف العمليات:</h3>
<div class="code-block">
kill $NODE_PID ${CLOUD_PID:-}
</div>

<div class="footer">
<p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام النشر الذكي</p>
<p style="margin-top: 8px;">Intelligent Deployment System with Auto-Fallback</p>
</div>
</div></body></html>
HTMLBODY

echo ""
echo "════════════════════════════════════════════════════════"
echo "           🚀 تقرير النشر الذكي النهائي"
echo "════════════════════════════════════════════════════════"
echo ""
echo "$([ "$STATUS" = "SUCCESS" ] && echo "✅" || echo "❌") الحالة: $STATUS"
echo "🌍 الرابط: $PUBLIC_URL"
echo "💓 الصحة: HTTP $HEALTH_CODE"
echo "📄 HTML: $REPORT_HTML"
echo "🧾 JSON: $REPORT_JSON"
echo "📂 السجلات: $LOGDIR"
echo "⚙️  الوضع: $MODE"
echo ""
echo "PIDs: Node=$NODE_PID | Cloudflared=${CLOUD_PID:-N/A}"
echo "════════════════════════════════════════════════════════"
echo ""

if [ "$STATUS" = "SUCCESS" ]; then
  info "النظام يعمل بنجاح! ✓"
  exit 0
else
  warn "فشل الفحص الصحي. راجع السجلات."
  exit 4
fi
