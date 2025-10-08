#!/bin/bash
# Build script for preview deployments

set -e

echo "🏗️  Building Dari Nursery System for preview..."

# Create dist directory
mkdir -p dist

# Copy public files
if [ -d "public" ]; then
  echo "📦 Copying public files..."
  cp -r public/* dist/ 2>/dev/null || true
fi

# Copy index.html if exists
if [ -f "index.html" ]; then
  echo "📄 Copying index.html..."
  cp index.html dist/
fi

# Copy webapp files if exists
if [ -d "webapp" ]; then
  echo "📱 Copying webapp files..."
  cp -r webapp/* dist/ 2>/dev/null || true
fi

# Ensure critical files exist
echo "✅ Ensuring critical files..."
touch dist/.nojekyll

# Create a simple index.html if none exists
if [ ! -f "dist/index.html" ]; then
  echo "📝 Creating default index.html..."
  cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نظام دار الحنونة للحضانة</title>
  <link rel="icon" href="/favicon.svg">
  <link rel="manifest" href="/manifest.json">
</head>
<body>
  <h1>🎉 Preview Deployment</h1>
  <p>This is an automated preview deployment.</p>
  <script>
    // Redirect to main app if available
    if (window.location.pathname === '/') {
      fetch('/health')
        .then(r => r.json())
        .then(data => console.log('Server health:', data))
        .catch(err => console.log('Static preview mode'));
    }
  </script>
</body>
</html>
EOF
fi

# List built files
echo ""
echo "📊 Build summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lah dist/ | head -20
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Build complete! Output in ./dist"
