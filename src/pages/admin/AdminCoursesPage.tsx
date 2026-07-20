import { useState } from 'react';
import { BookOpen, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useAllCoursesAdmin } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalTextarea, PortalSelect,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { Course } from '../../lib/supabase';

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const { data: courses, loading } = useAllCoursesAdmin();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    title: '',
    credits: '3',
    instructor: '',
    department: '',
    semester: '1',
    description: '',
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Courses Management" subtitle="Manage course catalog" icon={BookOpen} />
        <PortalLoading />
      </div>
    );
  }

  if (!user) {
    navigateTo('/admin/login');
    return null;
  }

  const filtered = courses.filter((c: Course) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.code?.toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q) ||
      c.instructor?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q)
    );
  });

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

  const resetForm = () => {
    setForm({ code: '', title: '', credits: '3', instructor: '', department: '', semester: '1', description: '' });
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (c: Course) => {
    setEditingId(c.id);
    setForm({
      code: c.code || '',
      title: c.title || '',
      credits: String(c.credits || 3),
      instructor: c.instructor || '',
      department: c.department || '',
      semester: String(c.semester || 1),
      description: c.description || '',
    });
    setShowAdd(true);
  };

  const save = async () => {
    const payload = {
      code: form.code,
      title: form.title,
      credits: Number(form.credits),
      instructor: form.instructor,
      department: form.department,
      semester: Number(form.semester),
      description: form.description,
    };
    if (editingId) {
      await supabase.from('courses').update(payload).eq('id', editingId);
    } else {
      await supabase.from('courses').insert([payload]);
    }
    resetForm();
    window.location.reload();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await supabase.from('courses').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Courses Management"
        subtitle="Manage the course catalog"
        icon={BookOpen}
        action={
          <div className="flex gap-2">
            <PortalButton variant="secondary" onClick={() => navigateTo('/admin')}>Dashboard</PortalButton>
            <PortalButton variant="primary" onClick={() => { resetForm(); setShowAdd(true); }} className="bg-rose-600 hover:bg-rose-700">
              Add Course
            </PortalButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile label="Total Courses" value={courses.length} icon={BookOpen} color="ink" />
        <StatTile label="Active" value={courses.length} icon={CheckCircle} color="green" />
        <StatTile label="Total Credits" value={totalCredits} icon={BookOpen} color="gold" />
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-ink-900 mb-4">{editingId ? 'Edit Course' : 'Add New Course'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PortalInput label="Course code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="CS101" required />
            <PortalInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Intro to Computer Science" required />
            <PortalInput label="Credits" type="number" value={form.credits} onChange={(v) => setForm({ ...form, credits: v })} placeholder="3" required />
            <PortalInput label="Instructor" value={form.instructor} onChange={(v) => setForm({ ...form, instructor: v })} placeholder="Dr. Smith" />
            <PortalInput label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="Computer Science" />
            <PortalSelect
              label="Semester"
              value={form.semester}
              onChange={(v) => setForm({ ...form, semester: v })}
              options={[
                { value: '1', label: 'Semester 1' },
                { value: '2', label: 'Semester 2' },
                { value: '3', label: 'Semester 3' },
                { value: '4', label: 'Semester 4' },
                { value: '5', label: 'Semester 5' },
                { value: '6', label: 'Semester 6' },
                { value: '7', label: 'Semester 7' },
                { value: '8', label: 'Semester 8' },
              ]}
            />
            <div className="sm:col-span-2">
              <PortalTextarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Course description..." />
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
        <PortalInput label="Search" value={search} onChange={setSearch} placeholder="Search by code, title, instructor, or department..." />
      </PortalCard>

      <PortalCard className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses found" message="No courses match your search. Try adding a new course." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Instructor</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Credits</th>
                  <th className="px-4 py-3 font-medium">Semester</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((c: Course) => (
                  <tr key={c.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <Badge variant="gold">{c.code}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">{c.title}</td>
                    <td className="px-4 py-3 text-ink-600">{c.instructor || '—'}</td>
                    <td className="px-4 py-3 text-ink-600">{c.department || '—'}</td>
                    <td className="px-4 py-3 text-ink-600">{c.credits}</td>
                    <td className="px-4 py-3 text-ink-600">{c.semester}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(c)} className="p-2 rounded-lg text-ink-600 hover:bg-ink-100" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => remove(c.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
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
