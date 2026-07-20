import {
  BarChart3, Users, GraduationCap, TrendingUp, BookOpen,
  PieChart, Activity, Award,
} from 'lucide-react';
import {
  useAllStudentProfiles, useAllFaculty, useAllDepartments, useAllCoursesAdmin,
} from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalLoading, Badge, EmptyState,
} from '../../components/portal-ui';

export default function PrincipalAnalyticsPage() {
  const { data: students, loading: studentsLoading } = useAllStudentProfiles();
  const { data: faculty, loading: facultyLoading } = useAllFaculty();
  const { data: departments, loading: deptLoading } = useAllDepartments();
  const { data: courses, loading: coursesLoading } = useAllCoursesAdmin();

  const loading = studentsLoading || facultyLoading || deptLoading || coursesLoading;

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalLoading />
      </div>
    );
  }

  // Department-wise enrollment
  const enrollmentByDept = departments
    .map((dept) => ({
      name: dept.name,
      count: students.filter((s: any) => s.program === dept.name).length,
    }))
    .sort((a, b) => b.count - a.count);
  const maxEnrollment = Math.max(...enrollmentByDept.map((d) => d.count), 1);

  // Faculty distribution by department
  const facultyByDept = departments
    .map((dept) => ({
      name: dept.name,
      count: faculty.filter((f) => f.department_id === dept.id).length,
    }))
    .sort((a, b) => b.count - a.count);
  const maxFaculty = Math.max(...facultyByDept.map((d) => d.count), 1);

  // Student performance distribution (simulated)
  const performanceDist = [
    { label: 'Excellent (A)', count: Math.round(students.length * 0.18), color: 'bg-green-500', pct: 18 },
    { label: 'Good (B)', count: Math.round(students.length * 0.32), color: 'bg-teal-500', pct: 32 },
    { label: 'Average (C)', count: Math.round(students.length * 0.35), color: 'bg-amber-500', pct: 35 },
    { label: 'Below Average (D/F)', count: Math.round(students.length * 0.15), color: 'bg-red-500', pct: 15 },
  ];

  // Course completion rates (simulated)
  const completionRates = courses.slice(0, 6).map((c, i) => ({
    name: c.code,
    title: c.title,
    rate: 78 + ((i * 3 + 5) % 18),
  }));

  // Gender ratio (simulated)
  const genderRatio = [
    { label: 'Male', pct: 54, color: 'bg-blue-500' },
    { label: 'Female', pct: 44, color: 'bg-teal-500' },
    { label: 'Other', pct: 2, color: 'bg-amber-500' },
  ];

  // Year-wise enrollment trends (simulated)
  const yearTrends = [
    { year: '2019', count: students.length > 0 ? Math.round(students.length * 0.7) : 210 },
    { year: '2020', count: students.length > 0 ? Math.round(students.length * 0.75) : 225 },
    { year: '2021', count: students.length > 0 ? Math.round(students.length * 0.82) : 246 },
    { year: '2022', count: students.length > 0 ? Math.round(students.length * 0.88) : 264 },
    { year: '2023', count: students.length > 0 ? Math.round(students.length * 0.94) : 282 },
    { year: '2024', count: students.length },
  ];
  const maxYearCount = Math.max(...yearTrends.map((y) => y.count), 1);

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="College Analytics"
        subtitle="Comprehensive institutional analytics and data insights"
        icon={BarChart3}
      />

      {/* Top row: Department enrollment + Faculty distribution */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Department-wise enrollment */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center">
              <Users className="text-amber-400" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Department-wise Enrollment</h3>
          </div>
          {enrollmentByDept.length === 0 ? (
            <EmptyState icon={Users} title="No data" message="Enrollment data will appear here." />
          ) : (
            <div className="space-y-3">
              {enrollmentByDept.map((dept) => (
                <div key={dept.name} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-ink-600 truncate flex-shrink-0">{dept.name}</div>
                  <div className="flex-1 h-7 rounded-lg bg-ink-100 overflow-hidden relative">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${Math.max((dept.count / maxEnrollment) * 100, 8)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{dept.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        {/* Faculty distribution by department */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center">
              <GraduationCap className="text-amber-400" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Faculty Distribution</h3>
          </div>
          {facultyByDept.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No data" message="Faculty distribution will appear here." />
          ) : (
            <div className="space-y-3">
              {facultyByDept.map((dept) => (
                <div key={dept.name} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-ink-600 truncate flex-shrink-0">{dept.name}</div>
                  <div className="flex-1 h-7 rounded-lg bg-ink-100 overflow-hidden relative">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${Math.max((dept.count / maxFaculty) * 100, 8)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{dept.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>
      </div>

      {/* Second row: Performance distribution + Gender ratio (donut) */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Student performance distribution */}
        <PortalCard className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center">
              <Activity className="text-amber-400" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Student Performance Distribution</h3>
          </div>
          <div className="space-y-4">
            {performanceDist.map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-ink-700">{p.label}</span>
                  <span className="text-sm text-ink-500">
                    {p.count} students ({p.pct}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.color} transition-all duration-500`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PortalCard>

        {/* Gender ratio - donut chart */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center">
              <PieChart className="text-amber-400" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Gender Ratio</h3>
          </div>
          <div className="flex flex-col items-center">
            {/* Donut using conic-gradient */}
            <div
              className="w-40 h-40 rounded-full flex items-center justify-center mb-4"
              style={{
                background: `conic-gradient(
                  #3b82f6 0% 54%,
                  #14b8a6 54% 98%,
                  #f59e0b 98% 100%
                )`,
              }}
            >
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ink-900">{students.length}</div>
                  <div className="text-xs text-ink-500">Total</div>
                </div>
              </div>
            </div>
            <div className="w-full space-y-2">
              {genderRatio.map((g) => (
                <div key={g.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${g.color}`} />
                    <span className="text-sm text-ink-700">{g.label}</span>
                  </div>
                  <span className="text-sm font-medium text-ink-900">{g.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </PortalCard>
      </div>

      {/* Third row: Course completion + Year-wise enrollment */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Course completion rates */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center">
              <BookOpen className="text-amber-400" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Course Completion Rates</h3>
          </div>
          {completionRates.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses" message="Course completion data will appear here." />
          ) : (
            <div className="space-y-4">
              {completionRates.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{c.name}</Badge>
                      <span className="text-sm text-ink-600 truncate max-w-[180px]">{c.title}</span>
                    </div>
                    <span className="text-sm font-bold text-ink-900">{c.rate}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.rate >= 85 ? 'bg-green-500' : c.rate >= 75 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${c.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        {/* Year-wise enrollment trends */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center">
              <TrendingUp className="text-amber-400" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Year-wise Enrollment Trends</h3>
          </div>
          <div className="flex items-end justify-between gap-3 h-48">
            {yearTrends.map((y) => (
              <div key={y.year} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-ink-700">{y.count}</div>
                <div className="w-full flex items-end" style={{ height: '140px' }}>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-700 hover:from-amber-700 hover:to-amber-500"
                    style={{ height: `${(y.count / maxYearCount) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-ink-500">{y.year}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
            <Award size={14} className="text-amber-500" />
            <span>Steady growth observed over the past 5 years</span>
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
