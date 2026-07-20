/*
# Create remaining Student Portal tables

1. New Tables (matching existing convention of student_id DEFAULT auth.uid())
- `courses` — shared course catalog (code, title, credits, instructor, department, semester, description)
- `enrollments` — links students to courses (student_id, course_id, enrolled_at, status)
- `timetable_slots` — weekly schedule (student_id, day_of_week, start/end time, course_title, room, instructor)
- `assignments` — coursework (student_id, course_title, title, description, due_date, status, submission_text)
- `admission_applications` — admission forms (student_id, full_name, email, phone, dob, gender, address, program, previous_school, gpa, statement, status)
- `support_tickets` — help tickets (student_id, subject, message, category, priority, status)

2. Security
- RLS enabled on all new tables.
- Courses: public read (anon + authenticated) — shared catalog.
- All other tables: owner-scoped CRUD via student_id = auth.uid().

3. Notes
- Uses student_id (not user_id) to match existing portal tables.
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  title text NOT NULL,
  credits int NOT NULL DEFAULT 3,
  instructor text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  semester int NOT NULL DEFAULT 1,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  enrolled_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week int NOT NULL DEFAULT 0,
  start_time text NOT NULL DEFAULT '09:00',
  end_time text NOT NULL DEFAULT '10:00',
  course_title text NOT NULL DEFAULT '',
  room text DEFAULT '',
  instructor text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_title text DEFAULT '',
  title text NOT NULL,
  description text DEFAULT '',
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending',
  submission_text text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admission_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  date_of_birth date,
  gender text DEFAULT '',
  address text DEFAULT '',
  program text NOT NULL DEFAULT '',
  previous_school text DEFAULT '',
  gpa numeric DEFAULT 0,
  statement text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Courses: public read
DROP POLICY IF EXISTS "read_courses" ON courses;
CREATE POLICY "read_courses" ON courses FOR SELECT
  TO anon, authenticated USING (true);

-- Enrollments: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_enrollments" ON enrollments;
CREATE POLICY "select_own_enrollments" ON enrollments FOR SELECT
  TO authenticated USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "insert_own_enrollments" ON enrollments;
CREATE POLICY "insert_own_enrollments" ON enrollments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "update_own_enrollments" ON enrollments;
CREATE POLICY "update_own_enrollments" ON enrollments FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "delete_own_enrollments" ON enrollments;
CREATE POLICY "delete_own_enrollments" ON enrollments FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- Timetable: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_timetable" ON timetable_slots;
CREATE POLICY "select_own_timetable" ON timetable_slots FOR SELECT
  TO authenticated USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "insert_own_timetable" ON timetable_slots;
CREATE POLICY "insert_own_timetable" ON timetable_slots FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "update_own_timetable" ON timetable_slots;
CREATE POLICY "update_own_timetable" ON timetable_slots FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "delete_own_timetable" ON timetable_slots;
CREATE POLICY "delete_own_timetable" ON timetable_slots FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- Assignments: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_assignments" ON assignments;
CREATE POLICY "select_own_assignments" ON assignments FOR SELECT
  TO authenticated USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "insert_own_assignments" ON assignments;
CREATE POLICY "insert_own_assignments" ON assignments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "update_own_assignments" ON assignments;
CREATE POLICY "update_own_assignments" ON assignments FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "delete_own_assignments" ON assignments;
CREATE POLICY "delete_own_assignments" ON assignments FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- Admission applications: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_admissions" ON admission_applications;
CREATE POLICY "select_own_admissions" ON admission_applications FOR SELECT
  TO authenticated USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "insert_own_admissions" ON admission_applications;
CREATE POLICY "insert_own_admissions" ON admission_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "update_own_admissions" ON admission_applications;
CREATE POLICY "update_own_admissions" ON admission_applications FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "delete_own_admissions" ON admission_applications;
CREATE POLICY "delete_own_admissions" ON admission_applications FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- Support tickets: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_tickets" ON support_tickets;
CREATE POLICY "select_own_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "insert_own_tickets" ON support_tickets;
CREATE POLICY "insert_own_tickets" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "update_own_tickets" ON support_tickets;
CREATE POLICY "update_own_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "delete_own_tickets" ON support_tickets;
CREATE POLICY "delete_own_tickets" ON support_tickets FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_timetable_student ON timetable_slots(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_admissions_student ON admission_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_tickets_student ON support_tickets(student_id);
