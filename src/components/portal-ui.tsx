import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

export function PortalCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-ink-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PortalPageHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center flex-shrink-0">
            <Icon className="text-gold-400" size={24} />
          </div>
        )}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-ink-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  icon: Icon,
  color = 'ink',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'ink' | 'gold' | 'teal' | 'green' | 'red' | 'blue';
}) {
  const colorMap: Record<string, string> = {
    ink: 'bg-ink-100 text-ink-700',
    gold: 'bg-gold-100 text-gold-700',
    teal: 'bg-teal-100 text-teal-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <PortalCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-ink-900">{value}</div>
          <div className="text-sm text-ink-500 mt-1">{label}</div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </PortalCard>
  );
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold';
}) {
  const variants: Record<string, string> = {
    default: 'bg-ink-100 text-ink-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gold: 'bg-gold-100 text-gold-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function PortalButton({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'danger' | 'ghost';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-ink-900 text-white hover:bg-ink-800',
    secondary: 'bg-white text-ink-900 border border-ink-200 hover:border-ink-900',
    gold: 'bg-gold-500 text-white hover:bg-gold-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-ink-600 hover:bg-ink-100',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function PortalInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  name,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all"
      />
    </div>
  );
}

export function PortalTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all resize-none"
      />
    </div>
  );
}

export function PortalSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 focus:border-transparent transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }: { icon: LucideIcon; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
        <Icon className="text-ink-400" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-ink-900 mb-1">{title}</h3>
      <p className="text-sm text-ink-500 max-w-sm">{message}</p>
    </div>
  );
}

export function PortalLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" />
    </div>
  );
}
