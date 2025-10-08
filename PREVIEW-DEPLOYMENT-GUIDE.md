# 🚀 Preview Deployment System - Complete Guide

## 📋 Overview

This system provides **automatic preview deployments** for every Pull Request with:
- ✅ Automated QA testing
- 🌐 Live preview URLs (Vercel/Netlify)
- 💬 Automatic PR comments with results
- 📱 Telegram notifications (optional)
- 🔄 Updates on every commit

## 🎯 What Happens When You Create a PR?

1. **Automated Build** - Code is built automatically
2. **QA Testing** - Critical routes are tested
3. **Preview Deployment** - Live preview is created
4. **PR Comment** - Results posted on the PR
5. **Notification** - Team notified via Telegram (optional)

## 📦 What's Included

### GitHub Actions Workflow
- **File:** `.github/workflows/auto-preview.yml`
- **Triggers:** On PR open, update, or reopen
- **Actions:** Build → Test → Deploy → Comment → Notify

### Configuration Files
- `netlify.toml` - Netlify deployment config
- `vercel.json` - Vercel deployment config
- `build.sh` - Build script for deployments
- `package.json` - Updated with build commands

### Documentation
- `.github/SECRETS-SETUP.md` - Secrets configuration guide
- `.github/pull_request_template.md` - PR template with instructions
- `scripts/test-preview-deployment.sh` - Local testing script
- `scripts/verify-preview-setup.sh` - Setup verification script

## 🚀 Quick Start

### Step 1: Configure Secrets

Choose your deployment platform and configure secrets:

#### Option A: Vercel (Recommended)
```bash
# Required secrets
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID  
gh secret set VERCEL_PROJECT_ID
```

#### Option B: Netlify
```bash
# Required secrets
gh secret set NETLIFY_AUTH_TOKEN
gh secret set NETLIFY_SITE_ID
```

#### Optional: Telegram Notifications
```bash
gh secret set TELEGRAM_BOT_TOKEN
gh secret set TELEGRAM_CHAT_ID
```

📚 **Detailed instructions:** See [.github/SECRETS-SETUP.md](.github/SECRETS-SETUP.md)

### Step 2: Verify Setup

```bash
# Run verification script
./scripts/verify-preview-setup.sh
```

### Step 3: Test Locally (Optional)

```bash
# Run full test suite
./scripts/test-preview-deployment.sh
```

### Step 4: Push to GitHub

```bash
# Add all files
git add .github/ netlify.toml build.sh package.json scripts/

# Commit
git commit -m "ci: add auto preview deployment system"

# Push
git push origin main
```

### Step 5: Create a Test PR

```bash
# Create test branch
git checkout -b test/preview-system

# Make a change
echo "# Testing Preview System" >> README.md
git add README.md
git commit -m "test: verify preview deployment"

# Push and create PR
git push origin test/preview-system
gh pr create --title "Test: Preview Deployment System" \
  --body "Testing automated preview deployment and QA verification"
```

## 📊 What to Expect

### On PR Creation:

1. **Workflow Starts** (~30 seconds)
   - Checks out code
   - Installs dependencies
   - Builds application

2. **QA Tests Run** (~10 seconds)
   - Tests critical routes
   - Verifies icons and assets
   - Checks health endpoints

3. **Preview Deploys** (~1-2 minutes)
   - Deploys to Vercel/Netlify
   - Generates unique preview URL
   - Alias: `pr-{number}.{domain}`

4. **PR Comment Posted**
   ```markdown
   ✅ Preview Environment Ready
   
   🔗 Preview: https://pr-123.dari-nursery.vercel.app
   🧪 QA: 5/5 tests passed
   📊 Success Rate: 100%
   ```

5. **Telegram Notification** (if configured)
   ```
   ✅ Preview created for PR #123
   📝 Add new feature
   🔗 https://pr-123.dari-nursery.vercel.app
   🧪 QA: 5 tests passed
   ```

### On PR Update:

- Previous preview is updated
- QA tests run again
- PR comment is updated
- New notification sent

## 🧪 Testing Routes

The workflow automatically tests these routes:

| Route | Purpose | Expected |
|-------|---------|----------|
| `/` | Homepage | HTTP 200 |
| `/health` | Health check | HTTP 200 |
| `/api` | API docs | HTTP 200 |
| `/manifest.json` | PWA manifest | HTTP 200 |
| `/favicon.svg` | Favicon | HTTP 200 |

**Success criteria:** All routes must return HTTP 200

## 🔧 Customization

### Add More Test Routes

Edit `.github/workflows/auto-preview.yml`:

```yaml
# Around line 60
pages=("/" "/health" "/api" "/manifest.json" "/favicon.svg" "/your-route")
```

### Change Deployment Platform

**Use only Vercel:**
```yaml
# Comment out the Netlify step in auto-preview.yml
```

**Use only Netlify:**
```yaml
# Comment out the Vercel step in auto-preview.yml
```

### Customize PR Comment

Edit the comment message in `.github/workflows/auto-preview.yml` around line 120.

## 📁 File Structure

```
.github/
├── workflows/
│   └── auto-preview.yml          # Main workflow
├── SECRETS-SETUP.md              # Secrets guide
└── pull_request_template.md      # PR template

scripts/
├── test-preview-deployment.sh    # Local testing
└── verify-preview-setup.sh       # Setup verification

netlify.toml                      # Netlify config
vercel.json                       # Vercel config (existing)
build.sh                          # Build script
package.json                      # Updated with build command
```

## 🔍 Troubleshooting

### Preview deployment fails

**Problem:** Deployment fails with authentication error

**Solution:**
1. Verify secrets are set correctly
2. Check token permissions
3. Review deployment platform logs

```bash
# Re-set secrets
gh secret set VERCEL_TOKEN
# or
gh secret set NETLIFY_AUTH_TOKEN
```

### QA tests fail

**Problem:** Routes return non-200 status

**Solution:**
1. Check server.js for route definitions
2. Verify server starts correctly
3. Test locally first

```bash
npm start
curl http://localhost:3000/health
```

### PR comment not appearing

**Problem:** Workflow runs but no comment posted

**Solution:**
1. Check workflow permissions
2. Repository Settings → Actions → General
3. Enable "Read and write permissions"
4. Save and re-run workflow

### Telegram notifications not working

**Problem:** No Telegram messages received

**Solution:**
1. Verify bot token is correct
2. Start the bot (send `/start`)
3. Check chat ID format
4. Test with curl:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<CHAT_ID>" \
  -d "text=Test message"
```

## 📊 Monitoring

### View Workflow Runs
- Go to: `https://github.com/{owner}/{repo}/actions`
- Click on "Auto Preview & QA Check"
- View logs for debugging

### Check Deployments
- **Vercel:** `https://vercel.com/{team}/deployments`
- **Netlify:** `https://app.netlify.com/sites/{site}/deploys`

### Download QA Reports
1. Go to workflow run
2. Scroll to "Artifacts" section
3. Download `qa-preview-report-{pr-number}`

## 🎯 Best Practices

### For Developers

1. **Wait for preview** before requesting review
2. **Test the preview link** yourself first
3. **Check QA results** in the PR comment
4. **Update PR** if tests fail

### For Reviewers

1. **Use preview link** to test changes
2. **Verify QA passed** before approving
3. **Check workflow logs** if concerned
4. **Request changes** if preview has issues

### For Maintainers

1. **Monitor deployment costs** (Vercel/Netlify)
2. **Update secrets** when tokens expire
3. **Keep workflow updated** with new routes
4. **Archive old previews** to save resources

## 🔐 Security Notes

- **Secrets are encrypted** by GitHub
- **Only accessible** in workflow runs
- **Not exposed** in logs or comments
- **Rotate tokens** every 90 days
- **Use least privilege** for tokens

## 📚 Additional Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments)
- [Netlify Deploy](https://docs.netlify.com/site-deploys/overview/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### Related Files
- [Secrets Setup Guide](.github/SECRETS-SETUP.md)
- [PR Template](.github/pull_request_template.md)
- [Main QA Report](QA-MISSION-COMPLETE.txt)

## 🆘 Support

### Getting Help

1. **Check workflow logs** first
2. **Review this guide** thoroughly
3. **Test locally** to isolate issues
4. **Check platform status** (Vercel/Netlify)

### Common Commands

```bash
# Verify setup
./scripts/verify-preview-setup.sh

# Test locally
./scripts/test-preview-deployment.sh

# Check secrets
gh secret list

# View workflow runs
gh run list --workflow=auto-preview.yml

# View specific run
gh run view <run-id>

# Re-run failed workflow
gh run rerun <run-id>
```

## ✨ Success Metrics

Your preview system is working when:

- ✅ PRs automatically get preview deployments
- ✅ QA tests run and pass consistently
- ✅ PR comments appear with links
- ✅ Team receives notifications
- ✅ Previews update on new commits
- ✅ Reviews are faster with live previews

## 🎉 Next Steps

Once your preview system is working:

1. **Add more QA tests** for comprehensive coverage
2. **Integrate visual testing** (Percy, Chromatic)
3. **Add performance checks** (Lighthouse CI)
4. **Set up staging deployments** for approved PRs
5. **Configure auto-merge** after successful preview

---

## 📝 Quick Reference

### Essential Commands

| Action | Command |
|--------|---------|
| Verify setup | `./scripts/verify-preview-setup.sh` |
| Test locally | `./scripts/test-preview-deployment.sh` |
| Set secret | `gh secret set SECRET_NAME` |
| List secrets | `gh secret list` |
| View runs | `gh run list --workflow=auto-preview.yml` |
| Re-run workflow | `gh run rerun <run-id>` |
| Create test PR | See "Step 5: Create a Test PR" above |

### Important URLs

- **Workflow:** `.github/workflows/auto-preview.yml`
- **Secrets Guide:** `.github/SECRETS-SETUP.md`
- **Actions:** `https://github.com/{owner}/{repo}/actions`
- **Vercel:** `https://vercel.com/{team}/deployments`
- **Netlify:** `https://app.netlify.com/sites/{site}/deploys`

---

**🎊 Your preview deployment system is now fully configured and ready to use!**

Every PR will automatically receive a live preview with QA verification. Happy coding! 🚀
