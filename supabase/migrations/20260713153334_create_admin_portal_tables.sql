/*
# Create Admin Portal Tables

1. New Tables
- `subjects` — academic subjects (code, name, department, credits, description)
- `library_books` — library catalog (title, author, isbn, category, copies, available, shelf)
- `scholarships` — scholarship programs (name, description, amount, eligibility, deadline, status)
- `audit_logs` — system audit trail (action, entity, entity_id, user_email, details, ip_address)
- `employee_profiles` — non-teaching staff (full_name, employee_id, role, department, phone, status)
- `admin_notifications` — admin notifications (title, message, type, is_read)
- `user_roles` — role management (email, role, permissions, status)
- `system_settings` — key-value system configuration (key, value, category, description)
- `fee_records` — admin fee management (student_name, student_id, amount, paid, status, due_date, description)
- `class_sections` — class/section management (name, course, teacher_name, room, capacity, enrolled, schedule)

2. Security
- RLS enabled on all tables.
- Owner-scoped via auth.uid() where applicable.
- Admin tables use TO authenticated with USING(true) since admin portal is behind auth.
*/

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  department text NOT NULL DEFAULT '',
  credits int NOT NULL DEFAULT 3,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL DEFAULT '',
  isbn text DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  total_copies int NOT NULL DEFAULT 1,
  available_copies int NOT NULL DEFAULT 1,
  shelf text DEFAULT '',
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  eligibility text DEFAULT '',
  deadline date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity text NOT NULL DEFAULT '',
  entity_id text DEFAULT '',
  user_email text NOT NULL DEFAULT '',
  details text DEFAULT '',
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  employee_id text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'Staff',
  department text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'student',
  permissions text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fee_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_id text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course text NOT NULL DEFAULT '',
  teacher_name text DEFAULT '',
  room text DEFAULT '',
  capacity int NOT NULL DEFAULT 30,
  enrolled int NOT NULL DEFAULT 0,
  schedule text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sections ENABLE ROW LEVEL SECURITY;

-- Admin tables: authenticated users can CRUD (admin portal is behind auth)
-- Using TO authenticated with USING(true) / WITH CHECK(true) for admin-managed tables

-- Subjects
CREATE POLICY "select_subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_subjects" ON subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_subjects" ON subjects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_subjects" ON subjects FOR DELETE TO authenticated USING (true);

-- Library books
CREATE POLICY "select_library" ON library_books FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_library" ON library_books FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_library" ON library_books FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_library" ON library_books FOR DELETE TO authenticated USING (true);

-- Scholarships
CREATE POLICY "select_scholarships" ON scholarships FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_scholarships" ON scholarships FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_scholarships" ON scholarships FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_scholarships" ON scholarships FOR DELETE TO authenticated USING (true);

-- Audit logs
CREATE POLICY "select_audit" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_audit" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Employee profiles
CREATE POLICY "select_employees" ON employee_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_employees" ON employee_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_employees" ON employee_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_employees" ON employee_profiles FOR DELETE TO authenticated USING (true);

-- Admin notifications
CREATE POLICY "select_admin_notifs" ON admin_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_admin_notifs" ON admin_notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_admin_notifs" ON admin_notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_admin_notifs" ON admin_notifications FOR DELETE TO authenticated USING (true);

-- User roles
CREATE POLICY "select_user_roles" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_user_roles" ON user_roles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_user_roles" ON user_roles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_user_roles" ON user_roles FOR DELETE TO authenticated USING (true);

-- System settings
CREATE POLICY "select_settings" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_settings" ON system_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_settings" ON system_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_settings" ON system_settings FOR DELETE TO authenticated USING (true);

-- Fee records
CREATE POLICY "select_fees" ON fee_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_fees" ON fee_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_fees" ON fee_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_fees" ON fee_records FOR DELETE TO authenticated USING (true);

-- Class sections
CREATE POLICY "select_classes" ON class_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_classes" ON class_sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_classes" ON class_sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_classes" ON class_sections FOR DELETE TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_dept ON subjects(department);
CREATE INDEX IF NOT EXISTS idx_library_category ON library_books(category);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employee_profiles(department);
CREATE INDEX IF NOT EXISTS idx_fee_records_status ON fee_records(status);
CREATE INDEX IF NOT EXISTS idx_class_sections_course ON class_sections(course);
