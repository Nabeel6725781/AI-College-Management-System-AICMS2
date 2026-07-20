import { useState } from 'react';
import {
  CreditCard, Plus, Pencil, Trash2, CheckCircle, DollarSign, Clock,
  AlertTriangle, X, FileText, Layers, Receipt, Download,
  Loader2, Check, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import {
  useFeeHeads, useFeeStructures, useFeeChallans, useFineConfigurations, useFeeRecords,
} from '../../lib/admin-hooks';
import { usePrograms } from '../../lib/hooks';
import type { FeeHead, FineConfiguration } from '../../lib/supabase';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalTextarea,
  PortalSelect, Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';

type Tab = 'records' | 'heads' | 'structures' | 'fines' | 'challans';

export default function AdminFeesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('records');

  if (!user) {
    navigateTo('/admin/login');
    return <PortalLoading />;
  }

  const tabs: { id: Tab; label: string; icon: typeof CreditCard }[] = [
    { id: 'records', label: 'Fee Records', icon: Receipt },
    { id: 'heads', label: 'Fee Heads', icon: Layers },
    { id: 'structures', label: 'Fee Structures', icon: FileText },
    { id: 'fines', label: 'Fine Management', icon: AlertTriangle },
    { id: 'challans', label: 'Challan Generation', icon: CreditCard },
  ];

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Fee Management"
        subtitle="Manage fee structures, heads, fines, and generate student challans"
        icon={CreditCard}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-400'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'records' && <FeeRecordsTab />}
      {tab === 'heads' && <FeeHeadsTab />}
      {tab === 'structures' && <FeeStructuresTab />}
      {tab === 'fines' && <FinesTab />}
      {tab === 'challans' && <ChallanGenerationTab />}
    </div>
  );
}

// ── Fee Records Tab (existing fee_records table) ──

function FeeRecordsTab() {
  const { data: fees, loading } = useFeeRecords();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    student_name: '', student_id: '', amount: '', paid_amount: '',
    status: 'pending', due_date: '', description: '',
  });

  if (loading) return <PortalLoading />;

  const totalCollected = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const pending = fees.filter((f) => f.status === 'pending');
  const overdue = fees.filter((f) => f.status === 'overdue');
  const pendingAmount = pending.reduce((sum, f) => sum + ((f.amount || 0) - (f.paid_amount || 0)), 0);
  const overdueAmount = overdue.reduce((sum, f) => sum + ((f.amount || 0) - (f.paid_amount || 0)), 0);

  const resetForm = () => {
    setForm({ student_name: '', student_id: '', amount: '', paid_amount: '', status: 'pending', due_date: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      student_name: form.student_name,
      student_id: form.student_id,
      amount: parseFloat(form.amount) || 0,
      paid_amount: parseFloat(form.paid_amount) || 0,
      status: form.status,
      due_date: form.due_date || null,
      description: form.description,
    };
    if (editingId) {
      await supabase.from('fee_records').update(payload).eq('id', editingId);
    } else {
      await supabase.from('fee_records').insert(payload);
    }
    window.location.reload();
  };

  const handleEdit = (f: typeof fees[0]) => {
    setEditingId(f.id);
    setForm({
      student_name: f.student_name, student_id: f.student_id,
      amount: String(f.amount), paid_amount: String(f.paid_amount),
      status: f.status, due_date: f.due_date || '', description: f.description,
    });
    setShowAdd(true);
  };

  const handleMarkPaid = async (f: typeof fees[0]) => {
    await supabase.from('fee_records').update({ status: 'paid', paid_amount: f.amount }).eq('id', f.id);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fee record?')) return;
    await supabase.from('fee_records').delete().eq('id', id);
    window.location.reload();
  };

  const statusVariant = (s: string) =>
    s === 'paid' ? 'success' : s === 'overdue' ? 'error' : s === 'partial' ? 'warning' : 'info';

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile label="Total Collected" value={`$${totalCollected.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatTile label="Pending" value={`$${pendingAmount.toLocaleString()}`} icon={Clock} color="gold" />
        <StatTile label="Overdue" value={`$${overdueAmount.toLocaleString()}`} icon={AlertTriangle} color="red" />
      </div>

      <div className="flex justify-end mb-4">
        <PortalButton variant="primary" onClick={() => { if (editingId) resetForm(); setShowAdd(!showAdd); }}>
          {showAdd ? <><X size={16} /> Close</> : <><Plus size={16} /> Add Fee Record</>}
        </PortalButton>
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">{editingId ? 'Edit Fee Record' : 'Add New Fee Record'}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PortalInput label="Student Name" value={form.student_name} onChange={(v) => setForm({ ...form, student_name: v })} required />
            <PortalInput label="Student ID" value={form.student_id} onChange={(v) => setForm({ ...form, student_id: v })} placeholder="e.g. STU-001" />
            <PortalInput label="Amount" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="0.00" required />
            <PortalInput label="Paid Amount" type="number" value={form.paid_amount} onChange={(v) => setForm({ ...form, paid_amount: v })} placeholder="0.00" />
            <PortalInput label="Due Date" type="date" value={form.due_date} onChange={(v) => setForm({ ...form, due_date: v })} />
            <PortalSelect label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'partial', label: 'Partial' },
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' },
              ]}
            />
            <div className="sm:col-span-2 lg:col-span-3">
              <PortalTextarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Tuition, lab fee, etc." rows={2} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <PortalButton type="submit" variant="primary">{editingId ? 'Update' : 'Create'} Record</PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => { resetForm(); setShowAdd(false); }}>Cancel</PortalButton>
            </div>
          </form>
        </PortalCard>
      )}

      {fees.length === 0 ? (
        <PortalCard className="p-6">
          <EmptyState icon={CreditCard} title="No Fee Records" message="Add a fee record to start tracking payments." />
        </PortalCard>
      ) : (
        <PortalCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Student</th>
                  <th className="text-left px-6 py-3 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 font-medium">Paid</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Due Date</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {fees.map((f) => (
                  <tr key={f.id} className="hover:bg-ink-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink-900">{f.student_name}</div>
                      <div className="text-xs text-ink-500">{f.student_id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-ink-900">${(f.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-ink-700">${(f.paid_amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant(f.status)}>{f.status}</Badge></td>
                    <td className="px-6 py-4 text-ink-600">{f.due_date ? new Date(f.due_date).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {f.status !== 'paid' && (
                          <button onClick={() => handleMarkPaid(f)} title="Mark as paid" className="p-2 rounded-lg hover:bg-green-100 text-green-600">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button onClick={() => handleEdit(f)} title="Edit" className="p-2 rounded-lg hover:bg-ink-100 text-ink-600">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(f.id)} title="Delete" className="p-2 rounded-lg hover:bg-rose-100 text-rose-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PortalCard>
      )}
    </div>
  );
}

// ── Fee Heads Tab ──

function FeeHeadsTab() {
  const { data: heads, loading } = useFeeHeads();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', is_mandatory: true, sort_order: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ name: '', code: '', description: '', is_mandatory: true, sort_order: '0' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const payload = {
      name: form.name,
      code: form.code.toUpperCase(),
      description: form.description,
      is_mandatory: form.is_mandatory,
      sort_order: parseInt(form.sort_order) || 0,
    };
    const { error } = editingId
      ? await supabase.from('fee_heads').update(payload).eq('id', editingId)
      : await supabase.from('fee_heads').insert(payload);
    if (error) setError(error.message);
    else { setShowAdd(false); resetForm(); window.location.reload(); }
    setSaving(false);
  };

  const handleEdit = (h: FeeHead) => {
    setEditingId(h.id);
    setForm({ name: h.name, code: h.code, description: h.description, is_mandatory: h.is_mandatory, sort_order: String(h.sort_order) });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fee head?')) return;
    await supabase.from('fee_heads').delete().eq('id', id);
    window.location.reload();
  };

  if (loading) return <PortalLoading />;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PortalButton variant="primary" onClick={() => { if (editingId) resetForm(); setShowAdd(!showAdd); }}>
          {showAdd ? <><X size={16} /> Close</> : <><Plus size={16} /> Add Fee Head</>}
        </PortalButton>
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">{editingId ? 'Edit Fee Head' : 'Add Fee Head'}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <PortalInput label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Tuition Fee" required />
            <PortalInput label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="e.g. TUIT" required />
            <PortalInput label="Sort Order" type="number" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} />
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Mandatory</label>
              <select
                value={String(form.is_mandatory)}
                onChange={(e) => setForm({ ...form, is_mandatory: e.target.value === 'true' })}
                className="w-full px-4 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              >
                <option value="true">Yes - applies to all students</option>
                <option value="false">No - optional</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <PortalTextarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <PortalButton type="submit" variant="primary" disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editingId ? 'Update' : 'Create'}
              </PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => { resetForm(); setShowAdd(false); }}>Cancel</PortalButton>
            </div>
            {error && <div className="sm:col-span-2 text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
          </form>
        </PortalCard>
      )}

      {heads.length === 0 ? (
        <PortalCard className="p-6"><EmptyState icon={Layers} title="No Fee Heads" message="Create fee heads like Tuition, Lab, Library, etc." /></PortalCard>
      ) : (
        <PortalCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Code</th>
                  <th className="text-left px-6 py-3 font-medium">Mandatory</th>
                  <th className="text-left px-6 py-3 font-medium">Order</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {heads.map((h) => (
                  <tr key={h.id} className="hover:bg-ink-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink-900">{h.name}</div>
                      <div className="text-xs text-ink-500">{h.description}</div>
                    </td>
                    <td className="px-6 py-4"><Badge variant="default">{h.code}</Badge></td>
                    <td className="px-6 py-4">{h.is_mandatory ? <Badge variant="info">Required</Badge> : <Badge variant="default">Optional</Badge>}</td>
                    <td className="px-6 py-4 text-ink-600">{h.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(h)} title="Edit" className="p-2 rounded-lg hover:bg-ink-100 text-ink-600"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(h.id)} title="Delete" className="p-2 rounded-lg hover:bg-rose-100 text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PortalCard>
      )}
    </div>
  );
}

// ── Fee Structures Tab ──

function FeeStructuresTab() {
  const { data: heads, loading: headsLoading } = useFeeHeads();
  const { data: programs } = usePrograms();
  const { data: structures, loading: structLoading } = useFeeStructures();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fee_head_id: '', program_id: '', semester: '', session: '2026-2027', amount: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (headsLoading || structLoading) return <PortalLoading />;

  const resetForm = () => {
    setForm({ fee_head_id: '', program_id: '', semester: '', session: '2026-2027', amount: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const payload = {
      fee_head_id: form.fee_head_id || null,
      program_id: form.program_id || null,
      semester: form.semester ? parseInt(form.semester) : null,
      session: form.session || null,
      amount: parseFloat(form.amount) || 0,
      is_active: true,
    };
    const { error } = editingId
      ? await supabase.from('fee_structures').update(payload).eq('id', editingId)
      : await supabase.from('fee_structures').insert(payload);
    if (error) setError(error.message);
    else { setShowAdd(false); resetForm(); window.location.reload(); }
    setSaving(false);
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      fee_head_id: s.fee_head_id || '',
      program_id: s.program_id || '',
      semester: s.semester ? String(s.semester) : '',
      session: s.session || '',
      amount: String(s.amount),
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fee structure?')) return;
    await supabase.from('fee_structures').delete().eq('id', id);
    window.location.reload();
  };

  const headName = (id: string) => heads.find((h) => h.id === id)?.name || '—';
  const programName = (id: string) => programs.find((p) => p.id === id)?.name || 'All Programs';

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PortalButton variant="primary" onClick={() => { if (editingId) resetForm(); setShowAdd(!showAdd); }}>
          {showAdd ? <><X size={16} /> Close</> : <><Plus size={16} /> Add Fee Structure</>}
        </PortalButton>
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">{editingId ? 'Edit Fee Structure' : 'Add Fee Structure'}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PortalSelect label="Fee Head" value={form.fee_head_id} onChange={(v) => setForm({ ...form, fee_head_id: v })}
              options={[{ value: '', label: '— Select —' }, ...heads.map((h) => ({ value: h.id, label: h.name }))]} required />
            <PortalSelect label="Program" value={form.program_id} onChange={(v) => setForm({ ...form, program_id: v })}
              options={[{ value: '', label: 'All Programs' }, ...programs.map((p) => ({ value: p.id, label: p.name }))]} />
            <PortalInput label="Semester" type="number" value={form.semester} onChange={(v) => setForm({ ...form, semester: v })} placeholder="All semesters" />
            <PortalInput label="Session" value={form.session} onChange={(v) => setForm({ ...form, session: v })} placeholder="e.g. 2026-2027" />
            <PortalInput label="Amount" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="0.00" required />
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <PortalButton type="submit" variant="primary" disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editingId ? 'Update' : 'Create'}
              </PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => { resetForm(); setShowAdd(false); }}>Cancel</PortalButton>
            </div>
            {error && <div className="sm:col-span-2 lg:col-span-3 text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
          </form>
        </PortalCard>
      )}

      {structures.length === 0 ? (
        <PortalCard className="p-6"><EmptyState icon={FileText} title="No Fee Structures" message="Define fee amounts by program, semester, and session." /></PortalCard>
      ) : (
        <PortalCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Fee Head</th>
                  <th className="text-left px-6 py-3 font-medium">Program</th>
                  <th className="text-left px-6 py-3 font-medium">Semester</th>
                  <th className="text-left px-6 py-3 font-medium">Session</th>
                  <th className="text-left px-6 py-3 font-medium">Amount</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {structures.map((s: any) => (
                  <tr key={s.id} className="hover:bg-ink-50">
                    <td className="px-6 py-4 font-medium text-ink-900">{s.fee_head?.name || headName(s.fee_head_id)}</td>
                    <td className="px-6 py-4 text-ink-600">{s.program_id ? programName(s.program_id) : 'All Programs'}</td>
                    <td className="px-6 py-4 text-ink-600">{s.semester || 'All'}</td>
                    <td className="px-6 py-4 text-ink-600">{s.session || 'All'}</td>
                    <td className="px-6 py-4 font-medium text-ink-900">${(s.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(s)} title="Edit" className="p-2 rounded-lg hover:bg-ink-100 text-ink-600"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(s.id)} title="Delete" className="p-2 rounded-lg hover:bg-rose-100 text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PortalCard>
      )}
    </div>
  );
}

// ── Fines Tab ──

function FinesTab() {
  const { data: fines, loading } = useFineConfigurations();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'fixed', value: '', days_after_due: '7' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <PortalLoading />;

  const resetForm = () => {
    setForm({ name: '', type: 'fixed', value: '', days_after_due: '7' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const payload = {
      name: form.name,
      type: form.type,
      value: parseFloat(form.value) || 0,
      days_after_due: parseInt(form.days_after_due) || 0,
      is_active: true,
    };
    const { error } = editingId
      ? await supabase.from('fine_configurations').update(payload).eq('id', editingId)
      : await supabase.from('fine_configurations').insert(payload);
    if (error) setError(error.message);
    else { setShowAdd(false); resetForm(); window.location.reload(); }
    setSaving(false);
  };

  const handleEdit = (f: FineConfiguration) => {
    setEditingId(f.id);
    setForm({ name: f.name, type: f.type, value: String(f.value), days_after_due: String(f.days_after_due) });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fine configuration?')) return;
    await supabase.from('fine_configurations').delete().eq('id', id);
    window.location.reload();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PortalButton variant="primary" onClick={() => { if (editingId) resetForm(); setShowAdd(!showAdd); }}>
          {showAdd ? <><X size={16} /> Close</> : <><Plus size={16} /> Add Fine Rule</>}
        </PortalButton>
      </div>

      {showAdd && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">{editingId ? 'Edit Fine Rule' : 'Add Fine Rule'}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <PortalInput label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Late Payment Fine" required />
            <PortalSelect label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })}
              options={[{ value: 'fixed', label: 'Fixed Amount' }, { value: 'percentage', label: 'Percentage (%)' }]} />
            <PortalInput label={form.type === 'fixed' ? 'Amount ($)' : 'Percentage (%)'} type="number" value={form.value} onChange={(v) => setForm({ ...form, value: v })} required />
            <PortalInput label="Days After Due Date" type="number" value={form.days_after_due} onChange={(v) => setForm({ ...form, days_after_due: v })} />
            <div className="sm:col-span-2 flex gap-3">
              <PortalButton type="submit" variant="primary" disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editingId ? 'Update' : 'Create'}
              </PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => { resetForm(); setShowAdd(false); }}>Cancel</PortalButton>
            </div>
            {error && <div className="sm:col-span-2 text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
          </form>
        </PortalCard>
      )}

      {fines.length === 0 ? (
        <PortalCard className="p-6"><EmptyState icon={AlertTriangle} title="No Fine Rules" message="Configure late payment fines and penalties." /></PortalCard>
      ) : (
        <PortalCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Type</th>
                  <th className="text-left px-6 py-3 font-medium">Value</th>
                  <th className="text-left px-6 py-3 font-medium">Days After Due</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-ink-50">
                    <td className="px-6 py-4 font-medium text-ink-900">{f.name}</td>
                    <td className="px-6 py-4"><Badge variant={f.type === 'fixed' ? 'info' : 'gold'}>{f.type === 'fixed' ? 'Fixed' : 'Percentage'}</Badge></td>
                    <td className="px-6 py-4 text-ink-700">{f.type === 'fixed' ? `$${f.value}` : `${f.value}%`}</td>
                    <td className="px-6 py-4 text-ink-600">{f.days_after_due} days</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(f)} title="Edit" className="p-2 rounded-lg hover:bg-ink-100 text-ink-600"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(f.id)} title="Delete" className="p-2 rounded-lg hover:bg-rose-100 text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PortalCard>
      )}
    </div>
  );
}

// ── Challan Generation Tab ──

function ChallanGenerationTab() {
  const { data: heads, loading: headsLoading } = useFeeHeads();
  const { data: structures, loading: structLoading } = useFeeStructures();
  const { data: programs } = usePrograms();
  const { data: challans, loading: challanLoading } = useFeeChallans();
  const [showGen, setShowGen] = useState(false);
  const [form, setForm] = useState({
    student_name: '', student_id: '', program_id: '', semester: '1', session: '2026-2027', due_date: '',
  });
  const [selectedHeads, setSelectedHeads] = useState<Set<string>>(new Set());
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (headsLoading || structLoading || challanLoading) return <PortalLoading />;

  const activeHeads = heads.filter((h) => h.is_active);

  const toggleHead = (headId: string) => {
    const next = new Set(selectedHeads);
    if (next.has(headId)) next.delete(headId);
    else next.add(headId);
    setSelectedHeads(next);

    // Auto-fill amount from matching structure
    if (!customAmounts[headId]) {
      const match = structures.find((s: any) =>
        s.fee_head_id === headId &&
        (!s.program_id || s.program_id === form.program_id) &&
        (!s.semester || String(s.semester) === form.semester) &&
        (!s.session || s.session === form.session)
      );
      if (match) {
        setCustomAmounts({ ...customAmounts, [headId]: String(match.amount) });
      }
    }
  };

  const totalAmount = Array.from(selectedHeads).reduce((sum, headId) => {
    return sum + (parseFloat(customAmounts[headId] || '0') || 0);
  }, 0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);

    // Generate challan number
    const count = challans.length + 1;
    const challanNumber = `CH-${new Date().getFullYear()}-${String(count).padStart(5, '0')}`;

    // Create challan
    const challanPayload = {
      challan_number: challanNumber,
      student_id: form.student_id,
      student_name: form.student_name,
      program_id: form.program_id || null,
      semester: parseInt(form.semester) || null,
      session: form.session,
      total_amount: totalAmount,
      paid_amount: 0,
      fine_amount: 0,
      status: 'pending',
      due_date: form.due_date || null,
    };

    const { data: challan, error: challanError } = await supabase
      .from('fee_challans')
      .insert(challanPayload)
      .select()
      .single();

    if (challanError || !challan) {
      setError(challanError?.message || 'Failed to create challan');
      setSaving(false);
      return;
    }

    // Create line items
    const items = Array.from(selectedHeads).map((headId, i) => {
      const head = heads.find((h) => h.id === headId);
      return {
        challan_id: challan.id,
        fee_head_id: headId,
        fee_head_name: head?.name || 'Unknown',
        amount: parseFloat(customAmounts[headId] || '0') || 0,
        sort_order: i + 1,
      };
    });

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('fee_challan_items').insert(items);
      if (itemsError) setError(itemsError.message);
    }

    setSuccess(`Challan ${challanNumber} generated successfully!`);
    setShowGen(false);
    setForm({ student_name: '', student_id: '', program_id: '', semester: '1', session: '2026-2027', due_date: '' });
    setSelectedHeads(new Set());
    setCustomAmounts({});
    setSaving(false);
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleMarkPaid = async (id: string, totalAmount: number) => {
    await supabase.from('fee_challans').update({
      status: 'paid',
      paid_amount: totalAmount,
      payment_date: new Date().toISOString().split('T')[0],
    }).eq('id', id);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this challan?')) return;
    await supabase.from('fee_challans').delete().eq('id', id);
    window.location.reload();
  };

  const downloadChallan = (challanId: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-fee-challan?challan_id=${challanId}`;
    window.open(url, '_blank');
  };

  const statusVariant = (s: string) =>
    s === 'paid' ? 'success' : s === 'overdue' ? 'error' : s === 'partial' ? 'warning' : 'info';

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatTile label="Total Challans" value={challans.length} icon={Receipt} color="ink" />
        <StatTile label="Pending" value={challans.filter((c) => c.status === 'pending').length} icon={Clock} color="gold" />
        <StatTile label="Paid" value={challans.filter((c) => c.status === 'paid').length} icon={CheckCircle} color="green" />
      </div>

      <div className="flex justify-end mb-4">
        <PortalButton variant="primary" onClick={() => setShowGen(!showGen)}>
          {showGen ? <><X size={16} /> Close</> : <><Plus size={16} /> Generate Challan</>}
        </PortalButton>
      </div>

      {showGen && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">Generate Fee Challan</h3>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PortalInput label="Student Name" value={form.student_name} onChange={(v) => setForm({ ...form, student_name: v })} required />
              <PortalInput label="Student ID" value={form.student_id} onChange={(v) => setForm({ ...form, student_id: v })} placeholder="e.g. STU-001" required />
              <PortalSelect label="Program" value={form.program_id} onChange={(v) => setForm({ ...form, program_id: v })}
                options={[{ value: '', label: '— Select —' }, ...programs.map((p) => ({ value: p.id, label: p.name }))]} />
              <PortalInput label="Semester" type="number" value={form.semester} onChange={(v) => setForm({ ...form, semester: v })} required />
              <PortalInput label="Session" value={form.session} onChange={(v) => setForm({ ...form, session: v })} required />
              <PortalInput label="Due Date" type="date" value={form.due_date} onChange={(v) => setForm({ ...form, due_date: v })} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink-700 mb-3">Select Fee Heads</h4>
              <div className="space-y-2">
                {activeHeads.map((head) => (
                  <div key={head.id} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    selectedHeads.has(head.id) ? 'border-ink-900 bg-ink-50' : 'border-ink-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedHeads.has(head.id)}
                      onChange={() => toggleHead(head.id)}
                      className="w-4 h-4 rounded border-ink-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-ink-900 text-sm">{head.name}</div>
                      <div className="text-xs text-ink-500">{head.description}</div>
                    </div>
                    {selectedHeads.has(head.id) && (
                      <input
                        type="number"
                        value={customAmounts[head.id] || ''}
                        onChange={(e) => setCustomAmounts({ ...customAmounts, [head.id]: e.target.value })}
                        placeholder="Amount"
                        className="w-32 px-3 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                      />
                    )}
                  </div>
                ))}
              </div>
              {selectedHeads.size > 0 && (
                <div className="mt-4 flex items-center justify-between p-4 bg-ink-900 rounded-lg text-white">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-xl font-bold">${totalAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <PortalButton type="submit" variant="primary" disabled={saving || selectedHeads.size === 0}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
                Generate Challan
              </PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => setShowGen(false)}>Cancel</PortalButton>
            </div>
            {error && <div className="text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
            {success && <div className="text-sm text-green-600 flex items-center gap-2"><Check size={16} /> {success}</div>}
          </form>
        </PortalCard>
      )}

      {challans.length === 0 ? (
        <PortalCard className="p-6"><EmptyState icon={CreditCard} title="No Challans Generated" message="Generate fee challans for students using the button above." /></PortalCard>
      ) : (
        <PortalCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Challan #</th>
                  <th className="text-left px-6 py-3 font-medium">Student</th>
                  <th className="text-left px-6 py-3 font-medium">Session</th>
                  <th className="text-left px-6 py-3 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Due Date</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {challans.map((c) => (
                  <tr key={c.id} className="hover:bg-ink-50">
                    <td className="px-6 py-4 font-mono text-xs text-ink-700">{c.challan_number}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink-900">{c.student_name}</div>
                      <div className="text-xs text-ink-500">{c.student_id}</div>
                    </td>
                    <td className="px-6 py-4 text-ink-600">{c.session}</td>
                    <td className="px-6 py-4 font-medium text-ink-900">${(c.total_amount + (c.fine_amount || 0)).toLocaleString()}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant(c.status)}>{c.status}</Badge></td>
                    <td className="px-6 py-4 text-ink-600">{c.due_date ? new Date(c.due_date).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => downloadChallan(c.id)} title="View / Print PDF" className="p-2 rounded-lg hover:bg-ink-100 text-ink-600">
                          <Download size={16} />
                        </button>
                        {c.status !== 'paid' && (
                          <button onClick={() => handleMarkPaid(c.id, c.total_amount + (c.fine_amount || 0))} title="Mark as paid" className="p-2 rounded-lg hover:bg-green-100 text-green-600">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(c.id)} title="Delete" className="p-2 rounded-lg hover:bg-rose-100 text-rose-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PortalCard>
      )}
    </div>
  );
}
