import { useState } from 'react';
import { Award, Plus, Pencil, Trash2, DollarSign, CheckCircle, X, Calendar } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import { useScholarships } from '../../lib/admin-hooks';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalTextarea,
  PortalSelect, Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';

export default function AdminScholarshipsPage() {
  const { user } = useAuth();
  const { data: scholarships, loading } = useScholarships();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    amount: '',
    eligibility: '',
    deadline: '',
    status: 'active',
  });

  if (!user) {
    navigateTo('/admin/login');
    return <PortalLoading />;
  }

  if (loading) return (
    <div className="animate-fade-in">
      <PortalPageHeader title="Scholarships" subtitle="Manage scholarship programs" icon={Award} />
      <PortalLoading />
    </div>
  );

  const totalAmount = scholarships.reduce((sum, s) => sum + (s.amount || 0), 0);
  const activeCount = scholarships.filter((s) => s.status === 'active').length;

  const resetForm = () => {
    setForm({ name: '', description: '', amount: '', eligibility: '', deadline: '', status: 'active' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      amount: parseFloat(form.amount) || 0,
      eligibility: form.eligibility,
      deadline: form.deadline || null,
      status: form.status,
    };
    if (editingId) {
      await supabase.from('scholarships').update(payload).eq('id', editingId);
    } else {
      await supabase.from('scholarships').insert(payload);
    }
    window.location.reload();
  };

  const handleEdit = (s: typeof scholarships[0]) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description,
      amount: String(s.amount),
      eligibility: s.eligibility,
      deadline: s.deadline || '',
      status: s.status,
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this scholarship?')) return;
    await supabase.from('scholarships').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Scholarships Management"
        subtitle="Create and manage scholarship programs for students"
        icon={Award}
        action={
          <PortalButton variant="primary" onClick={() => { if (editingId) resetForm(); setShowAdd(!showAdd); }}>
            {showAdd ? <><X size={16} /> Close</> : <><Plus size={16} /> Add Scholarship</>}
          </PortalButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatTile label="Total Scholarships" value={scholarships.length} icon={Award} color="ink" />
        <StatTile label="Active" value={activeCount} icon={CheckCircle} color="green" />
        <StatTile label="Total Amount" value={`$${totalAmount.toLocaleString()}`} icon={DollarSign} color="gold" />
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-8">
          <h3 className="text-lg font-bold text-ink-900 mb-4">{editingId ? 'Edit Scholarship' : 'Add New Scholarship'}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <PortalInput label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <PortalInput label="Amount" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="0.00" required />
            <div className="sm:col-span-2">
              <PortalTextarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
            </div>
            <div className="sm:col-span-2">
              <PortalTextarea label="Eligibility" value={form.eligibility} onChange={(v) => setForm({ ...form, eligibility: v })} placeholder="Eligibility criteria" rows={2} />
            </div>
            <PortalInput label="Deadline" type="date" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} />
            <PortalSelect
              label="Status"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'closed', label: 'Closed' },
                { value: 'draft', label: 'Draft' },
              ]}
            />
            <div className="sm:col-span-2 flex gap-3">
              <PortalButton type="submit" variant="primary">{editingId ? 'Update' : 'Create'} Scholarship</PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => { resetForm(); setShowAdd(false); }}>Cancel</PortalButton>
            </div>
          </form>
        </PortalCard>
      )}

      {scholarships.length === 0 ? (
        <PortalCard className="p-6">
          <EmptyState icon={Award} title="No Scholarships" message="Create a scholarship program to get started." />
        </PortalCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((s) => (
            <PortalCard key={s.id} className="p-6 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Award size={20} className="text-rose-600" />
                </div>
                <Badge variant={s.status === 'active' ? 'success' : s.status === 'draft' ? 'warning' : 'default'}>
                  {s.status}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-1">{s.name}</h3>
              <p className="text-sm text-ink-500 mb-3 line-clamp-2">{s.description}</p>
              <div className="text-2xl font-bold text-rose-600 mb-3">${(s.amount || 0).toLocaleString()}</div>
              <div className="space-y-2 text-sm text-ink-600 mb-4 flex-1">
                <div>
                  <span className="font-medium text-ink-700">Eligibility:</span>{' '}
                  <span className="line-clamp-2">{s.eligibility || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-rose-500" />
                  {s.deadline ? new Date(s.deadline).toLocaleDateString() : 'No deadline'}
                </div>
              </div>
              <div className="flex gap-2">
                <PortalButton variant="secondary" className="flex-1" onClick={() => handleEdit(s)}>
                  <Pencil size={14} /> Edit
                </PortalButton>
                <PortalButton variant="ghost" onClick={() => handleDelete(s.id)}>
                  <Trash2 size={14} className="text-rose-600" />
                </PortalButton>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
