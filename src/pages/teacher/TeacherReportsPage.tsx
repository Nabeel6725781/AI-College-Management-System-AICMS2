import { useMemo } from 'react';
import { BarChart3, TrendingUp, Award, Users, Download } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useMarks, useTeacherAssignments, useTeacherTimetable } from '../../lib/teacher-hooks';
import { PortalCard, PortalPageHeader, PortalLoading, Badge, EmptyState, StatTile } from '../../components/portal-ui';

export default function TeacherReportsPage() {
  const { user } = useAuth();
  const { data: marks, loading } = useMarks(user?.id);
  const { data: assignments } = useTeacherAssignments(user?.id);
  const { data: timetable } = useTeacherTimetable(user?.id);

  const stats = useMemo(() => {
    if (marks.length === 0) return { avg: 0, highest: 0, lowest: 0, passing: 0 };
    const scores = marks.map((m) => (Number(m.score) / Number(m.max_score)) * 100);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passing = scores.filter((s) => s >= 60).length;
    return { avg: Math.round(avg), highest: Math.round(highest), lowest: Math.round(lowest), passing };
  }, [marks]);

  const byCourse = useMemo(() => {
    const map: Record<string, { scores: number[]; count: number }> = {};
    marks.forEach((m) => {
      if (!map[m.course_title]) map[m.course_title] = { scores: [], count: 0 };
      map[m.course_title].scores.push((Number(m.score) / Number(m.max_score)) * 100);
      map[m.course_title].count++;
    });
    return Object.entries(map).map(([course, data]) => ({
      course,
      avg: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      count: data.count,
    }));
  }, [marks]);

  const gradeDistribution = useMemo(() => {
    const dist: Record<string, number> = { 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0, 'C+': 0, 'C': 0, 'C-': 0, 'D': 0, 'F': 0 };
    marks.forEach((m) => {
      if (dist[m.grade] !== undefined) dist[m.grade]++;
    });
    return Object.entries(dist).filter(([, count]) => count > 0);
  }, [marks]);

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Reports"
        subtitle="Analytics and insights for your classes"
        icon={BarChart3}
        action={
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-ink-900 border border-ink-200 hover:border-ink-900 transition-all">
            <Download size={16} /> Export
          </button>
        }
      />

      {marks.length === 0 ? (
        <EmptyState icon={BarChart3} title="No data for reports" message="Enter marks for your students to generate analytics and reports." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Class Average" value={`${stats.avg}%`} icon={TrendingUp} color="teal" />
            <StatTile label="Highest Score" value={`${stats.highest}%`} icon={Award} color="green" />
            <StatTile label="Lowest Score" value={`${stats.lowest}%`} icon={Award} color="red" />
            <StatTile label="Passing Rate" value={`${Math.round((stats.passing / marks.length) * 100)}%`} icon={Users} color="blue" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Course performance */}
            <PortalCard className="p-6">
              <h3 className="text-lg font-bold text-ink-900 mb-4">Performance by Course</h3>
              <div className="space-y-4">
                {byCourse.map((c) => (
                  <div key={c.course}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-ink-900 truncate">{c.course}</span>
                      <span className="text-sm text-ink-500">{c.avg}% · {c.count} entries</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.avg >= 85 ? 'bg-green-500' : c.avg >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${c.avg}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </PortalCard>

            {/* Grade distribution */}
            <PortalCard className="p-6">
              <h3 className="text-lg font-bold text-ink-900 mb-4">Grade Distribution</h3>
              <div className="space-y-3">
                {gradeDistribution.map(([grade, count]) => {
                  const pct = Math.round((count / marks.length) * 100);
                  return (
                    <div key={grade} className="flex items-center gap-3">
                      <Badge variant={grade.startsWith('A') ? 'success' : grade.startsWith('B') ? 'info' : grade.startsWith('C') ? 'warning' : 'error'}>
                        {grade}
                      </Badge>
                      <div className="flex-1 h-6 rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${grade.startsWith('A') ? 'bg-green-500' : grade.startsWith('B') ? 'bg-blue-500' : grade.startsWith('C') ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-ink-700 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </PortalCard>
          </div>

          {/* Summary table */}
          <PortalCard className="p-6 mt-6">
            <h3 className="text-lg font-bold text-ink-900 mb-4">Summary</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-ink-50">
                <div className="text-2xl font-bold text-ink-900">{new Set(marks.map((m) => m.student_name)).size}</div>
                <div className="text-sm text-ink-500 mt-1">Total Students</div>
              </div>
              <div className="p-4 rounded-lg bg-ink-50">
                <div className="text-2xl font-bold text-ink-900">{new Set(timetable.map((t) => t.course_title)).size}</div>
                <div className="text-sm text-ink-500 mt-1">Active Courses</div>
              </div>
              <div className="p-4 rounded-lg bg-ink-50">
                <div className="text-2xl font-bold text-ink-900">{assignments.filter((a) => a.status === 'active').length}</div>
                <div className="text-sm text-ink-500 mt-1">Active Assignments</div>
              </div>
            </div>
          </PortalCard>
        </>
      )}
    </div>
  );
}
