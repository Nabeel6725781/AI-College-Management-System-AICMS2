import { useEffect, useState } from 'react';
import { FolderOpen, Plus, Trash2, FileText, Clock, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { navigateTo } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import {
  PortalCard, PortalPageHeader, PortalButton, PortalInput, PortalSelect,
  Badge, StatTile, EmptyState, PortalLoading,
} from '../../components/portal-ui';

type DocRow = {
  id: string;
  name: string;
  type: string;
  uploaded_by: string;
  created_at: string;
  status: string;
};

export default function AdminDocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showCat, setShowCat] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', uploaded_by: '', status: 'pending' });
  const [catName, setCatName] = useState('');

  useEffect(() => {
    if (!user) {
      navigateTo('/admin/login');
      return;
    }
    (async () => {
      const [{ data: docData }, { data: catData }] = await Promise.all([
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('document_categories').select('*').order('name', { ascending: true }),
      ]);
      setDocs((docData as DocRow[]) || []);
      setCategories((catData as { id: string; name: string }[]) || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return (
    <div className="animate-fade-in">
      <PortalPageHeader title="Documents Management" subtitle="Track uploaded documents and categories" icon={FolderOpen} />
      <PortalLoading />
    </div>
  );

  const pendingCount = docs.filter((d) => d.status === 'pending').length;
  const verifiedCount = docs.filter((d) => d.status === 'verified').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('documents').insert({
      name: form.name,
      type: form.type,
      uploaded_by: form.uploaded_by,
      status: form.status,
    });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document record?')) return;
    await supabase.from('documents').delete().eq('id', id);
    window.location.reload();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    await supabase.from('document_categories').insert({ name: catName.trim() });
    window.location.reload();
  };

  const statusVariant = (s: string) =>
    s === 'verified' ? 'success' : s === 'pending' ? 'warning' : s === 'rejected' ? 'error' : 'info';

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Documents Management"
        subtitle="Track uploaded documents and manage categories"
        icon={FolderOpen}
        action={
          <div className="flex gap-2">
            <PortalButton variant="secondary" onClick={() => setShowCat(!showCat)}>
              {showCat ? <><X size={16} /> Close</> : <><Plus size={16} /> Category</>}
            </PortalButton>
            <PortalButton variant="primary" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? <><X size={16} /> Close</> : <><Plus size={16} /> Add Document</>}
            </PortalButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatTile label="Total Documents" value={docs.length} icon={FileText} color="ink" />
        <StatTile label="Pending Review" value={pendingCount} icon={Clock} color="gold" />
        <StatTile label="Verified" value={verifiedCount} icon={CheckCircle} color="green" />
      </div>

      {showCat && (
        <PortalCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">Add Document Category</h3>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <PortalInput label="Category Name" value={catName} onChange={setCatName} placeholder="e.g. Transcripts" required />
            </div>
            <div className="flex items-end gap-2">
              <PortalButton type="submit" variant="primary">Add Category</PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => { setShowCat(false); setCatName(''); }}>Cancel</PortalButton>
            </div>
          </form>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((c) => (
                <Badge key={c.id} variant="default">{c.name}</Badge>
              ))}
            </div>
          )}
        </PortalCard>
      )}

      {showAdd && (
        <PortalCard className="p-6 mb-8">
          <h3 className="text-lg font-bold text-ink-900 mb-4">Add Document Record</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PortalInput label="Document Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <PortalSelect
              label="Type"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={[
                { value: '', label: 'Select type' },
                { value: 'pdf', label: 'PDF' },
                { value: 'image', label: 'Image' },
                { value: 'certificate', label: 'Certificate' },
                { value: 'transcript', label: 'Transcript' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <PortalInput label="Uploaded By" value={form.uploaded_by} onChange={(v) => setForm({ ...form, uploaded_by: v })} placeholder="User name" />
            <PortalSelect
              label="Status"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'verified', label: 'Verified' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
            <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
              <PortalButton type="submit" variant="primary">Create Record</PortalButton>
              <PortalButton type="button" variant="secondary" onClick={() => { setShowAdd(false); setForm({ name: '', type: '', uploaded_by: '', status: 'pending' }); }}>Cancel</PortalButton>
            </div>
          </form>
        </PortalCard>
      )}

      {docs.length === 0 ? (
        <PortalCard className="p-6">
          <EmptyState icon={FolderOpen} title="No Documents" message="Add a document record to start tracking." />
        </PortalCard>
      ) : (
        <PortalCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Type</th>
                  <th className="text-left px-6 py-3 font-medium">Uploaded By</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-ink-50">
                    <td className="px-6 py-4 font-medium text-ink-900">{d.name}</td>
                    <td className="px-6 py-4"><Badge variant="info">{d.type || '—'}</Badge></td>
                    <td className="px-6 py-4 text-ink-700">{d.uploaded_by || '—'}</td>
                    <td className="px-6 py-4 text-ink-600">{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant(d.status)}>{d.status}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(d.id)} title="Delete" className="p-2 rounded-lg hover:bg-rose-100 text-rose-600">
                        <Trash2 size={16} />
                      </button>
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
