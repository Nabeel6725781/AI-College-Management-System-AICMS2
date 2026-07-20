import { useEffect, useState } from 'react';
import { CmsPageHeader, CmsCard, CmsField, CmsListEditor } from '../../components/cms-ui';
import { supabase } from '../../lib/supabase';
import type { Scholarship } from '../../lib/cms-hooks';
import { Save, Loader2, Check, AlertCircle } from 'lucide-react';

export default function AdminCmsScholarshipsPage() {
  const [items, setItems] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('scholarships').select('*').order('created_at', { ascending: false });
      setItems((data as Scholarship[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    for (const item of items) {
      const { id, ...payload } = item;
      if (id) await supabase.from('scholarships').update(payload).eq('id', id);
      else await supabase.from('scholarships').insert(payload);
    }
    setSuccess(true);
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" /></div>;

  return (
    <div>
      <CmsPageHeader title="Scholarships Management" description="Manage scholarships displayed on the public Admissions page." />
      <CmsCard>
        <CmsListEditor
          items={items}
          onChange={setItems}
          addLabel="Add Scholarship"
          newItem={() => ({ id: '', name: '', description: '', amount: 0, eligibility: '', deadline: null, status: 'active', created_at: '' })}
          renderItem={(item, updateItem) => (
            <div className="grid gap-3">
              <CmsField label="Name" value={item.name} onChange={(v) => updateItem({ name: v })} />
              <CmsField label="Description" value={item.description} onChange={(v) => updateItem({ description: v })} textarea rows={3} />
              <div className="grid sm:grid-cols-2 gap-3">
                <CmsField label="Amount" value={String(item.amount)} onChange={(v) => updateItem({ amount: parseFloat(v) || 0 })} type="number" />
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">Status</label>
                  <select
                    value={item.status}
                    onChange={(e) => updateItem({ status: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-ink-200 bg-ink-50 text-ink-900 focus:outline-none focus:border-ink-900 focus:bg-white transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <CmsField label="Eligibility" value={item.eligibility ?? ''} onChange={(v) => updateItem({ eligibility: v })} textarea />
                <CmsField label="Deadline" value={item.deadline ?? ''} onChange={(v) => updateItem({ deadline: v })} type="date" />
              </div>
            </div>
          )}
        />
      </CmsCard>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-ink-900 text-white font-medium rounded-lg hover:bg-ink-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save All'}
        </button>
        {success && <div className="flex items-center gap-2 text-sm text-green-600 font-medium"><Check size={16} /> Saved</div>}
        {error && <div className="flex items-center gap-2 text-sm text-red-600 font-medium"><AlertCircle size={16} /> {error}</div>}
      </div>
    </div>
  );
}
