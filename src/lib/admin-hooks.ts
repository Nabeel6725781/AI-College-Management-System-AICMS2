import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type {
  Subject, LibraryBook, Scholarship, AuditLog, EmployeeProfile,
  AdminNotification, UserRole, SystemSetting, FeeRecord, ClassSection,
  AdmissionApplication, Course, Department, FacultyMember,
  FeeHead, FeeStructure, FeeChallan, FineConfiguration,
} from './supabase';

async function safeListQuery<T>(request: PromiseLike<{ data: T[] | null; error?: { message?: string } | null }>, fallback: T[] = []): Promise<T[]> {
  try {
    const { data, error } = await request;
    if (error) return fallback;
    return (data ?? fallback) as T[];
  } catch {
    return fallback;
  }
}

export function useSubjects() {
  const [data, setData] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<Subject>(supabase.from('subjects').select('*').order('code', { ascending: true }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useLibraryBooks() {
  const [data, setData] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<LibraryBook>(supabase.from('library_books').select('*').order('title', { ascending: true }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useScholarships() {
  const [data, setData] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<Scholarship>(supabase.from('scholarships').select('*').order('created_at', { ascending: false }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useAuditLogs() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<AuditLog>(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useEmployees() {
  const [data, setData] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<EmployeeProfile>(supabase.from('employee_profiles').select('*').order('created_at', { ascending: false }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useAdminNotifications() {
  const [data, setData] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<AdminNotification>(supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useUserRoles() {
  const [data, setData] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<UserRole>(supabase.from('user_roles').select('*').order('created_at', { ascending: false }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useSystemSettings() {
  const [data, setData] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<SystemSetting>(supabase.from('system_settings').select('*').order('category', { ascending: true }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useFeeRecords() {
  const [data, setData] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<FeeRecord>(supabase.from('fee_records').select('*').order('created_at', { ascending: false }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useClassSections() {
  const [data, setData] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<ClassSection>(supabase.from('class_sections').select('*').order('name', { ascending: true }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useAdmissions() {
  const [data, setData] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<AdmissionApplication>(supabase.from('admission_applications').select('*').order('created_at', { ascending: false }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useAllCoursesAdmin() {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<Course>(supabase.from('courses').select('*').order('code', { ascending: true }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useAllDepartments() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<Department>(supabase.from('departments').select('*').order('name', { ascending: true }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useAllFaculty() {
  const [data, setData] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<FacultyMember>(supabase.from('faculty').select('*').order('name', { ascending: true }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useAllStudentProfiles() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<any>(supabase.from('student_profiles').select('*').order('created_at', { ascending: false }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return { data, loading };
}

export function useFeeHeads() {
  const [data, setData] = useState<FeeHead[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<FeeHead>(supabase.from('fee_heads').select('*').order('sort_order', { ascending: true }));
      if (active) { setData(result); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  return { data, loading };
}

export function useFeeStructures() {
  const [data, setData] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<FeeStructure>(supabase.from('fee_structures').select('*, fee_head:fee_heads(name, code)').order('created_at', { ascending: false }));
      if (active) { setData(result as unknown as FeeStructure[]); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  return { data, loading };
}

export function useFeeChallans() {
  const [data, setData] = useState<FeeChallan[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<FeeChallan>(supabase.from('fee_challans').select('*').order('created_at', { ascending: false }));
      if (active) { setData(result); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  return { data, loading };
}

export function useFineConfigurations() {
  const [data, setData] = useState<FineConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeListQuery<FineConfiguration>(supabase.from('fine_configurations').select('*').order('created_at', { ascending: false }));
      if (active) { setData(result); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  return { data, loading };
}
