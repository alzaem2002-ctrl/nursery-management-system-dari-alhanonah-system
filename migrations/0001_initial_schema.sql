-- Nursery Management System Database Schema
-- Database schema with Arabic text support (UTF-8)

-- Users/Authentication table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 1 AND age <= 6),
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  address TEXT,
  medical_notes TEXT,
  status TEXT DEFAULT 'نشط' CHECK (status IN ('نشط', 'غير نشط', 'محول')),
  registration_date DATE DEFAULT (date('now')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT NOT NULL,
  hire_date DATE NOT NULL,
  status TEXT DEFAULT 'نشط' CHECK (status IN ('نشط', 'غير نشط', 'مُجاز')),
  salary DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  attendance_date DATE NOT NULL,
  arrival_time TIME,
  departure_time TIME,
  status TEXT DEFAULT 'حاضر' CHECK (status IN ('حاضر', 'غائب', 'متأخر', 'انصراف مبكر')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  UNIQUE(child_id, attendance_date)
);

-- Payments table (for future use)
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_type TEXT DEFAULT 'شهري' CHECK (payment_type IN ('شهري', 'يومي', 'أسبوعي')),
  status TEXT DEFAULT 'مدفوع' CHECK (status IN ('مدفوع', 'مستحق', 'متأخر')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_children_name ON children(name);
CREATE INDEX IF NOT EXISTS idx_children_parent_phone ON children(parent_phone);
CREATE INDEX IF NOT EXISTS idx_children_status ON children(status);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_child_date ON attendance(child_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_payments_child_id ON payments(child_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);