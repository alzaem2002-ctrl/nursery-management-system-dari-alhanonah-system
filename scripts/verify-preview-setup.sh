#!/bin/bash
# Quick verification script for preview deployment setup

echo "🔍 Verifying Preview Deployment Setup..."
echo ""

# Check files
echo "📁 Checking required files..."
files=(
    ".github/workflows/auto-preview.yml"
    "netlify.toml"
    "vercel.json"
    "build.sh"
    "package.json"
    ".github/SECRETS-SETUP.md"
    ".github/pull_request_template.md"
)

all_present=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        all_present=false
    fi
done

echo ""
echo "📋 Checking package.json scripts..."
if grep -q '"build".*"bash build.sh"' package.json; then
    echo "  ✅ Build script configured"
else
    echo "  ❌ Build script not configured"
fi

echo ""
echo "🔧 Checking build script..."
if [ -x build.sh ]; then
    echo "  ✅ build.sh is executable"
else
    echo "  ❌ build.sh is not executable"
fi

echo ""
echo "🔐 Required GitHub Secrets:"
echo "  ⚠️  VERCEL_TOKEN (or NETLIFY_AUTH_TOKEN)"
echo "  ⚠️  VERCEL_ORG_ID (or NETLIFY_SITE_ID)"
echo "  ⚠️  VERCEL_PROJECT_ID (only if using Vercel)"
echo "  ℹ️  TELEGRAM_BOT_TOKEN (optional)"
echo "  ℹ️  TELEGRAM_CHAT_ID (optional)"
echo ""
echo "See .github/SECRETS-SETUP.md for setup instructions"

echo ""
if $all_present; then
    echo "✅ All files are present and ready!"
    echo "📚 Next steps:"
    echo "   1. Configure GitHub secrets (see .github/SECRETS-SETUP.md)"
    echo "   2. Push these changes to GitHub"
    echo "   3. Create a test PR to verify the workflow"
else
    echo "❌ Some files are missing. Please run the setup again."
fi
