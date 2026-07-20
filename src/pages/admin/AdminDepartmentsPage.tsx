import { useState } from 'react';
import { Building2, Pencil, Trash2, Plus, Calendar } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useAllDepartments, useAllFaculty } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalTextarea,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { Department, FacultyMember } from '../../lib/supabase';

export default function AdminDepartmentsPage() {
  const { user } = useAuth();
  const { data: departments, loading } = useAllDepartments();
  const { data: faculty } = useAllFaculty();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: 'Building2',
    established_year: '',
    sort_order: '0',
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Departments Management" subtitle="Manage academic departments" icon={Building2} />
        <PortalLoading />
      </div>
    );
  }

  if (!user) {
    navigateTo('/admin/login');
    return null;
  }

  const deptHead = (deptId: string): FacultyMember | undefined =>
    faculty.find((f) => f.department_id === deptId);

  const facultyCount = (deptId: string) =>
    faculty.filter((f) => f.department_id === deptId).length;

  const resetForm = () => {
    setForm({ name: '', description: '', icon: 'Building2', established_year: '', sort_order: '0' });
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (d: Department) => {
    setEditingId(d.id);
    setForm({
      name: d.name || '',
      description: d.description || '',
      icon: d.icon || 'Building2',
      established_year: d.established_year ? String(d.established_year) : '',
      sort_order: String(d.sort_order || 0),
    });
    setShowAdd(true);
  };

  const save = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      icon: form.icon,
      image_url: null,
      established_year: form.established_year ? Number(form.established_year) : null,
      sort_order: Number(form.sort_order) || 0,
    };
    if (editingId) {
      await supabase.from('departments').update(payload).eq('id', editingId);
    } else {
      await supabase.from('departments').insert([payload]);
    }
    resetForm();
    window.location.reload();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this department? Faculty assigned to it will become unassigned. This cannot be undone.')) return;
    await supabase.from('departments').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Departments Management"
        subtitle="Manage academic departments"
        icon={Building2}
        action={
          <div className="flex gap-2">
            <PortalButton variant="secondary" onClick={() => navigateTo('/admin')}>Dashboard</PortalButton>
            <PortalButton variant="primary" onClick={() => { resetForm(); setShowAdd(true); }} className="bg-rose-600 hover:bg-rose-700">
              <Plus size={16} /> Add Department
            </PortalButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatTile label="Total Departments" value={departments.length} icon={Building2} color="ink" />
        <StatTile label="Total Faculty" value={faculty.length} icon={Building2} color="teal" />
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-ink-900 mb-4">{editingId ? 'Edit Department' : 'Add New Department'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PortalInput label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Computer Science" required />
            <PortalInput label="Icon (lucide name)" value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} placeholder="Building2" />
            <PortalInput label="Established year" type="number" value={form.established_year} onChange={(v) => setForm({ ...form, established_year: v })} placeholder="1998" />
            <PortalInput label="Sort order" type="number" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} placeholder="0" />
            <div className="sm:col-span-2">
              <PortalTextarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Department description..." />
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

      {departments.length === 0 ? (
        <PortalCard>
          <EmptyState icon={Building2} title="No departments found" message="No departments have been created yet. Add your first department." />
        </PortalCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d: Department) => {
            const head = deptHead(d.id);
            return (
              <PortalCard key={d.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(d)} className="p-2 rounded-lg text-ink-600 hover:bg-ink-100" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => remove(d.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-ink-900">{d.name}</h3>
                <p className="text-sm text-ink-500 mt-1 line-clamp-2">{d.description || 'No description'}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500">Department Head</span>
                    <span className="text-ink-900 font-medium">{head ? head.name : 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500">Faculty</span>
                    <Badge variant="default">{facultyCount(d.id)}</Badge>
                  </div>
                  {d.established_year && (
                    <div className="flex items-center justify-between">
                      <span className="text-ink-500">Established</span>
                      <span className="text-ink-900 font-medium flex items-center gap-1">
                        <Calendar size={14} /> {d.established_year}
                      </span>
                    </div>
                  )}
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
