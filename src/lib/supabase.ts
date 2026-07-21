import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Department = {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url: string | null;
  established_year: number | null;
  sort_order: number;
};

export type Program = {
  id: string;
  name: string;
  degree_type: string;
  department_id: string | null;
  duration: string;
  description: string;
  image_url: string | null;
  highlights: string[];
  sort_order: number;
};

export type FacultyMember = {
  id: string;
  name: string;
  title: string;
  department_id: string | null;
  bio: string;
  image_url: string | null;
  email: string | null;
  research_areas: string[];
  sort_order: number;
};

export type NewsArticle = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  category: string;
  author: string;
  published_at: string;
  is_featured: boolean;
  sort_order: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
};

export type ContactSubmission = {
  name: string;
  email: string;
  subject: string | null;
  message: string;
};

// Portal types
export type StudentProfile = {
  id: string;
  full_name: string;
  student_id: string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  enrollment_date: string;
  program: string;
  year: number;
  status: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  credits: number;
  instructor: string;
  department: string;
  semester: number;
  description: string;
};

export type Enrollment = {
  id: string;
  student_id: string;
  course_id: string | null;
  enrolled_at: string;
  status: string;
  course?: Course | null;
};

export type AttendanceRecord = {
  id: string;
  student_id: string;
  date: string;
  course_name: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export type ResultRecord = {
  id: string;
  student_id: string;
  course_name: string;
  course_code: string | null;
  credits: number;
  grade: string | null;
  grade_points: number;
  semester: string | null;
  exam_type: string;
  created_at: string;
};

export type PortalFeeChallan = {
  id: string;
  student_id: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  payment_date: string | null;
  category: string;
  created_at: string;
};

export type TimetableSlot = {
  id: string;
  student_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  course_title: string;
  room: string;
  instructor: string;
  created_at: string;
};

export type Assignment = {
  id: string;
  student_id: string;
  course_title: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  submission_text: string | null;
  created_at: string;
};

export type DocumentRecord = {
  id: string;
  student_id: string;
  name: string;
  doc_type: string;
  file_url: string | null;
  file_path: string | null;
  file_size: number;
  mime_type: string | null;
  status: string;
  ocr_text: string | null;
  created_at: string;
};

export type NotificationRecord = {
  id: string;
  student_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type AdmissionApplication = {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  program: string;
  previous_school: string;
  gpa: number;
  statement: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportTicket = {
  id: string;
  student_id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ChatbotMessage = {
  id: string;
  student_id: string;
  role: string;
  content: string;
  created_at: string;
};

// Teacher portal types
export type TeacherProfile = {
  id: string;
  full_name: string;
  teacher_id: string;
  avatar_url: string | null;
  phone: string | null;
  department: string;
  title: string;
  bio: string | null;
  office_hours: string | null;
  office_location: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TeacherNotification = {
  id: string;
  teacher_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  recipient_name: string;
  sender_name: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export type TeacherTimetableSlot = {
  id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  course_title: string;
  room: string;
  class_name: string;
  created_at: string;
};

export type TeacherAssignment = {
  id: string;
  teacher_id: string;
  course_title: string;
  class_name: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  created_at: string;
};

export type Mark = {
  id: string;
  teacher_id: string;
  student_name: string;
  student_id: string;
  course_title: string;
  exam_type: string;
  score: number;
  max_score: number;
  grade: string;
  semester: string;
  created_at: string;
};

// Admin portal types
export type Subject = {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  description: string;
  created_at: string;
};

export type LibraryBook = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  total_copies: number;
  available_copies: number;
  shelf: string;
  status: string;
  created_at: string;
};

export type Scholarship = {
  id: string;
  name: string;
  description: string;
  amount: number;
  eligibility: string;
  deadline: string | null;
  status: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  user_email: string;
  details: string;
  ip_address: string;
  created_at: string;
};

export type EmployeeProfile = {
  id: string;
  full_name: string;
  employee_id: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
};

export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type UserRole = {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  created_at: string;
};

export type SystemSetting = {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string;
  updated_at: string;
};

export type FeeRecord = {
  id: string;
  student_name: string;
  student_id: string;
  amount: number;
  paid_amount: number;
  status: string;
  due_date: string | null;
  description: string;
  created_at: string;
};

export type ClassSection = {
  id: string;
  name: string;
  course: string;
  teacher_name: string;
  room: string;
  capacity: number;
  enrolled: number;
  schedule: string;
  status: string;
  created_at: string;
};

// Fee management types
export type FeeHead = {
  id: string;
  name: string;
  code: string;
  description: string;
  is_mandatory: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type FeeStructure = {
  id: string;
  fee_head_id: string;
  program_id: string | null;
  semester: number | null;
  session: string | null;
  amount: number;
  is_active: boolean;
  created_at: string;
};

export type FeeChallanItem = {
  id: string;
  challan_id: string;
  fee_head_id: string | null;
  fee_head_name: string;
  amount: number;
  sort_order: number;
};

export type FeeChallan = {
  id: string;
  challan_number: string;
  student_id: string;
  student_name: string;
  program_id: string | null;
  semester: number | null;
  session: string;
  total_amount: number;
  paid_amount: number;
  fine_amount: number;
  status: string;
  due_date: string | null;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  items?: FeeChallanItem[];
};

export type FineConfiguration = {
  id: string;
  name: string;
  type: string;
  value: number;
  days_after_due: number;
  is_active: boolean;
  created_at: string;
};

// Function wrapper fixing the orphan invoke line
export async function runLlmInference(userMessage: string) {
  const { data, error } = await supabase.functions.invoke("llm-inference", {
    body: { prompt: userMessage },
  });

  if (error) throw error;
  return data;
}
