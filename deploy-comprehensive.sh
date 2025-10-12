#!/bin/bash
set -euo pipefail

echo -e "\033[1;32m🚀 بدء التشغيل الشامل والتحقق الاحترافي عبر Cloudflare...\033[0m"

# إعدادات عامة
PORT=${PORT:-3001}
ROOT_PATH=${ROOT_PATH:-/}
HEALTH_PATH=${HEALTH_PATH:-/health}
LOGDIR=.autodeploy_logs
REPORT_HTML=deploy-report.html
REPORT_JSON=deploy-report.json
START_TIME=$(date +%s)
mkdir -p "$LOGDIR"

# تثبيت cloudflared إذا لم يكن موجودًا
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "⬇️  تثبيت cloudflared..."
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL -o cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb || sudo apt-get -f install -y
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL -o cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
    sudo rpm -Uvh cloudflared.rpm || sudo yum install -y cloudflared.rpm
  elif command -v brew >/dev/null 2>&1; then
    brew install cloudflared
  else
    echo "❌ لا يوجد مدير حزم مدعوم."
    exit 1
  fi
fi

# اختيار أمر التشغيل المناسب
START_CMD=""
if [ -f "package.json" ]; then
  if grep -q '"start"' package.json; then
    START_CMD="npm run start"
  elif grep -q '"start-prod"' package.json; then
    START_CMD="npm run start-prod"
  fi
fi

if [ -z "$START_CMD" ]; then
  if [ -f "server.js" ]; then
    START_CMD="node server.js"
  elif [ -f "index.js" ]; then
    START_CMD="node index.js"
  elif [ -f "app.js" ]; then
    START_CMD="node app.js"
  else
    START_CMD="node index.js"
  fi
fi

echo "⚙️  أمر التشغيل المختار: $START_CMD"

# إيقاف العمليات القديمة
echo "🧹 إيقاف العمليات القديمة..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true
sleep 2

# تشغيل الخادم
echo "▶️  تشغيل الخادم على المنفذ $PORT..."
PORT=$PORT NODE_ENV=production $START_CMD >"$LOGDIR/server.log" 2>&1 &
NODE_PID=$!
echo "   PID: $NODE_PID"
sleep 3

# التحقق من تشغيل الخادم
if ! kill -0 $NODE_PID 2>/dev/null; then
  echo "❌ فشل تشغيل الخادم!"
  tail -20 "$LOGDIR/server.log"
  exit 1
fi

# إنشاء النفق
echo "🌐 فتح نفق TryCloudflare..."
cloudflared tunnel --url "http://localhost:$PORT" --loglevel info >"$LOGDIR/cloudflared.log" 2>&1 &
CLOUD_PID=$!
echo "   PID: $CLOUD_PID"
sleep 6

# استخراج الرابط
URL=$(grep -oE "https?://[a-z0-9-]+\.trycloudflare\.com" "$LOGDIR/cloudflared.log" | head -n1 || true)
if [[ -z "$URL" ]]; then
  echo "❌ فشل استخراج الرابط."
  tail -n 40 "$LOGDIR/cloudflared.log"
  kill $NODE_PID $CLOUD_PID 2>/dev/null || true
  exit 1
fi

echo "✅ الرابط: $URL"

# الفحوصات
echo "🔍 إجراء الفحوصات..."
ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL$ROOT_PATH" || echo "000")
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL$HEALTH_PATH" || echo "000")
UPTIME=$(($(date +%s) - START_TIME))
STATUS="FAILED"
[[ "$HEALTH_CODE" == 2* ]] && STATUS="SUCCESS"

# إنشاء تقرير JSON
cat >"$REPORT_JSON" <<EOF
{
  "status": "$STATUS",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "uptime_seconds": $UPTIME,
  "port": $PORT,
  "url": "$URL",
  "root_path": "$ROOT_PATH",
  "health_path": "$HEALTH_PATH",
  "root_code": "$ROOT_CODE",
  "health_code": "$HEALTH_CODE",
  "node_pid": $NODE_PID,
  "cloudflared_pid": $CLOUD_PID,
  "logs_dir": "$LOGDIR",
  "start_command": "$START_CMD"
}
EOF

# إنشاء تقرير HTML
cat >"$REPORT_HTML" <<'HTMLEOF'
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير التشغيل - Cloudflare TryTunnel</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 20px;
            direction: rtl;
            min-height: 100vh;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
        }
        h1 {
            color: #00ff90;
            margin-bottom: 30px;
            text-align: center;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.2em;
            margin: 20px 0;
        }
        .status-success {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #0f0;
        }
        .status-failed {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: #fff;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
            overflow: hidden;
        }
        td, th {
            padding: 15px;
            text-align: right;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        th {
            background: rgba(0,0,0,0.3);
            font-weight: bold;
            width: 200px;
        }
        td {
            background: rgba(255,255,255,0.05);
        }
        a {
            color: #00ff90;
            text-decoration: none;
            transition: all 0.3s;
        }
        a:hover {
            color: #00ffff;
            text-shadow: 0 0 10px #00ffff;
        }
        .code-block {
            background: rgba(0,0,0,0.4);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            border-left: 4px solid #00ff90;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
            opacity: 0.8;
        }
        .emoji { font-size: 1.3em; }
    </style>
</head>
<body>
    <div class="container">
        <h1><span class="emoji">📊</span> تقرير التشغيل الفوري</h1>
HTMLEOF

# إضافة محتوى الجدول
cat >>"$REPORT_HTML" <<EOF
        <div style="text-align: center;">
            <span class="status-badge status-$(echo $STATUS | tr '[:upper:]' '[:lower:]')">
                $([ "$STATUS" == "SUCCESS" ] && echo "✅" || echo "⚠️") $STATUS
            </span>
        </div>
        
        <table>
            <tr><th><span class="emoji">⏰</span> الوقت</th><td>$(date)</td></tr>
            <tr><th><span class="emoji">🌍</span> الرابط العام</th><td><a href="$URL" target="_blank">$URL</a></td></tr>
            <tr><th><span class="emoji">🏠</span> رمز الجذر (Root)</th><td>HTTP $ROOT_CODE</td></tr>
            <tr><th><span class="emoji">💓</span> رمز الصحة (Health)</th><td>HTTP $HEALTH_CODE</td></tr>
            <tr><th><span class="emoji">🔌</span> المنفذ</th><td>$PORT</td></tr>
            <tr><th><span class="emoji">🖥️</span> PID الخادم</th><td>$NODE_PID</td></tr>
            <tr><th><span class="emoji">🌐</span> PID النفق</th><td>$CLOUD_PID</td></tr>
            <tr><th><span class="emoji">⏱️</span> مدة التشغيل</th><td>${UPTIME} ثانية</td></tr>
            <tr><th><span class="emoji">📂</span> مجلد السجلات</th><td>$LOGDIR</td></tr>
            <tr><th><span class="emoji">⚙️</span> أمر التشغيل</th><td style="font-family: monospace;">$START_CMD</td></tr>
        </table>
        
        <h3 style="margin-top: 30px; color: #00ff90;"><span class="emoji">🔗</span> روابط سريعة:</h3>
        <div class="code-block">
            الصفحة الرئيسية: <a href="$URL/" target="_blank">$URL/</a><br>
            فحص الصحة: <a href="$URL/health" target="_blank">$URL/health</a><br>
            واجهة API: <a href="$URL/api" target="_blank">$URL/api</a>
        </div>
        
        <h3 style="margin-top: 30px; color: #00ff90;"><span class="emoji">🧹</span> لإيقاف العمليات:</h3>
        <div class="code-block">
            kill $NODE_PID $CLOUD_PID
        </div>
        
        <div class="footer">
            <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام النشر الذكي</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Cloudflare TryTunnel Deployment System</p>
        </div>
    </div>
</body>
</html>
EOF

# عرض النتائج
echo ""
echo "═══════════════════════════════════════════════════════"
echo "📊 ملخص النشر"
echo "═══════════════════════════════════════════════════════"
echo "🌍 رابط التطبيق: $URL"
echo "🏠 رمز الجذر   : HTTP $ROOT_CODE"
echo "💓 رمز الصحة   : HTTP $HEALTH_CODE"
echo "📄 تقرير HTML  : $REPORT_HTML"
echo "🧾 تقرير JSON  : $REPORT_JSON"
echo "📂 السجلات     : $LOGDIR"
echo "⏱️  مدة التشغيل : ${UPTIME}s"
echo "═══════════════════════════════════════════════════════"

if [[ "$STATUS" == "SUCCESS" ]]; then
  echo -e "\033[1;32m✅ النظام يعمل بكفاءة تامة.\033[0m"
else
  echo -e "\033[1;33m⚠️ تحذير: فشل فحص الصحة.\033[0m"
  echo ""
  echo "عرض آخر 20 سطر من سجل الخادم:"
  tail -20 "$LOGDIR/server.log"
fi

echo ""
echo "🔗 افتح التقرير في المتصفح:"
echo "   file://$(pwd)/$REPORT_HTML"
