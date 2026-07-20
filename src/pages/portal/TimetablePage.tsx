import { CalendarClock, MapPin, User } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTimetable } from '../../lib/portal-hooks';
import { PortalCard, PortalPageHeader, PortalLoading, EmptyState } from '../../components/portal-ui';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const { user } = useAuth();
  const { data: slots, loading } = useTimetable(user?.id);

  if (loading) return <PortalLoading />;

  const slotsByDay = days.map((day, i) => ({
    day,
    slots: slots.filter((s) => s.day_of_week === i).sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 0 : today - 1;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Timetable"
        subtitle="Your weekly class schedule"
        icon={CalendarClock}
      />

      {slots.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No timetable slots" message="Your weekly schedule will appear here once classes are assigned." />
      ) : (
        <>
          {/* Today's classes */}
          <PortalCard className="p-6 mb-6">
            <h3 className="text-lg font-bold text-ink-900 mb-4">
              Today's Classes — {days[todayIndex] || 'Sunday'}
            </h3>
            {slotsByDay[todayIndex]?.slots.length === 0 ? (
              <p className="text-sm text-ink-500">No classes scheduled for today.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {slotsByDay[todayIndex]?.slots.map((s) => (
                  <div key={s.id} className="flex-shrink-0 w-56 p-4 rounded-xl bg-ink-900 text-white">
                    <div className="text-xs text-gold-400 font-medium">{s.start_time} — {s.end_time}</div>
                    <div className="font-bold mt-1">{s.course_title}</div>
                    <div className="text-xs text-ink-300 mt-2 flex items-center gap-1.5">
                      <MapPin size={12} /> {s.room || 'TBD'}
                    </div>
                    <div className="text-xs text-ink-300 mt-1 flex items-center gap-1.5">
                      <User size={12} /> {s.instructor || 'TBD'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>

          {/* Weekly grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slotsByDay.map(({ day, slots }) => (
              <PortalCard key={day} className={`p-5 ${day === days[todayIndex] ? 'ring-2 ring-gold-400' : ''}`}>
                <h3 className="text-sm font-bold text-ink-900 mb-3 flex items-center justify-between">
                  {day}
                  {day === days[todayIndex] && <span className="text-xs text-gold-600 font-medium">Today</span>}
                </h3>
                {slots.length === 0 ? (
                  <p className="text-xs text-ink-400 py-4 text-center">No classes</p>
                ) : (
                  <div className="space-y-2">
                    {slots.map((s) => (
                      <div key={s.id} className="p-3 rounded-lg bg-ink-50 hover:bg-ink-100 transition-colors">
                        <div className="text-xs font-medium text-ink-500">{s.start_time} — {s.end_time}</div>
                        <div className="text-sm font-medium text-ink-900 mt-0.5">{s.course_title}</div>
                        <div className="text-xs text-ink-500 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {s.room || 'TBD'}</span>
                          <span className="flex items-center gap-1"><User size={10} /> {s.instructor || 'TBD'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PortalCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
