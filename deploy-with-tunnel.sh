#!/bin/bash

echo -e "\033[1;32m🚀 بدء التشغيل التلقائي والتحقق عبر Cloudflare... \033[0m"
PORT=${PORT:-3001}
LOGDIR=.autodeploy_logs
mkdir -p "$LOGDIR"

install_cloudflared() {
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
      echo "❌ لا يوجد مدير حزم مناسب، ثبت cloudflared يدويًا."
      exit 1
    fi
  fi
}

install_cloudflared

echo "⚙️  البحث عن أمر تشغيل الخادم..."
START_CMD=""

# Check for npm scripts
if [ -f "package.json" ]; then
  if grep -q '"start"' package.json; then
    START_CMD="npm run start"
  elif grep -q '"start-prod"' package.json; then
    START_CMD="npm run start-prod"
  fi
fi

# Fallback to checking for files
if [ -z "$START_CMD" ]; then
  if [ -f "server.js" ]; then
    START_CMD="node server.js"
  elif [ -f "index.js" ]; then
    START_CMD="node index.js"
  elif [ -f "app.js" ]; then
    START_CMD="node app.js"
  elif [ -f "dist/server.js" ]; then
    START_CMD="node dist/server.js"
  elif [ -f "dist/index.js" ]; then
    START_CMD="node dist/index.js"
  else
    START_CMD="node index.js"
  fi
fi

echo "✅ أمر التشغيل المختار: $START_CMD"

echo "▶️ تشغيل الخادم على المنفذ $PORT..."
PORT=$PORT NODE_ENV=production $START_CMD >"$LOGDIR/server.log" 2>&1 &
NODE_PID=$!
echo "PID السيرفر: $NODE_PID"
sleep 3

# Check if server started
if ! kill -0 $NODE_PID 2>/dev/null; then
  echo "❌ فشل تشغيل الخادم. عرض السجل:"
  tail -n 30 "$LOGDIR/server.log"
  exit 1
fi

echo "🌐 فتح نفق TryCloudflare..."
cloudflared tunnel --url "http://localhost:$PORT" --loglevel info >"$LOGDIR/cloudflared.log" 2>&1 &
CLOUD_PID=$!
echo "PID Cloudflared: $CLOUD_PID"
sleep 6

URL=$(grep -oE "https?://[a-z0-9-]+\.trycloudflare\.com" "$LOGDIR/cloudflared.log" | head -n1 || true)
if [[ -z "$URL" ]]; then
  echo "❌ فشل استخراج الرابط. عرض السجل:"
  tail -n 40 "$LOGDIR/cloudflared.log"
  kill $NODE_PID $CLOUD_PID 2>/dev/null || true
  exit 1
fi

echo -e "\033[1;32m🌍 تم النشر المؤقت بنجاح:\033[0m $URL"
echo "⏱️  فحص صفحة الجذر..."
curl -I --max-time 10 "$URL/" || true
echo ""
echo "💓 فحص الصحة..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL/api/health" || echo "000")

echo ""
echo "───────────────────────────────"
echo "📊 التقرير النهائي:"
echo "• رابط الوصول: $URL"
echo "• رمز الصحة : $CODE"
echo "• PID السيرفر: $NODE_PID"
echo "• PID Cloudflared: $CLOUD_PID"
echo "• السجلات: $LOGDIR"
echo "───────────────────────────────"

if [[ "$CODE" == 2* ]]; then
  echo -e "\033[1;32m✅ النظام يعمل بكفاءة تامة.\033[0m"
else
  echo -e "\033[1;33m⚠️ تنبيه: نقطة الصحة لم تُرجع 2xx.\033[0m"
  echo "عرض سجلات الخادم:"
  tail -n 30 "$LOGDIR/server.log" || true
fi

echo ""
echo "🧹 لإيقاف العمليات يدويًا:"
echo "kill $NODE_PID $CLOUD_PID"
