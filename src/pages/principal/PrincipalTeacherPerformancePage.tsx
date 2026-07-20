import { useMemo } from 'react';
import {
  GraduationCap, Star, BookOpen, FlaskConical, Award,
  BarChart3, Users,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { useAllFaculty, useAllDepartments, useAllCoursesAdmin } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { FacultyMember, Department, Course } from '../../lib/supabase';

// Deterministic pseudo-random for stable simulated values
function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

type FacultyPerf = {
  id: string;
  name: string;
  title: string;
  department: string;
  courses: number;
  students: number;
  rating: number;
  research: number;
  status: 'Excellent' | 'Strong' | 'Satisfactory' | 'Needs Support';
};

function statusFromRating(r: number): FacultyPerf['status'] {
  if (r >= 4.5) return 'Excellent';
  if (r >= 4.0) return 'Strong';
  if (r >= 3.0) return 'Satisfactory';
  return 'Needs Support';
}

const AVERAGE_RATING = 4.3;

export default function PrincipalTeacherPerformancePage() {
  const { user } = useAuth();
  const { data: faculty, loading: facultyLoading } = useAllFaculty();
  const { data: departments, loading: deptLoading } = useAllDepartments();
  const { data: courses, loading: coursesLoading } = useAllCoursesAdmin();

  const loading = facultyLoading || deptLoading || coursesLoading;

  const deptName = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((d: Department) => map.set(d.id, d.name));
    return map;
  }, [departments]);

  // Courses per instructor (real data from courses table)
  const coursesPerInstructor = useMemo(() => {
    const map = new Map<string, number>();
    courses.forEach((c: Course) => {
      const key = c.instructor || 'Unassigned';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [courses]);

  // Simulated faculty performance
  const facultyPerf: FacultyPerf[] = useMemo(() => {
    return faculty.map((f: FacultyMember, i: number) => {
      const seed = (f.id || '').toString().split('').reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0) || i + 1;
      const rating = +(2.8 + seeded(seed) * 2.2).toFixed(1); // 2.8 - 5.0
      const courseCount = coursesPerInstructor.get(f.name) ?? Math.floor(seeded(seed + 7) * 5) + 1;
      const studentCount = courseCount * (15 + Math.floor(seeded(seed + 3) * 25));
      const research = Math.floor(seeded(seed + 11) * 8);
      return {
        id: f.id,
        name: f.name,
        title: f.title || 'Faculty',
        department: deptName.get(f.department_id || '') || f.title || 'General',
        courses: courseCount,
        students: studentCount,
        rating,
        research,
        status: statusFromRating(rating),
      };
    });
  }, [faculty, coursesPerInstructor, deptName]);

  const totalFaculty = faculty.length;
  const totalCourses = courses.length;
  const avgRating = facultyPerf.length
    ? +(facultyPerf.reduce((s, f) => s + f.rating, 0) / facultyPerf.length).toFixed(1)
    : AVERAGE_RATING;
  const totalResearch = facultyPerf.reduce((s, f) => s + f.research, 0);
  const topPerformers = facultyPerf.filter((f) => f.rating >= 4.5);

  // Department-wise faculty distribution
  const deptDist = useMemo(() => {
    const map = new Map<string, number>();
    facultyPerf.forEach((f) => {
      const key = f.department || 'General';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [facultyPerf]);
  const deptDistMax = Math.max(...deptDist.map((d) => d.value), 1);

  // Faculty workload (courses per teacher) distribution buckets
  const workload = useMemo(() => {
    const buckets = [
      { label: '1–2 courses', color: 'bg-teal-600', count: 0 },
      { label: '3–4 courses', color: 'bg-amber-500', count: 0 },
      { label: '5–6 courses', color: 'bg-amber-600', count: 0 },
      { label: '7+ courses', color: 'bg-rose-500', count: 0 },
    ];
    facultyPerf.forEach((f) => {
      if (f.courses <= 2) buckets[0].count++;
      else if (f.courses <= 4) buckets[1].count++;
      else if (f.courses <= 6) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [facultyPerf]);
  const workloadMax = Math.max(...workload.map((b) => b.count), 1);

  // Research output by department (simulated)
  const researchByDept = useMemo(() => {
    const map = new Map<string, number>();
    facultyPerf.forEach((f) => {
      const key = f.department || 'General';
      map.set(key, (map.get(key) || 0) + f.research);
    });
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [facultyPerf]);
  const researchMax = Math.max(...researchByDept.map((d) => d.value), 1);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Teacher Performance" subtitle="Faculty ratings, workload, and research output" icon={GraduationCap} />
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
        title="Teacher Performance"
        subtitle="Faculty ratings, workload distribution, and research output"
        icon={GraduationCap}
        action={
          <PortalButton variant="secondary" onClick={() => navigateTo('/principal/dashboard')}>
            Dashboard
          </PortalButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Faculty" value={totalFaculty} icon={Users} color="ink" />
        <StatTile label="Average Rating" value={`${avgRating}/5`} icon={Star} color="gold" />
        <StatTile label="Courses Taught" value={totalCourses} icon={BookOpen} color="green" />
        <StatTile label="Research Output" value={totalResearch} icon={FlaskConical} color="teal" />
      </div>

      {/* Top performers highlight */}
      {topPerformers.length > 0 && (
        <PortalCard className="p-6 mb-6 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Top Performers</h2>
            <Badge variant="gold">Rating ≥ 4.5</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            {topPerformers.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-amber-200 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {f.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink-900 truncate">{f.name}</div>
                  <div className="text-xs text-ink-500 truncate">{f.department}</div>
                </div>
                <div className="flex items-center gap-1 text-amber-600 font-semibold text-sm flex-shrink-0">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  {f.rating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      )}

      {/* Faculty distribution + Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Faculty by Department</h2>
          </div>
          {deptDist.length === 0 ? (
            <EmptyState icon={BarChart3} title="No faculty data" message="Department distribution will appear once faculty are assigned." />
          ) : (
            <div className="space-y-3">
              {deptDist.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <div className="w-40 text-sm text-ink-700 truncate" title={d.label}>{d.label}</div>
                  <div className="flex-1 h-6 rounded-full bg-ink-50 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${(d.value / deptDistMax) * 100}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-semibold text-ink-900">{d.value}</div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={18} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-ink-900">Faculty Workload Analysis</h2>
          </div>
          {facultyPerf.length === 0 ? (
            <EmptyState icon={BookOpen} title="No workload data" message="Workload analysis will appear once faculty and courses are loaded." />
          ) : (
            <div className="space-y-4">
              {workload.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-ink-700">{b.label}</span>
                    <span className="text-sm font-semibold text-ink-900">{b.count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-ink-50 overflow-hidden">
                    <div
                      className={`h-full ${b.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(b.count / workloadMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>
      </div>

      {/* Research output by department */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <FlaskConical size={18} className="text-amber-600" />
          <h2 className="text-lg font-semibold text-ink-900">Research Output by Department</h2>
        </div>
        {researchByDept.length === 0 ? (
          <EmptyState icon={FlaskConical} title="No research data" message="Research output will appear once faculty data is available." />
        ) : (
          <div className="space-y-3">
            {researchByDept.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <div className="w-40 text-sm text-ink-700 truncate" title={d.label}>{d.label}</div>
                <div className="flex-1 h-6 rounded-full bg-ink-50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(d.value / researchMax) * 100}%` }}
                  />
                </div>
                <div className="w-10 text-right text-sm font-semibold text-ink-900">{d.value}</div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-ink-400 mt-4">Research output values are simulated for demonstration.</p>
      </PortalCard>

      {/* Faculty performance table */}
      <PortalCard className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <GraduationCap size={18} className="text-amber-600" />
          <h2 className="text-lg font-semibold text-ink-900">Faculty Performance</h2>
        </div>
        {facultyPerf.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No faculty found" message="Faculty performance will appear once faculty members are added." />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-500 border-b border-ink-100">
                  <th className="px-2 py-3 font-semibold">Name</th>
                  <th className="px-2 py-3 font-semibold">Department</th>
                  <th className="px-2 py-3 font-semibold">Courses</th>
                  <th className="px-2 py-3 font-semibold">Students</th>
                  <th className="px-2 py-3 font-semibold">Rating</th>
                  <th className="px-2 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {facultyPerf.map((f) => (
                  <tr key={f.id} className={`hover:bg-ink-50/60 transition-colors ${f.rating >= 4.5 ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-ink-900 truncate">{f.name}</div>
                          <div className="text-xs text-ink-500 truncate">{f.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-ink-600 truncate">{f.department}</td>
                    <td className="px-2 py-3 text-ink-700">{f.courses}</td>
                    <td className="px-2 py-3 text-ink-700">{f.students}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className={`${f.rating >= 4.5 ? 'fill-amber-500 text-amber-500' : 'text-ink-400'}`} />
                        <span className={`font-semibold ${f.rating >= 4.5 ? 'text-amber-700' : 'text-ink-700'}`}>{f.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <Badge
                        variant={
                          f.status === 'Excellent'
                            ? 'success'
                            : f.status === 'Strong'
                            ? 'gold'
                            : f.status === 'Satisfactory'
                            ? 'info'
                            : 'error'
                        }
                      >
                        {f.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>

      <p className="text-xs text-ink-400 mt-4 px-1">
        Note: Ratings, student counts, and research output are simulated. Faculty count and courses taught use live data.
      </p>
    </div>
  );
}
