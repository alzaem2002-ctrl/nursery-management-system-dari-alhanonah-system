# 🔐 GitHub Secrets Setup Guide

This guide will help you configure the required secrets for the Auto Preview & QA system.

## 📋 Required Secrets

### 🌐 Deployment Secrets (Choose One or Both)

#### Option 1: Vercel (Recommended)
1. **VERCEL_TOKEN**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token with deployment permissions
   - Copy the token

2. **VERCEL_ORG_ID**
   - Go to your [Vercel Team Settings](https://vercel.com/teams)
   - Copy your Organization/Team ID from the URL or settings

3. **VERCEL_PROJECT_ID**
   - Go to your project settings on Vercel
   - Find the Project ID in the project settings

#### Option 2: Netlify
1. **NETLIFY_AUTH_TOKEN**
   - Go to [Netlify User Settings](https://app.netlify.com/user/applications)
   - Click "New access token"
   - Give it a descriptive name (e.g., "GitHub Actions")
   - Copy the generated token

2. **NETLIFY_SITE_ID**
   - Go to your site's settings on Netlify
   - Under "Site details" → "Site information"
   - Copy the "API ID" (this is your site ID)

### 📱 Telegram Notifications (Optional but Recommended)

1. **TELEGRAM_BOT_TOKEN**
   - Open Telegram and search for [@BotFather](https://t.me/BotFather)
   - Send `/newbot` and follow the instructions
   - Copy the token provided

2. **TELEGRAM_CHAT_ID**
   - Method 1: Use [@userinfobot](https://t.me/userinfobot)
     - Start a chat with the bot
     - Send any message
     - Copy your ID
   
   - Method 2: Create a group
     - Create a group and add your bot
     - Add [@raw_data_bot](https://t.me/raw_data_bot) to the group
     - Send a message in the group
     - Copy the "chat": {"id": XXXXXXXX} value

### 🔑 GitHub Token
- **GITHUB_TOKEN** (Automatically provided by GitHub Actions - no setup needed)

## 🛠️ How to Add Secrets

### Via GitHub Web Interface:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `VERCEL_TOKEN` (or other secret name)
   - Value: (paste the token/ID)
   - Click **Add secret**

### Via GitHub CLI:

```bash
# Set Vercel secrets
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID

# Set Netlify secrets
gh secret set NETLIFY_AUTH_TOKEN
gh secret set NETLIFY_SITE_ID

# Set Telegram secrets
gh secret set TELEGRAM_BOT_TOKEN
gh secret set TELEGRAM_CHAT_ID
```

## 📊 Secrets Checklist

Check off each secret as you configure it:

### Minimum Required (Choose One):
- [ ] VERCEL_TOKEN + VERCEL_ORG_ID + VERCEL_PROJECT_ID
  OR
- [ ] NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID

### Optional but Recommended:
- [ ] TELEGRAM_BOT_TOKEN
- [ ] TELEGRAM_CHAT_ID

### Automatic (No Action Needed):
- [x] GITHUB_TOKEN

## 🧪 Testing Your Setup

After adding secrets, test the workflow:

1. Create a test branch:
   ```bash
   git checkout -b test/preview-deployment
   ```

2. Make a small change:
   ```bash
   echo "# Test Preview" >> README.md
   git add README.md
   git commit -m "test: verify preview deployment"
   git push origin test/preview-deployment
   ```

3. Create a Pull Request on GitHub

4. The workflow should automatically:
   - ✅ Build the project
   - ✅ Run QA tests
   - ✅ Deploy a preview
   - ✅ Comment on the PR with preview link
   - ✅ (Optional) Send Telegram notification

## 🔍 Troubleshooting

### Preview deployment fails
- ✅ Check that all required secrets are set correctly
- ✅ Verify token permissions (deployment access)
- ✅ Check workflow logs for specific errors

### Telegram notifications not working
- ✅ Verify TELEGRAM_BOT_TOKEN is correct
- ✅ Ensure bot has been started (send /start to your bot)
- ✅ Check TELEGRAM_CHAT_ID format (should be a number)

### PR comment not appearing
- ✅ Ensure GITHUB_TOKEN has write permissions
- ✅ Check repository settings → Actions → General
- ✅ Ensure "Read and write permissions" is enabled

## 📚 Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 🆘 Need Help?

If you encounter issues:
1. Check the [workflow logs](../../actions)
2. Review the [GitHub Actions documentation](https://docs.github.com/en/actions)
3. Verify all secrets are correctly formatted
4. Ensure your deployment platform (Vercel/Netlify) project is properly configured

---

**✨ Once configured, every PR will automatically get a preview deployment with QA verification!**
