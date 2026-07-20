import { BookOpen, Users, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTeacherTimetable, useMarks } from '../../lib/teacher-hooks';
import { PortalCard, PortalPageHeader, PortalLoading, Badge, EmptyState } from '../../components/portal-ui';
import { navigateTo } from '../../lib/router';

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const { data: timetable, loading } = useTeacherTimetable(user?.id);
  const { data: marks } = useMarks(user?.id);

  if (loading) return <PortalLoading />;

  const classMap: Record<string, { course: string; className: string; room: string; students: Set<string>; slots: typeof timetable }> = {};
  timetable.forEach((t) => {
    const key = `${t.course_title} - ${t.class_name}`;
    if (!classMap[key]) {
      classMap[key] = { course: t.course_title, className: t.class_name, room: t.room, students: new Set(), slots: [] };
    }
    classMap[key].slots.push(t);
  });

  marks.forEach((m) => {
    Object.values(classMap).forEach((c) => {
      if (c.course === m.course_title) c.students.add(m.student_name);
    });
  });

  const classes = Object.entries(classMap);

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="My Classes"
        subtitle={`${classes.length} class${classes.length !== 1 ? 'es' : ''} assigned`}
        icon={BookOpen}
      />

      {classes.length === 0 ? (
        <EmptyState icon={BookOpen} title="No classes assigned" message="Your teaching schedule will appear here once classes are assigned." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(([key, c]) => {
            const days = [...new Set(c.slots.map((s) => s.day_of_week))].sort();
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const timeSlot = c.slots[0];
            return (
              <PortalCard key={key} className="p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                    <BookOpen className="text-teal-600" size={24} />
                  </div>
                  <Badge variant="info">{c.className}</Badge>
                </div>
                <h3 className="text-lg font-bold text-ink-900 mb-2">{c.course}</h3>
                <div className="space-y-2 text-sm text-ink-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-ink-400" />
                    {c.students.size} students
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-ink-400" />
                    {timeSlot?.start_time} — {timeSlot?.end_time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-ink-400" />
                    {c.room}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-ink-400" />
                    {days.map((d) => dayNames[d] || '').join(', ')}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigateTo('/teacher/attendance')}
                    className="flex-1 text-xs font-medium text-ink-900 bg-ink-50 hover:bg-ink-100 rounded-lg py-2 transition-colors"
                  >
                    Attendance
                  </button>
                  <button
                    onClick={() => navigateTo('/teacher/marks')}
                    className="flex-1 text-xs font-medium text-white bg-ink-900 hover:bg-ink-800 rounded-lg py-2 transition-colors"
                  >
                    Marks
                  </button>
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
