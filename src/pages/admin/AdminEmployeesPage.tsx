import { useState } from 'react';
import { Briefcase, Pencil, Trash2, UserCheck, Pause } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useEmployees } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalSelect,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';
import type { EmployeeProfile } from '../../lib/supabase';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  active: 'success',
  on_leave: 'warning',
  suspended: 'error',
};

export default function AdminEmployeesPage() {
  const { user } = useAuth();
  const { data: employees, loading } = useEmployees();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    employee_id: '',
    role: '',
    department: '',
    phone: '',
    email: '',
    status: 'active',
  });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="Employee Management" subtitle="Manage staff employees" icon={Briefcase} />
        <PortalLoading />
      </div>
    );
  }

  if (!user) {
    navigateTo('/admin/login');
    return null;
  }

  const filtered = employees.filter((e: EmployeeProfile) => {
    const q = search.toLowerCase();
    return (
      !q ||
      e.full_name?.toLowerCase().includes(q) ||
      e.employee_id?.toLowerCase().includes(q) ||
      e.role?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q)
    );
  });

  const activeCount = employees.filter((e) => e.status === 'active').length;
  const onLeaveCount = employees.filter((e) => e.status === 'on_leave').length;

  const resetForm = () => {
    setForm({ full_name: '', employee_id: '', role: '', department: '', phone: '', email: '', status: 'active' });
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (e: EmployeeProfile) => {
    setEditingId(e.id);
    setForm({
      full_name: e.full_name || '',
      employee_id: e.employee_id || '',
      role: e.role || '',
      department: e.department || '',
      phone: e.phone || '',
      email: e.email || '',
      status: e.status || 'active',
    });
    setShowAdd(true);
  };

  const save = async () => {
    const payload = {
      full_name: form.full_name,
      employee_id: form.employee_id,
      role: form.role,
      department: form.department,
      phone: form.phone,
      email: form.email,
      status: form.status,
    };
    if (editingId) {
      await supabase.from('employee_profiles').update(payload).eq('id', editingId);
    } else {
      await supabase.from('employee_profiles').insert([payload]);
    }
    resetForm();
    window.location.reload();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this employee profile? This cannot be undone.')) return;
    await supabase.from('employee_profiles').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Employee Management"
        subtitle="Manage staff and employee profiles"
        icon={Briefcase}
        action={
          <div className="flex gap-2">
            <PortalButton variant="secondary" onClick={() => navigateTo('/admin')}>Dashboard</PortalButton>
            <PortalButton variant="primary" onClick={() => { resetForm(); setShowAdd(true); }} className="bg-rose-600 hover:bg-rose-700">
              Add Employee
            </PortalButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile label="Total Employees" value={employees.length} icon={Briefcase} color="ink" />
        <StatTile label="Active" value={activeCount} icon={UserCheck} color="green" />
        <StatTile label="On Leave" value={onLeaveCount} icon={Pause} color="gold" />
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-ink-900 mb-4">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PortalInput label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} placeholder="John Doe" required />
            <PortalInput label="Employee ID" value={form.employee_id} onChange={(v) => setForm({ ...form, employee_id: v })} placeholder="EMP-001" required />
            <PortalInput label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} placeholder="Administrator" required />
            <PortalInput label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="Administration" />
            <PortalInput label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+1 555-0100" />
            <PortalInput label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="john@university.edu" />
            <PortalSelect
              label="Status"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'on_leave', label: 'On leave' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
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
        <PortalInput label="Search" value={search} onChange={setSearch} placeholder="Search by name, ID, role, or department..." />
      </PortalCard>

      <PortalCard className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Briefcase} title="No employees found" message="No employee profiles match your search criteria." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Employee ID</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((e: EmployeeProfile) => (
                  <tr key={e.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-medium text-ink-900">{e.full_name}</td>
                    <td className="px-4 py-3 text-ink-600">{e.employee_id}</td>
                    <td className="px-4 py-3 text-ink-600">{e.role}</td>
                    <td className="px-4 py-3 text-ink-600">{e.department}</td>
                    <td className="px-4 py-3 text-ink-600">{e.email || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[e.status || 'default'] || 'default'}>
                        {(e.status || 'active').replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(e)} className="p-2 rounded-lg text-ink-600 hover:bg-ink-100" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => remove(e.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
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
