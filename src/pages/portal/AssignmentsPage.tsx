import { useState } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle, Upload, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useAssignments } from '../../lib/portal-hooks';
import { supabase } from '../../lib/supabase';
import { PortalCard, PortalPageHeader, PortalButton, PortalLoading, Badge, EmptyState, PortalInput, PortalTextarea } from '../../components/portal-ui';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const { data: assignments, loading } = useAssignments(user?.id);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [form, setForm] = useState({ title: '', course_title: '', description: '', due_date: '' });

  const handleAdd = async () => {
    if (!user || !form.title) return;
    await supabase.from('assignments').insert({
      student_id: user.id,
      title: form.title,
      course_title: form.course_title,
      description: form.description,
      due_date: form.due_date || new Date().toISOString().split('T')[0],
      status: 'pending',
    });
    setShowAdd(false);
    setForm({ title: '', course_title: '', description: '', due_date: '' });
    window.location.reload();
  };

  const handleSubmit = async (id: string) => {
    if (!user) return;
    setSubmitting(id);
    await supabase.from('assignments').update({
      status: 'submitted',
      submission_text: submissionText,
    }).eq('id', id);
    setSubmitting(null);
    setSubmissionText('');
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  const pending = assignments.filter((a) => a.status === 'pending');
  const submitted = assignments.filter((a) => a.status === 'submitted');

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Assignments"
        subtitle={`${pending.length} pending · ${submitted.length} submitted`}
        icon={ClipboardList}
        action={
          <PortalButton variant="primary" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} /> Add Assignment
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
            <PortalInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required placeholder="Research Paper" />
            <div className="grid sm:grid-cols-2 gap-4">
              <PortalInput label="Course" value={form.course_title} onChange={(v) => setForm({ ...form, course_title: v })} placeholder="CS 101" />
              <PortalInput label="Due Date" type="date" value={form.due_date} onChange={(v) => setForm({ ...form, due_date: v })} />
            </div>
            <PortalTextarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={3} />
            <PortalButton variant="gold" onClick={handleAdd} disabled={!form.title}>Create Assignment</PortalButton>
          </div>
        </PortalCard>
      )}

      {assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments" message="Create an assignment or wait for your instructors to assign coursework." />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-3">Pending</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {pending.map((a) => {
                  const daysLeft = Math.ceil((new Date(a.due_date).getTime() - Date.now()) / 86400000);
                  return (
                    <PortalCard key={a.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${daysLeft < 3 ? 'bg-red-100' : 'bg-amber-100'}`}>
                            <Clock size={18} className={daysLeft < 3 ? 'text-red-600' : 'text-amber-600'} />
                          </div>
                          <div>
                            <h4 className="font-bold text-ink-900">{a.title}</h4>
                            <p className="text-xs text-ink-500">{a.course_title || 'General'}</p>
                          </div>
                        </div>
                        <Badge variant={daysLeft < 3 ? 'error' : 'warning'}>
                          {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                        </Badge>
                      </div>
                      {a.description && <p className="text-sm text-ink-600 mb-3">{a.description}</p>}
                      <div className="text-xs text-ink-500 mb-4">Due: {new Date(a.due_date).toLocaleDateString()}</div>
                      <div>
                        <textarea
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Enter your submission..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 resize-none mb-2"
                        />
                        <PortalButton variant="gold" onClick={() => handleSubmit(a.id)} disabled={submitting === a.id || !submissionText} className="w-full">
                          <Upload size={16} /> {submitting === a.id ? 'Submitting...' : 'Submit Assignment'}
                        </PortalButton>
                      </div>
                    </PortalCard>
                  );
                })}
              </div>
            </div>
          )}

          {submitted.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-3">Submitted</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {submitted.map((a) => (
                  <PortalCard key={a.id} className="p-6 opacity-75">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle size={18} className="text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-ink-900">{a.title}</h4>
                          <p className="text-xs text-ink-500">{a.course_title || 'General'}</p>
                        </div>
                      </div>
                      <Badge variant="success">Submitted</Badge>
                    </div>
                    {a.submission_text && (
                      <p className="text-sm text-ink-600 bg-ink-50 rounded-lg p-3 mt-2">{a.submission_text}</p>
                    )}
                  </PortalCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
