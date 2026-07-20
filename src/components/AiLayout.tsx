import { useState, type ReactNode } from 'react';
import {
  BrainCircuit, ScanLine, Eye, BadgeCheck, CopyCheck, UserPlus,
  TrendingUp, FileBarChart, CalendarCheck, MessageSquare, Search,
  FileText, LogOut, Menu, X, ChevronLeft, Sparkles,
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useAuth } from '../lib/auth';
import { useCmsSettings } from '../lib/cms-hooks';

const navGroups = [
  {
    label: 'Vision & OCR',
    items: [
      { label: 'OCR Dashboard', route: '/ai/dashboard', icon: ScanLine },
      { label: 'Document Scanner', route: '/ai/scanner', icon: FileText },
      { label: 'Computer Vision', route: '/ai/computer-vision', icon: Eye },
      { label: 'Certificate Verification', route: '/ai/certificate', icon: BadgeCheck },
      { label: 'Duplicate Detection', route: '/ai/duplicate', icon: CopyCheck },
    ],
  },
  {
    label: 'Predictive AI',
    items: [
      { label: 'Admission Recommendation', route: '/ai/admission', icon: UserPlus },
      { label: 'Performance Prediction', route: '/ai/performance-prediction', icon: TrendingUp },
      { label: 'Result Prediction', route: '/ai/result-prediction', icon: FileBarChart },
      { label: 'Attendance Prediction', route: '/ai/attendance-prediction', icon: CalendarCheck },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'AI Chatbot', route: '/ai/chatbot', icon: MessageSquare },
      { label: 'Smart Search', route: '/ai/smart-search', icon: Search },
      { label: 'AI Reports', route: '/ai/reports', icon: FileBarChart },
    ],
  },
];

export default function AiLayout({ children, activeRoute }: { children: ReactNode; activeRoute: string }) {
  const { user, signOut } = useAuth();
  const { data: settings } = useCmsSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const collegeName = settings.college_name || 'AI';

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
          <button onClick={() => navigateTo('/ai/dashboard')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <BrainCircuit className="text-white" size={20} />
            </div>
            <div className="text-left">
              <div className="font-serif text-sm font-bold text-white">{collegeName} AI</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-cyan-400">Intelligence Hub</div>
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
                        active ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md' : 'text-ink-400 hover:text-white hover:bg-ink-900'
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
          <div className="px-3 py-2 mb-2 rounded-lg bg-ink-900 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <Sparkles size={14} /> AI Engine v2.0
            </div>
            <div className="text-[10px] text-ink-500 mt-1">12 models active</div>
          </div>
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
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <BrainCircuit className="text-white" size={14} />
              </div>
              <span className="text-sm font-medium text-ink-900">AI Modules</span>
              <span className="text-sm text-ink-500">· {user?.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-cyan-600 font-medium">AI Engine Active</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
