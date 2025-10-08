# 🚀 Auto Preview Deployment System

## Quick Start

Every Pull Request automatically gets:
- ✅ Live preview deployment
- 🧪 Automated QA testing  
- 💬 PR comment with results
- 📱 Telegram notification (optional)

## 🎯 For Developers

### Creating a PR

1. Create your branch and make changes
2. Push to GitHub
3. Create Pull Request
4. **Wait 2-3 minutes** for automated preview
5. Check PR comments for preview link

### What You Get

```markdown
✅ Preview Environment Ready

🔗 Preview: https://pr-123.dari-nursery.vercel.app
🧪 QA: 5/5 tests passed
📊 Success Rate: 100%
```

## ⚙️ For Maintainers

### Initial Setup (One-time)

1. **Configure Secrets** (choose one platform):
   
   **Vercel:**
   ```bash
   gh secret set VERCEL_TOKEN
   gh secret set VERCEL_ORG_ID
   gh secret set VERCEL_PROJECT_ID
   ```
   
   **Netlify:**
   ```bash
   gh secret set NETLIFY_AUTH_TOKEN
   gh secret set NETLIFY_SITE_ID
   ```

2. **Optional - Telegram:**
   ```bash
   gh secret set TELEGRAM_BOT_TOKEN
   gh secret set TELEGRAM_CHAT_ID
   ```

3. **Verify Setup:**
   ```bash
   ./scripts/verify-preview-setup.sh
   ```

4. **Test:**
   ```bash
   ./scripts/test-preview-deployment.sh
   ```

### Secrets Reference

| Secret | Platform | Required | Get From |
|--------|----------|----------|----------|
| `VERCEL_TOKEN` | Vercel | Yes* | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel | Yes* | Vercel Team Settings |
| `VERCEL_PROJECT_ID` | Vercel | Yes* | Vercel Project Settings |
| `NETLIFY_AUTH_TOKEN` | Netlify | Yes* | [app.netlify.com/user/applications](https://app.netlify.com/user/applications) |
| `NETLIFY_SITE_ID` | Netlify | Yes* | Netlify Site Settings → API ID |
| `TELEGRAM_BOT_TOKEN` | Telegram | No | [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | Telegram | No | [@userinfobot](https://t.me/userinfobot) |
| `GITHUB_TOKEN` | GitHub | Auto | Provided automatically |

\* Choose either Vercel OR Netlify (or both)

## 📁 System Files

```
.github/
├── workflows/
│   └── auto-preview.yml              # Main workflow
├── SECRETS-SETUP.md                  # Detailed secrets guide
├── pull_request_template.md          # PR template
└── AUTO-PREVIEW-SYSTEM.md           # This file

scripts/
├── test-preview-deployment.sh        # Local test
└── verify-preview-setup.sh           # Verify setup

netlify.toml                          # Netlify config
vercel.json                           # Vercel config
build.sh                              # Build script
PREVIEW-DEPLOYMENT-GUIDE.md          # Complete guide
```

## 🔍 How It Works

1. **PR Created/Updated** → Workflow triggers
2. **Build** → `npm ci && npm run build`
3. **Server Start** → `npm start` (for testing)
4. **QA Tests** → Test critical routes:
   - `/` (Homepage)
   - `/health` (Health check)
   - `/api` (API docs)
   - `/manifest.json` (PWA)
   - `/favicon.svg` (Icon)
5. **Deploy** → To Vercel/Netlify
6. **Comment** → Post results on PR
7. **Notify** → Send Telegram message (optional)

## 🧪 QA Testing

Automated tests verify:

| Test | Check | Must Pass |
|------|-------|-----------|
| Routes | All routes return HTTP 200 | ✅ |
| Icons | Favicon and icons load | ✅ |
| API | API endpoints respond | ✅ |
| Health | Server health check | ✅ |
| Manifest | PWA manifest valid | ✅ |

**If any test fails:** Deployment proceeds but PR is flagged

## 📊 Monitoring

### View Results

- **PR Comment:** Check the automated comment on your PR
- **Workflow Logs:** `https://github.com/{repo}/actions`
- **Artifacts:** Download `qa-preview-report-{number}` from workflow
- **Deployments:** 
  - Vercel: `https://vercel.com/{team}/deployments`
  - Netlify: `https://app.netlify.com/sites/{site}/deploys`

### Common Commands

```bash
# Check workflow status
gh run list --workflow=auto-preview.yml

# View specific run
gh run view <run-id>

# Re-run failed workflow
gh run rerun <run-id>

# List configured secrets
gh secret list
```

## 🔧 Customization

### Add More Test Routes

Edit `.github/workflows/auto-preview.yml`:

```yaml
pages=("/" "/health" "/api" "/your-new-route")
```

### Change Notification Message

Edit Telegram notification in workflow:

```yaml
MSG="Your custom message for PR #${{ github.event.pull_request.number }}"
```

### Modify Build Process

Edit `build.sh` to customize the build:

```bash
# Add your custom build steps
npm run custom-build
```

## ⚠️ Troubleshooting

### Preview fails to deploy

1. Check secrets are set: `gh secret list`
2. Verify token permissions on Vercel/Netlify
3. Check workflow logs: `gh run view <run-id>`

### QA tests fail

1. Test locally: `./scripts/test-preview-deployment.sh`
2. Check server starts: `npm start`
3. Verify routes exist: `curl http://localhost:3000/health`

### No PR comment

1. Check workflow permissions: Settings → Actions → General
2. Enable "Read and write permissions"
3. Re-run workflow

### No Telegram notification

1. Verify bot token: `gh secret list | grep TELEGRAM`
2. Start bot: Send `/start` to your bot
3. Test manually:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
     -d "chat_id=<ID>" -d "text=Test"
   ```

## 📚 Documentation

- **📖 [Complete Guide](../PREVIEW-DEPLOYMENT-GUIDE.md)** - Full documentation
- **🔐 [Secrets Setup](SECRETS-SETUP.md)** - Detailed secrets configuration
- **🎯 [PR Template](pull_request_template.md)** - PR guidelines

## ✅ Verification Checklist

Setup is complete when:

- [ ] Secrets configured (Vercel OR Netlify + optional Telegram)
- [ ] Verification script passes: `./scripts/verify-preview-setup.sh`
- [ ] Test script passes: `./scripts/test-preview-deployment.sh`
- [ ] Files committed and pushed to GitHub
- [ ] Test PR created and preview deployed successfully
- [ ] PR comment appears with preview link
- [ ] QA tests pass (5/5)
- [ ] (Optional) Telegram notification received

## 🎉 Success!

Once configured, every PR will automatically:

1. ✅ Build successfully
2. ✅ Pass QA tests
3. ✅ Deploy to preview URL
4. ✅ Comment on PR with link
5. ✅ Notify team via Telegram

**Preview URL format:**
- Vercel: `https://pr-{number}-{project}.vercel.app`
- Netlify: `https://pr-{number}--{site}.netlify.app`

---

**Need Help?** See the [Complete Guide](../PREVIEW-DEPLOYMENT-GUIDE.md) or [Secrets Setup](SECRETS-SETUP.md)

**🚀 Happy Deploying!**
