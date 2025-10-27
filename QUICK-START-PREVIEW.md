# 🚀 Quick Start: Auto Preview Deployment

## ⚡ 3-Step Setup

### 1️⃣ Configure Secrets (Choose One)

**Vercel (Recommended):**
```bash
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID  
gh secret set VERCEL_PROJECT_ID
```

**OR Netlify:**
```bash
gh secret set NETLIFY_AUTH_TOKEN
gh secret set NETLIFY_SITE_ID
```

**Optional - Telegram:**
```bash
gh secret set TELEGRAM_BOT_TOKEN
gh secret set TELEGRAM_CHAT_ID
```

### 2️⃣ Push to GitHub

```bash
git commit -m "ci: add auto preview deployment system"
git push origin main
```

### 3️⃣ Create Test PR

```bash
git checkout -b test/preview
echo "# Test" >> README.md
git add . && git commit -m "test: preview"
git push origin test/preview
gh pr create --title "Test: Auto Preview"
```

## ✅ What Happens Next

1. **Build** (30s) - Dependencies installed, app built
2. **QA Test** (10s) - 5 routes tested automatically
3. **Deploy** (1-2 min) - Preview deployed to Vercel/Netlify
4. **Comment** - PR gets automated comment with link
5. **Notify** - Telegram notification sent (optional)

**Total Time:** ~3 minutes

## 🔗 Preview URL Format

- **Vercel:** `https://pr-{number}-{project}.vercel.app`
- **Netlify:** `https://pr-{number}--{site}.netlify.app`

## 📚 Documentation

- **Quick Guide:** `.github/AUTO-PREVIEW-SYSTEM.md`
- **Complete Guide:** `PREVIEW-DEPLOYMENT-GUIDE.md`
- **Secrets Setup:** `.github/SECRETS-SETUP.md`
- **Success Report:** `AUTO-PREVIEW-DEPLOYMENT-SUCCESS.md`

## 🔍 Verify Setup

```bash
./scripts/verify-preview-setup.sh
```

## 🧪 Test Locally

```bash
./scripts/test-preview-deployment.sh
```

## 📊 What's Tested

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/health` | Health check |
| `/api` | API docs |
| `/manifest.json` | PWA manifest |
| `/favicon.svg` | Favicon |

## 🎯 Success Criteria

✅ All routes return HTTP 200  
✅ Preview URL generated  
✅ PR comment appears  
✅ QA report available  

## 🆘 Troubleshooting

**Deployment fails?**
```bash
gh secret list  # Verify secrets
gh run view     # Check logs
```

**No PR comment?**
- Settings → Actions → Enable "Read and write permissions"

**QA tests fail?**
```bash
npm start
curl http://localhost:3000/health
```

## 🎉 That's It!

Every PR now gets automatic preview + QA verification! 🚀

---

**Need more details?** See `PREVIEW-DEPLOYMENT-GUIDE.md`
