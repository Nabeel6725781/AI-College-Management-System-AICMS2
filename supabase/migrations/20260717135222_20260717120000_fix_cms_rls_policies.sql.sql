/*
# Fix RLS policies for CMS-managed content tables

## Summary
This migration fixes Row Level Security policy gaps that prevent the public website
and admin CMS from functioning correctly.

## Problems Fixed
1. **scholarships SELECT policy was `authenticated`-only** — the public website
   (anon key) could not read scholarships at all. Changed to `TO anon, authenticated`.
2. **departments, faculty, faqs, news, programs had NO write policies** — admin
   users could not INSERT/UPDATE/DELETE rows via the CMS. Added authenticated-only
   INSERT/UPDATE/DELETE policies for each table.

## Policy Changes
- **scholarships**: DROP + recreate SELECT as `TO anon, authenticated`; keep
  existing INSERT/UPDATE/DELETE (authenticated).
- **departments**: add INSERT/UPDATE/DELETE (authenticated only). SELECT already
  exists as `TO anon, authenticated`.
- **faculty**: add INSERT/UPDATE/DELETE (authenticated only).
- **faqs**: add INSERT/UPDATE/DELETE (authenticated only).
- **news**: add INSERT/UPDATE/DELETE (authenticated only).
- **programs**: add INSERT/UPDATE/DELETE (authenticated only).

## Idempotency
All policies use `DROP POLICY IF EXISTS` before `CREATE POLICY` so this migration
is safe to re-run.
*/

-- ── scholarships: fix SELECT to allow anon reads ──
DROP POLICY IF EXISTS "select_scholarships" ON scholarships;
CREATE POLICY "select_scholarships" ON scholarships FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_scholarships" ON scholarships;
CREATE POLICY "insert_scholarships" ON scholarships FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_scholarships" ON scholarships;
CREATE POLICY "update_scholarships" ON scholarships FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_scholarships" ON scholarships;
CREATE POLICY "delete_scholarships" ON scholarships FOR DELETE
  TO authenticated USING (true);

-- ── departments: add write policies ──
DROP POLICY IF EXISTS "insert_departments" ON departments;
CREATE POLICY "insert_departments" ON departments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_departments" ON departments;
CREATE POLICY "update_departments" ON departments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_departments" ON departments;
CREATE POLICY "delete_departments" ON departments FOR DELETE
  TO authenticated USING (true);

-- ── faculty: add write policies ──
DROP POLICY IF EXISTS "insert_faculty" ON faculty;
CREATE POLICY "insert_faculty" ON faculty FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_faculty" ON faculty;
CREATE POLICY "update_faculty" ON faculty FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_faculty" ON faculty;
CREATE POLICY "delete_faculty" ON faculty FOR DELETE
  TO authenticated USING (true);

-- ── faqs: add write policies ──
DROP POLICY IF EXISTS "insert_faqs" ON faqs;
CREATE POLICY "insert_faqs" ON faqs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_faqs" ON faqs;
CREATE POLICY "update_faqs" ON faqs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_faqs" ON faqs;
CREATE POLICY "delete_faqs" ON faqs FOR DELETE
  TO authenticated USING (true);

-- ── news: add write policies ──
DROP POLICY IF EXISTS "insert_news" ON news;
CREATE POLICY "insert_news" ON news FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_news" ON news;
CREATE POLICY "update_news" ON news FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_news" ON news;
CREATE POLICY "delete_news" ON news FOR DELETE
  TO authenticated USING (true);

-- ── programs: add write policies ──
DROP POLICY IF EXISTS "insert_programs" ON programs;
CREATE POLICY "insert_programs" ON programs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_programs" ON programs;
CREATE POLICY "update_programs" ON programs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_programs" ON programs;
CREATE POLICY "delete_programs" ON programs FOR DELETE
  TO authenticated USING (true);
