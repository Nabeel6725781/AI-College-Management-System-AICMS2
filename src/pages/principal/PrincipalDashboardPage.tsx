import {
  LayoutDashboard, Users, GraduationCap, DollarSign, FileText,
  ArrowRight, TrendingUp, AlertCircle, Activity, BarChart3,
  Target, BrainCircuit, CheckCircle, Award,
} from 'lucide-react';
import {
  useAdmissions, useAllStudentProfiles, useAllFaculty, useFeeRecords,
  useAllDepartments, useScholarships, useAdminNotifications, useAuditLogs,
} from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, StatTile, Badge, PortalLoading, EmptyState,
} from '../../components/portal-ui';
import { navigateTo } from '../../lib/router';

export default function PrincipalDashboardPage() {
  const { data: admissions, loading: admissionsLoading } = useAdmissions();
  const { data: students, loading: studentsLoading } = useAllStudentProfiles();
  const { data: faculty, loading: facultyLoading } = useAllFaculty();
  const { data: fees, loading: feesLoading } = useFeeRecords();
  const { data: departments } = useAllDepartments();
  const { data: scholarships } = useScholarships();
  const { data: notifications } = useAdminNotifications();
  const { data: auditLogs } = useAuditLogs();

  const loading = admissionsLoading || studentsLoading || facultyLoading || feesLoading;

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalLoading />
      </div>
    );
  }

  const pendingAdmissions = admissions.filter(
    (a) => a.status === 'pending' || a.status === 'draft'
  );
  const totalRevenue = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const pendingFees = fees.filter((f) => f.status === 'pending' || f.status === 'partial');
  const overdueFees = fees.filter((f) => f.status === 'overdue');
  const pendingRevenue = pendingFees.reduce(
    (sum, f) => sum + (f.amount - (f.paid_amount || 0)),
    0
  );
  const overdueRevenue = overdueFees.reduce(
    (sum, f) => sum + (f.amount - (f.paid_amount || 0)),
    0
  );

  // Enrollment by department
  const enrollmentByDept = departments
    .map((dept) => ({
      name: dept.name,
      count: students.filter((s: any) => s.program === dept.name).length,
    }))
    .sort((a, b) => b.count - a.count);
  const maxEnrollment = Math.max(...enrollmentByDept.map((d) => d.count), 1);

  const recentAdmissions = admissions.slice(0, 5);
  const recentAudit = auditLogs.slice(0, 5);
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  const quickLinks = [
    { label: 'KPIs', route: '/principal/kpis', icon: Target, desc: 'Key performance indicators' },
    { label: 'Analytics', route: '/principal/analytics', icon: BarChart3, desc: 'College-wide analytics' },
    { label: 'AI Insights', route: '/principal/ai-insights', icon: BrainCircuit, desc: 'AI-powered intelligence' },
  ];

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Executive Dashboard"
        subtitle="Institutional overview and strategic insights"
        icon={LayoutDashboard}
        action={
          <button
            onClick={() => navigateTo('/principal/ai-insights')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <BrainCircuit size={16} /> AI Insights
          </button>
        }
      />

      {/* Top row: 4 StatTiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Students" value={students.length} icon={Users} color="blue" />
        <StatTile label="Total Faculty" value={faculty.length} icon={GraduationCap} color="teal" />
        <StatTile
          label="Total Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          icon={DollarSign}
          color="green"
        />
        <StatTile
          label="Pending Admissions"
          value={pendingAdmissions.length}
          icon={FileText}
          color="gold"
        />
      </div>

      {/* Second row: 2-column layout */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Left (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrollment by Department */}
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ink-900">Enrollment by Department</h3>
              <button
                onClick={() => navigateTo('/principal/analytics')}
                className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"
              >
                Details <ArrowRight size={14} />
              </button>
            </div>
            {enrollmentByDept.length === 0 ? (
              <EmptyState icon={BarChart3} title="No enrollment data" message="Department enrollment data will appear here." />
            ) : (
              <div className="space-y-3">
                {enrollmentByDept.slice(0, 6).map((dept) => (
                  <div key={dept.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-ink-700">{dept.name}</span>
                      <span className="text-sm text-ink-500">{dept.count} students</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${(dept.count / maxEnrollment) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>

          {/* Revenue Overview */}
          <PortalCard className="p-6">
            <h3 className="text-lg font-bold text-ink-900 mb-5">Revenue Overview</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm text-ink-600">Collected</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  ${(totalRevenue / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-ink-500 mt-1">{fees.filter((f) => f.status === 'paid').length} payments</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span className="text-sm text-ink-600">Pending</span>
                </div>
                <div className="text-2xl font-bold text-amber-700">
                  ${(pendingRevenue / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-ink-500 mt-1">{pendingFees.length} accounts</div>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm text-ink-600">Overdue</span>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  ${(overdueRevenue / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-ink-500 mt-1">{overdueFees.length} accounts</div>
              </div>
            </div>
          </PortalCard>
        </div>

        {/* Right (1/3) */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <PortalCard className="p-6">
            <h3 className="text-lg font-bold text-ink-900 mb-5">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm text-ink-700">Attendance Rate</span>
                </div>
                <span className="text-sm font-bold text-ink-900">94.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <CheckCircle size={16} className="text-teal-600" />
                  </div>
                  <span className="text-sm text-ink-700">Pass Rate</span>
                </div>
                <span className="text-sm font-bold text-ink-900">87.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Award size={16} className="text-amber-600" />
                  </div>
                  <span className="text-sm text-ink-700">Scholarships</span>
                </div>
                <span className="text-sm font-bold text-ink-900">{scholarships.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <GraduationCap size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-ink-700">Departments</span>
                </div>
                <span className="text-sm font-bold text-ink-900">{departments.length}</span>
              </div>
            </div>
          </PortalCard>

          {/* Recent Admissions */}
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">Recent Admissions</h3>
              <button
                onClick={() => navigateTo('/principal/admissions')}
                className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"
              >
                All <ArrowRight size={14} />
              </button>
            </div>
            {recentAdmissions.length === 0 ? (
              <EmptyState icon={FileText} title="No applications" message="Recent admission applications will appear here." />
            ) : (
              <div className="space-y-3">
                {recentAdmissions.map((app) => (
                  <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg bg-ink-50">
                    <div className="w-9 h-9 rounded-full bg-ink-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gold-400">
                        {app.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-900 truncate">{app.full_name}</div>
                      <div className="text-xs text-ink-500 truncate">{app.program}</div>
                    </div>
                    <Badge
                      variant={
                        app.status === 'approved' ? 'success' :
                        app.status === 'pending' || app.status === 'draft' ? 'warning' :
                        app.status === 'rejected' ? 'error' : 'default'
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {quickLinks.map((q) => (
          <button
            key={q.route}
            onClick={() => navigateTo(q.route)}
            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-ink-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center flex-shrink-0">
              <q.icon className="text-amber-400" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink-900">{q.label}</div>
              <div className="text-xs text-ink-500">{q.desc}</div>
            </div>
            <ArrowRight size={14} className="text-ink-400 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      {/* Third row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Audit Activity */}
        <PortalCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink-900">Recent Audit Activity</h3>
            <button
              onClick={() => navigateTo('/admin/audit')}
              className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          {recentAudit.length === 0 ? (
            <EmptyState icon={Activity} title="No activity" message="Audit log entries will appear here." />
          ) : (
            <div className="space-y-3">
              {recentAudit.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-ink-50">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      log.action === 'CREATE' ? 'bg-green-100' :
                      log.action === 'DELETE' ? 'bg-red-100' :
                      log.action === 'UPDATE' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}
                  >
                    <Activity
                      size={14}
                      className={
                        log.action === 'CREATE' ? 'text-green-600' :
                        log.action === 'DELETE' ? 'text-red-600' :
                        log.action === 'UPDATE' ? 'text-amber-600' : 'text-blue-600'
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-900 truncate">{log.details}</div>
                    <div className="text-xs text-ink-500">
                      {log.user_email} · {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Badge
                    variant={
                      log.action === 'CREATE' ? 'success' :
                      log.action === 'DELETE' ? 'error' :
                      'info'
                    }
                  >
                    {log.action}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </PortalCard>

        {/* System Alerts */}
        <PortalCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink-900">System Alerts</h3>
            <button
              onClick={() => navigateTo('/admin/notifications')}
              className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1"
            >
              All <ArrowRight size={14} />
            </button>
          </div>
          {unreadNotifications.length === 0 ? (
            <EmptyState icon={AlertCircle} title="No alerts" message="System is operating normally." />
          ) : (
            <div className="space-y-3">
              {unreadNotifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg ${
                    n.type === 'alert' ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      size={14}
                      className={`mt-0.5 flex-shrink-0 ${n.type === 'alert' ? 'text-amber-600' : 'text-blue-500'}`}
                    />
                    <div>
                      <div className="text-sm font-medium text-ink-900">{n.title}</div>
                      <div className="text-xs text-ink-500 mt-0.5 line-clamp-2">{n.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PortalCard>
      </div>
    </div>
  );
}
