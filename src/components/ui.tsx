import { type ReactNode } from 'react';

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
      )}
      {!image && (
        <div className="absolute inset-0 bg-gradient-to-b from-ink-100 to-ink-50" />
      )}
      <div className="container-wide relative z-10">
        {eyebrow && (
          <div className={`section-eyebrow mb-4 ${image ? 'text-gold-400' : ''}`}>
            {eyebrow}
          </div>
        )}
        <h1
          className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] max-w-3xl text-balance ${
            image ? 'text-white' : 'text-ink-900'
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`mt-6 text-lg lg:text-xl leading-relaxed max-w-2xl text-pretty ${
              image ? 'text-ink-200' : 'text-ink-600'
            }`}
          >
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 lg:py-24 ${className}`}>
      <div className="container-wide">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''} mb-12`}>
      {eyebrow && <div className="section-eyebrow mb-3">{eyebrow}</div>}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 leading-tight text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-ink-600 leading-relaxed text-pretty">{subtitle}</p>
      )}
    </div>
  );
}

export function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl lg:text-5xl font-serif font-bold text-ink-900">{value}</div>
      <div className="mt-2 text-sm text-ink-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <p className="text-ink-500">{message}</p>
      </div>
    </div>
  );
}
