/*
# Create Teacher Portal Tables

1. New Tables
- `teacher_profiles` — teacher personal info (id FK to auth.users, full_name, teacher_id, avatar, phone, department, title, bio)
- `teacher_notifications` — teacher notifications (teacher_id, title, message, type, is_read, created_at)
- `messages` — messaging between teachers and students (sender_id, recipient_id, subject, body, read, created_at)
- `teacher_timetable_slots` — teacher's weekly schedule (teacher_id, day_of_week, start/end time, course_title, room, class_name)
- `teacher_assignments` — assignments created by teacher for a class (teacher_id, course_title, title, description, due_date, status)
- `marks` — marks entered by teacher (teacher_id, student_name, student_id, course_title, exam_type, score, max_score, grade, semester)

2. Security
- RLS enabled on all tables.
- Owner-scoped CRUD via teacher_id = auth.uid() on all teacher tables.
- Messages: owner-scoped via sender_id OR recipient_id = auth.uid() (both can see conversation).

3. Notes
- Uses teacher_id DEFAULT auth.uid() matching existing portal convention.
- teacher_profiles uses id FK to auth.users (same pattern as student_profiles).
*/

CREATE TABLE IF NOT EXISTS teacher_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  teacher_id text NOT NULL DEFAULT '',
  avatar_url text,
  phone text,
  department text DEFAULT '',
  title text DEFAULT 'Professor',
  bio text,
  office_hours text,
  office_location text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name text DEFAULT '',
  sender_name text DEFAULT '',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week int NOT NULL DEFAULT 0,
  start_time text NOT NULL DEFAULT '09:00',
  end_time text NOT NULL DEFAULT '10:00',
  course_title text NOT NULL DEFAULT '',
  room text DEFAULT '',
  class_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_title text NOT NULL DEFAULT '',
  class_name text DEFAULT '',
  title text NOT NULL,
  description text DEFAULT '',
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name text NOT NULL DEFAULT '',
  student_id text DEFAULT '',
  course_title text NOT NULL DEFAULT '',
  exam_type text NOT NULL DEFAULT 'Midterm',
  score numeric NOT NULL DEFAULT 0,
  max_score numeric NOT NULL DEFAULT 100,
  grade text DEFAULT '',
  semester text DEFAULT 'Fall 2025',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- Teacher profiles: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_teacher_profile" ON teacher_profiles;
CREATE POLICY "select_own_teacher_profile" ON teacher_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_teacher_profile" ON teacher_profiles;
CREATE POLICY "insert_own_teacher_profile" ON teacher_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_teacher_profile" ON teacher_profiles;
CREATE POLICY "update_own_teacher_profile" ON teacher_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Teacher notifications: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_teacher_notifs" ON teacher_notifications;
CREATE POLICY "select_own_teacher_notifs" ON teacher_notifications FOR SELECT
  TO authenticated USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "insert_own_teacher_notifs" ON teacher_notifications;
CREATE POLICY "insert_own_teacher_notifs" ON teacher_notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "update_own_teacher_notifs" ON teacher_notifications;
CREATE POLICY "update_own_teacher_notifs" ON teacher_notifications FOR UPDATE
  TO authenticated USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "delete_own_teacher_notifs" ON teacher_notifications;
CREATE POLICY "delete_own_teacher_notifs" ON teacher_notifications FOR DELETE
  TO authenticated USING (auth.uid() = teacher_id);

-- Messages: sender or recipient can see
DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
  TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Teacher timetable: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_teacher_timetable" ON teacher_timetable_slots;
CREATE POLICY "select_own_teacher_timetable" ON teacher_timetable_slots FOR SELECT
  TO authenticated USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "insert_own_teacher_timetable" ON teacher_timetable_slots;
CREATE POLICY "insert_own_teacher_timetable" ON teacher_timetable_slots FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "update_own_teacher_timetable" ON teacher_timetable_slots;
CREATE POLICY "update_own_teacher_timetable" ON teacher_timetable_slots FOR UPDATE
  TO authenticated USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "delete_own_teacher_timetable" ON teacher_timetable_slots;
CREATE POLICY "delete_own_teacher_timetable" ON teacher_timetable_slots FOR DELETE
  TO authenticated USING (auth.uid() = teacher_id);

-- Teacher assignments: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_teacher_assignments" ON teacher_assignments;
CREATE POLICY "select_own_teacher_assignments" ON teacher_assignments FOR SELECT
  TO authenticated USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "insert_own_teacher_assignments" ON teacher_assignments;
CREATE POLICY "insert_own_teacher_assignments" ON teacher_assignments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "update_own_teacher_assignments" ON teacher_assignments;
CREATE POLICY "update_own_teacher_assignments" ON teacher_assignments FOR UPDATE
  TO authenticated USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "delete_own_teacher_assignments" ON teacher_assignments;
CREATE POLICY "delete_own_teacher_assignments" ON teacher_assignments FOR DELETE
  TO authenticated USING (auth.uid() = teacher_id);

-- Marks: owner-scoped CRUD
DROP POLICY IF EXISTS "select_own_marks" ON marks;
CREATE POLICY "select_own_marks" ON marks FOR SELECT
  TO authenticated USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "insert_own_marks" ON marks;
CREATE POLICY "insert_own_marks" ON marks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "update_own_marks" ON marks;
CREATE POLICY "update_own_marks" ON marks FOR UPDATE
  TO authenticated USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "delete_own_marks" ON marks;
CREATE POLICY "delete_own_marks" ON marks FOR DELETE
  TO authenticated USING (auth.uid() = teacher_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teacher_notifs_teacher ON teacher_notifications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_teacher_timetable_teacher ON teacher_timetable_slots(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_marks_teacher ON marks(teacher_id);
