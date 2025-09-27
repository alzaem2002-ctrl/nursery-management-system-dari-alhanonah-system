# 🔧 خيارات التخصيص - Customization Options

## 📋 الإعدادات القابلة للتخصيص

### 1️⃣ **إعدادات الحضانة الأساسية**

```sql
-- يمكن تعديل هذه القيم في seed.sql
INSERT OR REPLACE INTO settings (key, value, description) VALUES
('nursery_name', 'دار الحنونة للحضانة', 'اسم الحضانة الرسمي'),
('nursery_phone', '0112345678', 'رقم هاتف الحضانة'),
('nursery_email', 'info@alhanonah.com', 'البريد الإلكتروني للحضانة'),
('nursery_address', 'الرياض، المملكة العربية السعودية', 'عنوان الحضانة'),
('working_hours_start', '07:00:00', 'بداية ساعات العمل'),
('working_hours_end', '16:00:00', 'نهاية ساعات العمل'),
('max_children_per_class', '20', 'الحد الأقصى لعدد الأطفال في الفصل'),
('enrollment_fee', '500', 'رسوم التسجيل'),
('monthly_fee', '1200', 'الرسوم الشهرية');
```

### 2️⃣ **إعدادات الأمان**

```bash
# في .env.production
JWT_SECRET=super-secure-jwt-secret-for-production-change-this-immediately
SECURE_HEADERS_ENABLED=true
RATE_LIMITING_ENABLED=true
```

### 3️⃣ **إعدادات المشروع**

```toml
# في wrangler.toml
name = "nursery-management-system"  # يمكن تغييره
compatibility_date = "2025-09-05"

[env.production.vars]
NODE_ENV = "production"
JWT_SECRET = "your-custom-jwt-secret"
```

### 4️⃣ **إعدادات النطاق المخصص**

```bash
# في .env.production
CUSTOM_DOMAIN=your-domain.com
```

### 5️⃣ **بيانات الدخول الافتراضية**

```javascript
// في public/static/app-enhanced.js
if (email === 'admin@nursery.com' && password === 'admin123') {
```

### 6️⃣ **إعدادات PWA**

```json
// في public/manifest.json
{
  "name": "نظام إدارة دار الحنونة للحضانة",
  "short_name": "دار الحنونة",
  "description": "نظام شامل لإدارة الحضانات مع دعم كامل للعربية",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff"
}
```

### 7️⃣ **إعدادات الألوان والثيم**

```css
/* في public/static/styles.css */
:root {
  --primary-color: #3b82f6;    /* اللون الأساسي */
  --secondary-color: #10b981;  /* اللون الثانوي */
  --accent-color: #f59e0b;     /* لون التمييز */
  --danger-color: #ef4444;     /* لون التحذير */
}
```

---

## 🎨 **التخصيصات الشائعة**

### أ) **تغيير اسم الحضانة والمعلومات**
### ب) **تخصيص الألوان والشعار**  
### ج) **تعديل بيانات الدخول الافتراضية**
### د) **إعداد النطاق المخصص**
### هـ) **تخصيص ساعات العمل والرسوم**
### و) **إضافة المزيد من الفصول أو الموظفين**

---

## 🔧 **كيفية التطبيق**

### للتخصيصات البسيطة:
1. تعديل الملفات المطلوبة
2. إعادة البناء: `npm run build`
3. النشر: `./deploy-production.sh`

### للتخصيصات المتقدمة:
1. تعديل الكود المصدري
2. اختبار التغييرات محلياً
3. commit التغييرات
4. النشر عبر GitHub Actions أو مباشرة

---

**أي من هذه التخصيصات تريد تطبيقه؟**