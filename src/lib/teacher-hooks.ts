import { useEffect, useState } from 'react';
import { supabase } from './supabase';

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
import type {
  TeacherProfile,
  TeacherNotification,
  Message,
  TeacherTimetableSlot,
  TeacherAssignment,
  Mark,
  Course,
} from './supabase';

export function useTeacherProfile(userId: string | undefined) {
  const [data, setData] = useState<TeacherProfile | null>(null);
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
      const result = await safeQuerySingle<TeacherProfile>(supabase.from('teacher_profiles').select('*').eq('id', userId).maybeSingle());
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

export function useTeacherNotifications(userId: string | undefined) {
  const [data, setData] = useState<TeacherNotification[]>([]);
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
      const result = await safeQueryList<TeacherNotification>(supabase.from('teacher_notifications').select('*').eq('teacher_id', userId).order('created_at', { ascending: false }));
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

export function useMessages(userId: string | undefined) {
  const [data, setData] = useState<Message[]>([]);
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
      const result = await safeQueryList<Message>(supabase.from('messages').select('*').or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).order('created_at', { ascending: false }));
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

export function useTeacherTimetable(userId: string | undefined) {
  const [data, setData] = useState<TeacherTimetableSlot[]>([]);
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
      const result = await safeQueryList<TeacherTimetableSlot>(supabase.from('teacher_timetable_slots').select('*').eq('teacher_id', userId).order('day_of_week', { ascending: true }));
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

export function useTeacherAssignments(userId: string | undefined) {
  const [data, setData] = useState<TeacherAssignment[]>([]);
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
      const result = await safeQueryList<TeacherAssignment>(supabase.from('teacher_assignments').select('*').eq('teacher_id', userId).order('due_date', { ascending: true }));
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

export function useMarks(userId: string | undefined) {
  const [data, setData] = useState<Mark[]>([]);
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
      const result = await safeQueryList<Mark>(supabase.from('marks').select('*').eq('teacher_id', userId).order('created_at', { ascending: false }));
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

export function useAllCourses() {
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
