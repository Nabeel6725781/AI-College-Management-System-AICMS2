/*
# Seed content tables with website default data

## Summary
Seeds the 6 pre-existing content tables (departments, programs, faculty, faqs,
news, scholarships) and cms_site_notifications with default content matching
the website's hardcoded frontend fallbacks. Uses subqueries to thread
generated department UUIDs into child tables.

## Tables Seeded
1. departments — 3 rows (CS, Biology, Business)
2. programs — 3 rows (CS, Biology, Business Administration)
3. faculty — 2 rows (Dr. Sarah Chen, Dr. Amelia Ortiz)
4. faqs — 2 rows
5. news — 2 rows
6. scholarships — 4 rows (from Admissions page financial aid options)
7. cms_site_notifications — 1 welcome banner

## Idempotency
All inserts guarded by `WHERE NOT EXISTS`. Safe to re-run.
*/

-- ── departments ──
INSERT INTO departments (name, description, icon, image_url, established_year, sort_order)
SELECT v.name, v.description, v.icon, v.image_url, v.established_year, v.sort_order
FROM (VALUES
  ('Computer Science'::text, 'Explores software engineering, AI, and computational problem solving.'::text, 'Cpu'::text, 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800'::text, 1965::int, 1::int),
  ('Biology'::text, 'Advances research in genetics, ecology, and life sciences.'::text, 'Dna'::text, 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800'::text, 1851::int, 2::int),
  ('Business'::text, 'Prepares leaders for innovation, finance, and entrepreneurship.'::text, 'Briefcase'::text, 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800'::text, 1920::int, 3::int)
) AS v(name, description, icon, image_url, established_year, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM departments LIMIT 1);

-- ── programs ──
INSERT INTO programs (name, degree_type, department_id, duration, description, image_url, highlights, sort_order)
SELECT v.name, v.degree_type, d.id, v.duration, v.description, v.image_url, v.highlights, v.sort_order
FROM (VALUES
  ('Computer Science'::text, 'Bachelor of Science'::text, 'Computer Science'::text, '4 years'::text, 'Build modern software, AI systems, and scalable applications.'::text, 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800'::text, ARRAY['AI Lab', 'Cloud Computing', 'Research Opportunities']::text[], 1::int),
  ('Biology'::text, 'Bachelor of Science'::text, 'Biology'::text, '4 years'::text, 'Study living systems through labs, field work, and research.'::text, 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800'::text, ARRAY['Genomics', 'Fieldwork', 'Lab Methods']::text[], 2::int),
  ('Business Administration'::text, 'Bachelor of Arts'::text, 'Business'::text, '4 years'::text, 'Develop strategic thinking and leadership for modern enterprises.'::text, 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800'::text, ARRAY['Leadership', 'Finance', 'Entrepreneurship']::text[], 3::int)
) AS v(name, degree_type, dept_name, duration, description, image_url, highlights, sort_order)
LEFT JOIN departments d ON d.name = v.dept_name
WHERE NOT EXISTS (SELECT 1 FROM programs LIMIT 1);

-- ── faculty ──
INSERT INTO faculty (name, title, department_id, bio, image_url, email, research_areas, sort_order)
SELECT v.name, v.title, d.id, v.bio, v.image_url, v.email, v.research_areas, v.sort_order
FROM (VALUES
  ('Dr. Sarah Chen'::text, 'Professor of Computer Science'::text, 'Computer Science'::text, 'Researches artificial intelligence and human-centered computing.'::text, 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=600'::text, 'schen@meridian.edu'::text, ARRAY['AI', 'Human-Computer Interaction']::text[], 1::int),
  ('Dr. Amelia Ortiz'::text, 'Associate Professor of Biology'::text, 'Biology'::text, 'Leads research in ecological systems and conservation biology.'::text, 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=600'::text, 'aortiz@meridian.edu'::text, ARRAY['Ecology', 'Conservation']::text[], 2::int)
) AS v(name, title, dept_name, bio, image_url, email, research_areas, sort_order)
LEFT JOIN departments d ON d.name = v.dept_name
WHERE NOT EXISTS (SELECT 1 FROM faculty LIMIT 1);

-- ── faqs ──
INSERT INTO faqs (question, answer, category, sort_order)
SELECT v.question, v.answer, v.category, v.sort_order
FROM (VALUES
  ('How do I apply to Meridian University?'::text, 'You can start your application through the admissions page and submit required documents.'::text, 'Admissions'::text, 1::int),
  ('What programs are available?'::text, 'Meridian offers programs in computer science, biology, business, and more.'::text, 'Academics'::text, 2::int)
) AS v(question, answer, category, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM faqs LIMIT 1);

-- ── news ──
INSERT INTO news (title, excerpt, content, image_url, category, author, published_at, is_featured, sort_order)
SELECT v.title, v.excerpt, v.content, v.image_url, v.category, v.author, v.published_at, v.is_featured, v.sort_order
FROM (VALUES
  ('Meridian launches new AI research center'::text, 'The university unveiled a new institute focused on responsible AI innovation.'::text, 'The new institute brings together faculty, industry partners, and students to advance ethical AI research.'::text, 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800'::text, 'Research'::text, 'Meridian Communications'::text, '2026-07-15T10:00:00.000Z'::timestamptz, true::bool, 1::int),
  ('Students showcase community impact projects'::text, 'Undergraduate teams presented solutions for local and global challenges.'::text, 'The showcase highlighted projects connecting academic learning with community service.'::text, 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800'::text, 'Campus'::text, 'Student Affairs'::text, '2026-07-10T10:00:00.000Z'::timestamptz, false::bool, 2::int)
) AS v(title, excerpt, content, image_url, category, author, published_at, is_featured, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM news LIMIT 1);

-- ── scholarships ──
INSERT INTO scholarships (name, description, amount, eligibility, deadline, status)
SELECT v.name, v.description, v.amount, v.eligibility, v.deadline, v.status
FROM (VALUES
  ('Need-Based Aid'::text, 'Families earning under $100,000 pay no tuition. Aid packages include grants, not loans.'::text, 75000::numeric, 'Family income under $100,000'::text, '2027-01-15'::date, 'active'::text),
  ('Merit Scholarships'::text, 'Awarded based on academic excellence, leadership, and extracurricular achievement.'::text, 50000::numeric, 'Outstanding academic record and leadership'::text, '2027-01-15'::date, 'active'::text),
  ('Athletic Scholarships'::text, 'Available for student-athletes in our 18 NCAA Division I sports programs.'::text, 60000::numeric, 'Student-athletes in NCAA Division I sports'::text, '2027-03-01'::date, 'active'::text),
  ('Work-Study Program'::text, 'On-campus employment opportunities to help offset education costs.'::text, 6000::numeric, 'Demonstrated financial need'::text, '2027-01-15'::date, 'active'::text)
) AS v(name, description, amount, eligibility, deadline, status)
WHERE NOT EXISTS (SELECT 1 FROM scholarships LIMIT 1);

-- ── cms_site_notifications ──
INSERT INTO cms_site_notifications (title, message, type, link_text, link_url, is_active)
SELECT 'Welcome to Meridian University'::text, 'Applications for the Class of 2031 are now open. Start your journey today!'::text, 'info'::text, 'Apply Now'::text, '/admissions'::text, true::bool
WHERE NOT EXISTS (SELECT 1 FROM cms_site_notifications LIMIT 1);
