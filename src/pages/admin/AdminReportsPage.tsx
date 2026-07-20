import {
  BarChart3, Users, GraduationCap, CreditCard, Award, BookOpen,
  Briefcase, Download, TrendingUp, FileText, DollarSign,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import {
  useAllStudentProfiles, useAllFaculty, useFeeRecords,
  useAllDepartments, useAllCoursesAdmin, useScholarships,
} from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalLoading,
  StatTile, EmptyState, Badge,
} from '../../components/portal-ui';

export default function AdminReportsPage() {
  useAuth();
  const { data: students, loading: lStudents } = useAllStudentProfiles();
  const { data: faculty, loading: lFaculty } = useAllFaculty();
  const { data: fees, loading: lFees } = useFeeRecords();
  const { data: departments, loading: lDepts } = useAllDepartments();
  const { data: courses, loading: lCourses } = useAllCoursesAdmin();
  const { data: scholarships, loading: lScholar } = useScholarships();

  const loading = lStudents || lFaculty || lFees || lDepts || lCourses || lScholar;

  // ---- Derived metrics ----
  const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const collectedFees = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const pendingFees = totalFees - collectedFees;
  const scholarshipAmount = scholarships.reduce((sum, s) => sum + (s.amount || 0), 0);
  const activeScholarships = scholarships.filter((s) => s.status === 'active' || s.status === 'open').length;

  // Enrollment per department
  const enrollmentByDept = departments.map((d) => {
    const count = students.filter((s: any) => s.department === d.id || s.department === d.name).length;
    return { name: d.name, count };
  });
  const maxEnrollment = Math.max(1, ...enrollmentByDept.map((e) => e.count));

  // Faculty per department
  const facultyByDept = departments.map((d) => {
    const count = faculty.filter((f) => f.department_id === d.id).length;
    return { name: d.name, count };
  });
  const maxFaculty = Math.max(1, ...facultyByDept.map((e) => e.count));

  // Courses per department
  const coursesByDept = departments.map((d) => {
    const count = courses.filter((c) => c.department === d.name || c.department === d.id).length;
    return { name: d.name, count };
  });
  const maxCourses = Math.max(1, ...coursesByDept.map((e) => e.count));

  // Fee status breakdown
  const feeStatuses = ['paid', 'partial', 'pending', 'overdue'];
  const feeStatusCounts = feeStatuses.map((st) => ({
    status: st,
    count: fees.filter((f) => f.status === st).length,
  }));
  const maxFeeStatus = Math.max(1, ...feeStatusCounts.map((e) => e.count));

  const barColor = (idx: number) => {
    const colors = ['bg-rose-500', 'bg-teal-500', 'bg-gold-500', 'bg-ink-700', 'bg-green-500'];
    return colors[idx % colors.length];
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Reports" subtitle="Comprehensive analytics dashboard" icon={BarChart3} />
        <PortalLoading />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Reports"
        subtitle="Comprehensive analytics across enrollment, finance, academics, and faculty"
        icon={BarChart3}
        action={
          <PortalButton variant="secondary" onClick={() => { /* UI only */ }}>
            <Download size={16} /> Export Report
          </PortalButton>
        }
      />

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Students" value={students.length} icon={Users} color="blue" />
        <StatTile label="Total Faculty" value={faculty.length} icon={Briefcase} color="teal" />
        <StatTile label="Fees Collected" value={`$${collectedFees.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatTile label="Pending Fees" value={`$${pendingFees.toLocaleString()}`} icon={CreditCard} color="red" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Departments" value={departments.length} icon={BookOpen} color="gold" />
        <StatTile label="Courses" value={courses.length} icon={FileText} color="ink" />
        <StatTile label="Active Scholarships" value={activeScholarships} icon={Award} color="teal" />
        <StatTile label="Scholarship Funds" value={`$${scholarshipAmount.toLocaleString()}`} icon={TrendingUp} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollment Report */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
              <Users className="text-rose-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Enrollment Report</h3>
          </div>
          <p className="text-sm text-ink-500 mb-4">Students per department</p>
          {enrollmentByDept.length === 0 ? (
            <EmptyState icon={Users} title="No enrollment data" message="No departments or students found." />
          ) : (
            <div className="space-y-3">
              {enrollmentByDept.map((e, i) => (
                <div key={e.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-ink-700 font-medium truncate">{e.name}</span>
                    <span className="text-ink-500">{e.count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor(i)} transition-all duration-500`}
                      style={{ width: `${(e.count / maxEnrollment) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        {/* Financial Report */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <CreditCard className="text-teal-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Financial Report</h3>
          </div>
          <p className="text-sm text-ink-500 mb-4">Fee collection status</p>
          <div className="space-y-3">
            {feeStatusCounts.map((f, i) => (
              <div key={f.status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-ink-700 font-medium capitalize">{f.status}</span>
                  <span className="text-ink-500">{f.count} records</span>
                </div>
                <div className="h-3 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor(i + 1)} transition-all duration-500`}
                    style={{ width: `${(f.count / maxFeeStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-bold text-green-700">${collectedFees.toLocaleString()}</div>
              <div className="text-xs text-ink-500">Collected</div>
            </div>
            <div>
              <div className="text-sm font-bold text-rose-600">${pendingFees.toLocaleString()}</div>
              <div className="text-xs text-ink-500">Pending</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gold-600">${scholarshipAmount.toLocaleString()}</div>
              <div className="text-xs text-ink-500">Scholarships</div>
            </div>
          </div>
        </PortalCard>

        {/* Academic Report */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gold-100 flex items-center justify-center">
              <BookOpen className="text-gold-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Academic Report</h3>
          </div>
          <p className="text-sm text-ink-500 mb-4">Courses per department</p>
          {coursesByDept.length === 0 ? (
            <EmptyState icon={BookOpen} title="No academic data" message="No courses or departments found." />
          ) : (
            <div className="space-y-3">
              {coursesByDept.map((e, i) => (
                <div key={e.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-ink-700 font-medium truncate">{e.name}</span>
                    <span className="text-ink-500">{e.count} courses</span>
                  </div>
                  <div className="h-3 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor(i + 2)} transition-all duration-500`}
                      style={{ width: `${(e.count / maxCourses) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        {/* Faculty Report */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center">
              <GraduationCap className="text-ink-700" size={18} />
            </div>
            <h3 className="text-lg font-bold text-ink-900">Faculty Report</h3>
          </div>
          <p className="text-sm text-ink-500 mb-4">Teachers per department</p>
          {facultyByDept.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No faculty data" message="No faculty or departments found." />
          ) : (
            <div className="space-y-3">
              {facultyByDept.map((e, i) => (
                <div key={e.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-ink-700 font-medium truncate">{e.name}</span>
                    <span className="text-ink-500">{e.count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor(i + 3)} transition-all duration-500`}
                      style={{ width: `${(e.count / maxFaculty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>
      </div>

      {/* Scholarships summary */}
      <PortalCard className="p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
            <Award className="text-teal-600" size={18} />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Scholarship Report</h3>
        </div>
        {scholarships.length === 0 ? (
          <EmptyState icon={Award} title="No scholarships" message="No scholarship records available." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-500">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {scholarships.map((s) => (
                  <tr key={s.id} className="border-b border-ink-50">
                    <td className="py-2 pr-4 font-medium text-ink-900">{s.name}</td>
                    <td className="py-2 pr-4 text-ink-700">${(s.amount || 0).toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={s.status === 'active' || s.status === 'open' ? 'success' : 'default'}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-ink-500">
                      {s.deadline ? new Date(s.deadline).toLocaleDateString() : '—'}
                    </td>
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
