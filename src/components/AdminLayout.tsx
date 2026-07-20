import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, Briefcase, FileText, BookOpen,
  Building2, Library, ClipboardList, CreditCard, Award, FolderOpen,
  ScanLine, BrainCircuit, BarChart3, Bell, ScrollText, ShieldCheck,
  Settings, LogOut, Menu, X, ChevronLeft, Globe, Image, Newspaper,
  HelpCircle, Megaphone, Home, Phone, FileEdit, UsersRound, Trophy,
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useAuth } from '../lib/auth';
import { useCmsSettings } from '../lib/cms-hooks';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', route: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Notifications', route: '/admin/notifications', icon: Bell },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Students', route: '/admin/students', icon: Users },
      { label: 'Teachers', route: '/admin/teachers', icon: GraduationCap },
      { label: 'Employees', route: '/admin/employees', icon: Briefcase },
      { label: 'User Roles', route: '/admin/roles', icon: ShieldCheck },
    ],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Admissions', route: '/admin/admissions', icon: FileText },
      { label: 'Courses', route: '/admin/courses', icon: BookOpen },
      { label: 'Departments', route: '/admin/departments', icon: Building2 },
      { label: 'Subjects', route: '/admin/subjects', icon: ClipboardList },
      { label: 'Classes', route: '/admin/classes', icon: BookOpen },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Fee Management', route: '/admin/fees', icon: CreditCard },
      { label: 'Scholarships', route: '/admin/scholarships', icon: Award },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Library', route: '/admin/library', icon: Library },
      { label: 'Documents', route: '/admin/documents', icon: FolderOpen },
      { label: 'OCR Verification', route: '/admin/ocr', icon: ScanLine },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'AI Analytics', route: '/admin/analytics', icon: BrainCircuit },
      { label: 'Reports', route: '/admin/reports', icon: BarChart3 },
      { label: 'Audit Logs', route: '/admin/audit', icon: ScrollText },
      { label: 'System Settings', route: '/admin/settings', icon: Settings },
    ],
  },
  {
    label: 'Website CMS',
    items: [
      { label: 'Site Settings', route: '/admin/cms-settings', icon: Globe },
      { label: 'Homepage', route: '/admin/cms-homepage', icon: Home },
      { label: 'About Page', route: '/admin/cms-about', icon: FileEdit },
      { label: 'Admissions Page', route: '/admin/cms-admissions', icon: FileText },
      { label: 'Contact Page', route: '/admin/cms-contact', icon: Phone },
      { label: 'Gallery', route: '/admin/cms-gallery', icon: Image },
      { label: 'Notifications', route: '/admin/cms-notifications', icon: Megaphone },
      { label: 'News & Events', route: '/admin/cms-news', icon: Newspaper },
      { label: 'FAQ', route: '/admin/cms-faq', icon: HelpCircle },
      { label: 'Programs', route: '/admin/cms-programs', icon: BookOpen },
      { label: 'Departments', route: '/admin/cms-departments', icon: Building2 },
      { label: 'Faculty', route: '/admin/cms-faculty', icon: UsersRound },
      { label: 'Scholarships', route: '/admin/cms-scholarships', icon: Trophy },
    ],
  },
];

export default function AdminLayout({ children, activeRoute }: { children: ReactNode; activeRoute: string }) {
  const { user, signOut } = useAuth();
  const { data: settings } = useCmsSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const collegeName = settings.college_name || 'Admin';

  const handleSignOut = async () => {
    await signOut();
    navigateTo('/');
  };

  const isActive = (route: string) => activeRoute === route;

  return (
    <div className="min-h-screen bg-ink-50 flex">
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-ink-950 text-ink-300 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-ink-800">
          <button onClick={() => navigateTo('/admin/dashboard')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center overflow-hidden">
              {settings.college_logo_url ? (
                <img src={settings.college_logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-xl font-bold text-gold-400">{collegeName.charAt(0)}</span>
              )}
            </div>
            <div className="text-left">
              <div className="font-serif text-sm font-bold text-white">{collegeName} Admin</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-rose-400">Administrator</div>
            </div>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-ink-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-1 text-[10px] uppercase tracking-[0.15em] text-ink-600 font-semibold">{group.label}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.route);
                  return (
                    <button
                      key={item.route}
                      onClick={() => { navigateTo(item.route); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active ? 'bg-rose-600 text-white shadow-md' : 'text-ink-400 hover:text-white hover:bg-ink-900'
                      }`}
                    >
                      <item.icon size={18} className={active ? 'text-white' : 'text-ink-500'} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-ink-800">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-400 hover:text-white hover:bg-red-500/20 transition-all">
            <LogOut size={18} className="text-ink-500" /> Sign Out
          </button>
          <button onClick={() => navigateTo('/')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-400 hover:text-white hover:bg-ink-900 transition-all">
            <ChevronLeft size={18} className="text-ink-500" /> Back to Website
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-ink-100 h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-100">
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <span className="text-sm text-ink-500">Admin:</span>{' '}
              <span className="text-sm font-medium text-ink-900">{user?.email}</span>
            </div>
          </div>
          <button onClick={() => navigateTo('/admin/notifications')} className="relative p-2 rounded-lg text-ink-600 hover:bg-ink-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
