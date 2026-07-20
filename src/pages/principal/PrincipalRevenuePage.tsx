import { useMemo } from 'react';
import {
  DollarSign, TrendingUp, Clock, AlertCircle, Wallet,
  PieChart, Award, BarChart3,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { useFeeRecords, useScholarships } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { FeeRecord, Scholarship } from '../../lib/supabase';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
}

export default function PrincipalRevenuePage() {
  const { user } = useAuth();
  const { data: fees, loading: feesLoading } = useFeeRecords();
  const { data: scholarships, loading: scholarshipsLoading } = useScholarships();

  const loading = feesLoading || scholarshipsLoading;

  // Revenue stats from real fee records
  const stats = useMemo(() => {
    const expected = fees.reduce((s, f: FeeRecord) => s + (f.amount || 0), 0);
    const collected = fees.reduce((s, f: FeeRecord) => s + (f.paid_amount || 0), 0);
    const pending = fees
      .filter((f: FeeRecord) => f.status === 'pending' || f.status === 'partial')
      .reduce((s, f: FeeRecord) => s + ((f.amount || 0) - (f.paid_amount || 0)), 0);
    const overdue = fees
      .filter((f: FeeRecord) => {
        if (f.status === 'overdue') return true;
        if (f.status === 'pending' || f.status === 'partial') {
          if (!f.due_date) return false;
          return new Date(f.due_date).getTime() < Date.now();
        }
        return false;
      })
      .reduce((s, f: FeeRecord) => s + ((f.amount || 0) - (f.paid_amount || 0)), 0);
    return { expected, collected, pending, overdue };
  }, [fees]);

  const collectionRate = stats.expected > 0 ? Math.round((stats.collected / stats.expected) * 100) : 0;

  // Monthly revenue trend (simulated 6 months)
  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const base = stats.collected > 0 ? stats.collected / 6 : 50000;
    const factors = [0.7, 0.82, 0.9, 0.95, 1.05, 1.15];
    return months.map((m, i) => ({
      month: m,
      amount: Math.round(base * factors[i]),
    }));
  }, [stats.collected]);
  const monthlyMax = Math.max(...monthlyTrend.map((m) => m.amount), 1);

  // Revenue by category (simulated)
  const byCategory = useMemo(() => {
    const tuition = Math.round(stats.collected * 0.62);
    const lab = Math.round(stats.collected * 0.16);
    const library = Math.round(stats.collected * 0.12);
    const other = Math.max(stats.collected - tuition - lab - library, 0);
    return [
      { label: 'Tuition', amount: tuition, color: 'bg-amber-500' },
      { label: 'Lab Fees', amount: lab, color: 'bg-amber-400' },
      { label: 'Library', amount: library, color: 'bg-teal-500' },
      { label: 'Other', amount: other, color: 'bg-ink-400' },
    ];
  }, [stats.collected]);
  const categoryTotal = byCategory.reduce((s, c) => s + c.amount, 0) || 1;

  // Fee collection status breakdown
  const statusBreakdown = useMemo(() => {
    const buckets = [
      { label: 'Paid', color: 'bg-teal-600', count: 0, variant: 'success' as const },
      { label: 'Partial', color: 'bg-amber-500', count: 0, variant: 'warning' as const },
      { label: 'Pending', color: 'bg-amber-300', count: 0, variant: 'info' as const },
      { label: 'Overdue', color: 'bg-rose-500', count: 0, variant: 'error' as const },
    ];
    fees.forEach((f: FeeRecord) => {
      const st = (f.status || 'pending').toLowerCase();
      if (st === 'paid' || st === 'completed') buckets[0].count++;
      else if (st === 'partial') buckets[1].count++;
      else if (st === 'overdue') buckets[3].count++;
      else buckets[2].count++;
    });
    return buckets;
  }, [fees]);
  const statusTotal = statusBreakdown.reduce((s, b) => s + b.count, 0) || 1;

  // Scholarship financial impact
  const scholarshipImpact = useMemo(() => {
    const total = scholarships.reduce((s, sc: Scholarship) => s + (sc.amount || 0), 0);
    const active = scholarships.filter((sc: Scholarship) => sc.status === 'active' || sc.status === 'open').length;
    return { total, active, count: scholarships.length };
  }, [scholarships]);

  // Top pending payments
  const topPending = useMemo(() => {
    return fees
      .filter((f: FeeRecord) => f.status !== 'paid' && f.status !== 'completed')
      .map((f: FeeRecord) => ({
        ...f,
        remaining: (f.amount || 0) - (f.paid_amount || 0),
      }))
      .sort((a, b) => b.remaining - a.remaining)
      .slice(0, 8);
  }, [fees]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Revenue Overview" subtitle="Fee collection and financial performance" icon={DollarSign} />
        <PortalLoading />
      </div>
    );
  }

  if (!user) {
    navigateTo('/principal/login');
    return null;
  }

  // Circular progress (conic-gradient via inline style)
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (collectionRate / 100) * circumference;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Revenue Overview"
        subtitle="Fee collection, revenue trends, and scholarship impact"
        icon={DollarSign}
        action={
          <PortalButton variant="secondary" onClick={() => navigateTo('/principal/dashboard')}>
            Dashboard
          </PortalButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Expected" value={formatCurrency(stats.expected)} icon={Wallet} color="ink" />
        <StatTile label="Collected" value={formatCurrency(stats.collected)} icon={TrendingUp} color="green" />
        <StatTile label="Pending" value={formatCurrency(stats.pending)} icon={Clock} color="gold" />
        <StatTile label="Overdue" value={formatCurrency(stats.overdue)} icon={AlertCircle} color="red" />
      </div>

      {/* Collection rate + Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Revenue Collection Rate</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f0e8" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-ink-900">{collectionRate}%</span>
                <span className="text-xs text-ink-500 mt-1">Collected</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs">
              <div className="text-center p-3 rounded-lg bg-teal-50">
                <div className="text-xs text-ink-500">Collected</div>
                <div className="text-sm font-semibold text-teal-700">{formatCurrency(stats.collected)}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50">
                <div className="text-xs text-ink-500">Outstanding</div>
                <div className="text-sm font-semibold text-amber-700">{formatCurrency(stats.expected - stats.collected)}</div>
              </div>
            </div>
          </div>
        </PortalCard>

        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Fee Collection Status</h2>
          </div>
          {fees.length === 0 ? (
            <EmptyState icon={BarChart3} title="No fee records" message="Fee collection status will appear once fee records are created." />
          ) : (
            <>
              {/* Stacked bar */}
              <div className="flex h-4 rounded-full overflow-hidden mb-5">
                {statusBreakdown.map((b) => (
                  <div
                    key={b.label}
                    className={b.color}
                    style={{ width: `${(b.count / statusTotal) * 100}%` }}
                    title={`${b.label}: ${b.count}`}
                  />
                ))}
              </div>
              <div className="space-y-3">
                {statusBreakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${b.color}`} />
                      <span className="text-sm text-ink-700">{b.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink-900">{b.count}</span>
                      <Badge variant={b.variant}>{Math.round((b.count / statusTotal) * 100)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </PortalCard>
      </div>

      {/* Monthly trend + Revenue by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Monthly Revenue Trend</h2>
          </div>
          <div className="flex items-end justify-between gap-3 h-48">
            {monthlyTrend.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all duration-500 relative group"
                    style={{ height: `${(m.amount / monthlyMax) * 100}%` }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-ink-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(m.amount)}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-ink-500">{m.month}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-400 mt-4">Simulated 6-month trend based on current collection volume.</p>
        </PortalCard>

        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Wallet size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Revenue by Category</h2>
          </div>
          {stats.collected === 0 ? (
            <EmptyState icon={Wallet} title="No revenue yet" message="Revenue categories will appear once fees are collected." />
          ) : (
            <>
              {/* Stacked bar */}
              <div className="flex h-4 rounded-full overflow-hidden mb-5">
                {byCategory.map((c) => (
                  <div
                    key={c.label}
                    className={c.color}
                    style={{ width: `${(c.amount / categoryTotal) * 100}%` }}
                    title={`${c.label}: ${formatCurrency(c.amount)}`}
                  />
                ))}
              </div>
              <div className="space-y-3">
                {byCategory.map((c) => (
                  <div key={c.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${c.color}`} />
                      <span className="text-sm text-ink-700">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ink-900">{formatCurrency(c.amount)}</span>
                      <span className="text-xs text-ink-500 w-10 text-right">
                        {Math.round((c.amount / categoryTotal) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </PortalCard>
      </div>

      {/* Scholarship impact + Top pending payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PortalCard className="p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <Award size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Scholarship Impact</h2>
          </div>
          {scholarships.length === 0 ? (
            <EmptyState icon={Award} title="No scholarships" message="Scholarship financial impact will appear once scholarships are created." />
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                <div className="text-xs text-amber-700 font-medium uppercase tracking-wide">Total Awarded</div>
                <div className="text-3xl font-bold text-ink-900 mt-1">{formatCurrency(scholarshipImpact.total)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-ink-50">
                  <div className="text-xs text-ink-500">Scholarships</div>
                  <div className="text-lg font-semibold text-ink-900">{scholarshipImpact.count}</div>
                </div>
                <div className="p-3 rounded-lg bg-teal-50">
                  <div className="text-xs text-ink-500">Active</div>
                  <div className="text-lg font-semibold text-teal-700">{scholarshipImpact.active}</div>
                </div>
              </div>
              <div className="pt-2">
                <div className="text-xs text-ink-500 mb-2">Impact on revenue</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.expected > 0 ? Math.min(100, (scholarshipImpact.total / stats.expected) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-amber-700">
                    {stats.expected > 0 ? Math.round((scholarshipImpact.total / stats.expected) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </PortalCard>

        <PortalCard className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Top Pending Payments</h2>
          </div>
          {topPending.length === 0 ? (
            <EmptyState icon={Clock} title="No pending payments" message="All fees are collected or no pending payments exist." />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-ink-100">
                    <th className="px-2 py-3 font-semibold">Student</th>
                    <th className="px-2 py-3 font-semibold">Description</th>
                    <th className="px-2 py-3 font-semibold">Due Date</th>
                    <th className="px-2 py-3 font-semibold">Status</th>
                    <th className="px-2 py-3 font-semibold text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {topPending.map((f) => (
                    <tr key={f.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="px-2 py-3 font-medium text-ink-900 truncate">{f.student_name || '—'}</td>
                      <td className="px-2 py-3 text-ink-600 truncate max-w-[180px]" title={f.description}>{f.description || '—'}</td>
                      <td className="px-2 py-3 text-ink-600">{formatDate(f.due_date)}</td>
                      <td className="px-2 py-3">
                        <Badge
                          variant={
                            f.status === 'overdue'
                              ? 'error'
                              : f.status === 'partial'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {(f.status || 'pending').replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-right font-semibold text-rose-700">{formatCurrency(f.remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PortalCard>
      </div>

      <p className="text-xs text-ink-400 mt-4 px-1">
        Note: Monthly trends and revenue category splits are simulated. Fee totals and scholarship amounts use live data.
      </p>
    </div>
  );
}
