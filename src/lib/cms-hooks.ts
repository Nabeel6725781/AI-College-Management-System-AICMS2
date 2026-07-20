import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { Scholarship } from './supabase';
export type { Scholarship };

// ── CMS Types ──

export type CmsSettings = {
  id: string;
  college_name: string;
  tagline: string;
  college_logo_url: string | null;
  favicon_url: string | null;
  website_url: string | null;
  address: string;
  phone: string;
  email: string;
  footer_text: string;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  principal_name: string | null;
  principal_email: string | null;
  principal_phone: string | null;
  principal_message: string | null;
  registrar_name: string | null;
  registrar_email: string | null;
  registrar_phone: string | null;
  registrar_office: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  bank_branch: string | null;
  bank_ifsc: string | null;
  theme_primary: string | null;
  theme_accent: string | null;
  updated_at: string;
};

export type CmsHomepage = {
  id: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  stat_years: string;
  stat_students: string;
  stat_faculty: string;
  stat_programs: string;
  welcome_title: string;
  welcome_body: string;
  testimonial_quote: string;
  testimonial_author: string;
  testimonial_role: string;
  cta_title: string;
  cta_subtitle: string;
  updated_at: string;
};

export type CmsAbout = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  story_title: string;
  story_body1: string;
  story_body2: string;
  story_body3: string;
  mission_text: string;
  vision_text: string;
  stat_alumni: string;
  stat_research: string;
  stat_ratio: string;
  stat_placement: string;
  campus_title: string;
  campus_body: string;
  updated_at: string;
};

export type CmsAboutMilestone = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type CmsAboutValue = {
  id: string;
  icon: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type CmsAdmissions = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  stat_acceptance: string;
  stat_applications: string;
  stat_class: string;
  stat_aid: string;
  tuition: string;
  room_board: string;
  fees: string;
  total: string;
  aid_title: string;
  aid_description: string;
  updated_at: string;
};

export type CmsAdmissionsStep = {
  id: string;
  icon: string;
  title: string;
  description: string | null;
  deadline: string | null;
  sort_order: number;
};

export type CmsAdmissionsRequirement = {
  id: string;
  requirement: string;
  sort_order: number;
};

export type CmsAdmissionsDeadline = {
  id: string;
  type: string;
  date: string;
  description: string | null;
  sort_order: number;
};

export type CmsAdmissionsAid = {
  id: string;
  title: string;
  description: string | null;
  amount: string | null;
  sort_order: number;
};

export type CmsContact = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  address: string;
  phone: string;
  email: string;
  office_hours: string;
  updated_at: string;
};

export type CmsContactDepartment = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  sort_order: number;
};

export type CmsGalleryItem = {
  id: string;
  title: string | null;
  image_url: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
};

export type CmsSiteNotification = {
  id: string;
  title: string;
  message: string;
  type: string | null;
  link_text: string | null;
  link_url: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

// ── Default fallback values (match hardcoded frontend content) ──

const defaultSettings: CmsSettings = {
  id: '',
  college_name: 'Meridian University',
  tagline: 'Est. 1851',
  college_logo_url: null,
  favicon_url: null,
  website_url: null,
  address: '1851 University Avenue, Meridian, CA 90210',
  phone: '(555) 123-4567',
  email: 'admissions@meridian.edu',
  footer_text: 'Inspiring minds and shaping futures since 1851. A premier institution dedicated to academic excellence, groundbreaking research, and transformative education.',
  facebook_url: null,
  twitter_url: null,
  instagram_url: null,
  linkedin_url: null,
  youtube_url: null,
  principal_name: null,
  principal_email: null,
  principal_phone: null,
  principal_message: null,
  registrar_name: null,
  registrar_email: null,
  registrar_phone: null,
  registrar_office: null,
  bank_account_name: null,
  bank_account_number: null,
  bank_name: null,
  bank_branch: null,
  bank_ifsc: null,
  theme_primary: '#0f1118',
  theme_accent: '#c69035',
  updated_at: '',
};

const defaultHomepage: CmsHomepage = {
  id: '',
  hero_eyebrow: 'Welcome to Meridian University',
  hero_title: 'Inspiring Minds, Shaping Futures',
  hero_subtitle: 'Since 1851, Meridian University has been a beacon of academic excellence, groundbreaking research, and transformative education. Join a community where your potential knows no b[...]',
  hero_image_url: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1920',
  hero_cta_primary: 'Apply Now',
  hero_cta_secondary: 'Explore Meridian',
  stat_years: '175+',
  stat_students: '12,000+',
  stat_faculty: '600+',
  stat_programs: '80+',
  welcome_title: 'A community where intellectual curiosity meets boundless opportunity',
  welcome_body: 'At Meridian, we believe education is more than a degree — it\'s a transformation. Our students learn from world-renowned faculty, conduct research that changes the world, and g[...]',
  testimonial_quote: 'Meridian didn\'t just teach me what to think — it taught me how to think. The faculty pushed me to question assumptions, pursue bold ideas, and discover what I\'m truly ca[...]',
  testimonial_author: 'Dr. Sarah Lin',
  testimonial_role: 'Class of 2015 · Rhodes Scholar · CEO, NeuroLab',
  cta_title: 'Your future starts here.',
  cta_subtitle: 'Join the next generation of leaders, innovators, and changemakers. Applications for the Class of 2031 are now open.',
  updated_at: '',
};

const defaultAbout: CmsAbout = {
  id: '',
  hero_title: 'A legacy of learning since 1851',
  hero_subtitle: 'For over 175 years, Meridian University has been at the forefront of higher education, producing leaders, innovators, and thinkers who have shaped our world.',
  story_title: 'From a small college to a world-class institution',
  story_body1: 'Founded in 1851 as a small liberal arts college, Meridian University has grown into a world-class research institution while remaining true to its founding mission: to provide an [...]',
  story_body2: 'Our 175-year history is marked by pioneering achievements — from establishing one of the first computer science departments on the West Coast to launching a $50 million AI resea[...]',
  story_body3: 'Today, we serve over 12,000 students across six academic departments, with a global network of 80,000+ alumni leading in every field from science and technology to arts and public[...]',
  mission_text: 'To educate and empower students through rigorous scholarship, groundbreaking research, and a commitment to the public good. We strive to create knowledge that transforms lives an[...]',
  vision_text: 'To be a university where the boldest ideas are born, where students from all backgrounds discover their potential, and where research addresses humanity\'s greatest challenges. We[...]',
  stat_alumni: '80,000+',
  stat_research: '$200M',
  stat_ratio: '9:1',
  stat_placement: '94%',
  campus_title: 'A 200-acre living laboratory',
  campus_body: 'Our campus blends historic architecture with cutting-edge facilities. From the 1851 Founders Hall to the new AI Research Institute, every space is designed to inspire learning and[...]',
  updated_at: '',
};

const defaultAdmissions: CmsAdmissions = {
  id: '',
  hero_title: 'Begin your Meridian journey',
  hero_subtitle: 'We seek curious, driven, and compassionate students from all backgrounds. If you\'re ready to challenge yourself and change the world, we want you here.',
  stat_acceptance: '5.2%',
  stat_applications: '48,000+',
  stat_class: '2,547',
  stat_aid: '60%',
  tuition: '$58,200',
  room_board: '$16,800',
  fees: '$3,200',
  total: '$78,200',
  aid_title: 'We invest in you',
  aid_description: 'Over 60% of students receive financial aid. We\'re committed to making a Meridian education accessible to all admitted students, regardless of financial circumstances.',
  updated_at: '',
};

const defaultContact: CmsContact = {
  id: '',
  hero_title: 'We\'d love to hear from you',
  hero_subtitle: 'Whether you\'re a prospective student, a current member of our community, or just curious about Meridian, our team is here to help.',
  address: '1851 University Avenue\nMeridian, CA 90210',
  phone: '(555) 123-4567',
  email: 'admissions@meridian.edu',
  office_hours: 'Mon–Fri, 8:00 AM – 6:00 PM PST',
  updated_at: '',
};

// ── Singleton hooks (one row per table) ──

// ── Shared CMS settings store ──
// A single cached record + listeners so that a save in the admin panel can
// refresh every mounted consumer (Navbar, Footer, layouts, public pages) at
// once without each one re-fetching independently.

type SettingsState = {
  data: CmsSettings;
  loading: boolean;
  error: string | null;
  version: number; // bumped on every successful refresh
};

let settingsCache: SettingsState = {
  data: defaultSettings,
  loading: true,
  error: null,
  version: 0,
};

const settingsListeners = new Set<(s: SettingsState) => void>();

function emitSettings() {
  for (const fn of settingsListeners) fn(settingsCache);
}

async function fetchSettings(): Promise<void> {
  const { data, error } = await supabase.from('cms_settings').select('*').maybeSingle();
  settingsCache = {
    data: data ? (data as CmsSettings) : defaultSettings,
    loading: false,
    error: error ? error.message : null,
    version: settingsCache.version + 1,
  };
  emitSettings();
}

// Kick off the initial fetch once on module load.
let initialFetchStarted = false;
function ensureInitialFetch() {
  if (initialFetchStarted) return;
  initialFetchStarted = true;
  fetchSettings();
}

export function useCmsSettings() {
  const [state, setState] = useState<SettingsState>(settingsCache);

  useEffect(() => {
    ensureInitialFetch();
    settingsListeners.add(setState);
    setState(settingsCache); // sync to latest in case it changed before subscribe
    return () => { settingsListeners.delete(setState); };
  }, []);

  const refresh = useCallback(() => { fetchSettings(); }, []);

  return { data: state.data, loading: state.loading, error: state.error, refresh };
}

export function useThemeSettings() {
  const { data } = useCmsSettings();
  useEffect(() => {
    const primary = data.theme_primary || '#0f1118';
    const accent = data.theme_accent || '#c69035';
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', primary);
    root.style.setProperty('--theme-accent', accent);

    if (data.favicon_url) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = data.favicon_url;
    }

    if (data.college_name) {
      document.title = `${data.college_name} — ${data.tagline || ''}`.trim();
    }
  }, [data.theme_primary, data.theme_accent, data.favicon_url, data.college_name, data.tagline]);
}

export function useCmsHomepage() {
  const [data, setData] = useState<CmsHomepage>(defaultHomepage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('cms_homepage').select('*').maybeSingle();
      if (error) { setError(error.message); }
      else if (data) { setData(data as CmsHomepage); }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}

export function useCmsAbout() {
  const [data, setData] = useState<CmsAbout>(defaultAbout);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('cms_about').select('*').maybeSingle();
      if (error) { setError(error.message); }
      else if (data) { setData(data as CmsAbout); }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}

export function useCmsAdmissions() {
  const [data, setData] = useState<CmsAdmissions>(defaultAdmissions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('cms_admissions').select('*').maybeSingle();
      if (error) { setError(error.message); }
      else if (data) { setData(data as CmsAdmissions); }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}

export function useCmsContact() {
  const [data, setData] = useState<CmsContact>(defaultContact);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('cms_contact').select('*').maybeSingle();
      if (error) { setError(error.message); }
      else if (data) { setData(data as CmsContact); }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}

// ── List hooks ──

export function useCmsAboutMilestones() {
  const [data, setData] = useState<CmsAboutMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cms_about_milestones').select('*').order('sort_order', { ascending: true });
      setData((data as CmsAboutMilestone[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useCmsAboutValues() {
  const [data, setData] = useState<CmsAboutValue[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cms_about_values').select('*').order('sort_order', { ascending: true });
      setData((data as CmsAboutValue[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useCmsAdmissionsSteps() {
  const [data, setData] = useState<CmsAdmissionsStep[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cms_admissions_steps').select('*').order('sort_order', { ascending: true });
      setData((data as CmsAdmissionsStep[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useCmsAdmissionsRequirements() {
  const [data, setData] = useState<CmsAdmissionsRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cms_admissions_requirements').select('*').order('sort_order', { ascending: true });
      setData((data as CmsAdmissionsRequirement[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useCmsAdmissionsDeadlines() {
  const [data, setData] = useState<CmsAdmissionsDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cms_admissions_deadlines').select('*').order('sort_order', { ascending: true });
      setData((data as CmsAdmissionsDeadline[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useCmsAdmissionsAid() {
  const [data, setData] = useState<CmsAdmissionsAid[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cms_admissions_aid').select('*').order('sort_order', { ascending: true });
      setData((data as CmsAdmissionsAid[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useCmsContactDepartments() {
  const [data, setData] = useState<CmsContactDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cms_contact_departments').select('*').order('sort_order', { ascending: true });
      setData((data as CmsContactDepartment[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useCmsGallery() {
  const [data, setData] = useState<CmsGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('cms_gallery').select('*').eq('is_active', true).order('sort_order', { ascending: true });
      setData((data as CmsGalleryItem[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useCmsSiteNotifications() {
  const [data, setData] = useState<CmsSiteNotification[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('cms_site_notifications')
        .select('*')
        .eq('is_active', true)
        .and(`or(starts_at.is.null,starts_at.lte.${now}),or(ends_at.is.null,ends_at.gte.${now})`)
        .order('created_at', { ascending: false });
      setData((data as CmsSiteNotification[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useScholarships() {
  const [data, setData] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('scholarships').select('*').order('created_at', { ascending: false });
      setData((data as Scholarship[]) ?? []);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

// ── Mutation helpers (for admin CMS pages) ──

export function useCmsMutation<T extends Record<string, unknown>>(table: string) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const save = useCallback(async (payload: T, id?: string) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const { data, error } = id
      ? await supabase.from(table).update(payload).eq('id', id).select().single()
      : await supabase.from(table).insert(payload).select().single();
    if (error) { setError(error.message); }
    else { setSuccess(true); }
    setSaving(false);
    return data as T | null;
  }, [table]);

  const remove = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { setError(error.message); }
    setSaving(false);
    return !error;
  }, [table]);

  return { save, remove, saving, error, success, setSuccess, setError };
}
