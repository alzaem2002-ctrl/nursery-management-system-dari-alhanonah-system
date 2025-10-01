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