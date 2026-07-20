/*
# Create schema for educational institution public website

1. New Tables
- `departments` — academic departments (name, description, icon, banner image, established year)
- `programs` — academic programs (name, degree type, department, duration, description, image)
- `faculty` — faculty members (name, title, department, bio, image, email, research areas)
- `news` — news articles (title, excerpt, content, image, category, published date, author)
- `faqs` — frequently asked questions (question, answer, category, sort order)
- `contact_submissions` — contact form submissions (name, email, subject, message, created_at)

2. Security
- Enable RLS on all tables.
- Public read access (anon + authenticated) for departments, programs, faculty, news, faqs.
- Public insert for contact_submissions (anyone can submit the contact form).
- No update/delete from anon (admin-only, no admin role defined yet).

3. Notes
- All tables use gen_random_uuid() for primary keys.
- Timestamps default to now().
- Contact submissions stored for admin review.
*/

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'BookOpen',
  image_url text,
  established_year int,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  degree_type text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  duration text NOT NULL,
  description text NOT NULL,
  image_url text,
  highlights text[] DEFAULT '{}',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  bio text NOT NULL,
  image_url text,
  email text,
  research_areas text[] DEFAULT '{}',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text,
  category text NOT NULL DEFAULT 'General',
  author text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_featured boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Departments: public read
DROP POLICY IF EXISTS "anon_read_departments" ON departments;
CREATE POLICY "anon_read_departments" ON departments FOR SELECT
  TO anon, authenticated USING (true);

-- Programs: public read
DROP POLICY IF EXISTS "anon_read_programs" ON programs;
CREATE POLICY "anon_read_programs" ON programs FOR SELECT
  TO anon, authenticated USING (true);

-- Faculty: public read
DROP POLICY IF EXISTS "anon_read_faculty" ON faculty;
CREATE POLICY "anon_read_faculty" ON faculty FOR SELECT
  TO anon, authenticated USING (true);

-- News: public read
DROP POLICY IF EXISTS "anon_read_news" ON news;
CREATE POLICY "anon_read_news" ON news FOR SELECT
  TO anon, authenticated USING (true);

-- FAQs: public read
DROP POLICY IF EXISTS "anon_read_faqs" ON faqs;
CREATE POLICY "anon_read_faqs" ON faqs FOR SELECT
  TO anon, authenticated USING (true);

-- Contact submissions: public insert only
DROP POLICY IF EXISTS "anon_insert_contact" ON contact_submissions;
CREATE POLICY "anon_insert_contact" ON contact_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
