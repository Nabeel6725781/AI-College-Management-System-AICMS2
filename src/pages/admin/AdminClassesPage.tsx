import { useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Users, DoorOpen, Calendar, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useClassSections } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput,
  PortalSelect, Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';

export default function AdminClassesPage() {
  const { user } = useAuth();
  const { data: classes, loading } = useClassSections();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    course: '',
    teacher_name: '',
    room: '',
    capacity: '',
    enrolled: '',
    schedule: '',
    status: 'active',
  });

  if (!user) {
    navigateTo('/admin/login');
    return <PortalLoading />;
  }

  if (loading) return (
    <div className="animate-fade-in">
      <PortalPageHeader title="Class Management" subtitle="Manage class sections and enrollment" icon={BookOpen} />
      <PortalLoading />
    </div>
  );

  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const totalEnrolled = classes.reduce((sum, c) => sum + (c.enrolled || 0), 0);

  const resetForm = () => {
    setForm({ name: '', course: '', teacher_name: '', room: '', capacity: '', enrolled: '', schedule: '', status: 'active' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      course: form.course,
      teacher_name: form.teacher_name,
      room: form.room,
      capacity: parseInt(form.capacity) || 0,
      enrolled: parseInt(form.enrolled) || 0,
      schedule: form.schedule,
      status: form.status,
    };
    if (editingId) {
      await supabase.from('class_sections').update(payload).eq('id', editingId);
    } else {
      await supabase.from('class_sections').insert(payload);
    }
    window.location.reload();
  };

  const handleEdit = (c: typeof classes[0]) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      course: c.course,
      teacher_name: c.teacher_name,
      room: c.room,
      capacity: String(c.capacity),
      enrolled: String(c.enrolled),
      schedule: c.schedule,
      status: c.status,
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class section?')) return;
    await supabase.from('class_sections').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Class Management"
        subtitle="Manage class sections, capacity, and enrollment"
        icon={BookOpen}
        action={
          <PortalButton variant="primary" onClick={() => { if (editingId) resetForm(); setShowAdd(!showAdd); }}>
            {showAdd ? <><X size={16} /> Close</> : <><Plus size={16} /> Add Class</>}
          </PortalButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatTile label="Total Classes" value={classes.length} icon={BookOpen} color="ink" />
        <StatTile label="Total Capacity" value={totalCapacity} icon={Users} color="teal" />
        <StatTile label="Total Enrolled" value={totalEnrolled} icon={Users} color="gold" />
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-8">
          <h3 className="text-lg font-bold text-ink-900 mb-4">{editingId ? 'Edit Class' : 'Add New Class'}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PortalInput label="Class Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. CS-101-A" required />
            <PortalInput label="Course" value={form.course} onChange={(v) => setForm({ ...form, course: v })} placeholder="e.g. Intro to CS" required />
            <PortalInput label="Teacher" value={form.teacher_name} onChange={(v) => setForm({ ...form, teacher_name: v })} placeholder="Teacher name" />
            <PortalInput label="Room" value={form.room} onChange={(v) => setForm({ ...form, room: v })} placeholder="e.g. Room 204" />
            <PortalInput label="Capacity" type="number" value={form.capacity} onChange={(v) => setForm({ ...form, capacity: v })} placeholder="e.g. 40" />
            <PortalInput label="Enrolled" type="number" value={form.enrolled} onChange={(v) => setForm({ ...form, enrolled: v })} placeholder="e.g. 32" />
            <PortalInput label="Schedule" value={form.schedule} onChange={(v) => setForm({ ...form, schedule: v })} placeholder="e.g. Mon/Wed 10:00-11:30" />
            <PortalSelect
              label="Status"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'full', label: 'Full' },
              ]}
            />
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <PortalButton type="submit" variant="primary">{editingId ? 'Update' : 'Create'} Class</PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => { resetForm(); setShowAdd(false); }}>Cancel</PortalButton>
            </div>
          </form>
        </PortalCard>
      )}

      {classes.length === 0 ? (
        <PortalCard className="p-6">
          <EmptyState icon={BookOpen} title="No Classes" message="Add your first class section to get started." />
        </PortalCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => {
            const pct = c.capacity > 0 ? Math.min(100, (c.enrolled / c.capacity) * 100) : 0;
            return (
              <PortalCard key={c.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-ink-900">{c.name}</h3>
                    <p className="text-sm text-ink-500">{c.course}</p>
                  </div>
                  <Badge variant={c.status === 'active' ? 'success' : c.status === 'full' ? 'warning' : 'default'}>
                    {c.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-ink-600 mb-4">
                  <div className="flex items-center gap-2"><Users size={14} className="text-rose-500" /> {c.teacher_name || 'Unassigned'}</div>
                  <div className="flex items-center gap-2"><DoorOpen size={14} className="text-rose-500" /> {c.room || 'No room'}</div>
                  <div className="flex items-center gap-2"><Calendar size={14} className="text-rose-500" /> {c.schedule || 'No schedule'}</div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-ink-600">Enrollment</span>
                    <span className="font-medium text-ink-900">{c.enrolled}/{c.capacity}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-rose-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <PortalButton variant="secondary" className="flex-1" onClick={() => handleEdit(c)}>
                    <Pencil size={14} /> Edit
                  </PortalButton>
                  <PortalButton variant="ghost" onClick={() => handleDelete(c.id)}>
                    <Trash2 size={14} className="text-rose-600" />
                  </PortalButton>
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
