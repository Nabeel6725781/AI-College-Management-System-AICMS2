import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type {
  StudentProfile,
  Course,
  Enrollment,
  AttendanceRecord,
  ResultRecord,
  FeeChallan as PortalFeeChallan,
  TimetableSlot,
  Assignment,
  DocumentRecord,
  NotificationRecord,
  AdmissionApplication,
  SupportTicket,
  ChatbotMessage,
} from './supabase';

async function safeQueryList<T>(request: PromiseLike<{ data: T[] | null; error?: { message?: string } | null }>, fallback: T[] = []): Promise<T[]> {
  try {
    const { data, error } = await request;
    if (error) {
      console.error(error);
      return fallback;
    }
    return (data ?? fallback) as T[];
  } catch (err) {
    console.error(err);
    return fallback;
  }
}

async function safeQuerySingle<T>(request: PromiseLike<{ data: T | null; error?: { message?: string } | null }>, fallback: T | null = null): Promise<T | null> {
  try {
    const { data, error } = await request;
    if (error) {
      console.error(error);
      return fallback;
    }
    return (data ?? fallback) as T | null;
  } catch (err) {
    console.error(err);
    return fallback;
  }
}

function useSupabaseQuery<T>(
  table: string,
  userId: string | undefined,
  orderCol: string,
  ascending: boolean = true
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    (async () => {
      const result = await safeQueryList<T>(supabase.from(table).select('*').eq('student_id', userId).order(orderCol, { ascending }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [table, userId, orderCol, ascending]);

  return { data, loading, error };
}

export function useStudentProfile(userId: string | undefined) {
  const [data, setData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    (async () => {
      const result = await safeQuerySingle<StudentProfile>(supabase.from('student_profiles').select('*').eq('id', userId).maybeSingle());
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  return { data, loading, setProfile: setData };
}

export function useCourses() {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await safeQueryList<Course>(supabase.from('courses').select('*').order('code', { ascending: true }));
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

export function useEnrollments(userId: string | undefined) {
  const [data, setData] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    (async () => {
      const result = await safeQueryList<Enrollment>(supabase.from('enrollments').select('*, course:courses(*)').eq('student_id', userId).order('enrolled_at', { ascending: false }));
      if (active) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  return { data, loading };
}

export function useAttendance(userId: string | undefined) {
  return useSupabaseQuery<AttendanceRecord>('attendance', userId, 'date', false);
}

export function useResults(userId: string | undefined) {
  return useSupabaseQuery<ResultRecord>('results', userId, 'created_at', false);
}

export function useFees(userId: string | undefined) {
  return useSupabaseQuery<PortalFeeChallan>('fees', userId, 'due_date', true);
}

export function useTimetable(userId: string | undefined) {
  return useSupabaseQuery<TimetableSlot>('timetable_slots', userId, 'day_of_week', true);
}

export function useAssignments(userId: string | undefined) {
  return useSupabaseQuery<Assignment>('assignments', userId, 'due_date', true);
}

export function useDocuments(userId: string | undefined) {
  return useSupabaseQuery<DocumentRecord>('documents', userId, 'created_at', false);
}

export function useNotifications(userId: string | undefined) {
  return useSupabaseQuery<NotificationRecord>('notifications', userId, 'created_at', false);
}

export function useAdmissionApplications(userId: string | undefined) {
  return useSupabaseQuery<AdmissionApplication>('admission_applications', userId, 'updated_at', false);
}

export function useSupportTickets(userId: string | undefined) {
  return useSupabaseQuery<SupportTicket>('support_tickets', userId, 'created_at', false);
}

export function useChatbotMessages(userId: string | undefined) {
  return useSupabaseQuery<ChatbotMessage>('chatbot_messages', userId, 'created_at', true);
}
