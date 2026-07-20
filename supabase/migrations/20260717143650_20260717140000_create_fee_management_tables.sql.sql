/*
# Dynamic Fee Management Schema

## Summary
Creates a comprehensive fee management system with fee heads, program/semester/session-wise
fee structures, dynamic fee challans with line items, and fine management. This enables
the admin to define reusable fee components, compose them into structures by program/
semester/session, generate student-specific challans, and apply fines.

## New Tables

1. **fee_heads** — Reusable fee categories (e.g. Tuition, Lab, Library, Hostel).
   - id (uuid PK)
   - name (text, not null) — e.g. "Tuition Fee"
   - code (text, unique, not null) — short code e.g. "TUIT"
   - description (text)
   - is_mandatory (boolean, default true) — whether it applies to all students
   - is_active (boolean, default true)
   - sort_order (int, default 0)
   - created_at (timestamptz)

2. **fee_structures** — Fee amounts scoped by program/semester/session.
   - id (uuid PK)
   - fee_head_id (uuid FK → fee_heads.id)
   - program_id (uuid FK → programs.id, nullable) — null = all programs
   - semester (int, nullable) — null = all semesters
   - session (text, nullable) — e.g. "2026-2027"; null = all sessions
   - amount (numeric, not null, default 0)
   - is_active (boolean, default true)
   - created_at (timestamptz)

3. **fee_challans** — Student-specific fee invoices generated from structures.
   - id (uuid PK)
   - challan_number (text, unique, not null) — e.g. "CH-2026-00001"
   - student_id (text, not null) — references student_profiles.student_id
   - student_name (text, not null)
   - program_id (uuid, nullable)
   - semester (int, nullable)
   - session (text, not null, default '2026-2027')
   - total_amount (numeric, not null, default 0)
   - paid_amount (numeric, not null, default 0)
   - fine_amount (numeric, not null, default 0)
   - status (text, not null, default 'pending') — pending/partial/paid/overdue
   - due_date (date)
   - payment_date (date, nullable)
   - notes (text, nullable)
   - created_at (timestamptz)

4. **fee_challan_items** — Line items on a challan (one per fee head).
   - id (uuid PK)
   - challan_id (uuid FK → fee_challans.id ON DELETE CASCADE)
   - fee_head_id (uuid, nullable)
   - fee_head_name (text, not null) — denormalized for history
   - amount (numeric, not null, default 0)
   - sort_order (int, default 0)

5. **fine_configurations** — Fine rules for late payment, etc.
   - id (uuid PK)
   - name (text, not null) — e.g. "Late Payment Fine"
   - type (text, not null, default 'fixed') — fixed/percentage
   - value (numeric, not null, default 0) — amount or percentage
   - days_after_due (int, default 0) — applies N days after due date
   - is_active (boolean, default true)
   - created_at (timestamptz)

## Security
- All tables have RLS enabled.
- Since the admin panel uses authenticated sessions and the portal uses authenticated
  sessions, all policies are `TO authenticated` for write operations.
- SELECT policies use `TO anon, authenticated` so the anon-key client (portal) can read.
- Write policies (INSERT/UPDATE/DELETE) are `TO authenticated` only (admin/staff).

## Idempotency
All CREATE TABLE statements use IF NOT EXISTS. Policies use DROP IF EXISTS + CREATE.
*/

-- ── fee_heads ──
CREATE TABLE IF NOT EXISTS fee_heads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  is_mandatory boolean DEFAULT true,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fee_heads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_fee_heads" ON fee_heads;
CREATE POLICY "select_fee_heads" ON fee_heads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_fee_heads" ON fee_heads;
CREATE POLICY "insert_fee_heads" ON fee_heads FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_fee_heads" ON fee_heads;
CREATE POLICY "update_fee_heads" ON fee_heads FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_fee_heads" ON fee_heads;
CREATE POLICY "delete_fee_heads" ON fee_heads FOR DELETE
  TO authenticated USING (true);

-- ── fee_structures ──
CREATE TABLE IF NOT EXISTS fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_head_id uuid REFERENCES fee_heads(id) ON DELETE CASCADE,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  semester int,
  session text,
  amount numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_fee_structures" ON fee_structures;
CREATE POLICY "select_fee_structures" ON fee_structures FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_fee_structures" ON fee_structures;
CREATE POLICY "insert_fee_structures" ON fee_structures FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_fee_structures" ON fee_structures;
CREATE POLICY "update_fee_structures" ON fee_structures FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_fee_structures" ON fee_structures;
CREATE POLICY "delete_fee_structures" ON fee_structures FOR DELETE
  TO authenticated USING (true);

-- ── fee_challans ──
CREATE TABLE IF NOT EXISTS fee_challans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_number text UNIQUE NOT NULL,
  student_id text NOT NULL,
  student_name text NOT NULL,
  program_id uuid,
  semester int,
  session text NOT NULL DEFAULT '2026-2027',
  total_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  fine_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  payment_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fee_challans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_fee_challans" ON fee_challans;
CREATE POLICY "select_fee_challans" ON fee_challans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_fee_challans" ON fee_challans;
CREATE POLICY "insert_fee_challans" ON fee_challans FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_fee_challans" ON fee_challans;
CREATE POLICY "update_fee_challans" ON fee_challans FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_fee_challans" ON fee_challans;
CREATE POLICY "delete_fee_challans" ON fee_challans FOR DELETE
  TO authenticated USING (true);

-- ── fee_challan_items ──
CREATE TABLE IF NOT EXISTS fee_challan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id uuid REFERENCES fee_challans(id) ON DELETE CASCADE,
  fee_head_id uuid,
  fee_head_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  sort_order int DEFAULT 0
);

ALTER TABLE fee_challan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_fee_challan_items" ON fee_challan_items;
CREATE POLICY "select_fee_challan_items" ON fee_challan_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_fee_challan_items" ON fee_challan_items;
CREATE POLICY "insert_fee_challan_items" ON fee_challan_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_fee_challan_items" ON fee_challan_items;
CREATE POLICY "update_fee_challan_items" ON fee_challan_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_fee_challan_items" ON fee_challan_items;
CREATE POLICY "delete_fee_challan_items" ON fee_challan_items FOR DELETE
  TO authenticated USING (true);

-- ── fine_configurations ──
CREATE TABLE IF NOT EXISTS fine_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'fixed',
  value numeric NOT NULL DEFAULT 0,
  days_after_due int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fine_configurations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_fine_configurations" ON fine_configurations;
CREATE POLICY "select_fine_configurations" ON fine_configurations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_fine_configurations" ON fine_configurations;
CREATE POLICY "insert_fine_configurations" ON fine_configurations FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_fine_configurations" ON fine_configurations;
CREATE POLICY "update_fine_configurations" ON fine_configurations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_fine_configurations" ON fine_configurations;
CREATE POLICY "delete_fine_configurations" ON fine_configurations FOR DELETE
  TO authenticated USING (true);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_fee_structures_program ON fee_structures(program_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_head ON fee_structures(fee_head_id);
CREATE INDEX IF NOT EXISTS idx_fee_challans_student ON fee_challans(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_challans_status ON fee_challans(status);
CREATE INDEX IF NOT EXISTS idx_fee_challan_items_challan ON fee_challan_items(challan_id);

-- ── Seed default fee heads ──
INSERT INTO fee_heads (name, code, description, is_mandatory, sort_order)
SELECT v.name, v.code, v.description, v.is_mandatory, v.sort_order
FROM (VALUES
  ('Tuition Fee'::text, 'TUIT'::text, 'Core tuition for the academic term'::text, true, 1),
  ('Laboratory Fee'::text, 'LAB'::text, 'Lab equipment and materials'::text, false, 2),
  ('Library Fee'::text, 'LIB'::text, 'Library access and resources'::text, true, 3),
  ('Examination Fee'::text, 'EXAM'::text, 'Examination administration'::text, true, 4),
  ('Hostel Fee'::text, 'HOSTEL'::text, 'Hostel accommodation (optional)'::text, false, 5),
  ('Transportation Fee'::text, 'TRANS'::text, 'Campus transport service'::text, false, 6),
  ('Sports Fee'::text, 'SPORT'::text, 'Sports and recreation facilities'::text, false, 7),
  ('Student Activity Fee'::text, 'ACT'::text, 'Student clubs and events'::text, true, 8)
) AS v(name, code, description, is_mandatory, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM fee_heads LIMIT 1);

-- ── Seed default fine configuration ──
INSERT INTO fine_configurations (name, type, value, days_after_due, is_active)
SELECT 'Late Payment Fine', 'fixed', 500, 7, true
WHERE NOT EXISTS (SELECT 1 FROM fine_configurations LIMIT 1);
