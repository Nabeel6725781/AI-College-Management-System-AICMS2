import { useState, useMemo } from 'react';
import {
  FileText, Check, X, Clock, TrendingUp, Users, Mail,
  ChevronRight, Award, UserPlus,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { useAdmissions } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { AdmissionApplication } from '../../lib/supabase';

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'error' | 'info' | 'default'> = {
  pending: 'warning',
  draft: 'warning',
  approved: 'success',
  rejected: 'error',
  reviewing: 'info',
  enrolled: 'success',
};

function statusLabel(status: string): string {
  return (status || 'pending').replace(/_/g, ' ');
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
}

export default function PrincipalAdmissionsPage() {
  const { user } = useAuth();
  const { data: applications, loading } = useAdmissions();
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'pending' || a.status === 'draft' || a.status === 'reviewing').length;
    const approved = applications.filter((a) => a.status === 'approved' || a.status === 'enrolled').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [applications]);

  // Funnel stages derived from real statuses
  const funnel = useMemo(() => {
    const applied = applications.length;
    const reviewed = applications.filter((a) =>
      ['reviewing', 'approved', 'enrolled', 'rejected'].includes(a.status)
    ).length;
    const approved = applications.filter((a) => ['approved', 'enrolled'].includes(a.status)).length;
    const enrolled = applications.filter((a) => a.status === 'enrolled').length;
    const stages = [
      { label: 'Applied', value: applied, color: 'bg-ink-900' },
      { label: 'Reviewed', value: reviewed, color: 'bg-amber-500' },
      { label: 'Approved', value: approved, color: 'bg-amber-600' },
      { label: 'Enrolled', value: enrolled, color: 'bg-teal-600' },
    ];
    const max = Math.max(applied, 1);
    return { stages, max };
  }, [applications]);

  // Applications by program/department
  const byProgram = useMemo(() => {
    const map = new Map<string, number>();
    applications.forEach((a) => {
      const key = a.program || 'Unspecified';
      map.set(key, (map.get(key) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    arr.sort((x, y) => y.value - x.value);
    return arr;
  }, [applications]);

  const programMax = Math.max(...byProgram.map((p) => p.value), 1);

  // Approval rate trend (simulated based on current approval ratio)
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const trend = useMemo(() => {
    const base = Math.max(approvalRate, 1);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const factors = [0.72, 0.78, 0.81, 0.85, 0.9, 1.0];
    return months.map((m, i) => ({
      month: m,
      rate: Math.min(100, Math.round(base * factors[i])),
    }));
  }, [approvalRate]);
  const trendMax = 100;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications.slice(0, 12);
    return applications
      .filter(
        (a) =>
          a.full_name?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.program?.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [applications, search]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Admissions Overview" subtitle="Application funnel and approval trends" icon={FileText} />
        <PortalLoading />
      </div>
    );
  }

  if (!user) {
    navigateTo('/principal/login');
    return null;
  }

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Admissions Overview"
        subtitle="Application funnel, program distribution, and approval trends"
        icon={FileText}
        action={
          <PortalButton variant="secondary" onClick={() => navigateTo('/principal/dashboard')}>
            Dashboard
          </PortalButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Applications" value={stats.total} icon={FileText} color="ink" />
        <StatTile label="Pending Review" value={stats.pending} icon={Clock} color="gold" />
        <StatTile label="Approved" value={stats.approved} icon={Check} color="green" />
        <StatTile label="Rejected" value={stats.rejected} icon={X} color="red" />
      </div>

      {/* Funnel + Approval rate trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Admissions Funnel</h2>
          </div>
          {stats.total === 0 ? (
            <EmptyState icon={FileText} title="No applications yet" message="The admissions funnel will populate once applications arrive." />
          ) : (
            <div className="space-y-4">
              {funnel.stages.map((s, i) => {
                const pct = Math.round((s.value / funnel.max) * 100);
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-ink-100 text-ink-700 text-xs font-semibold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-ink-700">{s.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-ink-900">{s.value}</span>
                    </div>
                    <div className="h-3 rounded-full bg-ink-50 overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5 pt-2 text-xs text-ink-500">
                <ChevronRight size={14} className="text-amber-600" />
                <span>
                  Overall conversion: <span className="font-semibold text-amber-700">{approvalRate}%</span> of applications approved
                </span>
              </div>
            </div>
          )}
        </PortalCard>

        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Approval Rate Trend</h2>
          </div>
          <div className="flex items-end justify-between gap-3 h-48">
            {trend.map((t) => (
              <div key={t.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-md transition-all duration-500 relative group"
                    style={{ height: `${(t.rate / trendMax) * 100}%` }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-ink-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.rate}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-ink-500">{t.month}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-500 mt-4">
            Simulated 6-month trend based on current approval ratio. Current rate: <span className="font-semibold text-amber-700">{approvalRate}%</span>.
          </p>
        </PortalCard>
      </div>

      {/* Applications by program */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Users size={18} className="text-amber-600" />
          <h2 className="text-lg font-semibold text-ink-900">Applications by Program</h2>
        </div>
        {byProgram.length === 0 ? (
          <EmptyState icon={Users} title="No program data" message="Program distribution appears once applications are submitted." />
        ) : (
          <div className="space-y-3">
            {byProgram.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="w-40 text-sm text-ink-700 truncate" title={p.label}>{p.label}</div>
                <div className="flex-1 h-6 rounded-full bg-ink-50 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(p.value / programMax) * 100}%` }}
                  />
                </div>
                <div className="w-10 text-right text-sm font-semibold text-ink-900">{p.value}</div>
              </div>
            ))}
          </div>
        )}
      </PortalCard>

      {/* Recent applications table */}
      <PortalCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Recent Applications</h2>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, program..."
            className="px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all w-full sm:w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No applications found" message="No applications match your search or none have been submitted yet." />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-ink-100">
                  <th className="px-2 py-3 font-semibold">Name</th>
                  <th className="px-2 py-3 font-semibold">Email</th>
                  <th className="px-2 py-3 font-semibold">Program</th>
                  <th className="px-2 py-3 font-semibold">Status</th>
                  <th className="px-2 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((a: AdmissionApplication) => (
                  <tr key={a.id} className="hover:bg-ink-50/60 transition-colors">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {(a.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-ink-900 truncate">{a.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-ink-600">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-ink-400 flex-shrink-0" />
                        <span className="truncate">{a.email || '—'}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-ink-700">{a.program || '—'}</td>
                    <td className="px-2 py-3">
                      <Badge variant={STATUS_VARIANT[a.status || 'pending'] || 'default'}>
                        {statusLabel(a.status || 'pending')}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 text-ink-600">{formatDate(a.submitted_at || a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>
    </div>
  );
}
