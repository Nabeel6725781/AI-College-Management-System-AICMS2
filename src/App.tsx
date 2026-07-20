import { useEffect } from 'react';
import { useRouter } from './lib/router';
import { useAuth } from './lib/auth';
import { useThemeSettings } from './lib/cms-hooks';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SiteBanner from './components/SiteBanner';
import PortalLayout from './components/PortalLayout';
import TeacherLayout from './components/TeacherLayout';
import AdminLayout from './components/AdminLayout';
import PrincipalLayout from './components/PrincipalLayout';
import AiLayout from './components/AiLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AdmissionsPage from './pages/AdmissionsPage';
import ProgramsPage from './pages/ProgramsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import FacultyPage from './pages/FacultyPage';
import ContactPage from './pages/ContactPage';
import { NewsPage, NewsArticlePage } from './pages/NewsPage';
import FaqPage from './pages/FaqPage';
import GalleryPage from './pages/GalleryPage';
import LoginPage from './pages/portal/LoginPage';
import RegisterPage from './pages/portal/RegisterPage';
import ForgotPasswordPage from './pages/portal/ForgotPasswordPage';
import DashboardPage from './pages/portal/DashboardPage';
import ProfilePage from './pages/portal/ProfilePage';
import AdmissionFormPage from './pages/portal/AdmissionFormPage';
import MyCoursesPage from './pages/portal/MyCoursesPage';
import AttendancePage from './pages/portal/AttendancePage';
import ResultsPage from './pages/portal/ResultsPage';
import FeeChallanPage from './pages/portal/FeeChallanPage';
import TimetablePage from './pages/portal/TimetablePage';
import AssignmentsPage from './pages/portal/AssignmentsPage';
import DocumentUploadPage from './pages/portal/DocumentUploadPage';
import OcrVerificationPage from './pages/portal/OcrVerificationPage';
import NotificationsPage from './pages/portal/NotificationsPage';
import ChatbotPage from './pages/portal/ChatbotPage';
import SettingsPage from './pages/portal/SettingsPage';
import HelpSupportPage from './pages/portal/HelpSupportPage';
import TeacherLoginPage from './pages/teacher/TeacherLoginPage';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherClassesPage from './pages/teacher/TeacherClassesPage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherAttendancePage from './pages/teacher/TeacherAttendancePage';
import TeacherMarksPage from './pages/teacher/TeacherMarksPage';
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage';
import TeacherTimetablePage from './pages/teacher/TeacherTimetablePage';
import TeacherMessagesPage from './pages/teacher/TeacherMessagesPage';
import TeacherReportsPage from './pages/teacher/TeacherReportsPage';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';
import TeacherSettingsPage from './pages/teacher/TeacherSettingsPage';
import TeacherNotificationsPage from './pages/teacher/TeacherNotificationsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminTeachersPage from './pages/admin/AdminTeachersPage';
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage';
import AdminAdmissionsPage from './pages/admin/AdminAdmissionsPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminSubjectsPage from './pages/admin/AdminSubjectsPage';
import AdminClassesPage from './pages/admin/AdminClassesPage';
import AdminFeesPage from './pages/admin/AdminFeesPage';
import AdminScholarshipsPage from './pages/admin/AdminScholarshipsPage';
import AdminLibraryPage from './pages/admin/AdminLibraryPage';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
import AdminOcrPage from './pages/admin/AdminOcrPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminCmsSettingsPage from './pages/admin/AdminCmsSettingsPage';
import AdminCmsHomepagePage from './pages/admin/AdminCmsHomepagePage';
import AdminCmsAboutPage from './pages/admin/AdminCmsAboutPage';
import AdminCmsAdmissionsPage from './pages/admin/AdminCmsAdmissionsPage';
import AdminCmsContactPage from './pages/admin/AdminCmsContactPage';
import AdminCmsGalleryPage from './pages/admin/AdminCmsGalleryPage';
import AdminCmsNotificationsPage from './pages/admin/AdminCmsNotificationsPage';
import AdminCmsNewsPage from './pages/admin/AdminCmsNewsPage';
import AdminCmsFaqPage from './pages/admin/AdminCmsFaqPage';
import AdminCmsProgramsPage from './pages/admin/AdminCmsProgramsPage';
import AdminCmsDepartmentsPage from './pages/admin/AdminCmsDepartmentsPage';
import AdminCmsFacultyPage from './pages/admin/AdminCmsFacultyPage';
import AdminCmsScholarshipsPage from './pages/admin/AdminCmsScholarshipsPage';
import PrincipalLoginPage from './pages/principal/PrincipalLoginPage';
import PrincipalDashboardPage from './pages/principal/PrincipalDashboardPage';
import PrincipalKpisPage from './pages/principal/PrincipalKpisPage';
import PrincipalAnalyticsPage from './pages/principal/PrincipalAnalyticsPage';
import PrincipalAiInsightsPage from './pages/principal/PrincipalAiInsightsPage';
import PrincipalAdmissionsPage from './pages/principal/PrincipalAdmissionsPage';
import PrincipalStudentPerformancePage from './pages/principal/PrincipalStudentPerformancePage';
import PrincipalTeacherPerformancePage from './pages/principal/PrincipalTeacherPerformancePage';
import PrincipalRevenuePage from './pages/principal/PrincipalRevenuePage';
import PrincipalAttendancePage from './pages/principal/PrincipalAttendancePage';
import PrincipalReportsPage from './pages/principal/PrincipalReportsPage';
import PrincipalRecommendationsPage from './pages/principal/PrincipalRecommendationsPage';
import AiDashboardPage from './pages/ai/AiDashboardPage';
import AiScannerPage from './pages/ai/AiScannerPage';
import AiComputerVisionPage from './pages/ai/AiComputerVisionPage';
import AiCertificatePage from './pages/ai/AiCertificatePage';
import AiDuplicatePage from './pages/ai/AiDuplicatePage';
import AiAdmissionPage from './pages/ai/AiAdmissionPage';
import AiPerformancePredictionPage from './pages/ai/AiPerformancePredictionPage';
import AiResultPredictionPage from './pages/ai/AiResultPredictionPage';
import AiAttendancePredictionPage from './pages/ai/AiAttendancePredictionPage';
import AiChatbotPage from './pages/ai/AiChatbotPage';
import AiSmartSearchPage from './pages/ai/AiSmartSearchPage';
import AiReportsPage from './pages/ai/AiReportsPage';

const portalRoutes = new Set([
  'portal-dashboard', 'portal-profile', 'portal-admission', 'portal-courses',
  'portal-attendance', 'portal-results', 'portal-fees', 'portal-timetable',
  'portal-assignments', 'portal-documents', 'portal-ocr', 'portal-notifications',
  'portal-chatbot', 'portal-settings', 'portal-support',
]);

const authRoutes = new Set(['login', 'register', 'forgot-password', 'teacher-login', 'admin-login', 'principal-login']);

const teacherRoutes = new Set([
  'teacher-dashboard', 'teacher-classes', 'teacher-students', 'teacher-attendance',
  'teacher-marks', 'teacher-assignments', 'teacher-timetable', 'teacher-messages',
  'teacher-reports', 'teacher-profile', 'teacher-settings', 'teacher-notifications',
]);

const adminRoutes = new Set([
  'admin-dashboard', 'admin-students', 'admin-teachers', 'admin-employees',
  'admin-admissions', 'admin-courses', 'admin-departments', 'admin-subjects',
  'admin-classes', 'admin-fees', 'admin-scholarships', 'admin-library',
  'admin-documents', 'admin-ocr', 'admin-analytics', 'admin-reports',
  'admin-notifications', 'admin-audit', 'admin-roles', 'admin-settings',
  'admin-cms-settings', 'admin-cms-homepage', 'admin-cms-about', 'admin-cms-admissions',
  'admin-cms-contact', 'admin-cms-gallery', 'admin-cms-notifications', 'admin-cms-news',
  'admin-cms-faq', 'admin-cms-programs', 'admin-cms-departments', 'admin-cms-faculty',
  'admin-cms-scholarships',
]);

const principalRoutes = new Set([
  'principal-dashboard', 'principal-kpis', 'principal-analytics',
  'principal-ai-insights', 'principal-admissions', 'principal-student-performance',
  'principal-teacher-performance', 'principal-revenue', 'principal-attendance',
  'principal-reports', 'principal-recommendations',
]);

const aiRoutes = new Set([
  'ai-dashboard', 'ai-scanner', 'ai-computer-vision', 'ai-certificate',
  'ai-duplicate', 'ai-admission', 'ai-performance-prediction',
  'ai-result-prediction', 'ai-attendance-prediction', 'ai-chatbot',
  'ai-smart-search', 'ai-reports',
]);

export default function App() {
  const { route } = useRouter();
  const { user, loading, signingIn } = useAuth();
  useThemeSettings();

  const isPortalRoute = portalRoutes.has(route.name);
  const isTeacherRoute = teacherRoutes.has(route.name);
  const isAdminRoute = adminRoutes.has(route.name);
  const isPrincipalRoute = principalRoutes.has(route.name);
  const isAiRoute = aiRoutes.has(route.name);
  const isAuthRoute = authRoutes.has(route.name);

  useEffect(() => {
    if (loading || signingIn) return;

    if (isPortalRoute && !user) {
      if (window.location.hash !== '#/login') window.location.hash = '/login';
      return;
    }

    if (isTeacherRoute && !user) {
      if (window.location.hash !== '#/teacher/login') window.location.hash = '/teacher/login';
      return;
    }

    if (isAdminRoute && !user) {
      if (window.location.hash !== '#/admin/login') window.location.hash = '/admin/login';
      return;
    }

    if (isPrincipalRoute && !user) {
      if (window.location.hash !== '#/principal/login') window.location.hash = '/principal/login';
      return;
    }

    if (isAiRoute && !user) {
      if (window.location.hash !== '#/admin/login') window.location.hash = '/admin/login';
      return;
    }

    if (isAuthRoute && user) {
      if (route.name === 'teacher-login' && window.location.hash !== '#/teacher/dashboard') {
        window.location.hash = '/teacher/dashboard';
      } else if (route.name === 'admin-login' && window.location.hash !== '#/admin/dashboard') {
        window.location.hash = '/admin/dashboard';
      } else if (route.name === 'principal-login' && window.location.hash !== '#/principal/dashboard') {
        window.location.hash = '/principal/dashboard';
      } else if (window.location.hash !== '#/portal/dashboard') {
        window.location.hash = '/portal/dashboard';
      }
    }
  }, [loading, signingIn, user, route.name, isPortalRoute, isTeacherRoute, isAdminRoute, isPrincipalRoute, isAiRoute, isAuthRoute]);

  if (loading || signingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="w-10 h-10 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" />
      </div>
    );
  }

  const renderPage = () => {
    switch (route.name) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'admissions':
        return <AdmissionsPage />;
      case 'programs':
        return <ProgramsPage />;
      case 'departments':
        return <DepartmentsPage />;
      case 'faculty':
        return <FacultyPage />;
      case 'contact':
        return <ContactPage />;
      case 'news':
        return <NewsPage />;
      case 'news-article':
        return <NewsArticlePage route={route} />;
      case 'faq':
        return <FaqPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'portal-dashboard':
        return <DashboardPage />;
      case 'portal-profile':
        return <ProfilePage />;
      case 'portal-admission':
        return <AdmissionFormPage />;
      case 'portal-courses':
        return <MyCoursesPage />;
      case 'portal-attendance':
        return <AttendancePage />;
      case 'portal-results':
        return <ResultsPage />;
      case 'portal-fees':
        return <FeeChallanPage />;
      case 'portal-timetable':
        return <TimetablePage />;
      case 'portal-assignments':
        return <AssignmentsPage />;
      case 'portal-documents':
        return <DocumentUploadPage />;
      case 'portal-ocr':
        return <OcrVerificationPage />;
      case 'portal-notifications':
        return <NotificationsPage />;
      case 'portal-chatbot':
        return <ChatbotPage />;
      case 'portal-settings':
        return <SettingsPage />;
      case 'portal-support':
        return <HelpSupportPage />;
      case 'teacher-login':
        return <TeacherLoginPage />;
      case 'teacher-dashboard':
        return <TeacherDashboardPage />;
      case 'teacher-classes':
        return <TeacherClassesPage />;
      case 'teacher-students':
        return <TeacherStudentsPage />;
      case 'teacher-attendance':
        return <TeacherAttendancePage />;
      case 'teacher-marks':
        return <TeacherMarksPage />;
      case 'teacher-assignments':
        return <TeacherAssignmentsPage />;
      case 'teacher-timetable':
        return <TeacherTimetablePage />;
      case 'teacher-messages':
        return <TeacherMessagesPage />;
      case 'teacher-reports':
        return <TeacherReportsPage />;
      case 'teacher-profile':
        return <TeacherProfilePage />;
      case 'teacher-settings':
        return <TeacherSettingsPage />;
      case 'teacher-notifications':
        return <TeacherNotificationsPage />;
      case 'admin-login':
        return <AdminLoginPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'admin-students':
        return <AdminStudentsPage />;
      case 'admin-teachers':
        return <AdminTeachersPage />;
      case 'admin-employees':
        return <AdminEmployeesPage />;
      case 'admin-admissions':
        return <AdminAdmissionsPage />;
      case 'admin-courses':
        return <AdminCoursesPage />;
      case 'admin-departments':
        return <AdminDepartmentsPage />;
      case 'admin-subjects':
        return <AdminSubjectsPage />;
      case 'admin-classes':
        return <AdminClassesPage />;
      case 'admin-fees':
        return <AdminFeesPage />;
      case 'admin-scholarships':
        return <AdminScholarshipsPage />;
      case 'admin-library':
        return <AdminLibraryPage />;
      case 'admin-documents':
        return <AdminDocumentsPage />;
      case 'admin-ocr':
        return <AdminOcrPage />;
      case 'admin-analytics':
        return <AdminAnalyticsPage />;
      case 'admin-reports':
        return <AdminReportsPage />;
      case 'admin-notifications':
        return <AdminNotificationsPage />;
      case 'admin-audit':
        return <AdminAuditPage />;
      case 'admin-roles':
        return <AdminRolesPage />;
      case 'admin-settings':
        return <AdminSettingsPage />;
      case 'admin-cms-settings':
        return <AdminCmsSettingsPage />;
      case 'admin-cms-homepage':
        return <AdminCmsHomepagePage />;
      case 'admin-cms-about':
        return <AdminCmsAboutPage />;
      case 'admin-cms-admissions':
        return <AdminCmsAdmissionsPage />;
      case 'admin-cms-contact':
        return <AdminCmsContactPage />;
      case 'admin-cms-gallery':
        return <AdminCmsGalleryPage />;
      case 'admin-cms-notifications':
        return <AdminCmsNotificationsPage />;
      case 'admin-cms-news':
        return <AdminCmsNewsPage />;
      case 'admin-cms-faq':
        return <AdminCmsFaqPage />;
      case 'admin-cms-programs':
        return <AdminCmsProgramsPage />;
      case 'admin-cms-departments':
        return <AdminCmsDepartmentsPage />;
      case 'admin-cms-faculty':
        return <AdminCmsFacultyPage />;
      case 'admin-cms-scholarships':
        return <AdminCmsScholarshipsPage />;
      case 'principal-login':
        return <PrincipalLoginPage />;
      case 'principal-dashboard':
        return <PrincipalDashboardPage />;
      case 'principal-kpis':
        return <PrincipalKpisPage />;
      case 'principal-analytics':
        return <PrincipalAnalyticsPage />;
      case 'principal-ai-insights':
        return <PrincipalAiInsightsPage />;
      case 'principal-admissions':
        return <PrincipalAdmissionsPage />;
      case 'principal-student-performance':
        return <PrincipalStudentPerformancePage />;
      case 'principal-teacher-performance':
        return <PrincipalTeacherPerformancePage />;
      case 'principal-revenue':
        return <PrincipalRevenuePage />;
      case 'principal-attendance':
        return <PrincipalAttendancePage />;
      case 'principal-reports':
        return <PrincipalReportsPage />;
      case 'principal-recommendations':
        return <PrincipalRecommendationsPage />;
      case 'ai-dashboard':
        return <AiDashboardPage />;
      case 'ai-scanner':
        return <AiScannerPage />;
      case 'ai-computer-vision':
        return <AiComputerVisionPage />;
      case 'ai-certificate':
        return <AiCertificatePage />;
      case 'ai-duplicate':
        return <AiDuplicatePage />;
      case 'ai-admission':
        return <AiAdmissionPage />;
      case 'ai-performance-prediction':
        return <AiPerformancePredictionPage />;
      case 'ai-result-prediction':
        return <AiResultPredictionPage />;
      case 'ai-attendance-prediction':
        return <AiAttendancePredictionPage />;
      case 'ai-chatbot':
        return <AiChatbotPage />;
      case 'ai-smart-search':
        return <AiSmartSearchPage />;
      case 'ai-reports':
        return <AiReportsPage />;
      default:
        return <HomePage />;
    }
  };

  if (isPortalRoute && user) {
    const routePath = route.name.replace('portal-', '/portal/');
    return <PortalLayout activeRoute={routePath}>{renderPage()}</PortalLayout>;
  }

  if (isTeacherRoute && user) {
    const routePath = route.name.replace('teacher-', '/teacher/');
    return <TeacherLayout activeRoute={routePath}>{renderPage()}</TeacherLayout>;
  }

  if (isAdminRoute && user) {
    const routePath = route.name.replace('admin-', '/admin/');
    return <AdminLayout activeRoute={routePath}>{renderPage()}</AdminLayout>;
  }

  if (isPrincipalRoute && user) {
    const routePath = route.name.replace('principal-', '/principal/');
    return <PrincipalLayout activeRoute={routePath}>{renderPage()}</PrincipalLayout>;
  }

  if (isAiRoute && user) {
    const routePath = route.name.replace('ai-', '/ai/');
    return <AiLayout activeRoute={routePath}>{renderPage()}</AiLayout>;
  }

  if (isAuthRoute) {
    return <div className="min-h-screen bg-ink-50">{renderPage()}</div>;
  }

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <Navbar route={route} />
      <SiteBanner />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}
