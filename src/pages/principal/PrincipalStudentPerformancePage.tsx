import { useMemo } from 'react';
import {
  Users, GraduationCap, Award, AlertTriangle, TrendingUp,
  BarChart3, BookOpen,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { useAllStudentProfiles } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';

// Deterministic pseudo-random so simulated values are stable across renders
function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

type PerfStudent = {
  id: string;
  name: string;
  department: string;
  gpa: number;
  status: 'Excellent' | 'Good' | 'Average' | 'Below Average';
};

function bandFromGpa(gpa: number): PerfStudent['status'] {
  if (gpa >= 3.7) return 'Excellent';
  if (gpa >= 3.0) return 'Good';
  if (gpa >= 2.0) return 'Average';
  return 'Below Average';
}

function gradeFromGpa(gpa: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (gpa >= 3.7) return 'A';
  if (gpa >= 3.0) return 'B';
  if (gpa >= 2.0) return 'C';
  if (gpa >= 1.0) return 'D';
  return 'F';
}

const AVERAGE_GPA = 3.42;

export default function PrincipalStudentPerformancePage() {
  const { user } = useAuth();
  const { data: students, loading: studentsLoading } = useAllStudentProfiles();

  const loading = studentsLoading;

  // Simulated per-student performance (deterministic from id)
  const perfStudents: PerfStudent[] = useMemo(() => {
    return students.map((s: any, i: number) => {
      const seed = (s.id || '').toString().split('').reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0) || i + 1;
      const gpa = +(1.4 + seeded(seed) * 2.6).toFixed(2); // 1.4 - 4.0
      return {
        id: s.id,
        name: s.full_name || 'Unknown Student',
        department: s.program || 'General Studies',
        gpa,
        status: bandFromGpa(gpa),
      };
    });
  }, [students]);

  const totalStudents = students.length;
  const topPerformers = perfStudents.filter((s) => s.gpa >= 3.7).length;
  const atRisk = perfStudents.filter((s) => s.gpa < 2.0).length;

  // Performance distribution
  const distribution = useMemo(() => {
    const buckets = [
      { label: 'Excellent', range: 'GPA ≥ 3.7', color: 'bg-teal-600', count: 0 },
      { label: 'Good', range: '3.0 – 3.69', color: 'bg-amber-500', count: 0 },
      { label: 'Average', range: '2.0 – 2.99', color: 'bg-amber-300', count: 0 },
      { label: 'Below Average', range: 'GPA < 2.0', color: 'bg-rose-500', count: 0 },
    ];
    perfStudents.forEach((s) => {
      if (s.gpa >= 3.7) buckets[0].count++;
      else if (s.gpa >= 3.0) buckets[1].count++;
      else if (s.gpa >= 2.0) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [perfStudents]);
  const distMax = Math.max(...distribution.map((b) => b.count), 1);

  // Department-wise average GPA (simulated from student programs)
  const deptPerf = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    perfStudents.forEach((s) => {
      const key = s.department || 'General Studies';
      const cur = map.get(key) || { sum: 0, count: 0 };
      cur.sum += s.gpa;
      cur.count += 1;
      map.set(key, cur);
    });
    const arr = Array.from(map.entries()).map(([label, v]) => ({
      label,
      avg: v.count ? +(v.sum / v.count).toFixed(2) : 0,
      count: v.count,
    }));
    arr.sort((a, b) => b.avg - a.avg);
    return arr;
  }, [perfStudents]);
  const deptGpaMax = Math.max(...deptPerf.map((d) => d.avg), 4);

  // Top 10 students
  const top10 = useMemo(() => [...perfStudents].sort((a, b) => b.gpa - a.gpa).slice(0, 10), [perfStudents]);

  // At-risk students (GPA < 2.0)
  const atRiskList = useMemo(() => perfStudents.filter((s) => s.gpa < 2.0).sort((a, b) => a.gpa - b.gpa), [perfStudents]);

  // Grade distribution (A/B/C/D/F)
  const gradeDist = useMemo(() => {
    const grades = [
      { label: 'A', color: 'bg-teal-600', count: 0 },
      { label: 'B', color: 'bg-amber-500', count: 0 },
      { label: 'C', color: 'bg-amber-300', count: 0 },
      { label: 'D', color: 'bg-rose-400', count: 0 },
      { label: 'F', color: 'bg-rose-600', count: 0 },
    ];
    perfStudents.forEach((s) => {
      const g = gradeFromGpa(s.gpa);
      const idx = grades.findIndex((x) => x.label === g);
      if (idx >= 0) grades[idx].count++;
    });
    return grades;
  }, [perfStudents]);
  const gradeMax = Math.max(...gradeDist.map((g) => g.count), 1);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Student Performance" subtitle="Academic performance across the student body" icon={Users} />
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
        title="Student Performance"
        subtitle="Academic performance, distribution, and at-risk monitoring"
        icon={Users}
        action={
          <PortalButton variant="secondary" onClick={() => navigateTo('/principal/dashboard')}>
            Dashboard
          </PortalButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Students" value={totalStudents} icon={Users} color="ink" />
        <StatTile label="Average GPA" value={AVERAGE_GPA.toFixed(2)} icon={TrendingUp} color="gold" />
        <StatTile label="Top Performers" value={topPerformers} icon={Award} color="green" />
        <StatTile label="At-Risk Students" value={atRisk} icon={AlertTriangle} color="red" />
      </div>

      {/* Performance distribution + Grade distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Performance Distribution</h2>
          </div>
          {totalStudents === 0 ? (
            <EmptyState icon={BarChart3} title="No student data" message="Performance distribution will appear once students are enrolled." />
          ) : (
            <div className="space-y-4">
              {distribution.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-sm font-medium text-ink-700">{b.label}</span>
                      <span className="text-xs text-ink-500 ml-2">{b.range}</span>
                    </div>
                    <span className="text-sm font-semibold text-ink-900">{b.count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-ink-50 overflow-hidden">
                    <div
                      className={`h-full ${b.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(b.count / distMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Grade Distribution</h2>
          </div>
          {totalStudents === 0 ? (
            <EmptyState icon={GraduationCap} title="No grades yet" message="Grade distribution will appear once results are recorded." />
          ) : (
            <>
              <div className="flex items-end justify-between gap-4 h-48">
                {gradeDist.map((g) => (
                  <div key={g.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-sm font-semibold text-ink-900">{g.count}</div>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={`w-full ${g.color} rounded-t-md transition-all duration-500`}
                        style={{ height: `${(g.count / gradeMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-500 font-medium">{g.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-500 mt-4">Simulated grade distribution derived from GPA bands.</p>
            </>
          )}
        </PortalCard>
      </div>

      {/* Department-wise performance comparison */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={18} className="text-amber-600" />
          <h2 className="text-lg font-semibold text-ink-900">Department-wise Performance</h2>
        </div>
        {deptPerf.length === 0 ? (
          <EmptyState icon={BookOpen} title="No department data" message="Department performance will appear once students are assigned programs." />
        ) : (
          <div className="space-y-3">
            {deptPerf.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <div className="w-40 text-sm text-ink-700 truncate" title={d.label}>{d.label}</div>
                <div className="flex-1 h-6 rounded-full bg-ink-50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${(d.avg / deptGpaMax) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm font-semibold text-ink-900">{d.avg.toFixed(2)}</div>
                <div className="w-20 text-right text-xs text-ink-500">{d.count} students</div>
              </div>
            ))}
          </div>
        )}
      </PortalCard>

      {/* Top 10 students + At-risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Top 10 Students</h2>
          </div>
          {top10.length === 0 ? (
            <EmptyState icon={Award} title="No top performers" message="Top students will appear once performance data is available." />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-ink-100">
                    <th className="px-2 py-3 font-semibold">#</th>
                    <th className="px-2 py-3 font-semibold">Name</th>
                    <th className="px-2 py-3 font-semibold">Department</th>
                    <th className="px-2 py-3 font-semibold">GPA</th>
                    <th className="px-2 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {top10.map((s, i) => (
                    <tr key={s.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="px-2 py-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-amber-500 text-white' : 'bg-ink-100 text-ink-700'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-2 py-3 font-medium text-ink-900 truncate">{s.name}</td>
                      <td className="px-2 py-3 text-ink-600 truncate">{s.department}</td>
                      <td className="px-2 py-3 font-semibold text-amber-700">{s.gpa.toFixed(2)}</td>
                      <td className="px-2 py-3">
                        <Badge variant={s.status === 'Excellent' ? 'success' : 'gold'}>{s.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PortalCard>

        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-rose-600" />
            <h2 className="text-lg font-semibold text-ink-900">At-Risk Students</h2>
          </div>
          {atRiskList.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No at-risk students" message="No students currently fall below the 2.0 GPA threshold." />
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {atRiskList.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-rose-50 border border-rose-100">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink-900 truncate">{s.name}</div>
                    <div className="text-xs text-ink-500 truncate">{s.department}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-rose-700">{s.gpa.toFixed(2)}</span>
                    <Badge variant="error">At Risk</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>
      </div>

      <p className="text-xs text-ink-400 px-1">
        Note: GPA values, performance bands, and grade distribution are simulated for demonstration. Student counts use live enrollment data.
      </p>
    </div>
  );
}
