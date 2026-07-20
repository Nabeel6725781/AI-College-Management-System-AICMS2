import { useState } from 'react';
import { Users, Pencil, Trash2, UserCheck, Pause } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useAllStudentProfiles } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalSelect,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { StudentProfile } from '../../lib/supabase';

const STATUS_VARIANT: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  active: 'success',
  suspended: 'error',
  on_leave: 'warning',
};

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const { data: students, loading } = useAllStudentProfiles();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('active');

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Student Management" subtitle="Manage student profiles and status" icon={Users} />
        <PortalLoading />
      </div>
    );
  }

  if (!user) {
    navigateTo('/admin/login');
    return null;
  }

  const filtered = students.filter((s: StudentProfile) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.full_name?.toLowerCase().includes(q) ||
      s.student_id?.toLowerCase().includes(q) ||
      s.program?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = students.filter((s) => s.status === 'active').length;
  const onLeaveCount = students.filter((s) => s.status === 'on_leave').length;

  const startEdit = (s: StudentProfile) => {
    setEditingId(s.id);
    setEditStatus(s.status || 'active');
  };

  const saveStatus = async (id: string) => {
    await supabase.from('student_profiles').update({ status: editStatus, updated_at: new Date().toISOString() }).eq('id', id);
    setEditingId(null);
    window.location.reload();
  };

  const deleteStudent = async (id: string) => {
    if (!confirm('Delete this student profile? This cannot be undone.')) return;
    await supabase.from('student_profiles').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Student Management"
        subtitle="Manage student profiles and enrollment status"
        icon={Users}
        action={
          <PortalButton variant="primary" onClick={() => navigateTo('/admin')} className="bg-rose-600 hover:bg-rose-700">
            Back to Dashboard
          </PortalButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile label="Total Students" value={students.length} icon={Users} color="ink" />
        <StatTile label="Active" value={activeCount} icon={UserCheck} color="green" />
        <StatTile label="On Leave" value={onLeaveCount} icon={Pause} color="gold" />
      </div>

      <PortalCard className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <PortalInput
              label="Search"
              value={search}
              onChange={setSearch}
              placeholder="Search by name, student ID, or program..."
            />
          </div>
          <PortalSelect
            label="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'on_leave', label: 'On leave' },
            ]}
          />
        </div>
      </PortalCard>

      <PortalCard className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No students found" message="No student profiles match your search criteria." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Student ID</th>
                  <th className="px-4 py-3 font-medium">Program</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((s: StudentProfile) => (
                  <tr key={s.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-900">{s.full_name}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{s.student_id}</td>
                    <td className="px-4 py-3 text-ink-600">{s.program}</td>
                    <td className="px-4 py-3 text-ink-600">Year {s.year}</td>
                    <td className="px-4 py-3">
                      {editingId === s.id ? (
                        <PortalSelect
                          label=""
                          value={editStatus}
                          onChange={setEditStatus}
                          options={[
                            { value: 'active', label: 'Active' },
                            { value: 'suspended', label: 'Suspended' },
                            { value: 'on_leave', label: 'On leave' },
                          ]}
                        />
                      ) : (
                        <Badge variant={STATUS_VARIANT[s.status || 'default'] || 'default'}>
                          {(s.status || 'active').replace('_', ' ')}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === s.id ? (
                          <>
                            <PortalButton variant="primary" onClick={() => saveStatus(s.id)} className="bg-rose-600 hover:bg-rose-700 px-3 py-1.5">
                              Save
                            </PortalButton>
                            <PortalButton variant="ghost" onClick={() => setEditingId(null)} className="px-3 py-1.5">
                              Cancel
                            </PortalButton>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(s)}
                              className="p-2 rounded-lg text-ink-600 hover:bg-ink-100"
                              title="Edit status"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteStudent(s.id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                              title="Delete student"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
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
