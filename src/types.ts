// Type definitions for the Nursery Management System

export interface Child {
  id: number;
  name: string;
  age: number;
  parent_name: string;
  parent_phone: string;
  enrollment_date: string;
  class_id?: string;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  hire_date: string;
  salary?: number;
}

export interface AttendanceRecord {
  id: number;
  child_id: number;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  notes?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  capacity: number;
  age_group: string;
  teacher_id?: number;
}

export interface DashboardStats {
  totalChildren: number;
  totalEmployees: number;
  presentToday: number;
  totalClasses: number;
  weeklyAttendance: number[];
  classDistribution: Record<string, number>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  nurseryId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Cloudflare Workers types
export interface CloudflareEnv {
  DB: any; // D1Database
  FIREBASE_CONFIG?: string;
  JWT_SECRET?: string;
  NODE_ENV?: string;
}