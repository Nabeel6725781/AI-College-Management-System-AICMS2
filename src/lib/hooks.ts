import { useEffect, useState } from 'react';
import { supabase, type Department, type Program, type FacultyMember, type NewsArticle, type Faq } from './supabase';

const fallbackDepartments: Department[] = [
  {
    id: 'dept-computer-science',
    name: 'Computer Science',
    description: 'Explores software engineering, AI, and computational problem solving.',
    icon: 'Cpu',
    image_url: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800',
    established_year: 1965,
    sort_order: 1,
  },
  {
    id: 'dept-biology',
    name: 'Biology',
    description: 'Advances research in genetics, ecology, and life sciences.',
    icon: 'Dna',
    image_url: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
    established_year: 1851,
    sort_order: 2,
  },
  {
    id: 'dept-business',
    name: 'Business',
    description: 'Prepares leaders for innovation, finance, and entrepreneurship.',
    icon: 'Briefcase',
    image_url: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
    established_year: 1920,
    sort_order: 3,
  },
];

const fallbackPrograms: Program[] = [
  {
    id: 'prog-cs',
    name: 'Computer Science',
    degree_type: 'Bachelor of Science',
    department_id: 'dept-computer-science',
    duration: '4 years',
    description: 'Build modern software, AI systems, and scalable applications.',
    image_url: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['AI Lab', 'Cloud Computing', 'Research Opportunities'],
    sort_order: 1,
  },
  {
    id: 'prog-bio',
    name: 'Biology',
    degree_type: 'Bachelor of Science',
    department_id: 'dept-biology',
    duration: '4 years',
    description: 'Study living systems through labs, field work, and research.',
    image_url: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Genomics', 'Fieldwork', 'Lab Methods'],
    sort_order: 2,
  },
  {
    id: 'prog-business',
    name: 'Business Administration',
    degree_type: 'Bachelor of Arts',
    department_id: 'dept-business',
    duration: '4 years',
    description: 'Develop strategic thinking and leadership for modern enterprises.',
    image_url: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Leadership', 'Finance', 'Entrepreneurship'],
    sort_order: 3,
  },
];

const fallbackFaculty: FacultyMember[] = [
  {
    id: 'faculty-1',
    name: 'Dr. Sarah Chen',
    title: 'Professor of Computer Science',
    department_id: 'dept-computer-science',
    bio: 'Researches artificial intelligence and human-centered computing.',
    image_url: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=600',
    email: 'schen@meridian.edu',
    research_areas: ['AI', 'Human-Computer Interaction'],
    sort_order: 1,
  },
  {
    id: 'faculty-2',
    name: 'Dr. Amelia Ortiz',
    title: 'Associate Professor of Biology',
    department_id: 'dept-biology',
    bio: 'Leads research in ecological systems and conservation biology.',
    image_url: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=600',
    email: 'aortiz@meridian.edu',
    research_areas: ['Ecology', 'Conservation'],
    sort_order: 2,
  },
];

const fallbackNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Meridian launches new AI research center',
    excerpt: 'The university unveiled a new institute focused on responsible AI innovation.',
    content: 'The new institute brings together faculty, industry partners, and students to advance ethical AI research.',
    image_url: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Research',
    author: 'Meridian Communications',
    published_at: '2026-07-15T10:00:00.000Z',
    is_featured: true,
    sort_order: 1,
  },
  {
    id: 'news-2',
    title: 'Students showcase community impact projects',
    excerpt: 'Undergraduate teams presented solutions for local and global challenges.',
    content: 'The showcase highlighted projects connecting academic learning with community service.',
    image_url: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Campus',
    author: 'Student Affairs',
    published_at: '2026-07-10T10:00:00.000Z',
    is_featured: false,
    sort_order: 2,
  },
];

const fallbackFaqs: Faq[] = [
  {
    id: 'faq-1',
    question: 'How do I apply to Meridian University?',
    answer: 'You can start your application through the admissions page and submit required documents.',
    category: 'Admissions',
    sort_order: 1,
  },
  {
    id: 'faq-2',
    question: 'What programs are available?',
    answer: 'Meridian offers programs in computer science, biology, business, and more.',
    category: 'Academics',
    sort_order: 2,
  },
];

function isSupabaseAvailable() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function useDepartments() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isSupabaseAvailable()) {
        setData(fallbackDepartments);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) {
        setError(error.message);
        setData(fallbackDepartments);
      } else {
        setData((data as Department[])?.length ? data as Department[] : fallbackDepartments);
      }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}

export function usePrograms() {
  const [data, setData] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isSupabaseAvailable()) {
        setData(fallbackPrograms);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) {
        setError(error.message);
        setData(fallbackPrograms);
      } else {
        setData((data as Program[])?.length ? data as Program[] : fallbackPrograms);
      }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}

export function useFaculty() {
  const [data, setData] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isSupabaseAvailable()) {
        setData(fallbackFaculty);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) {
        setError(error.message);
        setData(fallbackFaculty);
      } else {
        setData((data as FacultyMember[])?.length ? data as FacultyMember[] : fallbackFaculty);
      }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}

export function useNews() {
  const [data, setData] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isSupabaseAvailable()) {
        setData(fallbackNews);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) {
        setError(error.message);
        setData(fallbackNews);
      } else {
        setData((data as NewsArticle[])?.length ? data as NewsArticle[] : fallbackNews);
      }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}

export function useNewsArticle(id: string | null) {
  const [data, setData] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      if (!isSupabaseAvailable()) {
        setData(fallbackNews.find((item) => item.id === id) ?? fallbackNews[0] ?? null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        setError(error.message);
        setData(fallbackNews.find((item) => item.id === id) ?? fallbackNews[0] ?? null);
      } else {
        setData((data as NewsArticle) ?? fallbackNews.find((item) => item.id === id) ?? fallbackNews[0] ?? null);
      }
      setLoading(false);
    })();
  }, [id]);

  return { data, loading, error };
}

export function useFaqs() {
  const [data, setData] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isSupabaseAvailable()) {
        setData(fallbackFaqs);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) {
        setError(error.message);
        setData(fallbackFaqs);
      } else {
        setData((data as Faq[])?.length ? data as Faq[] : fallbackFaqs);
      }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}
