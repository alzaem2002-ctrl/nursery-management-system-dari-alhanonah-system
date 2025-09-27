-- Enhanced Settings Table Migration
-- Migration: 0002_enhanced_settings.sql

-- Drop existing settings table if exists and recreate with enhanced structure
DROP TABLE IF EXISTS settings;

-- Create enhanced settings table
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    default_value TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    input_type TEXT NOT NULL DEFAULT 'text', -- text, number, email, tel, time, select, textarea
    min_value REAL NULL, -- for number inputs
    max_value REAL NULL, -- for number inputs
    options TEXT NULL, -- JSON string for select inputs
    is_editable BOOLEAN DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert comprehensive settings with validation rules
INSERT INTO settings (key, value, default_value, description, category, input_type, min_value, max_value, display_order, is_editable) VALUES

-- Basic Nursery Information
('nursery_name', 'دار الحنونة للحضانة', 'دار الحنونة للحضانة', 'اسم الحضانة الرسمي', 'basic_info', 'text', NULL, NULL, 1, 1),
('nursery_phone', '0112345678', '0112345678', 'رقم هاتف الحضانة', 'basic_info', 'tel', NULL, NULL, 2, 1),
('nursery_email', 'info@alhanonah.com', 'info@alhanonah.com', 'البريد الإلكتروني للحضانة', 'basic_info', 'email', NULL, NULL, 3, 1),
('nursery_address', 'الرياض، المملكة العربية السعودية', 'الرياض، المملكة العربية السعودية', 'عنوان الحضانة', 'basic_info', 'textarea', NULL, NULL, 4, 1),
('nursery_website', 'https://alhanonah.com', 'https://alhanonah.com', 'الموقع الإلكتروني للحضانة', 'basic_info', 'text', NULL, NULL, 5, 1),

-- Working Hours
('working_hours_start', '07:00', '07:00', 'بداية ساعات العمل', 'working_hours', 'time', NULL, NULL, 1, 1),
('working_hours_end', '16:00', '16:00', 'نهاية ساعات العمل', 'working_hours', 'time', NULL, NULL, 2, 1),
('break_time_start', '12:00', '12:00', 'بداية وقت الراحة', 'working_hours', 'time', NULL, NULL, 3, 1),
('break_time_end', '13:00', '13:00', 'نهاية وقت الراحة', 'working_hours', 'time', NULL, NULL, 4, 1),
('working_days_per_week', '5', '5', 'أيام العمل في الأسبوع', 'working_hours', 'number', 1, 7, 5, 1),

-- Capacity and Limits
('max_children_per_class', '20', '20', 'الحد الأقصى لعدد الأطفال في الفصل', 'capacity', 'number', 5, 50, 1, 1),
('max_total_children', '100', '100', 'الحد الأقصى لإجمالي الأطفال', 'capacity', 'number', 10, 500, 2, 1),
('min_age_months', '18', '18', 'العمر الأدنى بالشهور', 'capacity', 'number', 6, 60, 3, 1),
('max_age_months', '72', '72', 'العمر الأقصى بالشهور', 'capacity', 'number', 24, 120, 4, 1),
('max_employees', '20', '20', 'الحد الأقصى لعدد الموظفين', 'capacity', 'number', 5, 100, 5, 1),

-- Financial Settings
('enrollment_fee', '500', '500', 'رسوم التسجيل (ريال)', 'financial', 'number', 0, 5000, 1, 1),
('monthly_fee', '1200', '1200', 'الرسوم الشهرية (ريال)', 'financial', 'number', 100, 10000, 2, 1),
('late_pickup_fee_per_hour', '50', '50', 'رسوم التأخير في الاستلام (ريال/ساعة)', 'financial', 'number', 0, 500, 3, 1),
('meal_fee_per_day', '25', '25', 'رسوم الوجبة اليومية (ريال)', 'financial', 'number', 0, 200, 4, 1),
('transportation_fee', '300', '300', 'رسوم المواصلات الشهرية (ريال)', 'financial', 'number', 0, 1000, 5, 1),
('discount_sibling_percentage', '10', '10', 'نسبة خصم الأشقاء (%)', 'financial', 'number', 0, 50, 6, 1),

-- Security and System Settings
('session_timeout_minutes', '60', '60', 'انتهاء صلاحية الجلسة (دقيقة)', 'security', 'number', 15, 480, 1, 1),
('max_login_attempts', '5', '5', 'محاولات تسجيل الدخول القصوى', 'security', 'number', 3, 20, 2, 1),
('password_min_length', '8', '8', 'الحد الأدنى لطول كلمة المرور', 'security', 'number', 6, 50, 3, 1),
('backup_retention_days', '30', '30', 'مدة حفظ النسخ الاحتياطية (يوم)', 'security', 'number', 7, 365, 4, 1),

-- Notification Settings
('send_email_notifications', '1', '1', 'إرسال إشعارات بريد إلكتروني', 'notifications', 'select', NULL, NULL, 1, 1),
('send_sms_notifications', '1', '1', 'إرسال رسائل نصية', 'notifications', 'select', NULL, NULL, 2, 1),
('daily_report_time', '17:00', '17:00', 'وقت التقرير اليومي', 'notifications', 'time', NULL, NULL, 3, 1),
('reminder_before_hours', '2', '2', 'التذكير قبل (ساعة)', 'notifications', 'number', 1, 24, 4, 1),

-- Academic Settings
('academic_year_start_month', '9', '9', 'شهر بداية السنة الأكاديمية', 'academic', 'number', 1, 12, 1, 1),
('vacation_days_per_year', '30', '30', 'أيام الإجازة السنوية', 'academic', 'number', 10, 90, 2, 1),
('report_card_frequency_months', '3', '3', 'تكرار كشف الدرجات (شهور)', 'academic', 'number', 1, 12, 3, 1),

-- System Metadata (non-editable)
('system_version', '2.0', '2.0', 'إصدار النظام', 'system', 'text', NULL, NULL, 1, 0),
('last_backup_date', '', '', 'تاريخ آخر نسخة احتياطية', 'system', 'text', NULL, NULL, 2, 0),
('installation_date', datetime('now'), datetime('now'), 'تاريخ التثبيت', 'system', 'text', NULL, NULL, 3, 0);

-- Update options for select fields
UPDATE settings SET options = '{"1": "نعم", "0": "لا"}' 
WHERE input_type = 'select' AND key IN ('send_email_notifications', 'send_sms_notifications');

-- Create index for better performance
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_editable ON settings(is_editable);
CREATE INDEX idx_settings_key ON settings(key);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_settings_timestamp 
    AFTER UPDATE ON settings
    FOR EACH ROW
BEGIN
    UPDATE settings SET updated_at = datetime('now') WHERE id = NEW.id;
END;