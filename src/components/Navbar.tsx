import { useEffect, useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { navigateTo, type Route } from '../lib/router';
import { useCmsSettings } from '../lib/cms-hooks';

const navItems: { label: string; route: string; routeName: string }[] = [
  { label: 'Home', route: '/', routeName: 'home' },
  { label: 'About', route: '/about', routeName: 'about' },
  { label: 'Admissions', route: '/admissions', routeName: 'admissions' },
  { label: 'Programs', route: '/programs', routeName: 'programs' },
  { label: 'Departments', route: '/departments', routeName: 'departments' },
  { label: 'Faculty', route: '/faculty', routeName: 'faculty' },
  { label: 'News', route: '/news', routeName: 'news' },
  { label: 'Gallery', route: '/gallery', routeName: 'gallery' },
  { label: 'FAQ', route: '/faq', routeName: 'faq' },
  { label: 'Contact', route: '/contact', routeName: 'contact' },
];

export default function Navbar({ route }: { route: Route }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: settings } = useCmsSettings();
  const collegeName = settings.college_name || 'Meridian';
  const nameParts = collegeName.split(' ');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [route]);

  const isActive = (routeName: string) => {
    if (routeName === 'home' && route.name === 'home') return true;
    if (routeName === 'news' && (route.name === 'news' || route.name === 'news-article')) return true;
    return route.name === routeName;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-ink-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-wide flex items-center justify-between h-20">
        {/* Logo */}
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg theme-primary-bg flex items-center justify-center transition-transform group-hover:scale-105">
            {settings.college_logo_url ? (
              <img src={settings.college_logo_url} alt={collegeName} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="font-serif text-xl font-bold theme-accent-text">{nameParts[0]?.[0] ?? 'M'}</span>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <div className={`font-serif text-lg font-bold leading-none transition-colors ${scrolled ? 'text-ink-900' : 'text-ink-900'}`}>
              {nameParts[0] || 'Meridian'}
            </div>
            <div className={`text-[10px] font-sans uppercase tracking-[0.2em] mt-0.5 transition-colors ${scrolled ? 'text-ink-500' : 'text-ink-500'}`}>
              {nameParts.slice(1).join(' ') || 'University'}
            </div>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => navigateTo(item.route)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(item.routeName)
                  ? 'text-ink-900 bg-ink-100'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => navigateTo('/login')}
            className="ml-2 px-4 py-2 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
          >
            Student Portal
          </button>
          <button
            onClick={() => navigateTo('/teacher/login')}
            className="ml-1 px-4 py-2 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
          >
            Faculty
          </button>
          <button
            onClick={() => navigateTo('/admin/login')}
            className="ml-1 px-4 py-2 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
          >
            Admin
          </button>
          <button
            onClick={() => navigateTo('/principal/login')}
            className="ml-1 px-4 py-2 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
          >
            Principal
          </button>
          <button
            onClick={() => navigateTo('/ai/dashboard')}
            className="ml-1 px-4 py-2 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
          >
            AI Modules
          </button>
          <button
            onClick={() => navigateTo('/admissions')}
            className="ml-1 btn-gold text-sm"
          >
            Apply Now
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg text-ink-900 hover:bg-ink-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-ink-100 animate-slide-in">
          <div className="container-wide py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => navigateTo(item.route)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.routeName)
                    ? 'text-ink-900 bg-ink-100'
                    : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                {item.label}
                <ChevronRight size={16} className="text-ink-400" />
              </button>
            ))}
            <button
              onClick={() => navigateTo('/admissions')}
              className="btn-gold mt-2 justify-center"
            >
              Apply Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
