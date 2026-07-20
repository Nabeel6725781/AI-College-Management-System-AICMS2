import { useMemo } from 'react';
import { CalendarCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useAttendance } from '../../lib/portal-hooks';
import { PortalCard, PortalPageHeader, PortalLoading, Badge, EmptyState } from '../../components/portal-ui';

export default function AttendancePage() {
  const { user } = useAuth();
  const { data: records, loading } = useAttendance(user?.id);

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, rate };
  }, [records]);

  const byCourse = useMemo(() => {
    const map: Record<string, { present: number; absent: number; late: number; total: number }> = {};
    records.forEach((r) => {
      const name = r.course_name || 'Unknown';
      if (!map[name]) map[name] = { present: 0, absent: 0, late: 0, total: 0 };
      map[name].total++;
      if (r.status === 'present') map[name].present++;
      else if (r.status === 'absent') map[name].absent++;
      else if (r.status === 'late') map[name].late++;
    });
    return Object.entries(map);
  }, [records]);

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Attendance"
        subtitle="Track your class attendance across all courses"
        icon={CalendarCheck}
      />

      {/* Overall stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PortalCard className="p-6 text-center">
          <div className="text-3xl font-bold text-ink-900">{stats.rate}%</div>
          <div className="text-sm text-ink-500 mt-1">Overall Rate</div>
        </PortalCard>
        <PortalCard className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.present}</div>
          <div className="text-sm text-ink-500 mt-1">Present</div>
        </PortalCard>
        <PortalCard className="p-6 text-center">
          <div className="text-3xl font-bold text-amber-600">{stats.late}</div>
          <div className="text-sm text-ink-500 mt-1">Late</div>
        </PortalCard>
        <PortalCard className="p-6 text-center">
          <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
          <div className="text-sm text-ink-500 mt-1">Absent</div>
        </PortalCard>
      </div>

      {/* Progress bar */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-ink-600" />
            <span className="text-sm font-medium text-ink-900">Attendance Overview</span>
          </div>
          <span className="text-sm text-ink-500">{stats.present} / {stats.total} classes</span>
        </div>
        <div className="w-full h-3 rounded-full bg-ink-100 overflow-hidden flex">
          <div className="bg-green-500" style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }} />
          <div className="bg-amber-500" style={{ width: `${stats.total > 0 ? (stats.late / stats.total) * 100 : 0}%` }} />
          <div className="bg-red-500" style={{ width: `${stats.total > 0 ? (stats.absent / stats.total) * 100 : 0}%` }} />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Late</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Absent</span>
        </div>
      </PortalCard>

      {/* Per-course breakdown */}
      {byCourse.length > 0 && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">By Course</h3>
          <div className="space-y-4">
            {byCourse.map(([name, s]) => {
              const rate = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-ink-900">{name}</span>
                    <span className="text-sm text-ink-500">{rate}% ({s.present}/{s.total})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${rate >= 75 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </PortalCard>
      )}

      {/* Detailed records */}
      <PortalCard className="overflow-hidden">
        <div className="p-6 border-b border-ink-100">
          <h3 className="text-lg font-bold text-ink-900">Attendance History</h3>
        </div>
        {records.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance records" message="Your attendance will appear here once classes begin." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-ink-900">
                      {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-700">{r.course_name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'error'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-500">{r.notes || '—'}</td>
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
