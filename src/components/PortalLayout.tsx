import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, User, FileText, BookOpen, CalendarCheck, Award,
  CreditCard, CalendarClock, ClipboardList, Upload, ScanLine,
  Bell, MessageSquare, Settings, LifeBuoy, LogOut, Menu, X, ChevronLeft,
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useAuth } from '../lib/auth';
import { useCmsSettings } from '../lib/cms-hooks';

const navItems = [
  { label: 'Dashboard', route: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'Profile', route: '/portal/profile', icon: User },
  { label: 'Admission Form', route: '/portal/admission', icon: FileText },
  { label: 'My Courses', route: '/portal/courses', icon: BookOpen },
  { label: 'Attendance', route: '/portal/attendance', icon: CalendarCheck },
  { label: 'Results', route: '/portal/results', icon: Award },
  { label: 'Fee Challan', route: '/portal/fees', icon: CreditCard },
  { label: 'Timetable', route: '/portal/timetable', icon: CalendarClock },
  { label: 'Assignments', route: '/portal/assignments', icon: ClipboardList },
  { label: 'Document Upload', route: '/portal/documents', icon: Upload },
  { label: 'OCR Verification', route: '/portal/ocr', icon: ScanLine },
  { label: 'Notifications', route: '/portal/notifications', icon: Bell },
  { label: 'AI Chatbot', route: '/portal/chatbot', icon: MessageSquare },
  { label: 'Settings', route: '/portal/settings', icon: Settings },
  { label: 'Help & Support', route: '/portal/support', icon: LifeBuoy },
];

export default function PortalLayout({ children, activeRoute }: { children: ReactNode; activeRoute: string }) {
  const { user, signOut } = useAuth();
  const { data: settings } = useCmsSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const collegeName = settings.college_name || 'Portal';

  const handleSignOut = async () => {
    await signOut();
    navigateTo('/');
  };

  const isActive = (route: string) => activeRoute === route;

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-ink-950 text-ink-300 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-ink-800">
          <button onClick={() => navigateTo('/portal/dashboard')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center overflow-hidden">
              {settings.college_logo_url ? (
                <img src={settings.college_logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-xl font-bold text-gold-400">{collegeName.charAt(0)}</span>
              )}
            </div>
            <div className="text-left">
              <div className="font-serif text-sm font-bold text-white">{collegeName} Portal</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-ink-500">Student</div>
            </div>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-ink-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <button
                key={item.route}
                onClick={() => {
                  navigateTo(item.route);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gold-500 text-white shadow-md'
                    : 'text-ink-400 hover:text-white hover:bg-ink-900'
                }`}
              >
                <item.icon size={18} className={active ? 'text-white' : 'text-ink-500'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-ink-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-400 hover:text-white hover:bg-red-500/20 transition-all duration-200"
          >
            <LogOut size={18} className="text-ink-500" />
            Sign Out
          </button>
          <button
            onClick={() => navigateTo('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-400 hover:text-white hover:bg-ink-900 transition-all duration-200"
          >
            <ChevronLeft size={18} className="text-ink-500" />
            Back to Website
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-ink-100 h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-100"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <span className="text-sm text-ink-500">Welcome back,</span>{' '}
              <span className="text-sm font-medium text-ink-900">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('/portal/notifications')}
            className="relative p-2 rounded-lg text-ink-600 hover:bg-ink-100 transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
