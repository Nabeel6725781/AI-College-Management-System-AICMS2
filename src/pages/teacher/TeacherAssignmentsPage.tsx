import { useState } from 'react';
import { ClipboardList, Plus, Trash2, X, Clock } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTeacherAssignments, useTeacherTimetable } from '../../lib/teacher-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalButton, PortalLoading, Badge, EmptyState, PortalInput, PortalTextarea } from '../../components/portal-ui';

export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const { data: assignments, loading } = useTeacherAssignments(user?.id);
  const { data: timetable } = useTeacherTimetable(user?.id);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ course: '', className: '', title: '', description: '', dueDate: '' });

  const courses = [...new Set(timetable.map((t) => t.course_title))];
  const classNames = [...new Set(timetable.map((t) => t.class_name))];

  const handleAdd = async () => {
    if (!user || !form.title || !form.course) return;
    setSaving(true);
    const d = new Date();
    d.setDate(d.getDate() + (form.dueDate ? 0 : 7));
    await supabase.from('teacher_assignments').insert({
      teacher_id: user.id,
      course_title: form.course,
      class_name: form.className || 'All Sections',
      title: form.title,
      description: form.description,
      due_date: form.dueDate || d.toISOString().split('T')[0],
      status: 'active',
    });
    setSaving(false);
    setShowAdd(false);
    setForm({ course: '', className: '', title: '', description: '', dueDate: '' });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('teacher_assignments').delete().eq('id', id);
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Assignment Management"
        subtitle={`${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} created`}
        icon={ClipboardList}
        action={
          <PortalButton variant="primary" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} /> Create Assignment
          </PortalButton>
        }
      />

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink-900">New Assignment</h3>
            <button onClick={() => setShowAdd(false)} className="text-ink-400 hover:text-ink-700"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Class</label>
                <select
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                >
                  <option value="">All Sections</option>
                  {classNames.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <PortalInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required placeholder="Programming Assignment 2" />
            <PortalTextarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={3} />
            <PortalInput label="Due Date" type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
            <div className="flex gap-2">
              <PortalButton variant="secondary" onClick={() => setShowAdd(false)}>Cancel</PortalButton>
              <PortalButton variant="gold" onClick={handleAdd} disabled={saving || !form.title || !form.course}>
                {saving ? 'Creating...' : 'Create Assignment'}
              </PortalButton>
            </div>
          </div>
        </PortalCard>
      )}

      {assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments" message="Create assignments for your classes to distribute to students." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => {
            return (
              <PortalCard key={a.id} className="p-6 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
                    <ClipboardList className="text-ink-600" size={20} />
                  </div>
                  <Badge variant={a.status === 'active' ? 'success' : 'default'}>{a.status}</Badge>
                </div>
                <h3 className="font-bold text-ink-900 mb-1">{a.title}</h3>
                <p className="text-xs text-ink-500 mb-2">{a.course_title} · {a.class_name}</p>
                {a.description && <p className="text-sm text-ink-600 line-clamp-2 mb-3">{a.description}</p>}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-100">
                  <div className="flex items-center gap-1.5 text-xs text-ink-500">
                    <Clock size={14} />
                    Due {new Date(a.due_date).toLocaleDateString()}
                  </div>
                  <button onClick={() => handleDelete(a.id)} className="text-ink-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
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
