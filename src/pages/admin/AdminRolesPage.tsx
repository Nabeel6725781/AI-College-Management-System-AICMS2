import { useState } from 'react';
import {
  ShieldCheck, Plus, Trash2, Edit3, X, Check, Users, UserCog,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useUserRoles } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalSelect,
  PortalLoading, StatTile, EmptyState, Badge,
} from '../../components/portal-ui';
import type { UserRole } from '../../lib/supabase';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'viewer', label: 'Viewer' },
];

const ALL_PERMISSIONS = [
  'read', 'create', 'update', 'delete', 'manage_users',
  'manage_fees', 'manage_academics', 'manage_library', 'view_reports',
];

const STATUS_VARIANT: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  active: 'success',
  inactive: 'error',
  suspended: 'warning',
  pending: 'default',
};

export default function AdminRolesPage() {
  useAuth();
  const { data: roles, loading } = useUserRoles();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ role: '', status: '', permissions: [] as string[] });
  const [form, setForm] = useState({ email: '', role: 'student', permissions: ['read'] });
  const [saving, setSaving] = useState(false);

  const adminCount = roles.filter((r) => r.role === 'admin').length;
  const teacherCount = roles.filter((r) => r.role === 'teacher').length;
  const studentCount = roles.filter((r) => r.role === 'student').length;

  async function handleAdd() {
    if (!form.email.trim()) return;
    setSaving(true);
    await supabase.from('user_roles').insert({
      email: form.email,
      role: form.role,
      permissions: form.permissions,
      status: 'active',
    });
    window.location.reload();
  }

  async function handleSaveEdit(r: UserRole) {
    setSaving(true);
    await supabase
      .from('user_roles')
      .update({ role: editForm.role, status: editForm.status, permissions: editForm.permissions })
      .eq('id', r.id);
    window.location.reload();
  }

  async function handleDelete(r: UserRole) {
    await supabase.from('user_roles').delete().eq('id', r.id);
    window.location.reload();
  }

  function togglePermission(list: string[], perm: string): string[] {
    return list.includes(perm) ? list.filter((p) => p !== perm) : [...list, perm];
  }

  function startEdit(r: UserRole) {
    setEditingId(r.id);
    setEditForm({ role: r.role, status: r.status, permissions: r.permissions || [] });
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PortalPageHeader title="User Roles & Permissions" subtitle="Manage access control" icon={ShieldCheck} />
        <PortalLoading />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="User Roles & Permissions"
        subtitle="Manage user access and permissions across the system"
        icon={ShieldCheck}
        action={
          <PortalButton variant="primary" onClick={() => setShowAdd((s) => !s)}>
            {showAdd ? <X size={16} /> : <Plus size={16} />} {showAdd ? 'Cancel' : 'Add Role'}
          </PortalButton>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Users" value={roles.length} icon={Users} color="ink" />
        <StatTile label="Admins" value={adminCount} icon={ShieldCheck} color="red" />
        <StatTile label="Teachers" value={teacherCount} icon={UserCog} color="teal" />
        <StatTile label="Students" value={studentCount} icon={Users} color="blue" />
      </div>

      {/* Inline add form */}
      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">Add User Role</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <PortalInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="user@example.com"
              required
            />
            <PortalSelect
              label="Role"
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v })}
              options={ROLE_OPTIONS}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink-700 mb-2">Permissions</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm} className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm)}
                    onChange={() => setForm({ ...form, permissions: togglePermission(form.permissions, perm) })}
                    className="rounded border-ink-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-mono text-xs">{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <PortalButton variant="ghost" onClick={() => setShowAdd(false)}>Cancel</PortalButton>
            <PortalButton variant="primary" onClick={handleAdd} disabled={saving}>
              <Plus size={16} /> Add User Role
            </PortalButton>
          </div>
        </PortalCard>
      )}

      {/* Roles table */}
      <PortalCard className="p-6">
        <h3 className="text-lg font-bold text-ink-900 mb-4">User Roles</h3>
        {roles.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No user roles" message="No user roles have been configured yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-500">
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Permissions</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => {
                  const isEditing = editingId === r.id;
                  return (
                    <tr key={r.id} className="border-b border-ink-50 hover:bg-ink-50 transition-colors align-top">
                      <td className="py-3 pr-4 font-medium text-ink-900">{r.email}</td>
                      <td className="py-3 pr-4">
                        {isEditing ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="px-3 py-1.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            {ROLE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        ) : (
                          <Badge variant={r.role === 'admin' ? 'error' : r.role === 'teacher' ? 'info' : 'default'}>
                            {r.role}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {isEditing ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {ALL_PERMISSIONS.map((perm) => (
                              <label key={perm} className="flex items-center gap-1 text-xs text-ink-700">
                                <input
                                  type="checkbox"
                                  checked={editForm.permissions.includes(perm)}
                                  onChange={() => setEditForm({ ...editForm, permissions: togglePermission(editForm.permissions, perm) })}
                                  className="rounded border-ink-300 text-rose-600 focus:ring-rose-500"
                                />
                                {perm}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(r.permissions || []).length === 0 ? (
                              <span className="text-ink-400 text-xs">No permissions</span>
                            ) : (
                              (r.permissions || []).map((p) => (
                                <span key={p} className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-600 text-xs font-mono">
                                  {p}
                                </span>
                              ))
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {isEditing ? (
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="px-3 py-1.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending">Pending</option>
                          </select>
                        ) : (
                          <Badge variant={STATUS_VARIANT[r.status] || 'default'}>{r.status}</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(r)}
                                title="Save"
                                className="p-2 rounded-lg text-green-600 hover:bg-green-100 transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                title="Cancel"
                                className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(r)}
                                title="Edit"
                                className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(r)}
                                title="Delete"
                                className="p-2 rounded-lg text-ink-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PortalCard>
    </div>
  );
}
