import { useEffect, useState } from 'react';
import {
  LayoutDashboard, BookOpen, Users, Award, ClipboardList,
  CalendarClock, MessageSquare, ArrowRight, Clock,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import {
  useTeacherProfile, useTeacherNotifications, useTeacherAssignments,
  useTeacherTimetable, useMarks,
} from '../../lib/teacher-hooks';
import { seedTeacherData } from '../../lib/teacher-seed';
import { PortalCard, PortalPageHeader, StatTile, Badge, EmptyState } from '../../components/portal-ui';
import { navigateTo } from '../../lib/router';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useTeacherProfile(user?.id);
  const { data: notifications } = useTeacherNotifications(user?.id);
  const { data: assignments } = useTeacherAssignments(user?.id);
  const { data: timetable } = useTeacherTimetable(user?.id);
  const { data: marks } = useMarks(user?.id);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (user && !profile && !seeding) {
      setSeeding(true);
      (async () => {
        await seedTeacherData(user.id, user.email || '');
        window.location.reload();
      })();
    }
  }, [user, profile, seeding]);

  const uniqueCourses = new Set(timetable.map((t) => t.course_title));
  const uniqueStudents = new Set(marks.map((m) => m.student_name));
  const unreadNotifs = notifications.filter((n) => !n.is_read);
  const activeAssignments = assignments.filter((a) => a.status === 'active');

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 0 : today - 1;
  const todayClasses = timetable.filter((t) => t.day_of_week === todayIndex).sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Dashboard"
        subtitle={profile ? `Welcome, ${profile.full_name}` : 'Welcome to your teacher portal'}
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Active Classes" value={uniqueCourses.size} icon={BookOpen} color="teal" />
        <StatTile label="Total Students" value={uniqueStudents.size} icon={Users} color="blue" />
        <StatTile label="Assignments" value={activeAssignments.length} icon={ClipboardList} color="gold" />
        <StatTile label="Unread Alerts" value={unreadNotifs.length} icon={MessageSquare} color="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's schedule */}
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">Today's Schedule</h3>
              <button onClick={() => navigateTo('/teacher/timetable')} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
                Full timetable <ArrowRight size={14} />
              </button>
            </div>
            {todayClasses.length === 0 ? (
              <EmptyState icon={CalendarClock} title="No classes today" message="Enjoy your free day!" />
            ) : (
              <div className="space-y-3">
                {todayClasses.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-ink-50 hover:bg-ink-100 transition-colors">
                    <div className="w-1 h-12 rounded-full bg-teal-500" />
                    <div className="flex-1">
                      <div className="font-medium text-ink-900 text-sm">{c.course_title}</div>
                      <div className="text-xs text-ink-500">{c.class_name} · {c.room}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-ink-700">{c.start_time} — {c.end_time}</div>
                      <div className="text-xs text-ink-400 flex items-center gap-1 justify-end">
                        <Clock size={12} /> {c.room}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>

          {/* Recent marks */}
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">Recent Marks Entered</h3>
              <button onClick={() => navigateTo('/teacher/marks')} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>
            {marks.length === 0 ? (
              <EmptyState icon={Award} title="No marks entered" message="Enter marks for your students on the Marks Entry page." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ink-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-ink-500 uppercase">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-ink-500 uppercase">Course</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-ink-500 uppercase">Exam</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-ink-500 uppercase">Score</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-ink-500 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {marks.slice(0, 5).map((m) => (
                      <tr key={m.id} className="hover:bg-ink-50">
                        <td className="px-4 py-3 text-sm font-medium text-ink-900">{m.student_name}</td>
                        <td className="px-4 py-3 text-sm text-ink-600 truncate max-w-[150px]">{m.course_title}</td>
                        <td className="px-4 py-3 text-sm text-ink-600">{m.exam_type}</td>
                        <td className="px-4 py-3 text-sm text-ink-700">{m.score}/{m.max_score}</td>
                        <td className="px-4 py-3"><Badge variant={m.score >= 85 ? 'success' : m.score >= 75 ? 'warning' : 'error'}>{m.grade}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PortalCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <PortalCard className="p-6">
            <h3 className="text-lg font-bold text-ink-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Mark Attendance', route: '/teacher/attendance', icon: CalendarClock },
                { label: 'Enter Marks', route: '/teacher/marks', icon: Award },
                { label: 'Create Assignment', route: '/teacher/assignments', icon: ClipboardList },
                { label: 'View Students', route: '/teacher/students', icon: Users },
                { label: 'Send Message', route: '/teacher/messages', icon: MessageSquare },
              ].map((a) => (
                <button
                  key={a.route}
                  onClick={() => navigateTo(a.route)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-ink-50 hover:bg-ink-100 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-ink-900 flex items-center justify-center">
                    <a.icon className="text-teal-400" size={18} />
                  </div>
                  <span className="text-sm font-medium text-ink-900">{a.label}</span>
                  <ArrowRight size={14} className="ml-auto text-ink-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </PortalCard>

          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">Notifications</h3>
              <button onClick={() => navigateTo('/teacher/notifications')} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
                All <ArrowRight size={14} />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-ink-500 text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg ${n.is_read ? 'bg-ink-50' : 'bg-teal-50 border border-teal-200'}`}>
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
