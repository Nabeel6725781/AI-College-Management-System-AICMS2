import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Target, BarChart3, BrainCircuit, FileText,
  Users, GraduationCap, DollarSign, CalendarCheck, FileBarChart,
  Lightbulb, LogOut, Menu, X, ChevronLeft,
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useAuth } from '../lib/auth';
import { useCmsSettings } from '../lib/cms-hooks';

const navItems = [
  { label: 'Executive Dashboard', route: '/principal/dashboard', icon: LayoutDashboard },
  { label: 'KPIs', route: '/principal/kpis', icon: Target },
  { label: 'College Analytics', route: '/principal/analytics', icon: BarChart3 },
  { label: 'AI Insights', route: '/principal/ai-insights', icon: BrainCircuit },
  { label: 'Admissions', route: '/principal/admissions', icon: FileText },
  { label: 'Student Performance', route: '/principal/student-performance', icon: Users },
  { label: 'Teacher Performance', route: '/principal/teacher-performance', icon: GraduationCap },
  { label: 'Revenue', route: '/principal/revenue', icon: DollarSign },
  { label: 'Attendance', route: '/principal/attendance', icon: CalendarCheck },
  { label: 'Reports', route: '/principal/reports', icon: FileBarChart },
  { label: 'Strategic Recommendations', route: '/principal/recommendations', icon: Lightbulb },
];

export default function PrincipalLayout({ children, activeRoute }: { children: ReactNode; activeRoute: string }) {
  const { user, signOut } = useAuth();
  const { data: settings } = useCmsSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const collegeName = settings.college_name || 'Principal';

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
          <button onClick={() => navigateTo('/principal/dashboard')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center overflow-hidden">
              {settings.college_logo_url ? (
                <img src={settings.college_logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-xl font-bold text-amber-400">{collegeName.charAt(0)}</span>
              )}
            </div>
            <div className="text-left">
              <div className="font-serif text-sm font-bold text-white">{collegeName} Principal</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-amber-400">Executive</div>
            </div>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-ink-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-hide">
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <button
                key={item.route}
                onClick={() => { navigateTo(item.route); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active ? 'bg-amber-500 text-ink-950 shadow-md font-semibold' : 'text-ink-400 hover:text-white hover:bg-ink-900'
                }`}
              >
                <item.icon size={18} className={active ? 'text-ink-950' : 'text-ink-500'} />
                {item.label}
              </button>
            );
          })}
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
              <span className="text-sm text-ink-500">Principal:</span>{' '}
              <span className="text-sm font-medium text-ink-900">{user?.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <span className="hidden sm:inline">Academic Year 2025–2026</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="hidden sm:inline text-green-600 font-medium">Live</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
