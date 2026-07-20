import { useState, useMemo } from 'react';
import { CalendarCheck, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useMarks, useTeacherTimetable } from '../../lib/teacher-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalButton, PortalLoading, EmptyState } from '../../components/portal-ui';

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const { data: marks } = useMarks(user?.id);
  const { data: timetable, loading } = useTeacherTimetable(user?.id);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const classes = useMemo(() => {
    const set = new Set(timetable.map((t) => `${t.course_title} - ${t.class_name}`));
    return [...set];
  }, [timetable]);

  const students = useMemo(() => {
    if (!selectedClass) return [];
    const course = selectedClass.split(' - ')[0];
    const names = [...new Set(marks.filter((m) => m.course_title === course).map((m) => m.student_name))];
    return names;
  }, [selectedClass, marks]);

  const markStatus = (name: string, status: string) => {
    setAttendance({ ...attendance, [name]: status });
    setSaved(false);
  };

  const markAll = (status: string) => {
    const all: Record<string, string> = {};
    students.forEach((s) => { all[s] = status; });
    setAttendance(all);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    // Save attendance as notifications for tracking
    const records = Object.entries(attendance).map(([name, status]) => ({
      teacher_id: user.id,
      title: `Attendance marked: ${name}`,
      message: `${name} marked ${status} for ${selectedClass} on ${date}`,
      type: 'info',
      is_read: true,
    }));
    if (records.length > 0) {
      await supabase.from('teacher_notifications').insert(records);
    }
    setSaving(false);
    setSaved(true);
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Attendance"
        subtitle="Mark and track student attendance for your classes"
        icon={CalendarCheck}
        action={
          selectedClass && students.length > 0 ? (
            <PortalButton variant="gold" onClick={handleSave} disabled={saving || Object.keys(attendance).length === 0}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Attendance'}
            </PortalButton>
          ) : undefined
        }
      />

      {saved && (
        <PortalCard className="p-4 mb-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-sm text-green-700">Attendance saved successfully for {selectedClass} on {date}.</p>
          </div>
        </PortalCard>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setAttendance({}); setSaved(false); }}
            className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
          >
            <option value="">Choose a class...</option>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setSaved(false); }}
            className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
          />
        </div>
      </div>

      {!selectedClass ? (
        <EmptyState icon={CalendarCheck} title="Select a class" message="Choose a class above to mark attendance." />
      ) : students.length === 0 ? (
        <EmptyState icon={AlertCircle} title="No students found" message="No students are enrolled in this class yet." />
      ) : (
        <PortalCard className="overflow-hidden">
          <div className="p-4 border-b border-ink-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink-900">{students.length} Students</h3>
            <div className="flex gap-2">
              <button onClick={() => markAll('present')} className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">Mark all present</button>
              <button onClick={() => markAll('absent')} className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Mark all absent</button>
            </div>
          </div>
          <div className="divide-y divide-ink-100">
            {students.map((name) => {
              const status = attendance[name] || 'unmarked';
              return (
                <div key={name} className="flex items-center justify-between p-4 hover:bg-ink-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-ink-900 flex items-center justify-center">
                      <span className="text-xs font-bold text-gold-400">{name.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-ink-900">{name}</span>
                  </div>
                  <div className="flex gap-2">
                    {['present', 'late', 'absent'].map((s) => (
                      <button
                        key={s}
                        onClick={() => markStatus(name, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                          status === s
                            ? s === 'present' ? 'bg-green-500 text-white' : s === 'late' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                            : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </PortalCard>
      )}
    </div>
  );
}
