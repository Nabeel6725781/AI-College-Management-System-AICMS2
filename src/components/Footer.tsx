import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react';
import { navigateTo } from '../lib/router';
import { useCmsSettings } from '../lib/cms-hooks';

const footerLinks = {
  Explore: [
    { label: 'About Us', route: '/about' },
    { label: 'Programs', route: '/programs' },
    { label: 'Departments', route: '/departments' },
    { label: 'Faculty', route: '/faculty' },
  ],
  Admissions: [
    { label: 'How to Apply', route: '/admissions' },
    { label: 'Tuition & Aid', route: '/admissions' },
    { label: 'Visit Campus', route: '/contact' },
    { label: 'FAQ', route: '/faq' },
  ],
  Campus: [
    { label: 'News & Events', route: '/news' },
    { label: 'Gallery', route: '/gallery' },
    { label: 'Contact Us', route: '/contact' },
    { label: 'Research', route: '/departments' },
  ],
};

export default function Footer() {
  const { data: settings } = useCmsSettings();
  const collegeName = settings.college_name || 'Meridian University';
  const nameParts = collegeName.split(' ');

  const socials = [
    { icon: Facebook, url: settings.facebook_url },
    { icon: Twitter, url: settings.twitter_url },
    { icon: Instagram, url: settings.instagram_url },
    { icon: Linkedin, url: settings.linkedin_url },
    { icon: Youtube, url: settings.youtube_url },
  ].filter((s) => s.url);

  return (
    <footer className="theme-primary-bg text-ink-300">
      <div className="container-wide pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg theme-primary-bg border border-ink-700 flex items-center justify-center overflow-hidden">
                {settings.college_logo_url ? (
                  <img src={settings.college_logo_url} alt={collegeName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-serif text-xl font-bold theme-accent-text">{nameParts[0]?.[0] ?? 'M'}</span>
                )}
              </div>
              <div>
                <div className="font-serif text-lg font-bold text-white">{collegeName}</div>
                <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-ink-400 mt-0.5">
                  {settings.tagline || 'Est. 1851'}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ink-400 max-w-sm">
              {settings.footer_text || 'Inspiring minds and shaping futures since 1851.'}
            </p>
            {socials.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg theme-primary-bg border border-ink-700 flex items-center justify-center text-ink-400 hover:text-gold-400 hover:border-gold-500 transition-all duration-200"
                  >
                    <s.icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-sans font-semibold uppercase tracking-[0.15em] text-white mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigateTo(link.route)}
                      className="text-sm text-ink-400 hover:text-gold-400 transition-colors link-underline"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-8 border-t border-ink-800">
          <div className="flex items-center gap-3 text-sm text-ink-400">
            <MapPin size={18} className="theme-accent-text" />
            <span className="whitespace-pre-line">{settings.address || '1851 University Avenue, Meridian, CA 90210'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-400">
            <Phone size={18} className="theme-accent-text" />
            <span>{settings.phone || '(555) 123-4567'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-400">
            <Mail size={18} className="theme-accent-text" />
            <span>{settings.email || 'admissions@meridian.edu'}</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-ink-800">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} {collegeName}. All rights reserved.
          </p>
          <button
            onClick={() => navigateTo('/admissions')}
            className="flex items-center gap-2 text-xs text-ink-400 hover:text-gold-400 transition-colors group"
          >
            Begin your application
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
