import { useState, useMemo } from 'react';
import { Award, Plus, Save, Trash2, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useMarks, useTeacherTimetable } from '../../lib/teacher-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalButton, PortalLoading, Badge, EmptyState, PortalInput } from '../../components/portal-ui';

function calcGrade(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 60) return 'D';
  return 'F';
}

export default function TeacherMarksPage() {
  const { user } = useAuth();
  const { data: marks, loading } = useMarks(user?.id);
  const { data: timetable } = useTeacherTimetable(user?.id);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ studentName: '', studentId: '', course: '', examType: 'Midterm', score: '', maxScore: '100', semester: 'Fall 2025' });

  const courses = useMemo(() => [...new Set(timetable.map((t) => t.course_title))], [timetable]);

  const handleAdd = async () => {
    if (!user || !form.studentName || !form.course || !form.score) return;
    setSaving(true);
    const score = parseFloat(form.score);
    const max = parseFloat(form.maxScore);
    await supabase.from('marks').insert({
      teacher_id: user.id,
      student_name: form.studentName,
      student_id: form.studentId,
      course_title: form.course,
      exam_type: form.examType,
      score,
      max_score: max,
      grade: calcGrade(score, max),
      semester: form.semester,
    });
    setSaving(false);
    setShowAdd(false);
    setForm({ studentName: '', studentId: '', course: '', examType: 'Midterm', score: '', maxScore: '100', semester: 'Fall 2025' });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('marks').delete().eq('id', id);
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Marks Entry"
        subtitle={`${marks.length} mark${marks.length !== 1 ? 's' : ''} entered`}
        icon={Award}
        action={
          <PortalButton variant="primary" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} /> Add Marks
          </PortalButton>
        }
      />

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink-900">Enter New Marks</h3>
            <button onClick={() => setShowAdd(false)} className="text-ink-400 hover:text-ink-700"><X size={20} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <PortalInput label="Student Name" value={form.studentName} onChange={(v) => setForm({ ...form, studentName: v })} required placeholder="Jane Doe" />
            <PortalInput label="Student ID" value={form.studentId} onChange={(v) => setForm({ ...form, studentId: v })} placeholder="MU123456" />
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Course</label>
              <select
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              >
                <option value="">Select course...</option>
                {courses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Exam Type</label>
              <select
                value={form.examType}
                onChange={(e) => setForm({ ...form, examType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              >
                <option>Midterm</option>
                <option>Final</option>
                <option>Quiz 1</option>
                <option>Quiz 2</option>
                <option>Assignment</option>
                <option>Project</option>
              </select>
            </div>
            <PortalInput label="Score" type="number" value={form.score} onChange={(v) => setForm({ ...form, score: v })} required placeholder="85" />
            <PortalInput label="Max Score" type="number" value={form.maxScore} onChange={(v) => setForm({ ...form, maxScore: v })} placeholder="100" />
          </div>
          <div className="mt-4 flex gap-2">
            <PortalButton variant="secondary" onClick={() => setShowAdd(false)}>Cancel</PortalButton>
            <PortalButton variant="gold" onClick={handleAdd} disabled={saving || !form.studentName || !form.course || !form.score}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Marks'}
            </PortalButton>
          </div>
        </PortalCard>
      )}

      {marks.length === 0 ? (
        <EmptyState icon={Award} title="No marks entered" message="Click 'Add Marks' to enter grades for your students." />
      ) : (
        <PortalCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {marks.map((m) => (
                  <tr key={m.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-ink-900">{m.student_name}</td>
                    <td className="px-6 py-4 text-sm text-ink-500">{m.student_id || '—'}</td>
                    <td className="px-6 py-4 text-sm text-ink-700 truncate max-w-[180px]">{m.course_title}</td>
                    <td className="px-6 py-4 text-sm text-ink-600">{m.exam_type}</td>
                    <td className="px-6 py-4 text-sm text-ink-700">{m.score}/{m.max_score}</td>
                    <td className="px-6 py-4">
                      <Badge variant={m.score >= 85 ? 'success' : m.score >= 70 ? 'warning' : 'error'}>{m.grade}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(m.id)} className="text-ink-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PortalCard>
      )}
    </div>
  );
}
