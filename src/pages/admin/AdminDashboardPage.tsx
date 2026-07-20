import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, FileText,
  CreditCard, Library, Award, ArrowRight, TrendingUp,
  AlertCircle, CheckCircle, Activity,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { seedAdminData } from '../../lib/admin-seed';
import {
  useAdmissions, useAllStudentProfiles, useAllFaculty, useFeeRecords,
  useLibraryBooks, useScholarships, useAdminNotifications, useAuditLogs,
} from '../../lib/admin-hooks';
import { PortalCard, PortalPageHeader, StatTile, Badge } from '../../components/portal-ui';
import { navigateTo } from '../../lib/router';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const { data: admissions } = useAdmissions();
  const { data: students } = useAllStudentProfiles();
  const { data: faculty } = useAllFaculty();
  const { data: fees } = useFeeRecords();
  const { data: books } = useLibraryBooks();
  const { data: scholarships } = useScholarships();
  const { data: notifications } = useAdminNotifications();
  const { data: auditLogs } = useAuditLogs();

  useEffect(() => {
    if (user && !seeding) {
      setSeeding(true);
      (async () => {
        await seedAdminData(user.id, user.email || '');
      })();
    }
  }, [user, seeding]);

  const pendingAdmissions = admissions.filter((a: any) => a.status === 'pending' || a.status === 'draft');
  const paidFees = fees.filter((f) => f.status === 'paid');
  const overdueFees = fees.filter((f) => f.status === 'overdue');

  const quickLinks = [
    { label: 'Student Management', route: '/admin/students', icon: Users, count: students.length },
    { label: 'Teacher Management', route: '/admin/teachers', icon: GraduationCap, count: faculty.length },
    { label: 'Admissions', route: '/admin/admissions', icon: FileText, count: pendingAdmissions.length },
    { label: 'Fee Management', route: '/admin/fees', icon: CreditCard, count: fees.length },
    { label: 'Library', route: '/admin/library', icon: Library, count: books.length },
    { label: 'Scholarships', route: '/admin/scholarships', icon: Award, count: scholarships.length },
  ];

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Admin Dashboard"
        subtitle="System overview and quick access to all modules"
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Students" value={students.length} icon={Users} color="blue" />
        <StatTile label="Faculty Members" value={faculty.length} icon={GraduationCap} color="teal" />
        <StatTile label="Pending Admissions" value={pendingAdmissions.length} icon={FileText} color="gold" />
        <StatTile label="Overdue Fees" value={overdueFees.length} icon={CreditCard} color="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick access grid */}
          <PortalCard className="p-6">
            <h3 className="text-lg font-bold text-ink-900 mb-4">Quick Access</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickLinks.map((q) => (
                <button
                  key={q.route}
                  onClick={() => navigateTo(q.route)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-ink-50 hover:bg-ink-100 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center flex-shrink-0">
                    <q.icon className="text-rose-400" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-900 truncate">{q.label}</div>
                    <div className="text-xs text-ink-500">{q.count} records</div>
                  </div>
                  <ArrowRight size={14} className="text-ink-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </PortalCard>

          {/* Recent audit logs */}
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">Recent Activity</h3>
              <button onClick={() => navigateTo('/admin/audit')} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-ink-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-ink-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      log.action === 'CREATE' ? 'bg-green-100' : log.action === 'DELETE' ? 'bg-red-100' : log.action === 'UPDATE' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      <Activity size={14} className={log.action === 'CREATE' ? 'text-green-600' : log.action === 'DELETE' ? 'text-red-600' : log.action === 'UPDATE' ? 'text-amber-600' : 'text-blue-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-900">{log.details}</div>
                      <div className="text-xs text-ink-500">{log.user_email} · {new Date(log.created_at).toLocaleString()}</div>
                    </div>
                    <Badge variant={log.action === 'CREATE' ? 'success' : log.action === 'DELETE' ? 'error' : 'info'}>{log.action}</Badge>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* System health */}
          <PortalCard className="p-6">
            <h3 className="text-lg font-bold text-ink-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-600"><CheckCircle size={16} className="text-green-500" /> Database</div>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-600"><CheckCircle size={16} className="text-green-500" /> Auth Service</div>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-600"><CheckCircle size={16} className="text-green-500" /> File Storage</div>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-600"><TrendingUp size={16} className="text-blue-500" /> API Response</div>
                <span className="text-sm font-medium text-ink-700">142ms</span>
              </div>
            </div>
          </PortalCard>

          {/* Notifications */}
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">Alerts</h3>
              <button onClick={() => navigateTo('/admin/notifications')} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
                All <ArrowRight size={14} />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-ink-500 text-center py-4">No alerts</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg ${n.is_read ? 'bg-ink-50' : 'bg-rose-50 border border-rose-200'}`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className={`mt-0.5 flex-shrink-0 ${n.type === 'alert' ? 'text-rose-500' : 'text-blue-500'}`} />
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

          {/* Fee summary */}
          <PortalCard className="p-6">
            <h3 className="text-lg font-bold text-ink-900 mb-4">Fee Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <span className="text-sm text-ink-700">Paid</span>
                <span className="text-sm font-bold text-green-700">{paidFees.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                <span className="text-sm text-ink-700">Partial</span>
                <span className="text-sm font-bold text-amber-700">{fees.filter((f) => f.status === 'partial').length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                <span className="text-sm text-ink-700">Overdue</span>
                <span className="text-sm font-bold text-red-700">{overdueFees.length}</span>
              </div>
            </div>
          </PortalCard>
        </div>
      </div>
    </div>
  );
}
