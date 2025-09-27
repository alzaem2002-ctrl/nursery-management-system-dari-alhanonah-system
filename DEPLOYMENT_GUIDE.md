# 🚀 دليل النشر - نظام إدارة حضانة الأطفال
## Deployment Guide - Nursery Management System

## 📋 المتطلبات المسبقة

### 1️⃣ حساب Cloudflare
- إنشاء حساب على [Cloudflare](https://cloudflare.com)
- الحصول على API Token من [Dashboard](https://dash.cloudflare.com/profile/api-tokens)

### 2️⃣ صلاحيات API Token
يجب أن يحتوي API Token على الصلاحيات التالية:
- `Zone:Zone Settings:Edit`
- `Zone:Zone:Read`  
- `Account:Cloudflare Pages:Edit`
- `Account:D1:Edit`

## 🔑 خطوات النشر

### خطوة 1: إعداد API Token

```bash
# إعداد متغير البيئة
export CLOUDFLARE_API_TOKEN=your_token_here

# التحقق من المصادقة
npx wrangler whoami
```

### خطوة 2: النشر الكامل

```bash
# تشغيل سكريبت النشر الشامل
./deploy-production.sh
```

أو خطوة بخطوة:

```bash
# 1. بناء المشروع
npm run build

# 2. إعداد قاعدة البيانات للإنتاج
npm run db:setup:prod

# 3. تطبيق migrations
npm run db:migrate:prod

# 4. إضافة البيانات التجريبية
npm run db:seed:prod

# 5. النشر على Pages
npm run deploy:prod
```

## 🌐 بعد النشر

### 📍 روابط النظام
- **الرابط الرئيسي:** `https://nursery-management-system.pages.dev`
- **Cloudflare Dashboard:** `https://dash.cloudflare.com`
- **Pages Dashboard:** `https://dash.cloudflare.com/pages`
- **D1 Dashboard:** `https://dash.cloudflare.com/d1`

### 👤 بيانات الدخول الافتراضية
- **البريد الإلكتروني:** `admin@nursery.com`
- **كلمة المرور:** `admin123`

⚠️ **مهم:** يُنصح بشدة بتغيير بيانات الدخول الافتراضية!

## 🔧 إعدادات إضافية

### نطاق مخصص (اختياري)
1. اذهب إلى Pages Dashboard
2. اختر المشروع `nursery-management-system`
3. انقر على "Custom domains"
4. أضف نطاقك المخصص

### متغيرات البيئة
في Pages Dashboard، يمكن إضافة متغيرات بيئة إضافية:
- `JWT_SECRET` - مفتاح JWT (غيّره للأمان)
- `CUSTOM_DOMAIN` - النطاق المخصص
- أي إعدادات أخرى حسب الحاجة

## 🛡️ الأمان

### إعدادات أمان الإنتاج
- تفعيل HTTPS only
- إعداد Security Headers
- تحديث كلمات المرور الافتراضية
- مراجعة صلاحيات المستخدمين

### حماية قاعدة البيانات
- استخدام prepared statements
- تحديد صلاحيات الوصول
- النسخ الاحتياطي المنتظم

## 🔄 التحديثات

### نشر تحديث جديد
```bash
# بناء المشروع
npm run build

# نشر التحديث
npm run deploy:prod
```

### تحديث قاعدة البيانات
```bash
# إنشاء migration جديد
wrangler d1 migrations create nursery-db-production "update_description"

# تطبيق التحديث
npm run db:migrate:prod
```

## 📊 المراقبة والتحليل

### لوحة تحكم Cloudflare
- مراقبة الأداء والإحصائيات
- تتبع الأخطاء والسجلات
- إدارة الأمان والحماية

### سجلات النظام
```bash
# عرض سجلات الأخطاء
wrangler pages deployment tail

# مراقبة قاعدة البيانات
wrangler d1 info nursery-db-production
```

## 🆘 حل المشاكل الشائعة

### خطأ في API Token
```
Error: Authentication error
```
**الحل:** تأكد من صحة API Token وصلاحياته

### خطأ في قاعدة البيانات
```
Error: D1_ERROR
```
**الحل:** تحقق من database_id في wrangler.toml

### خطأ في النشر
```
Error: Deployment failed
```
**الحل:** تحقق من:
- بناء المشروع بنجاح (`npm run build`)
- توفر جميع الملفات في `dist/`
- صحة إعدادات wrangler.toml

## 📞 الدعم الفني

للحصول على المساعدة:
1. راجع [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
2. راجع [Cloudflare D1 Docs](https://developers.cloudflare.com/d1)
3. تحقق من [Community Forum](https://community.cloudflare.com)

---

**آخر تحديث:** 27 سبتمبر 2025  
**الإصدار:** v2.0  
**الحالة:** جاهز للإنتاج ✅