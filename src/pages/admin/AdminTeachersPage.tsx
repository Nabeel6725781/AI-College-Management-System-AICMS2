import { useState } from 'react';
import { GraduationCap, Pencil, Trash2, Mail } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useAllFaculty, useAllDepartments } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalTextarea, PortalSelect,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { FacultyMember } from '../../lib/supabase';

export default function AdminTeachersPage() {
  const { user } = useAuth();
  const { data: faculty, loading } = useAllFaculty();
  const { data: departments } = useAllDepartments();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    title: '',
    department_id: '',
    email: '',
    bio: '',
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Teacher Management" subtitle="Manage faculty members" icon={GraduationCap} />
        <PortalLoading />
      </div>
    );
  }

  if (!user) {
    navigateTo('/admin/login');
    return null;
  }

  const deptName = (id: string | null) =>
    departments.find((d) => d.id === id)?.name || 'Unassigned';

  const filtered = faculty.filter((f: FacultyMember) => {
    const q = search.toLowerCase();
    return (
      !q ||
      f.name?.toLowerCase().includes(q) ||
      f.title?.toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      deptName(f.department_id).toLowerCase().includes(q)
    );
  });

  const deptCounts = departments.map((d) => ({
    name: d.name,
    count: faculty.filter((f) => f.department_id === d.id).length,
  }));

  const resetForm = () => {
    setForm({ name: '', title: '', department_id: '', email: '', bio: '' });
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (f: FacultyMember) => {
    setEditingId(f.id);
    setForm({
      name: f.name || '',
      title: f.title || '',
      department_id: f.department_id || '',
      email: f.email || '',
      bio: f.bio || '',
    });
    setShowAdd(true);
  };

  const save = async () => {
    const payload = {
      name: form.name,
      title: form.title,
      department_id: form.department_id || null,
      email: form.email || null,
      bio: form.bio,
      research_areas: [],
      sort_order: 0,
    };
    if (editingId) {
      await supabase.from('faculty').update(payload).eq('id', editingId);
    } else {
      await supabase.from('faculty').insert([payload]);
    }
    resetForm();
    window.location.reload();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this faculty member? This cannot be undone.')) return;
    await supabase.from('faculty').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Teacher Management"
        subtitle="Manage faculty members across departments"
        icon={GraduationCap}
        action={
          <div className="flex gap-2">
            <PortalButton variant="secondary" onClick={() => navigateTo('/admin')}>
              Dashboard
            </PortalButton>
            <PortalButton variant="primary" onClick={() => { resetForm(); setShowAdd(true); }} className="bg-rose-600 hover:bg-rose-700">
              Add Teacher
            </PortalButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile label="Total Faculty" value={faculty.length} icon={GraduationCap} color="ink" />
        <StatTile label="Departments" value={departments.length} icon={GraduationCap} color="teal" />
        <StatTile label="With Email" value={faculty.filter((f) => f.email).length} icon={Mail} color="gold" />
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-ink-900 mb-4">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PortalInput label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Dr. Jane Smith" required />
            <PortalInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Professor" required />
            <PortalSelect
              label="Department"
              value={form.department_id}
              onChange={(v) => setForm({ ...form, department_id: v })}
              options={[{ value: '', label: 'Unassigned' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
            />
            <PortalInput label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="jane@university.edu" />
            <div className="sm:col-span-2">
              <PortalTextarea label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} placeholder="Brief biography..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <PortalButton variant="primary" onClick={save} className="bg-rose-600 hover:bg-rose-700">
              {editingId ? 'Update' : 'Create'}
            </PortalButton>
            <PortalButton variant="ghost" onClick={resetForm}>Cancel</PortalButton>
          </div>
        </PortalCard>
      )}

      <PortalCard className="p-4 mb-6">
        <PortalInput label="Search" value={search} onChange={setSearch} placeholder="Search by name, title, email, or department..." />
      </PortalCard>

      {deptCounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {deptCounts.map((d) => (
            <Badge key={d.name} variant="default">{d.name}: {d.count}</Badge>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <PortalCard>
          <EmptyState icon={GraduationCap} title="No faculty found" message="No teachers match your search. Try adding a new faculty member." />
        </PortalCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f: FacultyMember) => (
            <PortalCard key={f.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(f)} className="p-2 rounded-lg text-ink-600 hover:bg-ink-100" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove(f.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-ink-900">{f.name}</h3>
              <p className="text-sm text-ink-600">{f.title}</p>
              <div className="mt-3 space-y-1.5 text-sm text-ink-500">
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} /> {deptName(f.department_id)}
                </div>
                {f.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} /> <span className="truncate">{f.email}</span>
                  </div>
                )}
              </div>
              {f.bio && <p className="text-sm text-ink-500 mt-3 line-clamp-2">{f.bio}</p>}
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
