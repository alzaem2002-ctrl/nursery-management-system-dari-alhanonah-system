# Nursery Management System

Node.js + Express + SQLite system.

## 🚀 تشغيل المشروع
```bash
npm install
npm start
```

- فتح المتصفح على:
  - http://localhost:3000/api/health
  - http://localhost:3000/api/performance/health

## 🛠️ سكربتات
- `npm run db:check` → فحص قاعدة البيانات
- `npm run db:reset` → إعادة البيانات التجريبية

## 🔄 CI/CD Auto Deploy (SSH)

Auto-deploy is configured in `.github/workflows/autodeploy.yml` to connect over SSH using an ED25519 private key stored in GitHub Secrets.

### 🔐 Required GitHub Secrets
- `DEPLOY_KEY` (required): ED25519 private key (PEM), no passphrase
- `DEPLOY_HOST` (required): SSH host (domain or IP)
- `DEPLOY_USER` (required): SSH user (e.g. `deploy`)
- `DEPLOY_PORT` (optional): SSH port (default `22`)
- `APP_DIR` (optional): Deploy path (default `/var/www/nursery-system`)
- `NODE_VERSION` (optional): Node version if NVM is present (default `18`)
- `HEALTHCHECK_URL` (optional): URL to verify after deploy (2xx/3xx)

### 🚀 What the workflow does
1. Sets up SSH with correct file modes (600 for key, 644 for known_hosts)
2. Verifies `ssh -T` connectivity to the server
3. Uploads files to `APP_DIR` using rsync (tar-over-SSH fallback)
4. Runs `npm ci`/`npm install` and `npm run build --if-present`
5. Restarts PM2 via `ecosystem.config.cjs` or falls back to `server.js`

### ♻️ Rotate or update `DEPLOY_KEY`
1. Generate a new ED25519 key pair on a secure machine:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions@autodeploy" -f ./deploy_key -N ""
   ```
2. On the server (as the deployment user), add the public key:
   ```bash
   mkdir -p ~/.ssh && chmod 700 ~/.ssh
   cat ./deploy_key.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
3. In GitHub → Settings → Secrets and variables → Actions, update `DEPLOY_KEY` with the new private key contents (`deploy_key`).
4. Push to `main` or run the workflow manually to validate. After success, securely remove the old key.

### 🧪 Manual connectivity test
```bash
ssh -i ./deploy_key -p 22 deploy@YOUR_HOST -T "echo ok"
```

### 🛠️ Troubleshooting
- Permission denied (publickey): check `authorized_keys` and file modes (600), `~/.ssh` (700)
- Host key verification failed: ensure `DEPLOY_HOST` resolves; the workflow runs `ssh-keyscan`
- PM2 not found: workflow installs PM2 globally if missing
- Build failed: check `npm ci`/`npm run build` logs in Actions

## 📌 التعليمات لرفع التعديلات
1. انسخ الملفات أعلاه إلى مشروعك (مع المجلد `scripts/`).  
2. شغّل الأوامر:  
   ```bash
   git add .
   git commit -m "Refactor: Add Express server and SQLite DB setup"
   git push origin main
   ```
3. بعد الرفع، جرّب على جهازك المحلي:
   ```bash
   npm install
   npm start
   ```
   ثم افتح الرابط: http://localhost:3000/api/health

## 🗂️ هيكل المشروع
```
nursery-management-system/
├── server.js              # الخادم الرئيسي
├── package.json           # إعدادات Node.js
├── .env                   # متغيرات البيئة
├── database.sqlite        # قاعدة البيانات (ستُنشأ تلقائياً)
├── scripts/
│   ├── db-check.js       # فحص قاعدة البيانات
│   └── db-reset.js       # إعادة تعيين البيانات
└── README.md             # هذا الملف
```

## 🎯 API Endpoints
- `GET /api/health` - فحص حالة النظام
- `GET /api/performance/health` - فحص أداء قاعدة البيانات

## 🔧 المتطلبات
- Node.js 14+ 
- npm أو yarn

---

CI/CD test run: trigger auto-deploy via GitHub Actions