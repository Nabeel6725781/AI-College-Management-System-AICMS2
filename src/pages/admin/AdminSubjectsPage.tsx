import { useState } from 'react';
import { ClipboardList, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useSubjects, useAllDepartments } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalTextarea, PortalSelect,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { Subject } from '../../lib/supabase';

export default function AdminSubjectsPage() {
  const { user } = useAuth();
  const { data: subjects, loading } = useSubjects();
  const { data: departments } = useAllDepartments();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    department: '',
    credits: '3',
    description: '',
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Subjects Management" subtitle="Manage academic subjects" icon={ClipboardList} />
        <PortalLoading />
      </div>
    );
  }

  if (!user) {
    navigateTo('/admin/login');
    return null;
  }

  const filtered = subjects.filter((s: Subject) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.code?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q);
    const matchesDept = deptFilter === 'all' || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const deptCounts = departments.map((d) => ({
    name: d.name,
    count: subjects.filter((s) => s.department === d.name).length,
  }));

  const resetForm = () => {
    setForm({ code: '', name: '', department: '', credits: '3', description: '' });
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (s: Subject) => {
    setEditingId(s.id);
    setForm({
      code: s.code || '',
      name: s.name || '',
      department: s.department || '',
      credits: String(s.credits || 3),
      description: s.description || '',
    });
    setShowAdd(true);
  };

  const save = async () => {
    const payload = {
      code: form.code,
      name: form.name,
      department: form.department,
      credits: Number(form.credits),
      description: form.description,
    };
    if (editingId) {
      await supabase.from('subjects').update(payload).eq('id', editingId);
    } else {
      await supabase.from('subjects').insert([payload]);
    }
    resetForm();
    window.location.reload();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this subject? This cannot be undone.')) return;
    await supabase.from('subjects').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Subjects Management"
        subtitle="Manage academic subjects and curriculum"
        icon={ClipboardList}
        action={
          <div className="flex gap-2">
            <PortalButton variant="secondary" onClick={() => navigateTo('/admin')}>Dashboard</PortalButton>
            <PortalButton variant="primary" onClick={() => { resetForm(); setShowAdd(true); }} className="bg-rose-600 hover:bg-rose-700">
              Add Subject
            </PortalButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile label="Total Subjects" value={subjects.length} icon={ClipboardList} color="ink" />
        <StatTile label="Departments" value={departments.length} icon={BookOpen} color="teal" />
        <StatTile label="Total Credits" value={subjects.reduce((sum, s) => sum + (s.credits || 0), 0)} icon={ClipboardList} color="gold" />
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-ink-900 mb-4">{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PortalInput label="Subject code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="CS101" required />
            <PortalInput label="Subject name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Data Structures" required />
            <PortalSelect
              label="Department"
              value={form.department}
              onChange={(v) => setForm({ ...form, department: v })}
              options={[{ value: '', label: 'Select department' }, ...departments.map((d) => ({ value: d.name, label: d.name }))]}
              required
            />
            <PortalInput label="Credits" type="number" value={form.credits} onChange={(v) => setForm({ ...form, credits: v })} placeholder="3" required />
            <div className="sm:col-span-2">
              <PortalTextarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Subject description..." />
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <PortalInput label="Search" value={search} onChange={setSearch} placeholder="Search by code, name, or department..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Filter by department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </PortalCard>

      {deptCounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {deptCounts.map((d) => (
            <Badge key={d.name} variant="default">{d.name}: {d.count}</Badge>
          ))}
        </div>
      )}

      <PortalCard className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No subjects found" message="No subjects match your search. Try adding a new subject." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Credits</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((s: Subject) => (
                  <tr key={s.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <Badge variant="gold">{s.code}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">{s.name}</td>
                    <td className="px-4 py-3 text-ink-600">{s.department || '—'}</td>
                    <td className="px-4 py-3 text-ink-600">{s.credits}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(s)} className="p-2 rounded-lg text-ink-600 hover:bg-ink-100" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => remove(s.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>
    </div>
  );
}
