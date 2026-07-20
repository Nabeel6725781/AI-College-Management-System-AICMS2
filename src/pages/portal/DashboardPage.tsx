import { useEffect, useState } from 'react';
import {
  LayoutDashboard, BookOpen, CalendarCheck, Award, CreditCard,
  ClipboardList, Bell, TrendingUp, Clock, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useStudentProfile, useEnrollments, useAttendance, useResults, useFees, useAssignments, useNotifications } from '../../lib/portal-hooks';
import { PortalCard, PortalPageHeader, StatTile, Badge, EmptyState } from '../../components/portal-ui';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { seedDemoData } from '../../lib/seed';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useStudentProfile(user?.id);
  const { data: enrollments } = useEnrollments(user?.id);
  const { data: attendance } = useAttendance(user?.id);
  const { data: results } = useResults(user?.id);
  const { data: fees } = useFees(user?.id);
  const { data: assignments } = useAssignments(user?.id);
  const { data: notifications } = useNotifications(user?.id);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (user && !profile && !seeding) {
      setSeeding(true);
      (async () => {
        const { data: existing } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        if (!existing) {
          await supabase.from('student_profiles').insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'Student',
            student_id: `MU${Date.now().toString().slice(-6)}`,
            program: 'B.S. in Computer Science',
            year: 1,
            status: 'active',
          });
        }
        await seedDemoData(user.id);
        window.location.reload();
      })();
    }
  }, [user, profile, seeding]);

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const unpaidFees = fees.filter((f) => f.status === 'pending');
  const pendingAssignments = assignments.filter((a) => a.status === 'pending');
  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const activeCourses = enrollments.filter((e) => e.status === 'active');

  const avgGrade = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.grade_points || 0), 0) / results.length).toFixed(2)
    : '—';

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Dashboard"
        subtitle={profile ? `Welcome back, ${profile.full_name}` : 'Welcome to your portal'}
        icon={LayoutDashboard}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Enrolled Courses" value={activeCourses.length} icon={BookOpen} color="blue" />
        <StatTile label="Attendance Rate" value={`${attendanceRate}%`} icon={CalendarCheck} color="green" />
        <StatTile label="Avg. Grade Point" value={avgGrade} icon={Award} color="gold" />
        <StatTile label="Pending Fees" value={unpaidFees.length} icon={CreditCard} color="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent results */}
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">Recent Results</h3>
              <button onClick={() => navigateTo('/portal/results')} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>
            {results.length === 0 ? (
              <EmptyState icon={Award} title="No results yet" message="Your exam results will appear here once published." />
            ) : (
              <div className="space-y-3">
                {results.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-ink-50 hover:bg-ink-100 transition-colors">
                    <div>
                      <div className="font-medium text-ink-900 text-sm">{r.course_name}</div>
                      <div className="text-xs text-ink-500">{r.exam_type} · {r.semester || 'Current'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-ink-700">{r.grade || '—'}</span>
                      <Badge variant={r.grade_points >= 3 ? 'success' : 'warning'}>{r.grade_points.toFixed(1)} GPA</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>

          {/* Assignments */}
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">Upcoming Assignments</h3>
              <button onClick={() => navigateTo('/portal/assignments')} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>
            {pendingAssignments.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No pending assignments" message="You're all caught up!" />
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 4).map((a) => {
                  const daysLeft = Math.ceil((new Date(a.due_date).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-ink-50 hover:bg-ink-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${daysLeft < 3 ? 'bg-red-100' : 'bg-ink-100'}`}>
                          <Clock size={18} className={daysLeft < 3 ? 'text-red-600' : 'text-ink-600'} />
                        </div>
                        <div>
                          <div className="font-medium text-ink-900 text-sm">{a.title}</div>
                          <div className="text-xs text-ink-500">{a.course_title || 'General'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-ink-500">Due {new Date(a.due_date).toLocaleDateString()}</div>
                        <Badge variant={daysLeft < 3 ? 'error' : 'warning'}>{daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PortalCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick stats */}
          <PortalCard className="p-6">
            <h3 className="text-lg font-bold text-ink-900 mb-4">Quick Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-600">
                  <ClipboardList size={16} /> Pending Assignments
                </div>
                <span className="text-sm font-bold text-ink-900">{pendingAssignments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-600">
                  <Bell size={16} /> Unread Notifications
                </div>
                <span className="text-sm font-bold text-ink-900">{unreadNotifications.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-600">
                  <TrendingUp size={16} /> Total Results
                </div>
                <span className="text-sm font-bold text-ink-900">{results.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-600">
                  <CreditCard size={16} /> Unpaid Fees
                </div>
                <span className="text-sm font-bold text-ink-900">{unpaidFees.length}</span>
              </div>
            </div>
          </PortalCard>

          {/* Recent notifications */}
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">Notifications</h3>
              <button onClick={() => navigateTo('/portal/notifications')} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
                All <ArrowRight size={14} />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-ink-500 text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg ${n.is_read ? 'bg-ink-50' : 'bg-gold-50 border border-gold-200'}`}>
                    <div className="text-sm font-medium text-ink-900">{n.title}</div>
                    <div className="text-xs text-ink-500 mt-1 line-clamp-2">{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>
      </div>
    </div>
  );
}
