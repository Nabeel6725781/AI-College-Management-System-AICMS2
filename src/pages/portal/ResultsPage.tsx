import { useMemo } from 'react';
import { Award, Download } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useResults } from '../../lib/portal-hooks';
import { PortalCard, PortalPageHeader, PortalLoading, Badge, EmptyState } from '../../components/portal-ui';

export default function ResultsPage() {
  const { user } = useAuth();
  const { data: results, loading } = useResults(user?.id);

  const stats = useMemo(() => {
    if (results.length === 0) return { gpa: '—', total: 0, credits: 0, bestGrade: '—' };
    const totalPoints = results.reduce((sum, r) => sum + (r.grade_points || 0) * (r.credits || 3), 0);
    const totalCredits = results.reduce((sum, r) => sum + (r.credits || 3), 0);
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';
    const best = results.reduce((best, r) => (r.grade_points > best.grade_points ? r : best));
    return { gpa, total: results.length, credits: totalCredits, bestGrade: best.grade || '—' };
  }, [results]);

  const bySemester = useMemo(() => {
    const map: Record<string, typeof results> = {};
    results.forEach((r) => {
      const sem = r.semester || 'Current Semester';
      if (!map[sem]) map[sem] = [];
      map[sem].push(r);
    });
    return Object.entries(map);
  }, [results]);

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Results"
        subtitle="View your academic performance and grades"
        icon={Award}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PortalCard className="p-6 text-center">
          <div className="text-3xl font-bold text-ink-900">{stats.gpa}</div>
          <div className="text-sm text-ink-500 mt-1">Cumulative GPA</div>
        </PortalCard>
        <PortalCard className="p-6 text-center">
          <div className="text-3xl font-bold text-ink-900">{stats.total}</div>
          <div className="text-sm text-ink-500 mt-1">Results Published</div>
        </PortalCard>
        <PortalCard className="p-6 text-center">
          <div className="text-3xl font-bold text-ink-900">{stats.credits}</div>
          <div className="text-sm text-ink-500 mt-1">Credits Earned</div>
        </PortalCard>
        <PortalCard className="p-6 text-center">
          <div className="text-3xl font-bold text-gold-600">{stats.bestGrade}</div>
          <div className="text-sm text-ink-500 mt-1">Best Grade</div>
        </PortalCard>
      </div>

      {results.length === 0 ? (
        <EmptyState icon={Award} title="No results yet" message="Your exam and assessment results will appear here once published." />
      ) : (
        <div className="space-y-6">
          {bySemester.map(([semester, semResults]) => (
            <PortalCard key={semester} className="overflow-hidden">
              <div className="p-6 border-b border-ink-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink-900">{semester}</h3>
                <button className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
                  <Download size={14} /> Transcript
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ink-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Exam Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Grade Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {semResults.map((r) => (
                      <tr key={r.id} className="hover:bg-ink-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-ink-900">{r.course_name}</td>
                        <td className="px-6 py-4 text-sm text-ink-500">{r.course_code || '—'}</td>
                        <td className="px-6 py-4 text-sm text-ink-700">{r.exam_type}</td>
                        <td className="px-6 py-4 text-sm text-ink-700">{r.credits}</td>
                        <td className="px-6 py-4">
                          <Badge variant={r.grade_points >= 3.5 ? 'success' : r.grade_points >= 2.5 ? 'warning' : 'error'}>
                            {r.grade || '—'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-ink-900">{r.grade_points.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
