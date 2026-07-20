import { X, Info, AlertCircle, CheckCircle, Megaphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCmsSiteNotifications } from '../lib/cms-hooks';
import { navigateTo } from '../lib/router';

const iconMap: Record<string, typeof Info> = {
  info: Info,
  warning: AlertCircle,
  success: CheckCircle,
  announcement: Megaphone,
};

export default function SiteBanner() {
  const { data: notifications, loading } = useCmsSiteNotifications();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('cms-banner-dismissed');
    if (stored) {
      try { setDismissed(new Set(JSON.parse(stored))); } catch { /* ignore */ }
    }
  }, []);

  if (loading || notifications.length === 0) return null;

  const active = notifications.filter((n) => !dismissed.has(n.id));
  if (active.length === 0) return null;
  const banner = active[0];

  const Icon = iconMap[banner.type ?? 'info'] ?? Info;

  const dismiss = () => {
    const next = new Set(dismissed);
    next.add(banner.id);
    setDismissed(next);
    localStorage.setItem('cms-banner-dismissed', JSON.stringify([...next]));
  };

  const colorMap: Record<string, string> = {
    info: 'bg-ink-900',
    warning: 'bg-amber-600',
    success: 'bg-green-700',
    announcement: 'bg-gold-600',
  };

  return (
    <div className={`${colorMap[banner.type ?? 'info'] ?? 'bg-ink-900'} text-white relative z-[60]`}>
      <div className="container-wide py-2.5 flex items-center justify-center gap-3 text-sm">
        <Icon size={16} className="flex-shrink-0" />
        <span className="font-medium">{banner.title}:</span>
        <span className="hidden sm:inline text-white/90">{banner.message}</span>
        {banner.link_text && banner.link_url && (
          <button
            onClick={() => navigateTo(banner.link_url!)}
            className="underline underline-offset-2 font-semibold hover:text-white/80 transition-colors whitespace-nowrap"
          >
            {banner.link_text}
          </button>
        )}
        <button
          onClick={dismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
