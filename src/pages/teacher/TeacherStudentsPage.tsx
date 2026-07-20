import { useMemo, useState } from 'react';
import { Users, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useMarks } from '../../lib/teacher-hooks';
import { PortalCard, PortalPageHeader, PortalLoading, Badge, EmptyState } from '../../components/portal-ui';

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const { data: marks, loading } = useMarks(user?.id);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const students = useMemo(() => {
    const map: Record<string, { name: string; studentId: string; courses: Record<string, { scores: number[]; grades: string[] }> }> = {};
    marks.forEach((m) => {
      if (!map[m.student_name]) {
        map[m.student_name] = { name: m.student_name, studentId: m.student_id, courses: {} };
      }
      if (!map[m.student_name].courses[m.course_title]) {
        map[m.student_name].courses[m.course_title] = { scores: [], grades: [] };
      }
      map[m.student_name].courses[m.course_title].scores.push(Number(m.score));
      map[m.student_name].courses[m.course_title].grades.push(m.grade);
    });
    return Object.values(map);
  }, [marks]);

  const courses = [...new Set(marks.map((m) => m.course_title))];

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchCourse = !courseFilter || s.courses[courseFilter];
    return matchSearch && matchCourse;
  });

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Students"
        subtitle={`${students.length} students across your classes`}
        icon={Users}
      />

      {students.length === 0 ? (
        <EmptyState icon={Users} title="No students" message="Students will appear here once you enter marks or have classes assigned." />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
            >
              <option value="">All Courses</option>
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => {
              const allScores = Object.values(s.courses).flatMap((c) => c.scores);
              const avg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
              return (
                <PortalCard key={s.studentId} className="p-5 card-hover">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-ink-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gold-400">{s.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-ink-900 text-sm truncate">{s.name}</h3>
                      <p className="text-xs text-ink-500">{s.studentId}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(s.courses).map(([course, data]) => {
                      const courseAvg = data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0;
                      return (
                        <div key={course} className="flex items-center justify-between text-xs">
                          <span className="text-ink-600 truncate">{course}</span>
                          <Badge variant={courseAvg >= 85 ? 'success' : courseAvg >= 75 ? 'warning' : 'error'}>
                            {courseAvg}%
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                    <span className="text-xs text-ink-500">Overall Average</span>
                    <span className="text-sm font-bold text-ink-900">{avg}%</span>
                  </div>
                </PortalCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
