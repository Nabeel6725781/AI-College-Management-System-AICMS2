import { supabase } from './supabase';

export async function seedAdminData(userId: string, email: string) {
  // Check if already seeded
  const { data: existing } = await supabase.from('system_settings').select('key').eq('key', 'institution_name').maybeSingle();
  if (existing) return;

  // System settings
  await supabase.from('system_settings').insert([
    { key: 'institution_name', value: 'Meridian University', category: 'general', description: 'Institution name' },
    { key: 'academic_year', value: '2025-2026', category: 'general', description: 'Current academic year' },
    { key: 'current_semester', value: 'Fall 2025', category: 'general', description: 'Active semester' },
    { key: 'max_enrollment', value: '5000', category: 'general', description: 'Maximum student enrollment' },
    { key: 'enable_email_notifications', value: 'true', category: 'notifications', description: 'Enable email notifications' },
    { key: 'enable_sms_notifications', value: 'false', category: 'notifications', description: 'Enable SMS notifications' },
    { key: 'maintenance_mode', value: 'false', category: 'system', description: 'Enable maintenance mode' },
    { key: 'allow_registrations', value: 'true', category: 'system', description: 'Allow new student registrations' },
    { key: 'default_currency', value: 'USD', category: 'finance', description: 'Default currency for fees' },
    { key: 'late_fee_amount', value: '50', category: 'finance', description: 'Late fee penalty amount' },
    { key: 'min_gpa_requirement', value: '2.0', category: 'academic', description: 'Minimum GPA to maintain enrollment' },
    { key: 'max_course_load', value: '6', category: 'academic', description: 'Maximum courses per semester' },
  ]);

  // Subjects
  await supabase.from('subjects').insert([
    { code: 'CS101', name: 'Introduction to Computer Science', department: 'Computer Science', credits: 3, description: 'Foundational concepts of computing and programming.' },
    { code: 'CS201', name: 'Data Structures and Algorithms', department: 'Computer Science', credits: 4, description: 'Study of data organization and algorithm design.' },
    { code: 'CS301', name: 'Database Systems', department: 'Computer Science', credits: 3, description: 'Relational databases, SQL, and database design.' },
    { code: 'MATH101', name: 'Calculus I', department: 'Mathematics', credits: 4, description: 'Differential calculus, limits, and continuity.' },
    { code: 'MATH201', name: 'Linear Algebra', department: 'Mathematics', credits: 3, description: 'Vectors, matrices, and linear transformations.' },
    { code: 'ENG101', name: 'English Composition', department: 'English', credits: 3, description: 'Academic writing and critical reading.' },
    { code: 'PHY101', name: 'General Physics', department: 'Physics', credits: 4, description: 'Mechanics, thermodynamics, and wave motion.' },
    { code: 'BIO101', name: 'Introduction to Biology', department: 'Biology', credits: 3, description: 'Cell biology, genetics, and evolution.' },
    { code: 'CHEM101', name: 'General Chemistry', department: 'Chemistry', credits: 4, description: 'Atomic structure, bonding, and reactions.' },
    { code: 'HIS101', name: 'World History', department: 'History', credits: 3, description: 'Survey of world civilizations.' },
    { code: 'ECON101', name: 'Microeconomics', department: 'Economics', credits: 3, description: 'Economic principles and market analysis.' },
    { code: 'PSY101', name: 'Introduction to Psychology', department: 'Psychology', credits: 3, description: 'Fundamentals of human behavior and cognition.' },
  ]);

  // Library books
  await supabase.from('library_books').insert([
    { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0262033848', category: 'Computer Science', total_copies: 5, available_copies: 3, shelf: 'CS-101', status: 'available' },
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Computer Science', total_copies: 3, available_copies: 2, shelf: 'CS-102', status: 'available' },
    { title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '978-1285741550', category: 'Mathematics', total_copies: 4, available_copies: 4, shelf: 'MATH-101', status: 'available' },
    { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', isbn: '978-3319110790', category: 'Mathematics', total_copies: 2, available_copies: 1, shelf: 'MATH-102', status: 'available' },
    { title: 'The Elements of Style', author: 'Strunk and White', isbn: '978-0205309023', category: 'English', total_copies: 6, available_copies: 5, shelf: 'ENG-101', status: 'available' },
    { title: 'University Physics', author: 'Young and Freedman', isbn: '978-0321973610', category: 'Physics', total_copies: 3, available_copies: 2, shelf: 'PHY-101', status: 'available' },
    { title: 'Campbell Biology', author: 'Reece, Urry, Cain', isbn: '978-0321775658', category: 'Biology', total_copies: 4, available_copies: 3, shelf: 'BIO-101', status: 'available' },
    { title: 'Chemistry: The Central Science', author: 'Brown, LeMay, Bursten', isbn: '978-0321910417', category: 'Chemistry', total_copies: 3, available_copies: 3, shelf: 'CHEM-101', status: 'available' },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', category: 'Physics', total_copies: 2, available_copies: 0, shelf: 'PHY-102', status: 'borrowed' },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '978-0374533557', category: 'Psychology', total_copies: 3, available_copies: 2, shelf: 'PSY-101', status: 'available' },
  ]);

  // Scholarships
  await supabase.from('scholarships').insert([
    { name: 'Merit Excellence Scholarship', description: 'Awarded to students with outstanding academic performance.', amount: 5000, eligibility: 'GPA 3.8+, full-time enrollment', deadline: '2026-03-15', status: 'active' },
    { name: 'Need-Based Financial Aid', description: 'Support for students demonstrating financial need.', amount: 3000, eligibility: 'FAFSA required, family income below threshold', deadline: '2026-04-01', status: 'active' },
    { name: 'STEM Innovation Award', description: 'For students pursuing STEM fields with research potential.', amount: 7500, eligibility: 'STEM major, faculty recommendation', deadline: '2026-02-28', status: 'active' },
    { name: 'International Student Grant', description: 'Financial support for international students.', amount: 4000, eligibility: 'International student status, GPA 3.0+', deadline: '2026-05-01', status: 'active' },
    { name: 'Community Service Scholarship', description: 'Recognizing students committed to community service.', amount: 2500, eligibility: '100+ hours community service', deadline: '2026-03-30', status: 'active' },
  ]);

  // Employees
  await supabase.from('employee_profiles').insert([
    { full_name: 'Patricia Lee', employee_id: 'EMP001', role: 'Registrar', department: 'Administration', phone: '555-0101', email: 'plee@meridian.edu', status: 'active' },
    { full_name: 'James Wilson', employee_id: 'EMP002', role: 'Librarian', department: 'Library', phone: '555-0102', email: 'jwilson@meridian.edu', status: 'active' },
    { full_name: 'Maria Garcia', employee_id: 'EMP003', role: 'Finance Officer', department: 'Finance', phone: '555-0103', email: 'mgarcia@meridian.edu', status: 'active' },
    { full_name: 'Robert Chen', employee_id: 'EMP004', role: 'IT Support', department: 'IT Services', phone: '555-0104', email: 'rchen@meridian.edu', status: 'active' },
    { full_name: 'Linda Thompson', employee_id: 'EMP005', role: 'Admissions Officer', department: 'Admissions', phone: '555-0105', email: 'lthompson@meridian.edu', status: 'active' },
    { full_name: 'David Park', employee_id: 'EMP006', role: 'Facilities Manager', department: 'Operations', phone: '555-0106', email: 'dpark@meridian.edu', status: 'on_leave' },
  ]);

  // User roles
  await supabase.from('user_roles').insert([
    { email: email, role: 'admin', permissions: ['all'], status: 'active' },
    { email: 'teacher@meridian.edu', role: 'teacher', permissions: ['classes', 'attendance', 'marks', 'assignments', 'messages'], status: 'active' },
    { email: 'student@meridian.edu', role: 'student', permissions: ['portal', 'courses', 'fees', 'documents'], status: 'active' },
    { email: 'plee@meridian.edu', role: 'staff', permissions: ['admissions', 'records'], status: 'active' },
  ]);

  // Fee records
  await supabase.from('fee_records').insert([
    { student_name: 'Emma Johnson', student_id: 'MU10001', amount: 5000, paid_amount: 5000, status: 'paid', due_date: '2025-09-01', description: 'Fall 2025 Tuition' },
    { student_name: 'Liam Smith', student_id: 'MU10002', amount: 5000, paid_amount: 2500, status: 'partial', due_date: '2025-09-01', description: 'Fall 2025 Tuition' },
    { student_name: 'Olivia Brown', student_id: 'MU10003', amount: 5000, paid_amount: 0, status: 'pending', due_date: '2025-09-01', description: 'Fall 2025 Tuition' },
    { student_name: 'Noah Davis', student_id: 'MU10004', amount: 4500, paid_amount: 0, status: 'overdue', due_date: '2025-08-01', description: 'Fall 2025 Tuition' },
    { student_name: 'Ava Wilson', student_id: 'MU10005', amount: 5000, paid_amount: 5000, status: 'paid', due_date: '2025-09-01', description: 'Fall 2025 Tuition' },
    { student_name: 'Ethan Moore', student_id: 'MU10006', amount: 3200, paid_amount: 1600, status: 'partial', due_date: '2025-09-15', description: 'Lab Fees' },
  ]);

  // Class sections
  await supabase.from('class_sections').insert([
    { name: 'CS101-A', course: 'Introduction to Computer Science', teacher_name: 'Dr. Sarah Chen', room: 'Lab 101', capacity: 30, enrolled: 28, schedule: 'Mon/Wed 9:00-10:30', status: 'active' },
    { name: 'CS201-B', course: 'Data Structures and Algorithms', teacher_name: 'Dr. James Lee', room: 'Room 220', capacity: 25, enrolled: 22, schedule: 'Tue/Thu 11:00-12:30', status: 'active' },
    { name: 'CS301-C', course: 'Database Systems', teacher_name: 'Dr. Maria Rodriguez', room: 'Lab 103', capacity: 20, enrolled: 18, schedule: 'Mon/Wed 2:00-3:30', status: 'active' },
    { name: 'MATH101-A', course: 'Calculus I', teacher_name: 'Prof. David Kim', room: 'Room 105', capacity: 35, enrolled: 32, schedule: 'Mon/Wed/Fri 10:00-11:00', status: 'active' },
    { name: 'ENG101-B', course: 'English Composition', teacher_name: 'Dr. Emily Watson', room: 'Room 210', capacity: 25, enrolled: 20, schedule: 'Tue/Thu 9:30-11:00', status: 'active' },
  ]);

  // Admin notifications
  await supabase.from('admin_notifications').insert([
    { title: 'New Admission Applications', message: '12 new applications pending review for Fall 2025 semester.', type: 'info', is_read: false },
    { title: 'Fee Payment Overdue', message: '3 students have overdue fee payments. Follow-up required.', type: 'alert', is_read: false },
    { title: 'System Backup Complete', message: 'Scheduled system backup completed successfully at 2:00 AM.', type: 'success', is_read: true },
    { title: 'Library Inventory Update', message: 'Library inventory audit scheduled for next week.', type: 'info', is_read: false },
    { title: 'New Teacher Registration', message: 'A new faculty member has registered and needs account approval.', type: 'info', is_read: true },
    { title: 'Server Performance Alert', message: 'Server CPU usage spiked to 85% during peak hours. Consider scaling.', type: 'alert', is_read: true },
  ]);

  // Audit logs
  await supabase.from('audit_logs').insert([
    { action: 'LOGIN', entity: 'auth', entity_id: userId, user_email: email, details: 'Admin logged in', ip_address: '192.168.1.1' },
    { action: 'CREATE', entity: 'subject', entity_id: 'CS101', user_email: email, details: 'Created subject: Introduction to Computer Science', ip_address: '192.168.1.1' },
    { action: 'UPDATE', entity: 'system_settings', entity_id: 'academic_year', user_email: email, details: 'Updated academic year to 2025-2026', ip_address: '192.168.1.1' },
    { action: 'DELETE', entity: 'user_role', entity_id: 'temp_user', user_email: email, details: 'Removed temporary user access', ip_address: '192.168.1.1' },
    { action: 'CREATE', entity: 'scholarship', entity_id: 'merit_excellence', user_email: email, details: 'Created new scholarship program', ip_address: '192.168.1.1' },
  ]);
}
