#!/usr/bin/env bash
set -euo pipefail
mkdir -p .qa
: > .qa/project-structure.txt
find . -type f \( -name "*.js" -o -name "*.json" -o -name "*.go" -o -name "*.html" \) \
  | grep -v node_modules \
  | sed 's#^\./##' \
  | sort > .qa/project-structure.txt || true

{
  echo "# Dependencies"
  if command -v npm >/dev/null 2>&1 && [ -f package.json ]; then
    node -e "try { require('./package.json'); console.log('✅ package.json صالح') } catch(e) { console.log('❌ package.json به أخطاء') }" || true
  else
    echo "لا توجد تبعيات Node.js"
  fi
} > .qa/dependencies.txt

cat > .qa/initial-scan-report.md << EOF
# تقرير المسح الشامل
- الملفات JavaScript: $(find . -name "*.js" | grep -v node_modules | wc -l)
- الملفات JSON: $(find . -name "*.json" | grep -v node_modules | wc -l)
- الملفات Go: $(find . -name "*.go" | grep -v node_modules | wc -l)
- وجود server.js: $( [ -f "server.js" ] && echo "✅" || echo "❌" )
- وجود package.json: $( [ -f "package.json" ] && echo "✅" || echo "❌" )
EOF

echo "Scan complete"