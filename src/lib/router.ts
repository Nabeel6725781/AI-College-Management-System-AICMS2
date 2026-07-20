import { useEffect, useState, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'admissions' }
  | { name: 'programs' }
  | { name: 'departments' }
  | { name: 'faculty' }
  | { name: 'contact' }
  | { name: 'news' }
  | { name: 'faq' }
  | { name: 'gallery' }
  | { name: 'chatbot' }
  | { name: 'news-article'; id: string }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'forgot-password' }
  | { name: 'portal-dashboard' }
  | { name: 'portal-profile' }
  | { name: 'portal-admission' }
  | { name: 'portal-courses' }
  | { name: 'portal-attendance' }
  | { name: 'portal-results' }
  | { name: 'portal-fees' }
  | { name: 'portal-timetable' }
  | { name: 'portal-assignments' }
  | { name: 'portal-documents' }
  | { name: 'portal-ocr' }
  | { name: 'portal-notifications' }
  | { name: 'portal-chatbot' }
  | { name: 'portal-settings' }
  | { name: 'portal-support' }
  | { name: 'teacher-login' }
  | { name: 'teacher-dashboard' }
  | { name: 'teacher-classes' }
  | { name: 'teacher-students' }
  | { name: 'teacher-attendance' }
  | { name: 'teacher-marks' }
  | { name: 'teacher-assignments' }
  | { name: 'teacher-timetable' }
  | { name: 'teacher-messages' }
  | { name: 'teacher-reports' }
  | { name: 'teacher-profile' }
  | { name: 'teacher-settings' }
  | { name: 'teacher-notifications' }
  | { name: 'admin-login' }
  | { name: 'admin-dashboard' }
  | { name: 'admin-students' }
  | { name: 'admin-teachers' }
  | { name: 'admin-employees' }
  | { name: 'admin-admissions' }
  | { name: 'admin-courses' }
  | { name: 'admin-departments' }
  | { name: 'admin-subjects' }
  | { name: 'admin-classes' }
  | { name: 'admin-fees' }
  | { name: 'admin-scholarships' }
  | { name: 'admin-library' }
  | { name: 'admin-documents' }
  | { name: 'admin-ocr' }
  | { name: 'admin-analytics' }
  | { name: 'admin-reports' }
  | { name: 'admin-notifications' }
  | { name: 'admin-audit' }
  | { name: 'admin-roles' }
  | { name: 'admin-settings' }
  | { name: 'admin-cms-settings' }
  | { name: 'admin-cms-homepage' }
  | { name: 'admin-cms-about' }
  | { name: 'admin-cms-admissions' }
  | { name: 'admin-cms-contact' }
  | { name: 'admin-cms-gallery' }
  | { name: 'admin-cms-notifications' }
  | { name: 'admin-cms-news' }
  | { name: 'admin-cms-faq' }
  | { name: 'admin-cms-programs' }
  | { name: 'admin-cms-departments' }
  | { name: 'admin-cms-faculty' }
  | { name: 'admin-cms-scholarships' }
  | { name: 'principal-login' }
  | { name: 'principal-dashboard' }
  | { name: 'principal-kpis' }
  | { name: 'principal-analytics' }
  | { name: 'principal-ai-insights' }
  | { name: 'principal-admissions' }
  | { name: 'principal-student-performance' }
  | { name: 'principal-teacher-performance' }
  | { name: 'principal-revenue' }
  | { name: 'principal-attendance' }
  | { name: 'principal-reports' }
  | { name: 'principal-recommendations' }
  | { name: 'ai-dashboard' }
  | { name: 'ai-scanner' }
  | { name: 'ai-computer-vision' }
  | { name: 'ai-certificate' }
  | { name: 'ai-duplicate' }
  | { name: 'ai-admission' }
  | { name: 'ai-performance-prediction' }
  | { name: 'ai-result-prediction' }
  | { name: 'ai-attendance-prediction' }
  | { name: 'ai-chatbot' }
  | { name: 'ai-smart-search' }
  | { name: 'ai-reports' };

const routeMap: Record<string, (parts: string[]) => Route> = {
  '': () => ({ name: 'home' }),
  about: () => ({ name: 'about' }),
  admissions: () => ({ name: 'admissions' }),
  programs: () => ({ name: 'programs' }),
  departments: () => ({ name: 'departments' }),
  faculty: () => ({ name: 'faculty' }),
  contact: () => ({ name: 'contact' }),
  chatbot: () => ({ name: 'chatbot' }),
  news: (parts) => {
    if (parts[1]) return { name: 'news-article', id: parts[1] };
    return { name: 'news' };
  },
  faq: () => ({ name: 'faq' }),
  gallery: () => ({ name: 'gallery' }),
  login: () => ({ name: 'login' }),
  register: () => ({ name: 'register' }),
  'forgot-password': () => ({ name: 'forgot-password' }),
  'portal/dashboard': () => ({ name: 'portal-dashboard' }),
  'portal/profile': () => ({ name: 'portal-profile' }),
  'portal/admission': () => ({ name: 'portal-admission' }),
  'portal/courses': () => ({ name: 'portal-courses' }),
  'portal/attendance': () => ({ name: 'portal-attendance' }),
  'portal/results': () => ({ name: 'portal-results' }),
  'portal/fees': () => ({ name: 'portal-fees' }),
  'portal/timetable': () => ({ name: 'portal-timetable' }),
  'portal/assignments': () => ({ name: 'portal-assignments' }),
  'portal/documents': () => ({ name: 'portal-documents' }),
  'portal/ocr': () => ({ name: 'portal-ocr' }),
  'portal/notifications': () => ({ name: 'portal-notifications' }),
  'portal/chatbot': () => ({ name: 'portal-chatbot' }),
  'portal/settings': () => ({ name: 'portal-settings' }),
  'portal/support': () => ({ name: 'portal-support' }),
  'teacher/login': () => ({ name: 'teacher-login' }),
  'teacher/dashboard': () => ({ name: 'teacher-dashboard' }),
  'teacher/classes': () => ({ name: 'teacher-classes' }),
  'teacher/students': () => ({ name: 'teacher-students' }),
  'teacher/attendance': () => ({ name: 'teacher-attendance' }),
  'teacher/marks': () => ({ name: 'teacher-marks' }),
  'teacher/assignments': () => ({ name: 'teacher-assignments' }),
  'teacher/timetable': () => ({ name: 'teacher-timetable' }),
  'teacher/messages': () => ({ name: 'teacher-messages' }),
  'teacher/reports': () => ({ name: 'teacher-reports' }),
  'teacher/profile': () => ({ name: 'teacher-profile' }),
  'teacher/settings': () => ({ name: 'teacher-settings' }),
  'teacher/notifications': () => ({ name: 'teacher-notifications' }),
  'admin/login': () => ({ name: 'admin-login' }),
  'admin/dashboard': () => ({ name: 'admin-dashboard' }),
  'admin/students': () => ({ name: 'admin-students' }),
  'admin/teachers': () => ({ name: 'admin-teachers' }),
  'admin/employees': () => ({ name: 'admin-employees' }),
  'admin/admissions': () => ({ name: 'admin-admissions' }),
  'admin/courses': () => ({ name: 'admin-courses' }),
  'admin/departments': () => ({ name: 'admin-departments' }),
  'admin/subjects': () => ({ name: 'admin-subjects' }),
  'admin/classes': () => ({ name: 'admin-classes' }),
  'admin/fees': () => ({ name: 'admin-fees' }),
  'admin/scholarships': () => ({ name: 'admin-scholarships' }),
  'admin/library': () => ({ name: 'admin-library' }),
  'admin/documents': () => ({ name: 'admin-documents' }),
  'admin/ocr': () => ({ name: 'admin-ocr' }),
  'admin/analytics': () => ({ name: 'admin-analytics' }),
  'admin/reports': () => ({ name: 'admin-reports' }),
  'admin/notifications': () => ({ name: 'admin-notifications' }),
  'admin/audit': () => ({ name: 'admin-audit' }),
  'admin/roles': () => ({ name: 'admin-roles' }),
  'admin/settings': () => ({ name: 'admin-settings' }),
  'admin/cms-settings': () => ({ name: 'admin-cms-settings' }),
  'admin/cms-homepage': () => ({ name: 'admin-cms-homepage' }),
  'admin/cms-about': () => ({ name: 'admin-cms-about' }),
  'admin/cms-admissions': () => ({ name: 'admin-cms-admissions' }),
  'admin/cms-contact': () => ({ name: 'admin-cms-contact' }),
  'admin/cms-gallery': () => ({ name: 'admin-cms-gallery' }),
  'admin/cms-notifications': () => ({ name: 'admin-cms-notifications' }),
  'admin/cms-news': () => ({ name: 'admin-cms-news' }),
  'admin/cms-faq': () => ({ name: 'admin-cms-faq' }),
  'admin/cms-programs': () => ({ name: 'admin-cms-programs' }),
  'admin/cms-departments': () => ({ name: 'admin-cms-departments' }),
  'admin/cms-faculty': () => ({ name: 'admin-cms-faculty' }),
  'admin/cms-scholarships': () => ({ name: 'admin-cms-scholarships' }),
  'principal/login': () => ({ name: 'principal-login' }),
  'principal/dashboard': () => ({ name: 'principal-dashboard' }),
  'principal/kpis': () => ({ name: 'principal-kpis' }),
  'principal/analytics': () => ({ name: 'principal-analytics' }),
  'principal/ai-insights': () => ({ name: 'principal-ai-insights' }),
  'principal/admissions': () => ({ name: 'principal-admissions' }),
  'principal/student-performance': () => ({ name: 'principal-student-performance' }),
  'principal/teacher-performance': () => ({ name: 'principal-teacher-performance' }),
  'principal/revenue': () => ({ name: 'principal-revenue' }),
  'principal/attendance': () => ({ name: 'principal-attendance' }),
  'principal/reports': () => ({ name: 'principal-reports' }),
  'principal/recommendations': () => ({ name: 'principal-recommendations' }),
  'ai/dashboard': () => ({ name: 'ai-dashboard' }),
  'ai/scanner': () => ({ name: 'ai-scanner' }),
  'ai/computer-vision': () => ({ name: 'ai-computer-vision' }),
  'ai/certificate': () => ({ name: 'ai-certificate' }),
  'ai/duplicate': () => ({ name: 'ai-duplicate' }),
  'ai/admission': () => ({ name: 'ai-admission' }),
  'ai/performance-prediction': () => ({ name: 'ai-performance-prediction' }),
  'ai/result-prediction': () => ({ name: 'ai-result-prediction' }),
  'ai/attendance-prediction': () => ({ name: 'ai-attendance-prediction' }),
  'ai/chatbot': () => ({ name: 'ai-chatbot' }),
  'ai/smart-search': () => ({ name: 'ai-smart-search' }),
  'ai/reports': () => ({ name: 'ai-reports' }),
};

export function parseRoute(path: string): Route {
  const clean = path.replace(/^#\/?/, '').replace(/\/$/, '');
  const parts = clean.split('/');
  const key = parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0] || '';
  const singleKey = parts[0] || '';
  const parser = routeMap[key] || routeMap[singleKey];
  if (parser) return parser(parts);
  return { name: 'home' };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
}

export function navigateTo(path: string) {
  window.location.hash = path;
}
